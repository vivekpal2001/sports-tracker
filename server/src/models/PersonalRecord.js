import mongoose from 'mongoose';

const personalRecordSchema = new mongoose.Schema({
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
      // Running PRs
      'fastest_1k',
      'fastest_5k', 
      'fastest_10k',
      'fastest_half_marathon',
      'fastest_marathon',
      'longest_run',
      'highest_elevation_run',
      
      // Cardio PRs
      'longest_cardio',
      'longest_cycling',
      
      // General PRs
      'longest_workout',
      'highest_weekly_distance',
      'highest_monthly_distance',
      'most_workouts_week',
      
      // Strength PRs (can be extended)
      'heaviest_deadlift',
      'heaviest_squat',
      'heaviest_bench'
    ]
  },
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['km', 'min', 'kg', 'count', 'm']
  },
  workout: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout'
  },
  previousValue: {
    type: Number
  },
  improvement: {
    type: Number // Percentage improvement from previous record
  },
  achievedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
personalRecordSchema.index({ user: 1, type: 1 });

// Static method to get PR type display info
personalRecordSchema.statics.getPRTypeInfo = function(type) {
  const prTypes = {
    fastest_1k: { name: 'Fastest 1K', icon: '🏃', unit: 'min', category: 'running' },
    fastest_5k: { name: 'Fastest 5K', icon: '🏃', unit: 'min', category: 'running' },
    fastest_10k: { name: 'Fastest 10K', icon: '🏃', unit: 'min', category: 'running' },
    fastest_half_marathon: { name: 'Fastest Half Marathon', icon: '🏃', unit: 'min', category: 'running' },
    fastest_marathon: { name: 'Fastest Marathon', icon: '🏃', unit: 'min', category: 'running' },
    longest_run: { name: 'Longest Run', icon: '📏', unit: 'km', category: 'running' },
    highest_elevation_run: { name: 'Highest Elevation', icon: '⛰️', unit: 'm', category: 'running' },
    longest_cardio: { name: 'Longest Cardio', icon: '❤️', unit: 'min', category: 'cardio' },
    longest_cycling: { name: 'Longest Cycling', icon: '🚴', unit: 'km', category: 'cardio' },
    longest_workout: { name: 'Longest Workout', icon: '⏱️', unit: 'min', category: 'general' },
    highest_weekly_distance: { name: 'Best Week (Distance)', icon: '📅', unit: 'km', category: 'general' },
    highest_monthly_distance: { name: 'Best Month (Distance)', icon: '📆', unit: 'km', category: 'general' },
    most_workouts_week: { name: 'Most Workouts (Week)', icon: '🔥', unit: 'count', category: 'general' },
    heaviest_deadlift: { name: 'Heaviest Deadlift', icon: '🏋️', unit: 'kg', category: 'strength' },
    heaviest_squat: { name: 'Heaviest Squat', icon: '🏋️', unit: 'kg', category: 'strength' },
    heaviest_bench: { name: 'Heaviest Bench Press', icon: '🏋️', unit: 'kg', category: 'strength' }
  };
  
  return prTypes[type] || { name: type, icon: '🏆', unit: '', category: 'other' };
};

const PersonalRecord = mongoose.model('PersonalRecord', personalRecordSchema);

export default PersonalRecord;
