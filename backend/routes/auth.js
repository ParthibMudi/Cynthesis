const express = require('express');
const { login, addMember, generateInstitutionId, registerAdmin } = require('../controllers/auth');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register-admin', registerAdmin);
router.post('/institution', generateInstitutionId);

// Protected routes
router.post('/add-member', protect, authorize('admin'), addMember);

module.exports = router;