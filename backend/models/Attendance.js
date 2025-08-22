const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    unique: true
  },
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
  subject: {
    type: String,
    required: true
  },
  teacher: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  tokens: [
    {
      token: {
        type: String,
        required: true
      },
      expires_at: {
        type: Date,
        required: true
      },
      used_by: {
        type: [String],
        default: []
      },
      created_at: {
        type: Date,
        default: Date.now
      }
    }
  ],
  active: {
    type: Boolean,
    default: true
  },
  students_present: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);