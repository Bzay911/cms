const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  // Personal Details
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true },

  // Employment Details
  role: { type: String, required: true },
  department: { type: String },
  employeeId: { type: String, required: true, unique: true },
  dateOfJoining: { type: Date, required: true },
  employmentType: { type: String, enum: ["Full-time", "Part-time", "Contract", "Internship"], required: true },
  supervisor: { type: String }, // Supervisor name or ID reference
  
  // Document Management
  documents: [
    {
      type: { type: String, required: true }, // e.g., "Passport", "Driving License"
      documentNumber: { type: String, required: true },
      issueDate: { type: Date },
      expiryDate: { type: Date },
      fileUrl: { type: String }, // URL for document storage (e.g., cloud storage link)
    },
  ],

  // Emergency Contact Information
  emergencyContact: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String },
  },

  // Company Related Details
  salary: { type: Number, required: true }, // Salary information
  benefits: { type: [String] }, // List of benefits (e.g., "Health Insurance", "401k")
  workLocation: { type: String, required: true }, // Office location or site

  // Status and Metadata
  status: { type: String, enum: ["Active", "On Leave", "Resigned", "Terminated"], required: true, default: "Active" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date },
});

module.exports = mongoose.models.Worker || mongoose.model('Worker', workerSchema);