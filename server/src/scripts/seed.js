import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Workout from '../models/Workout.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-tracker';

// Sample workout data generators
const generateRunWorkout = (userId, daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 12) + 6);
  
  const distance = Math.round((3 + Math.random() * 12) * 10) / 10;
  const duration = Math.round(distance * (5 + Math.random() * 2));
  
  return {
    user: userId,
    type: 'run',
    title: ['Morning Run', 'Tempo Run', 'Easy Run', 'Long Run', 'Recovery Run', 'Interval Training'][Math.floor(Math.random() * 6)],
    date,
    duration,
    rpe: Math.floor(Math.random() * 4) + 5,
    run: {
      distance,
      pace: Math.round((duration / distance) * 100) / 100,
      avgHeartRate: 130 + Math.floor(Math.random() * 40),
      maxHeartRate: 160 + Math.floor(Math.random() * 30),
      elevation: Math.floor(Math.random() * 200),
      calories: Math.floor(distance * 65),
      terrain: ['road', 'trail', 'track', 'treadmill'][Math.floor(Math.random() * 4)],
      weather: ['sunny', 'cloudy', 'rainy', 'hot', 'cold'][Math.floor(Math.random() * 5)]
    }
  };
};

const generateLiftWorkout = (userId, daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 12) + 8);
  
  const exercises = [
    { name: 'Squats', sets: 4, reps: 8, weight: 60 + Math.floor(Math.random() * 40) },
    { name: 'Deadlifts', sets: 3, reps: 6, weight: 80 + Math.floor(Math.random() * 40) },
    { name: 'Bench Press', sets: 4, reps: 8, weight: 50 + Math.floor(Math.random() * 30) },
    { name: 'Pull-ups', sets: 3, reps: 10, weight: 0 },
    { name: 'Lunges', sets: 3, reps: 12, weight: 20 + Math.floor(Math.random() * 20) }
  ];
  
  const selectedExercises = exercises
    .sort(() => Math.random() - 0.5)
    .slice(0, 3 + Math.floor(Math.random() * 3));
  
  const totalVolume = selectedExercises.reduce(
    (sum, ex) => sum + (ex.sets * ex.reps * ex.weight), 0
  );
  
  return {
    user: userId,
    type: 'lift',
    title: ['Leg Day', 'Upper Body', 'Full Body', 'Push Day', 'Pull Day', 'Strength Training'][Math.floor(Math.random() * 6)],
    date,
    duration: 45 + Math.floor(Math.random() * 30),
    rpe: Math.floor(Math.random() * 3) + 6,
    lift: {
      muscleGroup: ['chest', 'back', 'legs', 'arms', 'full-body'][Math.floor(Math.random() * 5)],
      exercises: selectedExercises,
      totalVolume,
      personalRecords: Math.random() > 0.8
    }
  };
};

const generateCardioWorkout = (userId, daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  
  return {
    user: userId,
    type: 'cardio',
    title: ['Cycling Session', 'Swimming', 'HIIT', 'Rowing', 'Elliptical'][Math.floor(Math.random() * 5)],
    date,
    duration: 30 + Math.floor(Math.random() * 45),
    rpe: Math.floor(Math.random() * 4) + 5,
    cardio: {
      activity: ['cycling', 'swimming', 'rowing', 'elliptical', 'hiit'][Math.floor(Math.random() * 5)],
      distance: Math.round((5 + Math.random() * 25) * 10) / 10,
      avgHeartRate: 125 + Math.floor(Math.random() * 35),
      maxHeartRate: 155 + Math.floor(Math.random() * 30),
      calories: 250 + Math.floor(Math.random() * 300)
    }
  };
};

const generateBiometrics = (userId, daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(7);
  
  return {
    user: userId,
    type: 'biometrics',
    title: 'Daily Check-in',
    date,
    biometrics: {
      weight: 72 + Math.round((Math.random() - 0.5) * 4 * 10) / 10,
      sleepHours: 6 + Math.round(Math.random() * 3 * 10) / 10,
      sleepQuality: ['fair', 'good', 'good', 'excellent'][Math.floor(Math.random() * 4)],
      restingHeartRate: 55 + Math.floor(Math.random() * 15),
      hrv: 40 + Math.floor(Math.random() * 40),
      mood: ['tired', 'neutral', 'good', 'good', 'energized'][Math.floor(Math.random() * 5)],
      stress: Math.floor(Math.random() * 5) + 3,
      hydration: 2 + Math.round(Math.random() * 2 * 10) / 10,
      soreness: Math.floor(Math.random() * 5) + 2
    }
  };
};

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📊 Connected to MongoDB');
    
    // Clear existing data
    await User.deleteMany({});
    await Workout.deleteMany({});
    console.log('🗑️  Cleared existing data');
    
    // Create demo user
    const demoUser = await User.create({
      name: 'Alex Runner',
      email: 'demo@athlete.com',
      password: 'demo123',
      profile: {
        height: 178,
        weight: 72,
        age: 28,
        sport: 'running',
        fitnessLevel: 'advanced',
        weeklyGoalHours: 8
      },
      preferences: {
        units: 'metric',
        notifications: true
      }
    });
    
    console.log('👤 Created demo user: demo@athlete.com / demo123');
    
    // Generate 30+ workouts over 4 weeks
    const workouts = [];
    
    for (let day = 0; day < 28; day++) {
      // Daily biometrics
      workouts.push(generateBiometrics(demoUser._id, day));
      
      // Training days (5-6 per week)
      if (day % 7 !== 0) { // Skip some Sundays
        // Run workouts (3-4 per week)
        if (day % 7 === 1 || day % 7 === 3 || day % 7 === 5 || (day % 7 === 6 && Math.random() > 0.3)) {
          workouts.push(generateRunWorkout(demoUser._id, day));
        }
        
        // Lift workouts (2-3 per week)
        if (day % 7 === 2 || day % 7 === 4 || (day % 7 === 6 && Math.random() > 0.5)) {
          workouts.push(generateLiftWorkout(demoUser._id, day));
        }
        
        // Occasional cardio
        if (Math.random() > 0.8) {
          workouts.push(generateCardioWorkout(demoUser._id, day));
        }
      }
    }
    
    await Workout.insertMany(workouts);
    console.log(`🏃 Created ${workouts.length} sample workouts`);
    
    // Summary stats
    const runCount = workouts.filter(w => w.type === 'run').length;
    const liftCount = workouts.filter(w => w.type === 'lift').length;
    const cardioCount = workouts.filter(w => w.type === 'cardio').length;
    const bioCount = workouts.filter(w => w.type === 'biometrics').length;
    
    console.log(`
  ════════════════════════════════════
  ✅ Seed completed successfully!
  ════════════════════════════════════
  
  Demo Account:
  📧 Email: demo@athlete.com
  🔑 Password: demo123
  
  Sample Data Created:
  🏃 Runs: ${runCount}
  🏋️ Lifts: ${liftCount}
  🚴 Cardio: ${cardioCount}
  📊 Biometrics: ${bioCount}
  ────────────────────────────────────
  Total: ${workouts.length} records
  ════════════════════════════════════
    `);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
}

seed();
