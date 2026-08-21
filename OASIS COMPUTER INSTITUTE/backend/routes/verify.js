const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { computeAverage, remarkFor } = require('../utils/grading');

// Public - no login required. Anyone (student, parent, employer) can check
// a certificate by lesson number. Only non-sensitive fields are returned:
// no username, no password, nothing that could be used to log in as the student.
router.get('/:lessonNumber', async (req, res) => {
  const lessonNumber = String(req.params.lessonNumber || '').trim().toUpperCase();
  if (!lessonNumber) {
    return res.status(400).json({ error: 'Please provide a lesson number.' });
  }

  const student = await Student.findOne({ lessonNumber }).select(
    'fullName lessonNumber scores certificateIssued completionDate createdAt'
  );

  if (!student) {
    return res.status(404).json({ error: 'No record found for that lesson number. Check that it was entered correctly.' });
  }

  const average = computeAverage(student.scores);
  res.json({
    found: true,
    fullName: student.fullName,
    lessonNumber: student.lessonNumber,
    scores: student.scores,
    average,
    remark: remarkFor(average),
    certificateIssued: student.certificateIssued,
    completionDate: student.completionDate,
    enrolledAt: student.createdAt
  });
});

module.exports = router;
