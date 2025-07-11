// server/models/Achievement.js
const mongoose = require('mongoose');

// Schema pentru realizări
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

module.exports = Achievement;