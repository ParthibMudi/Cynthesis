const mongoose = require('mongoose');

const RoutineSchema = new mongoose.Schema({
  institutionId: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  schedule: {
    type: Object,
    required: true
    // Format:
    // {
    //   "Monday": [
    //     { "time": "9:00-10:00", "subject": "DS&A", "teacher": "Prof. Ananya Sharma", "room": "CR-101" }
    //   ],
    //   "Tuesday": [...]
    // }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Routine', RoutineSchema);