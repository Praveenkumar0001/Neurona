// Symptom Report Model
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const specialtySchema = new mongoose.Schema({
  specialty: String,
  relevance: String,
  priority: Number
});

const symptomReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Conversation data
  conversationHistory: [messageSchema],
  
  // Symptom details
  symptoms: {
    chiefComplaint: String,
    duration: String,
    severity: Number,
    location: String,
    characteristics: [String],
    associatedSymptoms: [String],
    aggravatingFactors: [String],
    relievingFactors: [String]
  },
  
  // AI-generated content
  aiSummary: {
    type: String
  },
  
  urgencyLevel: {
    type: String,
    enum: ['EMERGENCY', 'URGENT', 'MODERATE', 'LOW'],
    default: 'MODERATE'
  },
  
  structuredData: {
    type: mongoose.Schema.Types.Mixed
  },
  
  suggestedSpecialties: [specialtySchema],
  
  // Status tracking
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'cancelled'],
    default: 'in-progress'
  },
  
  // Associated booking
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  
  // Timestamps
  startedAt: {
    type: Date,
    default: Date.now
  },
  
  completedAt: Date,
  
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
symptomReportSchema.index({ user: 1, createdAt: -1 });
symptomReportSchema.index({ status: 1 });
symptomReportSchema.index({ urgencyLevel: 1 });

// Virtual for conversation duration
symptomReportSchema.virtual('duration').get(function() {
  if (this.completedAt && this.startedAt) {
    return Math.round((this.completedAt - this.startedAt) / 1000 / 60); // in minutes
  }
  return null;
});

// Virtual for message count
symptomReportSchema.virtual('messageCount').get(function() {
  return this.conversationHistory.length;
});

// Method to add message
symptomReportSchema.methods.addMessage = function(role, content) {
  this.conversationHistory.push({
    role,
    content,
    timestamp: new Date()
  });
  this.lastUpdated = new Date();
  return this.save();
};

// Method to complete report
symptomReportSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Static method to get user's reports
symptomReportSchema.statics.getUserReports = function(userId, options = {}) {
  const { limit = 10, skip = 0, status } = options;
  
  const query = { user: userId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .select('-conversationHistory'); // Exclude large conversation data
};

// Static method to get urgent reports
symptomReportSchema.statics.getUrgentReports = function(limit = 10) {
  return this.find({
    urgencyLevel: { $in: ['EMERGENCY', 'URGENT'] },
    status: 'completed',
    booking: { $exists: false }
  })
    .sort({ completedAt: -1 })
    .limit(limit)
    .populate('user', 'name email phone');
};

const SymptomReport = mongoose.model('SymptomReport', symptomReportSchema);

module.exports = SymptomReport;