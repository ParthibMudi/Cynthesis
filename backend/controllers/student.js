const Routine = require('../models/Routine');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const User = require('../models/User');
const axios = require('axios');

// @desc    Get student dashboard data
// @route   GET /api/student/dashboard
// @access  Private/Student
exports.getDashboard = async (req, res) => {
  try {
    const { institutionId, department, userId } = req.user;

    // Get student's routine
    const routine = await Routine.findOne({ 
      institutionId, 
      department 
    });

    // Get student's attendance history
    const attendanceHistory = await Attendance.find({
      institutionId,
      department,
      students_present: userId
    }).select('session_id subject date');

    // Generate AI study tips (placeholder - would use Gemini API in production)
    const studyTips = [
      {
        subject: "Data Structures",
        tip: "Practice implementing linked lists with different data types to strengthen your understanding",
        difficulty: "Medium",
        timeEstimate: "30 mins"
      },
      {
        subject: "Algorithms",
        tip: "Implement merge sort and quick sort algorithms and compare their performance",
        difficulty: "Hard",
        timeEstimate: "45 mins"
      },
      {
        subject: "Database Systems",
        tip: "Practice writing complex SQL queries with multiple joins and aggregations",
        difficulty: "Medium",
        timeEstimate: "25 mins"
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        routine: routine ? routine.schedule : {},
        attendanceHistory,
        studyTips
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

// @desc    Get student routine
// @route   GET /api/student/routine
// @access  Private/Student
exports.getRoutine = async (req, res) => {
  try {
    const { institutionId, department } = req.user;

    // Get student's routine
    const routine = await Routine.findOne({
      institutionId,
      department
    });

    res.status(200).json({
      success: true,
      data: routine ? routine.schedule : {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Mark attendance via QR scan
// @route   POST /api/student/attendance/mark
// @access  Private/Student
exports.markAttendance = async (req, res) => {
  try {
    const { userId } = req.user;
    const { session_id, token } = req.body;

    if (!session_id || !token) {
      return res.status(400).json({
        success: false,
        message: 'Please provide session_id and token'
      });
    }

    // Find attendance session
    const attendance = await Attendance.findOne({ session_id, active: true });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance session not found or inactive'
      });
    }

    // Find the token in the session
    const tokenObj = attendance.tokens.find(t => t.token === token);

    if (!tokenObj) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Check if token is expired
    if (new Date(tokenObj.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Token expired'
      });
    }

    // Check if student already marked attendance for this session
    if (attendance.students_present.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this session'
      });
    }

    // Check if token already used by this student
    if (tokenObj.used_by.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Token already used by this student'
      });
    }

    // Mark attendance
    tokenObj.used_by.push(userId);
    attendance.students_present.push(userId);
    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        session_id,
        subject: attendance.subject,
        date: attendance.date
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

// @desc    Get student announcements
// @route   GET /api/student/announcements
// @access  Private/Student
exports.getAnnouncements = async (req, res) => {
  try {
    const { institutionId } = req.user;

    const announcements = await Announcement.find({
      institutionId,
      target: { $in: ['all', 'students'] }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get AI study tips
// @route   GET /api/student/study-tips
// @access  Private/Student
exports.getStudyTips = async (req, res) => {
  try {
    const { department } = req.user;
    const { subject } = req.query;

    // In a real implementation, this would call the Gemini API
    // For now, we'll return mock data
    
    // Example prompt for Gemini API:
    // const prompt = `Generate 3 personalized study tips for a ${department} student studying ${subject}.
    // For each tip, include:
    // 1. A specific actionable study technique
    // 2. Difficulty level (Easy, Medium, Hard)
    // 3. Estimated time to complete (in minutes)
    // Format as JSON array.`;

    const studyTips = [
      {
        subject: subject || "General",
        tip: "Create a mind map connecting all major concepts from recent lectures",
        difficulty: "Medium",
        timeEstimate: "20 mins"
      },
      {
        subject: subject || "General",
        tip: "Practice explaining complex concepts in simple terms as if teaching someone else",
        difficulty: "Medium",
        timeEstimate: "15 mins"
      },
      {
        subject: subject || "General",
        tip: "Create flashcards for key definitions and review them using spaced repetition",
        difficulty: "Easy",
        timeEstimate: "10 mins"
      }
    ];

    res.status(200).json({
      success: true,
      data: studyTips
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};