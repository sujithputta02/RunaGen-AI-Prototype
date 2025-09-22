import mongoose from 'mongoose';

const mentorConversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true
  },
  messages: [{
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
    },
    metadata: {
      intent: String,
      confidence: Number,
      processingTime: Number,
      sources: [{
        docId: String,
        snippet: String
      }],
      // Allow flexibility: actions may be objects or strings from legacy data
      actions: [mongoose.Schema.Types.Mixed],
      badges: [String]
    }
  }],
  sessionMetadata: {
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: Date,
    totalMessages: {
      type: Number,
      default: 0
    },
    userProfile: {
      name: String,
      role: String,
      preferences: mongoose.Schema.Types.Mixed
    },
    resumeText: String,
    jobDescription: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
mentorConversationSchema.index({ userId: 1, createdAt: -1 });
mentorConversationSchema.index({ sessionId: 1 });
mentorConversationSchema.index({ 'sessionMetadata.startTime': -1 });

// Update the updatedAt field before saving
mentorConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get recent conversations for a user
mentorConversationSchema.statics.getRecentConversations = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('sessionId sessionMetadata messages createdAt')
    .exec();
};

// Static method to get conversation by session ID
mentorConversationSchema.statics.getConversationBySession = function(sessionId) {
  return this.findOne({ sessionId }).exec();
};

// Static method to add a message to a conversation
mentorConversationSchema.methods.addMessage = function(message) {
  this.messages.push(message);
  this.sessionMetadata.totalMessages = this.messages.length;
  return this.save();
};

// Static method to get user interaction history
mentorConversationSchema.statics.getUserHistory = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    userId,
    createdAt: { $gte: startDate }
  })
  .sort({ createdAt: -1 })
  .select('sessionId messages sessionMetadata createdAt')
  .exec();
};

// Static method to get conversation statistics
mentorConversationSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalMessages: { $sum: '$sessionMetadata.totalMessages' },
        avgConfidence: { $avg: '$messages.metadata.confidence' },
        uniqueIntents: { $addToSet: '$messages.metadata.intent' },
        badgesEarned: { $addToSet: '$messages.metadata.badges' }
      }
    },
    {
      $project: {
        _id: 0,
        totalSessions: 1,
        totalMessages: 1,
        avgConfidence: { $round: ['$avgConfidence', 2] },
        uniqueIntents: { $size: '$uniqueIntents' },
        totalBadges: { $size: { $reduce: { input: '$badgesEarned', initialValue: [], in: { $concatArrays: ['$$value', '$$this'] } } } }
      }
    }
  ]).exec();
};

const MentorConversation = mongoose.model('MentorConversation', mentorConversationSchema);

export default MentorConversation;

