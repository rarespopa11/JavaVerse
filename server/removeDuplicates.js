const mongoose = require('mongoose');
const Course = require('./models/course');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/JavaVerseDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

async function removeDuplicateCourses() {
  try {
    const allCourses = await Course.find();

    const seenCourses = new Set();
    const duplicateCourses = [];

    for (const course of allCourses) {
      if (seenCourses.has(course.name)) {
        duplicateCourses.push(course._id);
      } else {
        seenCourses.add(course.name);
      }
    }

    // Verifică dacă există duplicate și șterge-le
    if (duplicateCourses.length > 0) {
      await Course.deleteMany({ _id: { $in: duplicateCourses } });
      console.log(`${duplicateCourses.length} duplicate courses deleted.`);
    } else {
      console.log('No duplicate courses found.');
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error removing duplicates:', error);
    mongoose.connection.close();
  }
}

removeDuplicateCourses();
