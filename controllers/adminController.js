const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

//create admin

const createAdmin = async (req, res) => {
    const { username, password, name, email, contactNumber, role, permissions=[] } = req.body;
  
    try {
      // Check if the admin username already exists
      const existingAdmin = await Admin.findOne({ username });
      if (existingAdmin) {
        return res.status(400).json({ error: 'Username already exists' });
      }
  
      // Create a new Admin instance
      const newAdmin = new Admin({
        username,
        password,
        name,
        email,
        contactNumber,
        role,
        permissions
      });
  
      // Save the admin to the database
      await newAdmin.save();
  
      res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  };
  
  
 
// Admin login
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  console.log(username, password);

  try {
    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ adminId: admin._id }, 'your_jwt_secret_key', { expiresIn: '2h' });

    res.json({ token });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Server error' });
  }
};

// Get admin profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin).select('-password');
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin profile' });
  }
};

// Update admin profile
const updateAdminProfile = async (req, res) => {
  const { name, email, contactNumber, profilePicture } = req.body;

  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.admin,
      { name, email, contactNumber, profilePicture, updated_at: Date.now() },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json(updatedAdmin);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update admin profile' });
  }
};

const createDefaultAdmin = async () => {
  try {
    // Check if an admin with username 'admin' already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });

    if (existingAdmin) {
      console.log('Admin already exists. Skipping default admin creation.');
      return;
    }

    // If no admin exists, create the default admin
    const defaultAdmin = new Admin({
      username: 'admin',
      password: 'admin', // Password will be hashed in the pre-save hook
      name: 'Default Admin',
      email: 'admin@example.com',
      contactNumber: '1234567890',
      role: 'SuperAdmin',
      permissions: ['View Reports', 'Manage Users', 'Edit Settings'],
    });

    await defaultAdmin.save();
    console.log('Default admin created with username: admin and password: admin');
  } catch (error) {
    if (error.code === 11000) {
      console.error('Default admin creation failed due to a duplicate key error');
    } else {
      console.error('Error creating default admin:', error);
    }
  }
};

module.exports = { loginAdmin, getAdminProfile, updateAdminProfile, createAdmin, createDefaultAdmin };
