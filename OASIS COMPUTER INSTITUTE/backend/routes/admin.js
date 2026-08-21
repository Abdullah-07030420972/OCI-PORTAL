const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const LessonNumber = require('../models/LessonNumber');
const Message = require('../models/Message');
const authRequired = require('../middleware/auth');
const { computeAverage, remarkFor, COURSES } = require('../utils/grading');

router.get('/students', authRequired('admin'), async (req, res) => {
  const students = await Student.find().sort({ createdAt: -1 });
  const out = students.map((s) => {
    const average = computeAverage(s.scores);
    return {
      username: s.username,
      fullName: s.fullName,
      lessonNumber: s.lessonNumber,
      average,
      remark: remarkFor(average).label,
      certificateIssued: s.certificateIssued
    };
  });
  res.json(out);
});

router.get('/students/:username', authRequired('admin'), async (req, res) => {
  const student = await Student.findOne({ username: String(req.params.username).toLowerCase() });
  if (!student) return res.status(404).json({ error: 'Student not found.' });
  const average = computeAverage(student.scores);
  res.json({
    username: student.username,
    fullName: student.fullName,
    lessonNumber: student.lessonNumber,
    scores: student.scores,
    average,
    remark: remarkFor(average),
    certificateIssued: student.certificateIssued,
    completionDate: student.completionDate
  });
});

router.put('/students/:username/certificate', authRequired('admin'), async (req, res) => {
  const student = await Student.findOne({ username: String(req.params.username).toLowerCase() });
  if (!student) return res.status(404).json({ error: 'Student not found.' });

  student.certificateIssued = !!req.body.issued;
  student.completionDate = student.certificateIssued ? (student.completionDate || new Date()) : null;
  await student.save();

  res.json({ ok: true, certificateIssued: student.certificateIssued, completionDate: student.completionDate });
});

router.put('/students/:username/scores', authRequired('admin'), async (req, res) => {
  const student = await Student.findOne({ username: String(req.params.username).toLowerCase() });
  if (!student) return res.status(404).json({ error: 'Student not found.' });

  const updates = req.body.scores || {};
  COURSES.forEach((key) => {
    if (key in updates) {
      const val = updates[key];
      student.scores[key] =
        val === null || val === '' || val === undefined
          ? null
          : Math.max(0, Math.min(100, Number(val)));
    }
  });
  await student.save();

  const average = computeAverage(student.scores);
  res.json({ ok: true, scores: student.scores, average, remark: remarkFor(average) });
});

router.get('/lesson-numbers', authRequired('admin'), async (req, res) => {
  const numbers = await LessonNumber.find().sort({ number: 1 });
  res.json({
    defaultPrefix: process.env.LESSON_PREFIX || 'OCI-26-',
    numbers
  });
});

router.post('/lesson-numbers/generate', authRequired('admin'), async (req, res) => {
  const count = Math.min(Math.max(parseInt(req.body.count, 10) || 20, 1), 200);

  let prefix = (req.body.prefix ? String(req.body.prefix) : (process.env.LESSON_PREFIX || 'OCI-26-'))
    .trim()
    .toUpperCase();
  if (!prefix.endsWith('-')) prefix += '-';
  if (!/^[A-Z0-9-]+$/.test(prefix)) {
    return res.status(400).json({ error: 'Prefix should only contain letters, numbers, and dashes, e.g. OCI-27-' });
  }

  // Find the highest existing number for THIS prefix specifically, so switching
  // to a new prefix (e.g. a new year) always starts fresh at 001 unless told otherwise.
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const existingForPrefix = await LessonNumber.find({ number: { $regex: '^' + escapedPrefix } })
    .sort({ number: -1 })
    .limit(1);

  let start = req.body.start ? Math.max(1, parseInt(req.body.start, 10) || 1) : 1;
  if (existingForPrefix.length) {
    const lastNum = parseInt(existingForPrefix[0].number.slice(prefix.length), 10);
    if (!Number.isNaN(lastNum)) start = lastNum + 1;
  }

  const docs = [];
  for (let i = start; i < start + count; i++) {
    docs.push({ number: prefix + String(i).padStart(3, '0'), used: false });
  }

  try {
    await LessonNumber.insertMany(docs, { ordered: false });
  } catch (err) {
    // Duplicate key errors just mean some numbers in this batch already existed - safe to ignore.
    if (!err.code || err.code !== 11000) throw err;
  }

  res.json({ ok: true, added: docs.length, prefix });
});

router.get('/messages', authRequired('admin'), async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
});

router.put('/messages/:id/resolve', authRequired('admin'), async (req, res) => {
  const msg = await Message.findById(req.params.id);
  if (!msg) return res.status(404).json({ error: 'Message not found.' });
  msg.status = 'resolved';
  await msg.save();
  res.json({ ok: true });
});

module.exports = router;
