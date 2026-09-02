const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Message = require('../models/Message');
const authRequired = require('../middleware/auth');
const { computeAverage, remarkFor } = require('../utils/grading');
const { generateCertificatePdf } = require('../utils/certificate');

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
    remark: remarkFor(average),
    certificateIssued: student.certificateIssued,
    completionDate: student.completionDate,
    paymentConfirmed: student.paymentConfirmed,
    stamped: student.stamped
  });
});

router.get('/certificate/download', authRequired('student'), async (req, res) => {
  const student = await Student.findOne({ username: req.user.username });
  if (!student) return res.status(404).json({ error: 'Student not found.' });

  if (!student.certificateIssued || !student.paymentConfirmed || !student.stamped) {
    return res.status(403).json({ error: 'Your certificate is not fully authorized for download yet.' });
  }

  const average = computeAverage(student.scores);
  const remark = remarkFor(average);

  try {
    const pdfBytes = await generateCertificatePdf(student, average, remark.label);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${student.lessonNumber}-certificate.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not generate certificate. Please contact your instructor.' });
  }
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
