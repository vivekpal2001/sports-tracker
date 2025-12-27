import mongoose from 'mongoose';

// User Badge - earned badges
const userBadgeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  badgeId: {
    type: String,
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  workout: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout'
  }
}, {
  timestamps: true
});

// Compound index for unique badges per user
userBadgeSchema.index({ user: 1, badgeId: 1 }, { unique: true });

const UserBadge = mongoose.model('UserBadge', userBadgeSchema);

export default UserBadge;
