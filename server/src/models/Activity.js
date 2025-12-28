import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['workout', 'badge', 'goal_completed', 'pr', 'follow', 'milestone'],
    required: true
  },
  // Reference to related content
  workout: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout'
  },
  badge: {
    type: String // badge ID from BADGES constant
  },
  goal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  },
  pr: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PersonalRecord'
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // For follow activities
  },
  // Content
  title: {
    type: String,
    required: true
  },
  description: String,
  metadata: {
    duration: Number,
    distance: Number,
    type: String, // workout type
    value: mongoose.Schema.Types.Mixed
  },
  // Engagement
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Visibility
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient feed queries
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });

// Virtual for like count
activitySchema.virtual('likeCount').get(function() {
  return this.likes?.length || 0;
});

activitySchema.virtual('commentCount').get(function() {
  return this.comments?.length || 0;
});

activitySchema.set('toJSON', { virtuals: true });
activitySchema.set('toObject', { virtuals: true });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
