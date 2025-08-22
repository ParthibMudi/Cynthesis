const express = require('express');
const { getDashboard, getRoutine, markAttendance, getAnnouncements, getStudyTips } = require('../controllers/student');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('student'));

router.get('/dashboard', getDashboard);
router.get('/routine', getRoutine);
router.post('/attendance/mark', markAttendance);
router.get('/announcements', getAnnouncements);
router.get('/study-tips', getStudyTips);

module.exports = router;