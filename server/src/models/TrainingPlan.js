import mongoose from 'mongoose';

const workoutScheduleSchema = new mongoose.Schema({
  day: {
    type: Number, // 0-6 (Sunday-Saturday)
    required: true
  },
  type: {
    type: String,
    enum: ['run', 'lift', 'cardio', 'rest', 'cross-training'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  duration: Number, // minutes
  distance: Number, // km
  intensity: {
    type: String,
    enum: ['easy', 'moderate', 'hard', 'max'],
    default: 'moderate'
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  workout: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout'
  }
});

const weekSchema = new mongoose.Schema({
  weekNumber: {
    type: Number,
    required: true
  },
  theme: String, // e.g., "Base Building", "Peak Week", "Recovery"
  totalDistance: Number,
  totalDuration: Number,
  workouts: [workoutScheduleSchema]
});

const trainingPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: ['5k', '10k', 'half_marathon', 'marathon', 'general_fitness', 'strength', 'custom'],
    required: true
  },
  goal: String, // e.g., "Run 5K in under 25 minutes"
  duration: {
    type: Number, // weeks
    required: true,
    min: 1,
    max: 52
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  currentWeek: {
    type: Number,
    default: 1
  },
  weeks: [weekSchema],
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  progress: {
    completedWorkouts: {
      type: Number,
      default: 0
    },
    totalWorkouts: Number,
    completedDistance: {
      type: Number,
      default: 0
    },
    targetDistance: Number
  },
  aiGenerated: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for progress percentage
trainingPlanSchema.virtual('progressPercentage').get(function() {
  if (!this.progress.totalWorkouts) return 0;
  return Math.round((this.progress.completedWorkouts / this.progress.totalWorkouts) * 100);
});

// Virtual to check if plan is current
trainingPlanSchema.virtual('isCurrent').get(function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate && this.status === 'active';
});

trainingPlanSchema.set('toJSON', { virtuals: true });
trainingPlanSchema.set('toObject', { virtuals: true });

// Method to update current week
trainingPlanSchema.methods.updateCurrentWeek = function() {
  const now = new Date();
  const startDate = new Date(this.startDate);
  const weeksSinceStart = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000)) + 1;
  this.currentWeek = Math.min(weeksSinceStart, this.duration);
};

const TrainingPlan = mongoose.model('TrainingPlan', trainingPlanSchema);

export default TrainingPlan;
