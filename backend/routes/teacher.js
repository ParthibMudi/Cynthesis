const express = require('express');
const { getRoutine, startAttendance, getQrToken, endAttendance, getAnnouncements } = require('../controllers/teacher');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('teacher'));

router.get('/routine', getRoutine);
router.post('/attendance/start', startAttendance);
router.get('/attendance/qr', getQrToken);
router.post('/attendance/end', endAttendance);
router.get('/announcements', getAnnouncements);

module.exports = router;