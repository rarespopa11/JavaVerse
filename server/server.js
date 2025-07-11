// server/server.js - Fixed version with proper progress saving
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

app.use(cors({ origin: 'http://localhost:3000' })); // Permite cererile din React
app.use(express.json({ limit: '10mb' })); // Mărește limita pentru avatar-uri base64
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Conectare la MongoDB
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Middleware pentru autentificare
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Definirea modelului pentru utilizatori - ACTUALIZAT cu avatar
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { 
    type: String, 
    default: 'default-avatar.png' // Avatar implicit
  },
  avatarType: {
    type: String,
    enum: ['default', 'preset', 'custom'],
    default: 'default'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  preferences: {
    theme: {
      type: String,
      enum: ['dark', 'light', 'auto'],
      default: 'dark'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'ro'
    }
  }
});

// Adaugă un index pentru email pentru performanță mai bună
userSchema.index({ email: 1 });

// Metodă pentru obținerea URL-ului avatar-ului
userSchema.methods.getAvatarUrl = function() {
  if (this.avatarType === 'preset') {
    // Pentru avatar-uri preset, returnăm ID-ul preset-ului
    return this.avatar;
  } else if (this.avatarType === 'custom') {
    // Pentru avatar-uri custom, returnăm URL-ul sau datele base64
    return this.avatar;
  }
  // Pentru avatar implicit
  return 'default-avatar.png';
};

// Metodă pentru verificarea dacă utilizatorul are avatar custom
userSchema.methods.hasCustomAvatar = function() {
  return this.avatarType === 'custom' && this.avatar && this.avatar.startsWith('data:image/');
};

const User = mongoose.model('User', userSchema);

// Definirea modelului pentru cursuri
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

const Course = mongoose.model('Course', courseSchema);

// FIXAT: Definirea modelului pentru progresul utilizatorului cu index-uri îmbunătățite
const userProgressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User',
    index: true // Index pentru căutări rapide
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'Course',
    index: true // Index pentru căutări rapide
  },
  completedLessons: { type: Number, required: true, default: 0 },
  totalLessons: { type: Number, required: true },
  testScore: { type: Number, default: null },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
});

// Index compus pentru găsirea rapidă a progresului unui utilizator pentru un curs specific
userProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Middleware pentru a actualiza lastUpdated la fiecare salvare
userProgressSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  this.isCompleted = this.completedLessons >= this.totalLessons && this.testScore !== null;
  next();
});

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

// Definirea modelului pentru realizări
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

const Achievement = mongoose.model('Achievement', achievementSchema);

// Definirea modelului pentru execuțiile de cod
const codeExecutionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true
  },
  code: {
    type: String,
    required: true
  },
  success: {
    type: Boolean,
    required: true,
    default: false
  },
  output: {
    type: String,
    default: ''
  },
  executionTime: {
    type: Number,
    default: 0
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course.content',
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Adăugăm un index compus pentru a optimiza interogările
codeExecutionSchema.index({ userId: 1, timestamp: -1 });

const CodeExecution = mongoose.model('CodeExecution', codeExecutionSchema);

// Import rute - IMPORTANT: Rutele trebuie importate DUPĂ definirea modelelor
const userRoutes = require('./routes/userRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const codeExecutionRoutes = require('./routes/codeExecutionRoutes');

// Utilizarea rutelor - Acum rutele vor avea acces la modelele definite mai sus
app.use('/', userRoutes);
app.use('/', achievementRoutes);
app.use('/', codeExecutionRoutes);

// Ruta pentru înregistrare
app.post('/api/users/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Validare simplă a email-ului
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return res.json({ success: false, message: 'Invalid email format' });
    }

    // Verificăm dacă utilizatorul există deja
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'Email already registered' });
    }

    // Criptăm parola utilizatorului
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creăm un nou utilizator cu avatar preset aleator
    const presetAvatars = ['dev1', 'dev2', 'student1', 'student2', 'prof1', 'prof2', 'ninja', 'wizard', 'robot', 'alien', 'pirate', 'astronaut'];
    const randomAvatar = presetAvatars[Math.floor(Math.random() * presetAvatars.length)];

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      avatar: randomAvatar,
      avatarType: 'preset'
    });

    // Salvăm utilizatorul în baza de date
    await newUser.save();

    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Ruta pentru login
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    // Actualizăm lastLogin
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token });
  } catch (err) {
    console.error('Login error:', err);
    res.json({ success: false, message: 'Login failed', error: err.message });
  }
});

// Ruta pentru adăugarea unui curs
app.post('/api/courses', async (req, res) => {
  const { name, description, content, totalLessons } = req.body;

  try {
    // Creăm un nou curs
    const newCourse = new Course({
      name,
      description,
      content,
      totalLessons
    });

    // Salvăm cursul în MongoDB
    await newCourse.save();

    res.status(201).json({ success: true, message: 'Course added successfully' });
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ success: false, message: 'Error adding course' });
  }
});

// Ruta pentru obținerea tuturor cursurilor
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find(); // Obține toate cursurile
    res.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

// Ruta pentru obținerea detaliilor unui curs pe baza ID-ului
app.get('/api/courses/:courseId', async (req, res) => {
  const { courseId } = req.params;
  console.log(`Received courseId: ${courseId}`);  // Logare pentru a vedea dacă ajunge corect

  try {
    const course = await Course.findOne({ _id: courseId });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ course });
  } catch (error) {
    console.error('Error fetching course data:', error);
    res.status(500).json({ message: 'Error fetching course data' });
  }
});

// FIXAT: Ruta pentru salvarea progresului utilizatorului cu logging îmbunătățit
app.post('/api/user/progress', async (req, res) => {
  const { userId, courseId, completedLessons, totalLessons, testScore } = req.body;

  console.log('📊 Salvare progres:', {
    userId,
    courseId,
    completedLessons,
    totalLessons,
    testScore
  });

  try {
    // Verificăm dacă progresul există deja
    let userProgress = await UserProgress.findOne({ userId, courseId });

    if (userProgress) {
      // Dacă există, actualizăm progresul
      console.log('📈 Actualizez progresul existent...');
      userProgress.completedLessons = Math.max(userProgress.completedLessons, completedLessons);
      if (testScore !== null) {
        userProgress.testScore = testScore;
      }
      userProgress.totalLessons = totalLessons;
      await userProgress.save(); // Salvăm actualizările
      console.log('✅ Progres actualizat cu succes');
    } else {
      // Dacă nu există, creăm un nou progres
      console.log('📝 Creez progres nou...');
      userProgress = new UserProgress({
        userId,
        courseId,
        completedLessons,
        totalLessons,
        testScore,
      });
      await userProgress.save(); // Salvăm progresul nou
      console.log('✅ Progres nou creat cu succes');
    }

    // După salvarea progresului, verificăm și actualizăm realizările
    try {
      const existingAchievements = await Achievement.find({ userId });
      console.log('🏆 Verificăm realizările...');
      
      // Verificăm realizarea "Primul pas" dacă nu există deja
      if (!existingAchievements.some(a => a.name === 'Primul pas')) {
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
        console.log('🏆 Realizare deblocată: Primul pas');
      }
      
      // Verificăm realizarea "Prima lecție" dacă nu există deja și utilizatorul a completat cel puțin o lecție
      if (!existingAchievements.some(a => a.name === 'Prima lecție') && completedLessons >= 1) {
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
        console.log('🏆 Realizare deblocată: Prima lecție');
      }
      
      // Verificăm realizarea "Primul test" dacă nu există deja și utilizatorul a susținut un test
      if (!existingAchievements.some(a => a.name === 'Primul test') && testScore !== null) {
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
        console.log('🏆 Realizare deblocată: Primul test');
      }
      
      // Verificăm realizarea "Test perfect" dacă nu există deja și utilizatorul a obținut 100% la test
      if (!existingAchievements.some(a => a.name === 'Test perfect') && testScore === 100) {
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
        console.log('🏆 Realizare deblocată: Test perfect');
      }
      
    } catch (achievementError) {
      console.error('❌ Eroare la actualizarea realizărilor:', achievementError);
      // Nu returnăm eroare aici pentru a nu afecta salvarea progresului
    }

    res.status(200).json({ success: true, message: 'User progress saved successfully' });
  } catch (error) {
    console.error('❌ Eroare la salvarea progresului:', error);
    res.status(500).json({ success: false, message: 'Error saving user progress' });
  }
});

// FIXAT: Rută nouă pentru obținerea progresului unui utilizator
app.get('/api/user/progress/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  
  console.log('📊 Cerere progres pentru userId:', userId);

  try {
    const progress = await UserProgress.find({ userId })
      .populate('courseId', 'name description')
      .sort({ lastUpdated: -1 });
    
    console.log('📈 Progres găsit:', progress.length, 'cursuri');
    
    res.json(progress);
  } catch (error) {
    console.error('❌ Eroare la obținerea progresului:', error);
    res.status(500).json({ success: false, message: 'Error fetching user progress' });
  }
});

// FIXAT: Rută pentru obținerea statisticilor utilizatorului
app.get('/api/user/stats/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  
  console.log('📊 Cerere statistici pentru userId:', userId);

  try {
    const progress = await UserProgress.find({ userId });
    const achievements = await Achievement.find({ userId });
    const codeExecutions = await CodeExecution.find({ userId });
    
    const stats = {
      totalCourses: progress.length,
      completedCourses: progress.filter(p => p.isCompleted).length,
      totalLessons: progress.reduce((sum, p) => sum + p.completedLessons, 0),
      totalAchievements: achievements.length,
      totalCodeExecutions: codeExecutions.length,
      averageTestScore: progress.filter(p => p.testScore !== null).length > 0 
        ? Math.round(progress.filter(p => p.testScore !== null).reduce((sum, p) => sum + p.testScore, 0) / progress.filter(p => p.testScore !== null).length)
        : 0
    };
    
    console.log('📈 Statistici calculate:', stats);
    
    res.json(stats);
  } catch (error) {
    console.error('❌ Eroare la calcularea statisticilor:', error);
    res.status(500).json({ success: false, message: 'Error calculating user stats' });
  }
});

// Rută de diagnostic pentru a verifica cheile API
app.get('/api/config/check', (req, res) => {
  res.json({
    mongoConnected: mongoose.connection.readyState === 1,
    jdoodleConfigured: !!process.env.JDOODLE_CLIENT_ID && !!process.env.JDOODLE_CLIENT_SECRET,
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    env: process.env.NODE_ENV || 'development'
  });
});

// Rută de test pentru avatar
app.get('/api/avatar/test', (req, res) => {
  res.json({
    success: true,
    message: 'Avatar routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// DEBUGGING ROUTES - Temporare pentru testare
app.get('/api/debug/routes', (req, res) => {
  res.json({
    message: 'Server routes are working',
    availableRoutes: [
      'GET /api/debug/routes',
      'PUT /api/users/:userId/avatar',
      'GET /api/users/:userId/avatar',
      'GET /api/users/:userId',
      'GET /api/user/progress/:userId',
      'POST /api/user/progress',
      'GET /api/user/stats/:userId'
    ],
    timestamp: new Date().toISOString()
  });
});

// Test direct pentru avatar update
app.put('/api/debug/avatar/:userId', async (req, res) => {
  const { userId } = req.params;
  const { avatar, avatarType } = req.body;
  
  console.log('DEBUG Avatar Update Request:');
  console.log('- UserId:', userId);
  console.log('- Avatar:', avatar ? avatar.substring(0, 50) + '...' : avatar);
  console.log('- AvatarType:', avatarType);
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.avatar = avatar;
    user.avatarType = avatarType;
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Avatar updated successfully (DEBUG)',
      user: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        avatarType: user.avatarType
      }
    });
  } catch (error) {
    console.error('DEBUG Avatar Update Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Pornirea serverului
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`JDoodle API Configured: ${!!process.env.JDOODLE_CLIENT_ID && !!process.env.JDOODLE_CLIENT_SECRET}`);
  console.log(`OpenAI API Configured: ${!!process.env.OPENAI_API_KEY}`);
  console.log(`Avatar functionality enabled`);
  console.log(`MongoDB Connected: ${mongoose.connection.readyState === 1 ? 'Yes' : 'No'}`);
  console.log(`📊 Progress tracking enabled`);
});