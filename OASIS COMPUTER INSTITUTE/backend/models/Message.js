const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  studentUsername: { type: String, required: true },
  fullName: String,
  lessonNumber: String,
  course: String,
  message: { type: String, required: true },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
