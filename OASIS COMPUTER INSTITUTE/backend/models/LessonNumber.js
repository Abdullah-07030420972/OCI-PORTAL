const mongoose = require('mongoose');

const lessonNumberSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  used: { type: Boolean, default: false }
});

module.exports = mongoose.model('LessonNumber', lessonNumberSchema);
