const Worker = require('../models/worker');
const moment = require('moment');


// Function to Generate list of Workers with Expired Documents Which is Called in Dashboard Component for the brief Overview of the Expired Documents.
const getWorkersWithExpiredDocuments = async (req, res) => {
  try {
    
    const currentDate = new Date();
    const workersWithExpiredDocs = await Worker.aggregate([
      {
        $project: {
          name: 1,
          contactNumber: 1,
          expiredDocuments: {
            $filter: {
              input: "$documents",
              as: "document",
              cond: {
                $lt: ["$$document.expiryDate", currentDate],
              },
            },
          },
        },
      },
      {
        $match: {
          "expiredDocuments.0": { $exists: true }, // this will only include workers who have at least one expired document
        },
      },
    ]);

    // If no workers have expired documents, return an empty list
    if (workersWithExpiredDocs.length === 0) {
      return res.status(200).json([]);
    }

    // Format the expiryDate using moment.js in order to display it in the expiry Date Row
    const formattedWorkers = workersWithExpiredDocs.map((worker) => {
      const formattedDocuments = worker.expiredDocuments.map((doc) => ({
        ...doc,
        expiryDate: moment(doc.expiryDate).format("YYYY-MM-DD"),
      }));
      return {
        ...worker,
        expiredDocuments: formattedDocuments,
      };
    });

    // Respond with workers with expired document details
    res.status(200).json(formattedWorkers);
  } catch (error) {
    console.error("Error fetching expired documents:", error);
    res.status(500).json({ error: "Failed to fetch expired documents" });
  }
};

// Get workers with documents expiring in the next 30 days
const getWorkersWithExpiringDocuments = async (req, res) => {
  
  try {
    // Get the number of days from the query parameter
    const { days } = req.query;

    if (!days || isNaN(days)) {
      return res.status(400).json({ error: "Please provide a valid number of days." });
    }

    // Calculate the date based on the given days
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + parseInt(days));

    // Find workers with documents expiring within the specified number of days
    const workersWithExpiringDocs = await Worker.aggregate([
      {
        $project: {
          name: 1,
          contactNumber: 1,
          expiringDocuments: {
            $filter: {
              input: "$documents",
              as: "document",
              cond: {
                $and: [
                  { $gte: ["$$document.expiryDate", currentDate] },
                  { $lte: ["$$document.expiryDate", futureDate] },
                ],
              },
            },
          },
        },
      },
      {
        $match: {
          "expiringDocuments.0": { $exists: true }, // Only include workers who have at least one expiring document
        },
      },
    ]);

    // Format the dates using moment.js and calculate days left until expiry
    const formattedWorkers = workersWithExpiringDocs.map((worker) => {
      worker.expiringDocuments = worker.expiringDocuments.map((doc) => {
        const daysLeft = moment(doc.expiryDate).diff(moment(currentDate), 'days');
        return {
          ...doc,
          expiryDate: moment(doc.expiryDate).format("YYYY-MM-DD"),
          daysLeft,
        };
      });
      return worker;
    });

    // If no workers have expiring documents, return an empty list
    if (formattedWorkers.length === 0) {
      return res.status(200).json([]);
    }

    // Respond with workers with formatted expiring document details
    res.status(200).json(formattedWorkers);
  } catch (error) {
    console.error("Error fetching expiring documents:", error);
    res.status(500).json({ error: "Failed to fetch expiring documents" });
  }

};



// Get all workers or filter by role and document type
const getWorkers = async (req, res) => {
  const { role, documentType, gender, department, employmentType, search } = req.query;

  try {
    // Build a dynamic filter object based on provided query parameters
    let filter = {};
    if (role) filter.role = role;

    if (documentType)  filter.documents = { $elemMatch: { type: documentType } };
    
    if (gender) filter.gender = gender;

    if (department) filter.department = department;

    if (employmentType) filter.employmentType = employmentType;

    if (search) filter.name = new RegExp(search,'i');


    const workers = await Worker.find(filter);
    
    const workersWithAge = workers.map((worker) => {
      const birthDate = new Date(worker.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
      ) {
        return {
          ...worker.toObject(),
          age: age - 1,
        };
      }
      return {
        ...worker.toObject(),
        age,
      };
    });
    
    
    res.json(workersWithAge);
  } catch (error) {
    console.error("Error fetching workers:", error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
};
const getDocumentStatistics = async (req, res) => {
  try {
    const currentDate = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(currentDate.getDate() + 30);

    // Get all workers
    const workers = await Worker.find({});

    let totalDocuments = 0;
    let expiredDocuments = 0;
    let expiringDocuments = 0;

    // Iterate over workers to calculate document statistics
    workers.forEach((worker) => {
      worker.documents.forEach((document) => {
        totalDocuments++;
        if (document.expiryDate && new Date(document.expiryDate) < currentDate) {
          expiredDocuments++;
        } else if (
          document.expiryDate &&
          new Date(document.expiryDate) >= currentDate &&
          new Date(document.expiryDate) <= thirtyDaysFromNow
        ) {
          expiringDocuments++;
        }
      });
    });

    // Calculate the percentage of expired documents
    const expiredPercentage = totalDocuments > 0 ? ((expiredDocuments / totalDocuments) * 100).toFixed(2) : "0.00";

    res.status(200).json({
      totalDocuments,
      expiredDocuments,
      expiringDocuments,
      expiredPercentage,
    });
  } catch (error) {
    console.error("Error fetching document statistics:", error);
    res.status(500).json({ error: 'Failed to fetch document statistics' });
  }
};

const getfilters= async (req,res)=>{
  try{
    const roles = await Worker.distinct('role');
    const genders = await Worker.distinct('gender');
    const department = await Worker.distinct('department');
    const employmentType = await Worker.distinct('employmentType');
    const documentTypes = await Worker.distinct('document.type');

    res.status(200).json({
      roles,
      genders,
      department,
      employmentType,
      documentTypes,
    });
  }catch(error){
    res.status(500).json({error: 'Failed to fetch filter options'})
  }
};

// Create a new worker
const createWorker = async (req, res) => {
  const {
    name,
    dateOfBirth,
    gender,
    address,
    contactNumber,
    email,
    role,
    department,
    employeeId,
    dateOfJoining,
    employmentType,
    supervisor,
    documents,
    emergencyContact,
    salary,
    benefits,
    workLocation,
    status,
  } = req.body;

  try {
    // Create a new Worker instance with all the required fields
    const newWorker = new Worker({
      name,
      dateOfBirth,
      gender,
      address,
      contactNumber,
      email,
      role,
      department,
      employeeId,
      dateOfJoining,
      employmentType,
      supervisor,
      documents,
      emergencyContact,
      salary,
      benefits,
      workLocation,
      status,
    });

    // Save the worker to the database
    await newWorker.save();
    res.status(201).json(newWorker);
  } catch (error) {
    console.error("Error creating worker:", error);
    res.status(500).json({ error: 'Failed to create worker' });
  }
};
const getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ error: "Worker not found" });
    }
    res.json(worker);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch worker" });
  }
};
const updateWorker = async (req, res) => {
  try {
    const updatedWorker = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedWorker) {
      return res.status(404).json({ error: "Worker not found" });
    }
    res.json(updatedWorker);
  } catch (error) {
    res.status(500).json({ error: "Failed to update worker" });
  }
};
// // Update worker details
// const updateWorker = async (req, res) => {
//   const { id } = req.params;
//   const {
//     name,
//     dateOfBirth,
//     gender,
//     address,
//     contactNumber,
//     email,
//     role,
//     department,
//     employeeId,
//     dateOfJoining,
//     employmentType,
//     supervisor,
//     documents,
//     emergencyContact,
//     salary,
//     benefits,
//     workLocation,
//     status,
//   } = req.body;

//   try {
//     // Find the worker by ID and update the fields
//     const updatedWorker = await Worker.findByIdAndUpdate(
//       id,
//       {
//         name,
//         dateOfBirth,
//         gender,
//         address,
//         contactNumber,
//         email,
//         role,
//         department,
//         employeeId,
//         dateOfJoining,
//         employmentType,
//         supervisor,
//         documents,
//         emergencyContact,
//         salary,
//         benefits,
//         workLocation,
//         status,
//         updated_at: Date.now(),
//       },
//       { new: true }
//     );

//     if (!updatedWorker) {
//       return res.status(404).json({ error: 'Worker not found' });
//     }

//     res.status(200).json(updatedWorker);
//   } catch (error) {
//     console.error("Error updating worker:", error);
//     res.status(500).json({ error: 'Failed to update worker' });
//   }
// };

module.exports = { getWorkers, createWorker, updateWorker, getWorkerById, getfilters, getDocumentStatistics, getWorkersWithExpiredDocuments, getWorkersWithExpiringDocuments };
