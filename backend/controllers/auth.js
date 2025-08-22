const User = require('../models/User');
const Institution = require('../models/Institution');
const { v4: uuidv4 } = require('uuid');

// @desc    Register admin
// @route   POST /api/auth/register-admin
// @access  Public
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, institutionName, institutionAddress } = req.body;

    // Validate required fields
    if (!name || !email || !password || !institutionName || !institutionAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Generate unique institution ID
    const institutionId = `INST-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Create institution
    const institution = await Institution.create({
      institutionId,
      name: institutionName,
      address: institutionAddress
    });

    // Generate admin ID
    const adminId = `ADM${Math.floor(1000 + Math.random() * 9000)}`;

    // Create admin user
    const user = await User.create({
      institutionId,
      userId: adminId,
      name,
      email,
      role: 'admin',
      password
    });

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        institutionId
      },
      message: 'Admin registered successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Validate userId & password
    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId and password'
      });
    }

    // Check for user
    const user = await User.findOne({ userId }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        userId: user.userId,
        name: user.name,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Add a new member (teacher/student)
// @route   POST /api/auth/add-member
// @access  Private/Admin
exports.addMember = async (req, res) => {
  try {
    const { institutionId, name, role, department, subjects } = req.body;

    // Validate required fields
    if (!institutionId || !name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if institution exists
    const institution = await Institution.findOne({ institutionId });
    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    // Generate unique ID based on role
    const prefix = role === 'teacher' ? 'TCH' : 'STD';
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const userId = `${prefix}${randomId}`;

    // Generate default password (can be changed later)
    const defaultPassword = `${userId}@123`;

    // Create user
    const user = await User.create({
      institutionId,
      userId,
      name,
      role,
      department,
      subjects,
      password: defaultPassword
    });

    res.status(201).json({
      success: true,
      data: {
        userId: user.userId,
        name: user.name,
        role: user.role,
        department: user.department,
        defaultPassword
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Generate institution ID
// @route   POST /api/auth/institution
// @access  Public
exports.generateInstitutionId = async (req, res) => {
  try {
    const { name, address } = req.body;

    if (!name || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide institution name and address'
      });
    }

    // Generate unique institution ID
    const institutionId = `INST-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Create institution
    const institution = await Institution.create({
      institutionId,
      name,
      address
    });

    // Create admin user for the institution
    const adminId = `ADM${Math.floor(1000 + Math.random() * 9000)}`;
    const defaultPassword = `${adminId}@123`;

    await User.create({
      institutionId,
      userId: adminId,
      name: `Admin-${name}`,
      role: 'admin',
      password: defaultPassword
    });

    res.status(201).json({
      success: true,
      data: {
        institutionId,
        adminId,
        defaultPassword
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};