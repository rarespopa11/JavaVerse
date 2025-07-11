// server/seedUserProgress.js
const mongoose = require('mongoose');
require('dotenv').config();

// Conectare la MongoDB
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/JavaVerseDB')
  .then(() => {
    console.log('Connected to MongoDB');
    // Rulăm funcția de seeding după ce ne-am conectat
    seedUserProgress();
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Funcția pentru popularea tabelei UserProgress
async function seedUserProgress() {
  try {
    // Așteptăm ca modelele să fie disponibile
    const User = mongoose.model('User');
    const Course = mongoose.model('Course');
    const UserProgress = mongoose.model('UserProgress');
    
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
    
    console.log(`S-au găsit ${users.length} utilizatori și ${courses.length} cursuri`);
    
    // Pentru fiecare utilizator, creăm progres pentru toate cursurile
    for (const user of users) {
      console.log(`Procesare utilizator: ${user.username || user.email}`);
      
      // Pentru fiecare curs, adăugăm o intrare de progres pentru utilizator
      for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        
        // Verificăm dacă există deja progres pentru acest utilizator și curs
        const existingProgress = await UserProgress.findOne({ 
          userId: user._id, 
          courseId: course._id 
        });
        
        if (existingProgress) {
          console.log(`Progresul pentru cursul "${course.name}" există deja pentru utilizatorul ${user.username || user.email}. Se ignoră.`);
          continue;
        }
        
        // Generăm valori aleatorii pentru progres
        // Primele cursuri au mai mult progres, cursurile ulterioare mai puțin
        const completedLessons = Math.max(0, Math.min(course.totalLessons, Math.floor(course.totalLessons / (i + 1))));
        
        // Generăm un scor aleator pentru test dacă utilizatorul a completat cel puțin o lecție
        // Altfel, scorul este null (testul nu a fost susținut)
        const testScore = completedLessons > 0 ? Math.floor(70 + Math.random() * 30) : null;
        
        const progress = new UserProgress({
          userId: user._id,
          courseId: course._id,
          completedLessons: completedLessons,
          totalLessons: course.totalLessons,
          testScore: testScore
        });
        
        await progress.save();
        
        console.log(`S-a adăugat progres pentru cursul "${course.name}" pentru utilizatorul ${user.username || user.email}: ${completedLessons}/${course.totalLessons} lecții, scor test: ${testScore}`);
      }
    }
    
    console.log('\nPopularea cu date de progres a fost finalizată cu succes!');
    mongoose.connection.close();
    
  } catch (error) {
    console.error('Error seeding UserProgress:', error);
    mongoose.connection.close();
  }
}