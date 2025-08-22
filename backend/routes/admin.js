const express = require('express');
const { 
  getMembers, 
  generateRoutine, 
  createAnnouncement, 
  addDepartment, 
  getRoutines, 
  getRoutineByDepartment, 
  saveRoutine,
  saveMultipleRoutines
} = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('admin'));

router.get('/members', getMembers);
router.post('/routine/generate', generateRoutine);
router.post('/announcements', createAnnouncement);
router.post('/department', addDepartment);

// Routine routes
router.get('/routines', getRoutines);
router.get('/routines/:department/:section', getRoutineByDepartment);
router.post('/routines/save', saveRoutine);
router.post('/routines/save-multiple', saveMultipleRoutines);

module.exports = router;
