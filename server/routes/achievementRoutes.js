// server/routes/achievementRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Middleware pentru autentificare
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ message: 'Unauthorized' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
};

// Rută de test pentru verificarea funcționării
router.get('/api/achievements/test', (req, res) => {
  res.json({ success: true, message: 'Achievement routes are working!' });
});

// Obține toate realizările unui utilizator
router.get('/api/achievements/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificăm dacă ID-ul este valid
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    
    // Obținem modelul Achievement
    const Achievement = mongoose.model('Achievement');
    
    // Obținem toate realizările utilizatorului
    const achievements = await Achievement.find({ userId });
    
    // Dacă utilizatorul nu are realizări, inițializăm câteva realizări de bază
    if (achievements.length === 0) {
      // Definim realizările inițiale (blocate)
      const initialAchievements = [
        {
          userId,
          name: 'Primul pas',
          description: 'Te-ai înscris la primul curs',
          icon: '🏆',
          category: 'course',
          isUnlocked: false,
          progress: { current: 0, target: 1 },
          dateEarned: null
        },
        {
          userId,
          name: 'Prima lecție',
          description: 'Ai completat prima lecție',
          icon: '📚',
          category: 'course',
          isUnlocked: false, 
          progress: { current: 0, target: 1 },
          dateEarned: null
        },
        {
          userId,
          name: 'Explorator',
          description: 'Te-ai înscris la 3 cursuri',
          icon: '🧭',
          category: 'course',
          isUnlocked: false,
          progress: { current: 0, target: 3 },
          dateEarned: null
        },
        {
          userId,
          name: 'Student sârguincios',
          description: 'Ai completat 10 lecții în total',
          icon: '🎓',
          category: 'course',
          isUnlocked: false,
          progress: { current: 0, target: 10 },
          dateEarned: null
        },
        {
          userId,
          name: 'Primul test',
          description: 'Ai susținut primul test',
          icon: '📝',
          category: 'test',
          isUnlocked: false,
          progress: { current: 0, target: 1 },
          dateEarned: null
        },
        {
          userId,
          name: 'Test perfect',
          description: 'Ai obținut 100% la un test',
          icon: '💯',
          category: 'test',
          isUnlocked: false,
          progress: { current: 0, target: 1 },
          dateEarned: null
        }
      ];
      
      // Salvăm realizările inițiale
      for (const achievement of initialAchievements) {
        const newAchievement = new Achievement(achievement);
        await newAchievement.save();
      }
      
      // Încărcăm realizările nou create
      const createdAchievements = await Achievement.find({ userId });
      return res.json({ success: true, achievements: createdAchievements });
    }
    
    res.json({ success: true, achievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ success: false, message: 'Error fetching achievements' });
  }
});

// Verifică și acordă realizări pentru un utilizator
router.post('/api/achievements/check', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Verificăm dacă utilizatorul din cerere este același cu cel autentificat
    if (req.user.id !== userId) {
      return res.status(403).json({ success: false, message: 'You can only check achievements for your own account' });
    }
    
    // Obținem modelele necesare
    const Achievement = mongoose.model('Achievement');
    const UserProgress = mongoose.model('UserProgress');
    const Course = mongoose.model('Course');
    
    // Obținem progresul utilizatorului
    const userProgress = await UserProgress.find({ userId }).populate('courseId');
    
    // Obținem realizările existente ale utilizatorului
    const existingAchievements = await Achievement.find({ userId });
    
    // Array pentru realizările noi
    const newAchievements = [];
    
    // Verificăm și actualizăm realizările
    
    // 1. Verificăm realizarea "Primul pas"
    if (!existingAchievements.some(a => a.name === 'Primul pas' && a.isUnlocked)) {
      if (userProgress.length >= 1) {
        // Utilizatorul s-a înscris la cel puțin un curs
        const achievement = existingAchievements.find(a => a.name === 'Primul pas');
        if (achievement) {
          // Actualizăm realizarea existentă
          achievement.isUnlocked = true;
          achievement.dateEarned = new Date();
          await achievement.save();
          newAchievements.push(achievement);
        } else {
          // Creăm și salvăm o nouă realizare
          const newAchievement = new Achievement({
            userId,
            name: 'Primul pas',
            description: 'Te-ai înscris la primul curs',
            icon: '🏆',
            category: 'course',
            isUnlocked: true,
            dateEarned: new Date()
          });
          await newAchievement.save();
          newAchievements.push(newAchievement);
        }
      }
    }
    
    // 2. Verificăm realizarea "Prima lecție"
    if (!existingAchievements.some(a => a.name === 'Prima lecție' && a.isUnlocked)) {
      if (userProgress.some(p => p.completedLessons >= 1)) {
        // Utilizatorul a completat cel puțin o lecție
        const achievement = existingAchievements.find(a => a.name === 'Prima lecție');
        if (achievement) {
          // Actualizăm realizarea existentă
          achievement.isUnlocked = true;
          achievement.dateEarned = new Date();
          await achievement.save();
          newAchievements.push(achievement);
        } else {
          // Creăm și salvăm o nouă realizare
          const newAchievement = new Achievement({
            userId,
            name: 'Prima lecție',
            description: 'Ai completat prima lecție',
            icon: '📚',
            category: 'course',
            isUnlocked: true,
            dateEarned: new Date()
          });
          await newAchievement.save();
          newAchievements.push(newAchievement);
        }
      }
    }
    
    // 3. Verificăm realizarea "Explorator"
    if (!existingAchievements.some(a => a.name === 'Explorator' && a.isUnlocked)) {
      if (userProgress.length >= 3) {
        // Utilizatorul s-a înscris la cel puțin 3 cursuri
        const achievement = existingAchievements.find(a => a.name === 'Explorator');
        if (achievement) {
          // Actualizăm realizarea existentă
          achievement.isUnlocked = true;
          achievement.dateEarned = new Date();
          await achievement.save();
          newAchievements.push(achievement);
        } else {
          // Creăm și salvăm o nouă realizare
          const newAchievement = new Achievement({
            userId,
            name: 'Explorator',
            description: 'Te-ai înscris la 3 cursuri',
            icon: '🧭',
            category: 'course',
            isUnlocked: true,
            dateEarned: new Date()
          });
          await newAchievement.save();
          newAchievements.push(newAchievement);
        }
      } else {
        // Actualizăm progresul
        const achievement = existingAchievements.find(a => a.name === 'Explorator');
        if (achievement) {
          achievement.progress.current = userProgress.length;
          await achievement.save();
        }
      }
    }
    
    // 4. Verificăm realizarea "Student sârguincios"
    if (!existingAchievements.some(a => a.name === 'Student sârguincios' && a.isUnlocked)) {
      const totalLessons = userProgress.reduce((total, p) => total + p.completedLessons, 0);
      if (totalLessons >= 10) {
        // Utilizatorul a completat cel puțin 10 lecții în total
        const achievement = existingAchievements.find(a => a.name === 'Student sârguincios');
        if (achievement) {
          // Actualizăm realizarea existentă
          achievement.isUnlocked = true;
          achievement.dateEarned = new Date();
          await achievement.save();
          newAchievements.push(achievement);
        } else {
          // Creăm și salvăm o nouă realizare
          const newAchievement = new Achievement({
            userId,
            name: 'Student sârguincios',
            description: 'Ai completat 10 lecții în total',
            icon: '🎓',
            category: 'course',
            isUnlocked: true,
            dateEarned: new Date()
          });
          await newAchievement.save();
          newAchievements.push(newAchievement);
        }
      } else {
        // Actualizăm progresul
        const achievement = existingAchievements.find(a => a.name === 'Student sârguincios');
        if (achievement) {
          achievement.progress.current = totalLessons;
          await achievement.save();
        }
      }
    }
    
    // 5. Verificăm realizarea "Primul test"
    if (!existingAchievements.some(a => a.name === 'Primul test' && a.isUnlocked)) {
      if (userProgress.some(p => p.testScore !== null)) {
        // Utilizatorul a susținut cel puțin un test
        const achievement = existingAchievements.find(a => a.name === 'Primul test');
        if (achievement) {
          // Actualizăm realizarea existentă
          achievement.isUnlocked = true;
          achievement.dateEarned = new Date();
          await achievement.save();
          newAchievements.push(achievement);
        } else {
          // Creăm și salvăm o nouă realizare
          const newAchievement = new Achievement({
            userId,
            name: 'Primul test',
            description: 'Ai susținut primul test',
            icon: '📝',
            category: 'test',
            isUnlocked: true,
            dateEarned: new Date()
          });
          await newAchievement.save();
          newAchievements.push(newAchievement);
        }
      }
    }
    
    // 6. Verificăm realizarea "Test perfect"
    if (!existingAchievements.some(a => a.name === 'Test perfect' && a.isUnlocked)) {
      if (userProgress.some(p => p.testScore === 100)) {
        // Utilizatorul a obținut 100% la cel puțin un test
        const achievement = existingAchievements.find(a => a.name === 'Test perfect');
        if (achievement) {
          // Actualizăm realizarea existentă
          achievement.isUnlocked = true;
          achievement.dateEarned = new Date();
          await achievement.save();
          newAchievements.push(achievement);
        } else {
          // Creăm și salvăm o nouă realizare
          const newAchievement = new Achievement({
            userId,
            name: 'Test perfect',
            description: 'Ai obținut 100% la un test',
            icon: '💯',
            category: 'test',
            isUnlocked: true,
            dateEarned: new Date()
          });
          await newAchievement.save();
          newAchievements.push(newAchievement);
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Achievements checked', 
      newAchievements,
      totalAchievements: existingAchievements.length + newAchievements.length - existingAchievements.filter(a => newAchievements.some(na => na._id.toString() === a._id.toString())).length
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ success: false, message: 'Error checking achievements' });
  }
});

module.exports = router;