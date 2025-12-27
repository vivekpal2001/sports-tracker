import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'weekly_workouts',      // Number of workouts per week
      'weekly_distance',      // Total km per week
      'weekly_duration',      // Total minutes per week
      'monthly_workouts',     // Number of workouts per month
      'monthly_distance',     // Total km per month
      'daily_streak',         // Consecutive days with workout
      'weight_target',        // Target weight
      'run_distance',         // Single run distance goal
      'custom'                // Custom goal
    ]
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  target: {
    type: Number,
    required: true
  },
  current: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['workouts', 'km', 'min', 'days', 'kg', 'count']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'failed', 'paused'],
    default: 'active'
  },
  completedAt: {
    type: Date
  },
  reminders: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for progress percentage
goalSchema.virtual('progress').get(function() {
  if (this.target === 0) return 0;
  return Math.min(100, Math.round((this.current / this.target) * 100));
});

// Virtual for remaining
goalSchema.virtual('remaining').get(function() {
  return Math.max(0, this.target - this.current);
});

// Virtual for days remaining
goalSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const end = new Date(this.endDate);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
});

// Check if goal is expired
goalSchema.virtual('isExpired').get(function() {
  return new Date() > new Date(this.endDate);
});

// Ensure virtuals are included
goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

// Static method to get goal type display info
goalSchema.statics.getGoalTypeInfo = function(type) {
  const goalTypes = {
    weekly_workouts: { 
      name: 'Weekly Workouts', 
      icon: '🏋️', 
      unit: 'workouts',
      defaultTarget: 5,
      description: 'Complete a set number of workouts each week'
    },
    weekly_distance: { 
      name: 'Weekly Distance', 
      icon: '🏃', 
      unit: 'km',
      defaultTarget: 30,
      description: 'Run or cover a certain distance each week'
    },
    weekly_duration: { 
      name: 'Weekly Training Time', 
      icon: '⏱️', 
      unit: 'min',
      defaultTarget: 300,
      description: 'Spend a certain amount of time training each week'
    },
    monthly_workouts: { 
      name: 'Monthly Workouts', 
      icon: '📅', 
      unit: 'workouts',
      defaultTarget: 20,
      description: 'Complete a set number of workouts each month'
    },
    monthly_distance: { 
      name: 'Monthly Distance', 
      icon: '📏', 
      unit: 'km',
      defaultTarget: 100,
      description: 'Cover a certain distance each month'
    },
    daily_streak: { 
      name: 'Workout Streak', 
      icon: '🔥', 
      unit: 'days',
      defaultTarget: 7,
      description: 'Maintain a consecutive workout streak'
    },
    weight_target: { 
      name: 'Weight Goal', 
      icon: '⚖️', 
      unit: 'kg',
      defaultTarget: 70,
      description: 'Reach a target body weight'
    },
    run_distance: { 
      name: 'Distance Milestone', 
      icon: '🎯', 
      unit: 'km',
      defaultTarget: 10,
      description: 'Complete a single run of a certain distance'
    },
    custom: { 
      name: 'Custom Goal', 
      icon: '⭐', 
      unit: 'count',
      defaultTarget: 1,
      description: 'Set your own custom goal'
    }
  };
  
  return goalTypes[type] || goalTypes.custom;
};

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;
