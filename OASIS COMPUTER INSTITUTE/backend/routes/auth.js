const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Student = require('../models/Student');
const LessonNumber = require('../models/LessonNumber');

router.post('/register', async (req, res) => {
  try {
    let { lessonNumber, fullName, username, password } = req.body;

    if (!lessonNumber || !fullName || !username || !password) {
      return res.status(400).json({ error: 'Please fill in every field.' });
    }

    lessonNumber = String(lessonNumber).trim().toUpperCase();
    username = String(username).trim().toLowerCase();
    fullName = String(fullName).trim();

    if (password.length < 4) {
      return res.status(400).json({ error: 'Password should be at least 4 characters.' });
    }

    const lesson = await LessonNumber.findOne({ number: lessonNumber });
    if (!lesson) {
      return res.status(400).json({ error: 'That lesson number was not found. Check your enrollment slip and try again.' });
    }
    if (lesson.used) {
      return res.status(400).json({ error: 'That lesson number has already been used to create an account.' });
    }

    const existing = await Student.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: 'That username is already taken. Choose another.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const student = await Student.create({ username, passwordHash, fullName, lessonNumber });

    lesson.used = true;
    await lesson.save();

    const token = jwt.sign({ role: 'student', username }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, fullName: student.fullName, username: student.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const username = String(req.body.username || '').trim().toLowerCase();
    const password = req.body.password || '';

    const student = await Student.findOne({ username });
    if (!student) {
      return res.status(400).json({ error: 'Username or password is incorrect.' });
    }
    const match = await bcrypt.compare(password, student.passwordHash);
    if (!match) {
      return res.status(400).json({ error: 'Username or password is incorrect.' });
    }
    const token = jwt.sign({ role: 'student', username }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, fullName: student.fullName, username: student.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

router.post('/admin-login', (req, res) => {
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(400).json({ error: 'Incorrect admin password.' });
  }
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

module.exports = router;
