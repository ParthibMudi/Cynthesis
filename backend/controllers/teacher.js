const Routine = require('../models/Routine');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const { v4: uuidv4 } = require('uuid');

// @desc    Get teacher's routine
// @route   GET /api/teacher/routine
// @access  Private/Teacher
exports.getRoutine = async (req, res) => {
  try {
    const { institutionId, department } = req.user;

    // Find all routines where this teacher is assigned
    const routines = await Routine.find({ institutionId });
    
    // Extract classes for this teacher
    const teacherSchedule = {};
    
    routines.forEach(routine => {
      const { department, section, schedule } = routine;
      
      Object.keys(schedule).forEach(day => {
        if (!teacherSchedule[day]) {
          teacherSchedule[day] = [];
        }
        
        schedule[day].forEach(classItem => {
          if (classItem.teacher === req.user.name) {
            teacherSchedule[day].push({
              ...classItem,
              department,
              section
            });
          }
        });
      });
    });

    res.status(200).json({
      success: true,
      data: teacherSchedule
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Start attendance session
// @route   POST /api/teacher/attendance/start
// @access  Private/Teacher
exports.startAttendance = async (req, res) => {
  try {
    const { institutionId, userId, name } = req.user;
    const { department, section, subject } = req.body;

    if (!department || !section || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Please provide department, section and subject'
      });
    }

    // Generate session ID
    const date = new Date();
    const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const session_id = `ATT${formattedDate}_${department}${section}_${subject.substring(0, 3).toUpperCase()}`;

    // Generate token
    const token = uuidv4();
    
    // Set expiry (15 seconds from now)
    const expires_at = new Date(Date.now() + 15000);

    // Create attendance session
    const attendance = await Attendance.create({
      session_id,
      institutionId,
      department,
      section,
      subject,
      teacher: name,
      tokens: [
        {
          token,
          expires_at,
          used_by: []
        }
      ],
      active: true
    });

    res.status(201).json({
      success: true,
      data: {
        session_id,
        token,
        expires_at
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

// @desc    Get latest QR token
// @route   GET /api/teacher/attendance/qr
// @access  Private/Teacher
exports.getQrToken = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide session_id'
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

    // Generate new token
    const token = uuidv4();
    
    // Set expiry (15 seconds from now)
    const expires_at = new Date(Date.now() + 15000);

    // Add new token to session
    attendance.tokens.push({
      token,
      expires_at,
      used_by: []
    });

    await attendance.save();

    res.status(200).json({
      success: true,
      data: {
        session_id,
        token,
        expires_at
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

// @desc    End attendance session
// @route   POST /api/teacher/attendance/end
// @access  Private/Teacher
exports.endAttendance = async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide session_id'
      });
    }

    // Find and update attendance session
    const attendance = await Attendance.findOneAndUpdate(
      { session_id },
      { active: false },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance session not found'
      });
    }

    // Compile list of present students
    const presentStudents = new Set();
    
    attendance.tokens.forEach(token => {
      token.used_by.forEach(student => {
        presentStudents.add(student);
      });
    });

    attendance.students_present = Array.from(presentStudents);
    await attendance.save();

    res.status(200).json({
      success: true,
      data: {
        session_id,
        students_present: attendance.students_present,
        total_present: attendance.students_present.length
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

// @desc    Get teacher announcements
// @route   GET /api/teacher/announcements
// @access  Private/Teacher
exports.getAnnouncements = async (req, res) => {
  try {
    const { institutionId } = req.user;

    const announcements = await Announcement.find({
      institutionId,
      target: { $in: ['all', 'teachers'] }
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