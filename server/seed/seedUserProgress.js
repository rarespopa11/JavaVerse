// seedUserProgress.js
const mongoose = require('mongoose');
require('dotenv').config();

// Conectare la MongoDB
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/JavaVerseDB')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Definire modele - definim modelele direct aici pentru a evita importurile externe
// Schema User
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Schema Course
const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  content: { 
    type: [{
      title: { type: String, required: true },
      content: { type: String, required: true },
      examples: [{
        code: { type: String, required: true },
        explanation: { type: String, required: true }
      }]
    }], 
    required: true 
  },
  totalLessons: { type: Number, required: true },
  questions: { type: Array }
});

// Schema UserProgress
const userProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  courseId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Course' },
  completedLessons: { type: Number, required: true },
  totalLessons: { type: Number, required: true },
  testScore: { type: Number, default: null },
});

// Creăm modelele
const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const UserProgress = mongoose.model('UserProgress', userProgressSchema);

// Funcția pentru popularea tabelei UserProgress
async function seedUserProgress() {
  try {
    console.log('Starting to seed user progress...');
    
    // Obținem toți utilizatorii
    const users = await User.find();
    
    if (users.length === 0) {
      console.log('Nu există utilizatori în baza de date. Creează utilizatori înainte de a rula acest script.');
      mongoose.connection.close();
      return;
    }
    
    // Obținem toate cursurile
    const courses = await Course.find();
    
    if (courses.length === 0) {
      console.log('Nu există cursuri în baza de date. Creează cursuri înainte de a rula acest script.');
      mongoose.connection.close();
      return;
    }
    
    console.log(`S-au găsit ${users.length} utilizatori și ${courses.length} cursuri.`);
    
    // Înainte de a adăuga date noi, ștergem toate înregistrările existente
    await UserProgress.deleteMany({});
    console.log('Toate înregistrările de progres anterioare au fost șterse.');
    
    // Pentru fiecare utilizator, adăugăm progres pentru fiecare curs
    for (const user of users) {
      console.log(`Adăugăm progres pentru utilizatorul: ${user.username} (${user._id})`);
      
      for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        console.log(`- Procesăm cursul: ${course.name} (${course._id})`);
        
        // Generăm valori diferite pentru fiecare utilizator și curs
        // Primele cursuri au mai mult progres
        const completedLessons = Math.min(
          course.totalLessons, 
          Math.floor((course.totalLessons / (i + 1)) * Math.random() * 2)
        );
        
        // Generăm un scor aleator pentru test dacă utilizatorul a completat cel puțin jumătate din lecții
        // Altfel, scorul este null (testul nu a fost susținut)
        const testScore = completedLessons > course.totalLessons / 2 
          ? Math.floor(70 + Math.random() * 30) 
          : null;
        
        // Creăm o nouă intrare de progres
        const progress = new UserProgress({
          userId: user._id,
          courseId: course._id,
          completedLessons: completedLessons,
          totalLessons: course.totalLessons,
          testScore: testScore
        });
        
        try {
          // Salvăm progresul în baza de date
          await progress.save();
          console.log(`   ✓ Progres salvat: ${completedLessons}/${course.totalLessons} lecții, scor test: ${testScore}`);
        } catch (error) {
          console.error(`   ✗ Eroare la salvarea progresului:`, error);
        }
      }
    }
    
    console.log('\nPopularea cu date de progres a fost finalizată cu succes!');
  } catch (error) {
    console.error('Eroare generală la popularea bazei de date:', error);
  } finally {
    // Închidem conexiunea la baza de date
    mongoose.connection.close();
    console.log('Conexiunea la baza de date a fost închisă.');
  }
}

// Rulăm funcția de seeding
seedUserProgress();