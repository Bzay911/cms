const express = require('express');
const { loginAdmin, getAdminProfile, updateAdminProfile, createAdmin } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Admin login route
router.post('/login', loginAdmin);

// Get admin profile (protected)
router.get('/me', authMiddleware, getAdminProfile);

// Update admin profile (protected)
router.put('/profile', authMiddleware, updateAdminProfile);
router.post('/create', authMiddleware, createAdmin);
module.exports = router;
