import mongoose from 'mongoose';

const userInteractionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  interactionType: {
    type: String,
    enum: ['mentor_chat', 'simulation', 'resume_upload', 'skill_exploration', 'badge_earned'],
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    message: String,
    intent: String,
    confidence: Number,
    processingTime: Number,
    simulationScore: Number,
    simulationLanguage: String,
    badgeEarned: String,
    skillsExplored: [String],
    resumeAnalysis: mongoose.Schema.Types.Mixed
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    sessionDuration: Number,
    previousInteractions: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for analytics queries
userInteractionSchema.index({ userId: 1, createdAt: -1 });
userInteractionSchema.index({ interactionType: 1, createdAt: -1 });
userInteractionSchema.index({ 'details.intent': 1 });
userInteractionSchema.index({ 'details.badgeEarned': 1 });

// Static method to get user interaction history
userInteractionSchema.statics.getUserInteractions = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

// Static method to get interaction analytics
userInteractionSchema.statics.getInteractionAnalytics = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$interactionType',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$details.confidence' },
        avgProcessingTime: { $avg: '$details.processingTime' },
        uniqueIntents: { $addToSet: '$details.intent' },
        badgesEarned: { $addToSet: '$details.badgeEarned' }
      }
    },
    {
      $project: {
        _id: 1,
        count: 1,
        avgConfidence: { $round: ['$avgConfidence', 2] },
        avgProcessingTime: { $round: ['$avgProcessingTime', 2] },
        uniqueIntents: { $size: '$uniqueIntents' },
        totalBadges: { $size: { $reduce: { input: '$badgesEarned', initialValue: [], in: { $concatArrays: ['$$value', '$$this'] } } } }
      }
    }
  ]).exec();
};

// Static method to get popular intents
userInteractionSchema.statics.getPopularIntents = function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        'details.intent': { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: '$details.intent',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$details.confidence' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]).exec();
};

// Static method to track user engagement
userInteractionSchema.statics.getUserEngagement = function(userId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        interactions: { $sum: 1 },
        uniqueSessions: { $addToSet: '$sessionId' }
      }
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        interactions: 1,
        uniqueSessions: { $size: '$uniqueSessions' }
      }
    },
    {
      $sort: { date: -1 }
    },
    {
      $limit: 30
    }
  ]).exec();
};

const UserInteraction = mongoose.model('UserInteraction', userInteractionSchema);

export default UserInteraction;

