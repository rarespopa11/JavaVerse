// server/seedAchievements.js
const mongoose = require('mongoose');
require('dotenv').config();

// Conectare la MongoDB
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/JavaVerseDB')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Definire schema Achievement
const achievementSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User'
  },
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  icon: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['course', 'test', 'general', 'special']
  },
  dateEarned: { 
    type: Date, 
    default: Date.now 
  },
  isUnlocked: { 
    type: Boolean, 
    default: true 
  },
  progress: {
    current: { type: Number, default: 0 },
    target: { type: Number, default: 1 }
  },
  level: {
    type: Number,
    default: 1
  }
});

// Definire model Achievement
const Achievement = mongoose.model('Achievement', achievementSchema, 'achievements');

// Model User
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  email: String,
  password: String
}));

// Funcție pentru crearea unui nou model Achievement dacă nu există
async function createAchievementModel() {
  try {
    // Verifică dacă colecția există
    const collections = await mongoose.connection.db.listCollections({ name: 'achievements' }).toArray();
    
    if (collections.length === 0) {
      console.log('Crearea colecției achievements...');
      await mongoose.connection.db.createCollection('achievements');
    }
    
    return Achievement;
  } catch (error) {
    console.error('Error creating Achievement model:', error);
    throw error;
  }
}

// Funcție pentru inițializarea realizărilor pentru un utilizator
async function initializeAchievementsForUser(userId, isFirstUser = false) {
  try {
    // Verificăm dacă utilizatorul există
    const user = await User.findById(userId);
    if (!user) {
      console.log(`Utilizatorul cu ID-ul ${userId} nu există.`);
      return;
    }
    
    // Verificăm dacă utilizatorul are deja realizări
    const existingAchievements = await Achievement.find({ userId });
    
    if (existingAchievements.length > 0) {
      if (isFirstUser) {
        // Pentru primul utilizator, ștergem realizările existente și le recreăm
        console.log(`Ștergem ${existingAchievements.length} realizări existente pentru ${user.username || user.email}...`);
        await Achievement.deleteMany({ userId });
      } else {
        console.log(`Utilizatorul ${user.username || user.email} are deja ${existingAchievements.length} realizări. Se ignoră.`);
        return;
      }
    }
    
    // Lista cu realizări de bază pentru fiecare utilizator
    const baseAchievements = [
      // Realizări deblocate (simulate)
      {
        name: 'Primul pas',
        description: 'Te-ai înscris la primul curs',
        icon: '🏆',
        category: 'course',
        isUnlocked: true,
        dateEarned: new Date()
      },
      {
        name: 'Prima lecție',
        description: 'Ai completat prima lecție',
        icon: '📚',
        category: 'course',
        isUnlocked: true,
        dateEarned: new Date(Date.now() - 86400000) // Acum o zi
      },
      // Realizări blocate
      {
        name: 'Explorator',
        description: 'Te-ai înscris la 3 cursuri',
        icon: '🧭',
        category: 'course',
        isUnlocked: false,
        progress: { current: 1, target: 3 },
        dateEarned: null
      },
      {
        name: 'Student sârguincios',
        description: 'Ai completat 10 lecții în total',
        icon: '🎓',
        category: 'course',
        isUnlocked: false,
        progress: { current: 2, target: 10 },
        dateEarned: null
      },
      {
        name: 'Primul test',
        description: 'Ai susținut primul test',
        icon: '📝',
        category: 'test',
        isUnlocked: false,
        dateEarned: null
      },
      {
        name: 'Test perfect',
        description: 'Ai obținut 100% la un test',
        icon: '💯',
        category: 'test',
        isUnlocked: false,
        dateEarned: null
      },
      {
        name: 'Primul curs finalizat',
        description: 'Ai finalizat primul curs complet',
        icon: '🎯',
        category: 'course',
        isUnlocked: false,
        dateEarned: null
      },
      {
        name: 'Expert Java',
        description: 'Ai finalizat toate cursurile disponibile',
        icon: '🏅',
        category: 'special',
        isUnlocked: false,
        dateEarned: null
      }
    ];
    
    // Doar pentru primul utilizator, adăugăm mai multe realizări deblocate
    const achievements = [...baseAchievements];
    
    if (isFirstUser) {
      // Adăugăm realizări suplimentare pentru primul utilizator
      achievements.push({
        name: 'Primul test',
        description: 'Ai susținut primul test',
        icon: '📝',
        category: 'test',
        isUnlocked: true,
        dateEarned: new Date(Date.now() - 172800000) // Acum două zile
      });
      
      // Modificăm progresul pentru realizarea "Student sârguincios"
      const studentIndex = achievements.findIndex(a => a.name === 'Student sârguincios');
      if (studentIndex !== -1) {
        achievements[studentIndex].progress.current = 5; // Mai aproape de obiectiv
      }
    }
    
    // Creăm realizările pentru utilizator
    for (const achievement of achievements) {
      const newAchievement = new Achievement({
        userId,
        ...achievement
      });
      
      await newAchievement.save();
    }
    
    console.log(`S-au adăugat ${achievements.length} realizări pentru utilizatorul ${user.username || user.email}`);
  } catch (error) {
    console.error('Error initializing achievements for user:', error);
  }
}

// Funcție pentru popularea realizărilor pentru toți utilizatorii
async function seedAchievements() {
  try {
    // Creăm modelul Achievement dacă nu există
    await createAchievementModel();
    
    // Obținem toți utilizatorii
    const users = await User.find();
    
    if (users.length === 0) {
      console.log('Nu există utilizatori în baza de date. Creează utilizatori înainte de a rula acest script.');
      mongoose.connection.close();
      return;
    }
    
    console.log(`S-au găsit ${users.length} utilizatori. Inițializăm realizările...`);
    
    // Inițializăm realizări pentru toți utilizatorii
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      await initializeAchievementsForUser(user._id, i === 0);
    }
    
    console.log('\nPopularea realizărilor a fost finalizată cu succes!');
  } catch (error) {
    console.error('Error seeding achievements:', error);
  } finally {
    // Închidem conexiunea la baza de date
    mongoose.connection.close();
    console.log('Conexiunea la baza de date a fost închisă.');
  }
}

// Rulăm funcția de seeding
seedAchievements();