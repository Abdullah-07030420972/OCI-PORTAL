const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Message = require('../models/Message');
const authRequired = require('../middleware/auth');
const { computeAverage, remarkFor } = require('../utils/grading');

router.get('/me', authRequired('student'), async (req, res) => {
  const student = await Student.findOne({ username: req.user.username });
  if (!student) return res.status(404).json({ error: 'Student not found.' });

  const average = computeAverage(student.scores);
  res.json({
    fullName: student.fullName,
    username: student.username,
    lessonNumber: student.lessonNumber,
    scores: student.scores,
    average,
    remark: remarkFor(average)
  });
});

router.post('/message', authRequired('student'), async (req, res) => {
  const student = await Student.findOne({ username: req.user.username });
  if (!student) return res.status(404).json({ error: 'Student not found.' });

  const message = String(req.body.message || '').trim();
  if (!message) {
    return res.status(400).json({ error: 'Please write a message before sending.' });
  }

  const doc = await Message.create({
    studentUsername: student.username,
    fullName: student.fullName,
    lessonNumber: student.lessonNumber,
    course: req.body.course || 'General',
    message
  });

  res.json({ ok: true, message: doc });
});

module.exports = router;
