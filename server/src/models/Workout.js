import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: Number, required: true },
  weight: { type: Number }, // in kg
  restTime: { type: Number } // in seconds
});

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['run', 'lift', 'cardio', 'biometrics'],
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  duration: {
    type: Number, // in minutes
    min: 0
  },
  notes: {
    type: String,
    maxlength: 500
  },
  
  // Run-specific fields
  run: {
    distance: { type: Number }, // in km
    pace: { type: Number }, // min/km
    avgHeartRate: { type: Number },
    maxHeartRate: { type: Number },
    elevation: { type: Number }, // in meters
    calories: { type: Number },
    cadence: { type: Number }, // steps per minute
    terrain: {
      type: String,
      enum: ['road', 'trail', 'track', 'treadmill', 'mixed']
    },
    weather: {
      type: String,
      enum: ['sunny', 'cloudy', 'rainy', 'windy', 'hot', 'cold', 'humid']
    }
  },
  
  // Lift-specific fields
  lift: {
    muscleGroup: {
      type: String,
      enum: ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'full-body']
    },
    exercises: [exerciseSchema],
    totalVolume: { type: Number }, // total kg lifted
    personalRecords: { type: Boolean, default: false }
  },
  
  // Cardio-specific fields
  cardio: {
    activity: {
      type: String,
      enum: ['cycling', 'swimming', 'rowing', 'elliptical', 'stairmaster', 'hiit', 'other']
    },
    distance: { type: Number },
    avgHeartRate: { type: Number },
    maxHeartRate: { type: Number },
    calories: { type: Number }
  },
  
  // Biometrics fields
  biometrics: {
    weight: { type: Number }, // kg
    bodyFat: { type: Number }, // percentage
    sleepHours: { type: Number },
    sleepQuality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent']
    },
    restingHeartRate: { type: Number },
    hrv: { type: Number }, // heart rate variability
    mood: {
      type: String,
      enum: ['exhausted', 'tired', 'neutral', 'good', 'energized']
    },
    stress: {
      type: Number,
      min: 1,
      max: 10
    },
    hydration: { type: Number }, // liters
    soreness: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  
  // RPE (Rate of Perceived Exertion) 1-10
  rpe: {
    type: Number,
    min: 1,
    max: 10
  },
  
  // File upload reference
  uploadedFile: {
    filename: String,
    originalName: String,
    type: { type: String, enum: ['gpx', 'csv'] },
    path: String
  },
  
  // AI-generated insights for this workout
  aiInsights: {
    generated: { type: Boolean, default: false },
    summary: String,
    performanceScore: Number,
    recommendations: [String]
  }
}, {
  timestamps: true
});

// Index for efficient querying
workoutSchema.index({ user: 1, date: -1 });
workoutSchema.index({ user: 1, type: 1, date: -1 });

// Virtual for formatted duration
workoutSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return null;
  const hours = Math.floor(this.duration / 60);
  const mins = this.duration % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
});

// Calculate training load (simplified TSS-like score)
workoutSchema.methods.calculateTrainingLoad = function() {
  let load = 0;
  const duration = this.duration || 0;
  const rpe = this.rpe || 5;
  
  // Base load from duration and RPE
  load = (duration * rpe) / 10;
  
  // Adjust for workout type
  const typeMultipliers = {
    run: 1.2,
    lift: 1.0,
    cardio: 1.1,
    biometrics: 0
  };
  
  return Math.round(load * (typeMultipliers[this.type] || 1));
};

const Workout = mongoose.model('Workout', workoutSchema);

export default Workout;
