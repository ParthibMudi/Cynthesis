const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  institutionId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  postedBy: {
    type: String,
    required: true
  },
  targetAudience: {
    type: [String],
    enum: ['all', 'teachers', 'students'],
    default: ['all']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);