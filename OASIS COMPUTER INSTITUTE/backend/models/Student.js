const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true, trim: true },
  lessonNumber: { type: String, required: true, unique: true },
  scores: {
    msword: { type: Number, default: null },
    mspowerpoint: { type: Number, default: null },
    msexcel: { type: Number, default: null },
    internet: { type: Number, default: null },
    sysarch: { type: Number, default: null }
  },
  createdAt: { type: Date, default: Date.now },
  certificateIssued: { type: Boolean, default: false },
  completionDate: { type: Date, default: null }
});

module.exports = mongoose.model('Student', studentSchema);
