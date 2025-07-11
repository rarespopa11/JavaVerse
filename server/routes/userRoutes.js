// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
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

// Ruta pentru obținerea informațiilor utilizatorului
router.get('/api/users/:userId', async (req, res) => {
  try {
    // Importăm modelul User direct aici pentru a evita problemele de încărcare
    const User = require('mongoose').model('User');
    
    const userId = req.params.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Excludem parola din răspuns pentru securitate
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      avatarType: user.avatarType,
      createdAt: user._id.getTimestamp() // MongoDB stochează timestamp-ul creării în ObjectId
    };
    
    res.json({ success: true, user: userResponse });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Error fetching user' });
  }
});

// Ruta pentru actualizarea numelui de utilizator
router.put('/api/users/:userId/username', authenticateToken, async (req, res) => {
  try {
    const User = require('mongoose').model('User');
    
    const userId = req.params.userId;
    const { username } = req.body;
    
    // Verificăm dacă utilizatorul autentificat este același cu cel pe care încercăm să-l actualizăm
    if (req.user.id !== userId) {
      return res.status(403).json({ success: false, message: 'You can only update your own account' });
    }
    
    // Validare pentru username
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters long' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Actualizăm numele de utilizator
    user.username = username;
    await user.save();
    
    // Returnăm utilizatorul actualizat (fără parolă)
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      avatarType: user.avatarType,
      createdAt: user._id.getTimestamp()
    };
    
    res.json({ success: true, user: userResponse, message: 'Username updated successfully' });
  } catch (error) {
    console.error('Error updating username:', error);
    res.status(500).json({ success: false, message: 'Error updating username' });
  }
});

// Rută pentru schimbarea parolei
router.put('/api/users/:userId/change-password', authenticateToken, async (req, res) => {
  try {
    const User = require('mongoose').model('User');
    
    const userId = req.params.userId;
    const { currentPassword, newPassword } = req.body;
    
    // Verificăm dacă utilizatorul autentificat este același cu cel pe care încercăm să-l actualizăm
    if (req.user.id !== userId) {
      return res.status(403).json({ success: false, message: 'You can only change your own password' });
    }
    
    // Validare pentru parola nouă
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Verificăm dacă parola curentă este corectă
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Criptăm noua parolă
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    await user.save();
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Error changing password' });
  }
});

// Rută pentru actualizarea avatar-ului utilizatorului
router.put('/api/users/:userId/avatar', authenticateToken, async (req, res) => {
  try {
    const User = require('mongoose').model('User');
    
    const userId = req.params.userId;
    const { avatar, avatarType } = req.body;
    
    // Verificăm dacă utilizatorul autentificat este același cu cel pe care încercăm să-l actualizăm
    if (req.user.id !== userId) {
      return res.status(403).json({ success: false, message: 'You can only update your own avatar' });
    }
    
    // Validare pentru tipul de avatar
    if (!['preset', 'custom', 'default'].includes(avatarType)) {
      return res.status(400).json({ success: false, message: 'Invalid avatar type' });
    }
    
    // Validare pentru avatar preset
    if (avatarType === 'preset') {
      const validPresets = ['dev1', 'dev2', 'student1', 'student2', 'prof1', 'prof2', 
                           'ninja', 'wizard', 'robot', 'alien', 'pirate', 'astronaut'];
      if (!validPresets.includes(avatar)) {
        return res.status(400).json({ success: false, message: 'Invalid preset avatar' });
      }
    }
    
    // Validare pentru avatar custom (verificăm dacă e base64 valid)
    if (avatarType === 'custom') {
      if (!avatar || !avatar.startsWith('data:image/')) {
        return res.status(400).json({ success: false, message: 'Invalid custom avatar data' });
      }
      
      // Verificăm dimensiunea (aproximativ, pentru base64)
      const base64Size = avatar.length * 0.75; // aproximare pentru dimensiunea în bytes
      if (base64Size > 5 * 1024 * 1024) { // 5MB limit
        return res.status(400).json({ success: false, message: 'Avatar image too large (max 5MB)' });
      }
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Actualizăm avatar-ul utilizatorului
    user.avatar = avatar;
    user.avatarType = avatarType;
    
    await user.save();
    
    // Returnăm utilizatorul actualizat (fără parolă)
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      avatarType: user.avatarType,
      createdAt: user._id.getTimestamp()
    };
    
    res.json({ success: true, user: userResponse, message: 'Avatar updated successfully' });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ success: false, message: 'Error updating avatar' });
  }
});

// Rută pentru obținerea avatar-ului unui utilizator (publică)
router.get('/api/users/:userId/avatar', async (req, res) => {
  try {
    const User = require('mongoose').model('User');
    
    const userId = req.params.userId;
    
    const user = await User.findById(userId).select('avatar avatarType username');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      avatar: {
        data: user.avatar,
        type: user.avatarType || 'default',
        username: user.username
      }
    });
  } catch (error) {
    console.error('Error fetching avatar:', error);
    res.status(500).json({ success: false, message: 'Error fetching avatar' });
  }
});

// Rută pentru resetarea avatar-ului la cel implicit
router.delete('/api/users/:userId/avatar', authenticateToken, async (req, res) => {
  try {
    const User = require('mongoose').model('User');
    
    const userId = req.params.userId;
    
    // Verificăm dacă utilizatorul autentificat este același cu cel pe care încercăm să-l actualizăm
    if (req.user.id !== userId) {
      return res.status(403).json({ success: false, message: 'You can only reset your own avatar' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Resetăm avatar-ul la cel implicit
    user.avatar = 'default-avatar.png';
    user.avatarType = 'default';
    
    await user.save();
    
    // Returnăm utilizatorul actualizat (fără parolă)
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      avatarType: user.avatarType,
      createdAt: user._id.getTimestamp()
    };
    
    res.json({ success: true, user: userResponse, message: 'Avatar reset to default successfully' });
  } catch (error) {
    console.error('Error resetting avatar:', error);
    res.status(500).json({ success: false, message: 'Error resetting avatar' });
  }
});

// Ruta pentru obținerea progresului utilizatorului
router.get('/api/user/progress/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const UserProgress = require('mongoose').model('UserProgress');
    
    // Găsim progresul utilizatorului și populăm referințele la cursuri
    const progress = await UserProgress.find({ userId })
      .populate({
        path: 'courseId',
        select: 'name description totalLessons' // Selectăm doar câmpurile de care avem nevoie
      });
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ success: false, message: 'Error fetching user progress' });
  }
});

// Salvarea progresului utilizatorului
router.post('/api/user/progress', authenticateToken, async (req, res) => {
  const { userId, courseId, completedLessons, totalLessons, testScore } = req.body;

  try {
    const UserProgress = require('mongoose').model('UserProgress');
    
    // Verifică dacă utilizatorul autentificat este același cu cel din request
    if (req.user.id !== userId) {
      return res.status(403).json({ success: false, message: 'You can only update your own progress' });
    }

    // Verificăm dacă progresul există deja
    let userProgress = await UserProgress.findOne({ userId, courseId });

    if (userProgress) {
      // Dacă există, actualizăm progresul
      userProgress.completedLessons = completedLessons;
      userProgress.testScore = testScore;
      await userProgress.save(); // Salvăm actualizările
    } else {
      // Dacă nu există, creăm un nou progres
      userProgress = new UserProgress({
        userId,
        courseId,
        completedLessons,
        totalLessons,
        testScore,
      });
      await userProgress.save(); // Salvăm progresul nou
    }

    res.status(200).json({ success: true, message: 'User progress saved successfully' });
  } catch (error) {
    console.error('Error saving user progress:', error);
    res.status(500).json({ success: false, message: 'Error saving user progress' });
  }
});

module.exports = router;