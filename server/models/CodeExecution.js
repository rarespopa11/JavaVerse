// server/models/CodeExecution.js
const mongoose = require('mongoose');

/**
 * Schema pentru înregistrarea execuțiilor de cod
 * Util pentru a urmări utilizarea funcției de execuție a codului și pentru a genera statistici
 */
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

// Adăugăm metode utile pentru model
codeExecutionSchema.statics.getUserExecutionStats = async function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    { $group: {
        _id: null,
        totalExecutions: { $sum: 1 },
        successfulExecutions: { $sum: { $cond: ["$success", 1, 0] } },
        averageExecutionTime: { $avg: "$executionTime" }
      }
    }
  ]);
};

codeExecutionSchema.statics.getRecentExecutions = async function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .select('code success output executionTime timestamp');
};

const CodeExecution = mongoose.model('CodeExecution', codeExecutionSchema);

module.exports = CodeExecution;