require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const LessonNumber = require('./models/LessonNumber');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');
const verifyRoutes = require('./routes/verify');
const settingsRoutes = require('./routes/settings');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/', (req, res) => {
  res.send('Oasis Computer Institute API is running.');
});

async function seedLessonNumbers() {
  const count = await LessonNumber.countDocuments();
  if (count === 0) {
    const prefix = process.env.LESSON_PREFIX || 'OCI-26-';
    const startCount = parseInt(process.env.LESSON_START_COUNT, 10) || 40;
    const docs = [];
    for (let i = 1; i <= startCount; i++) {
      docs.push({ number: prefix + String(i).padStart(3, '0'), used: false });
    }
    await LessonNumber.insertMany(docs);
    console.log(`Seeded ${docs.length} lesson numbers (${docs[0].number} to ${docs[docs.length - 1].number}).`);
  }
}

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedLessonNumbers();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
