import mongoose from 'mongoose';
import crypto from 'crypto';

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  rank: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const challengeSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  type: {
    type: String,
    required: true,
    enum: ['distance', 'duration', 'workouts', 'calories'],
    index: true
  },
  target: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    required: true,
    enum: ['km', 'min', 'count', 'kcal']
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true,
    index: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'invite-only'],
    default: 'public'
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  participants: [participantSchema],
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming',
    index: true
  },
  prizes: {
    winner: { type: String, default: 'challenge_winner' },
    topThree: { type: String, default: 'challenge_top3' },
    finisher: { type: String, default: 'challenge_finisher' }
  },
  coverImage: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['running', 'cycling', 'general', 'strength', 'yoga', 'custom'],
    default: 'general'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
challengeSchema.index({ status: 1, startDate: 1 });
challengeSchema.index({ 'participants.user': 1 });
challengeSchema.index({ visibility: 1, status: 1 });

// Pre-save: generate invite code for invite-only challenges
challengeSchema.pre('save', function(next) {
  if (this.visibility === 'invite-only' && !this.inviteCode) {
    this.inviteCode = crypto.randomBytes(6).toString('hex').toUpperCase();
  }
  next();
});

// Virtual for participant count
challengeSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Virtual for days remaining
challengeSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const end = new Date(this.endDate);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
});

// Virtual for is active
challengeSchema.virtual('isActive').get(function() {
  const now = new Date();
  return now >= new Date(this.startDate) && now <= new Date(this.endDate);
});

// Virtual for is upcoming
challengeSchema.virtual('isUpcoming').get(function() {
  return new Date() < new Date(this.startDate);
});

// Virtual for is completed
challengeSchema.virtual('isCompleted').get(function() {
  return new Date() > new Date(this.endDate);
});

// Get leaderboard (sorted by progress descending)
challengeSchema.methods.getLeaderboard = function() {
  return this.participants
    .slice()
    .sort((a, b) => b.progress - a.progress)
    .map((p, index) => ({
      ...p.toObject(),
      rank: index + 1,
      progressPercent: Math.min(100, Math.round((p.progress / this.target) * 100))
    }));
};

// Check if user is a participant
challengeSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => 
    p.user.toString() === userId.toString()
  );
};

// Get user's progress
challengeSchema.methods.getUserProgress = function(userId) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  return participant ? participant.progress : null;
};

// Update rankings
challengeSchema.methods.updateRankings = function() {
  const sorted = this.participants
    .slice()
    .sort((a, b) => b.progress - a.progress);
  
  sorted.forEach((participant, index) => {
    const p = this.participants.find(x => 
      x.user.toString() === participant.user.toString()
    );
    if (p) {
      p.rank = index + 1;
    }
  });
};

// Ensure virtuals are included
challengeSchema.set('toJSON', { virtuals: true });
challengeSchema.set('toObject', { virtuals: true });

// Static method to get type display info
challengeSchema.statics.getChallengeTypeInfo = function(type) {
  const types = {
    distance: {
      name: 'Distance Challenge',
      icon: '🏃',
      unit: 'km',
      description: 'Cover a certain distance'
    },
    duration: {
      name: 'Duration Challenge',
      icon: '⏱️',
      unit: 'min',
      description: 'Accumulate training time'
    },
    workouts: {
      name: 'Workout Challenge',
      icon: '💪',
      unit: 'count',
      description: 'Complete a number of workouts'
    },
    calories: {
      name: 'Calorie Challenge',
      icon: '🔥',
      unit: 'kcal',
      description: 'Burn a certain number of calories'
    }
  };
  
  return types[type] || types.workouts;
};

// Static method to update challenge status based on dates
challengeSchema.statics.updateChallengeStatuses = async function() {
  const now = new Date();
  
  // Update upcoming to active
  await this.updateMany(
    { 
      status: 'upcoming',
      startDate: { $lte: now }
    },
    { status: 'active' }
  );
  
  // Update active to completed
  await this.updateMany(
    { 
      status: 'active',
      endDate: { $lt: now }
    },
    { status: 'completed' }
  );
};

const Challenge = mongoose.model('Challenge', challengeSchema);

export default Challenge;
