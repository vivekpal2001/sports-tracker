import TrainingPlan from '../models/TrainingPlan.js';
import Workout from '../models/Workout.js';
import { generatePersonalizedPlan } from '../services/aiService.js';
import { calculateRecoveryScore } from '../services/recoveryService.js';

// Plan templates for different goals
const PLAN_TEMPLATES = {
  '5k': {
    name: '5K Running Plan',
    weeks: 8,
    weeklyDistances: [15, 18, 20, 22, 25, 23, 20, 15], // km per week
    workoutsPerWeek: 4
  },
  '10k': {
    name: '10K Running Plan',
    weeks: 10,
    weeklyDistances: [20, 25, 30, 35, 40, 38, 42, 40, 35, 25],
    workoutsPerWeek: 4
  },
  'half_marathon': {
    name: 'Half Marathon Plan',
    weeks: 12,
    weeklyDistances: [30, 35, 40, 45, 50, 48, 55, 52, 58, 55, 45, 30],
    workoutsPerWeek: 5
  },
  'marathon': {
    name: 'Marathon Training Plan',
    weeks: 16,
    weeklyDistances: [40, 45, 50, 55, 60, 55, 65, 60, 70, 65, 75, 70, 75, 65, 50, 30],
    workoutsPerWeek: 5
  },
  'general_fitness': {
    name: 'General Fitness Plan',
    weeks: 8,
    weeklyDistances: [15, 18, 20, 22, 25, 25, 23, 20],
    workoutsPerWeek: 4
  },
  'strength': {
    name: 'Strength Building Plan',
    weeks: 8,
    workoutsPerWeek: 4
  }
};

// @desc    Generate AI training plan
// @route   POST /api/training-plans/generate
// @access  Private
export const generateTrainingPlan = async (req, res, next) => {
  try {
    const { type, goal, duration, difficulty, startDate } = req.body;
    
    // Validate
    if (!type || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide plan type and start date'
      });
    }
    
    const template = PLAN_TEMPLATES[type] || PLAN_TEMPLATES.general_fitness;
    const planDuration = duration || template.weeks;
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + (planDuration * 7));
    
    // Fetch user's workout history for personalization
    const workoutHistory = await Workout.find({
      user: req.user._id,
      date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) } // Last 60 days
    }).sort({ date: -1 });
    
    // Get recovery score for intensity adjustment
    let recoveryScore = 75;
    try {
      const recoveryData = await calculateRecoveryScore(req.user._id);
      recoveryScore = recoveryData.score;
    } catch (e) {
      console.log('Could not get recovery score, using default');
    }
    
    // Generate personalized plan using AI
    const aiPlan = await generatePersonalizedPlan(
      req.user._id,
      { type, difficulty: difficulty || 'intermediate', duration: planDuration, goal },
      workoutHistory,
      recoveryScore
    );
    
    // Transform AI response to match our schema
    const weeks = aiPlan.weeks.map(week => ({
      weekNumber: week.weekNumber,
      theme: week.theme,
      totalDistance: week.totalDistance || 0,
      totalDuration: week.workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      workouts: week.workouts.map(w => ({
        day: w.day,
        type: w.type,
        name: w.name,
        description: w.description,
        duration: w.duration || 0,
        distance: w.distance || undefined,
        intensity: w.intensity || 'moderate',
        completed: false
      }))
    }));
    
    // Calculate totals
    let totalWorkouts = 0;
    let totalDistance = 0;
    
    weeks.forEach(week => {
      week.workouts.forEach(workout => {
        if (workout.type !== 'rest') {
          totalWorkouts++;
          totalDistance += workout.distance || 0;
        }
      });
    });
    
    const plan = await TrainingPlan.create({
      user: req.user._id,
      name: aiPlan.planName || goal || template.name,
      type,
      goal,
      duration: planDuration,
      difficulty: difficulty || 'intermediate',
      startDate: start,
      endDate: end,
      weeks,
      progress: {
        totalWorkouts,
        targetDistance: totalDistance
      },
      aiGenerated: aiPlan.aiGenerated || false,
      tips: aiPlan.tips || []
    });
    
    res.status(201).json({
      success: true,
      data: plan,
      aiGenerated: aiPlan.aiGenerated,
      tips: aiPlan.tips
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all training plans
// @route   GET /api/training-plans
// @access  Private
export const getTrainingPlans = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    
    const plans = await TrainingPlan.find(filter)
      .sort({ createdAt: -1 });
    
    // Update current week for active plans
    for (const plan of plans) {
      if (plan.status === 'active') {
        plan.updateCurrentWeek();
        await plan.save();
      }
    }
    
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single training plan
// @route   GET /api/training-plans/:id
// @access  Private
export const getTrainingPlan = async (req, res, next) => {
  try {
    const plan = await TrainingPlan.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Training plan not found'
      });
    }
    
    // Update current week
    if (plan.status === 'active') {
      plan.updateCurrentWeek();
      await plan.save();
    }
    
    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update workout completion
// @route   PUT /api/training-plans/:id/workout
// @access  Private
export const completeWorkout = async (req, res, next) => {
  try {
    const { weekNumber, day, workoutId } = req.body;
    
    const plan = await TrainingPlan.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Training plan not found'
      });
    }
    
    // Find the week and workout
    const week = plan.weeks.find(w => w.weekNumber === weekNumber);
    if (!week) {
      return res.status(400).json({
        success: false,
        message: 'Week not found'
      });
    }
    
    const workout = week.workouts.find(w => w.day === day);
    if (!workout) {
      return res.status(400).json({
        success: false,
        message: 'Workout not found'
      });
    }
    
    // Mark as completed
    workout.completed = true;
    workout.completedAt = new Date();
    if (workoutId) {
      workout.workout = workoutId;
    }
    
    // Update progress
    plan.progress.completedWorkouts = (plan.progress.completedWorkouts || 0) + 1;
    if (workout.distance) {
      plan.progress.completedDistance = (plan.progress.completedDistance || 0) + workout.distance;
    }
    
    // Check if plan is complete
    const allComplete = plan.weeks.every(w => 
      w.workouts.every(wo => wo.type === 'rest' || wo.completed)
    );
    
    if (allComplete) {
      plan.status = 'completed';
    }
    
    await plan.save();
    
    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete training plan
// @route   DELETE /api/training-plans/:id
// @access  Private
export const deleteTrainingPlan = async (req, res, next) => {
  try {
    const plan = await TrainingPlan.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Training plan not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Training plan deleted'
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Generate weekly schedule based on plan type
function generateWeeklySchedule(type, duration, difficulty) {
  const weeks = [];
  const template = PLAN_TEMPLATES[type] || PLAN_TEMPLATES.general_fitness;
  
  // Intensity multiplier based on difficulty
  const intensityMultiplier = {
    beginner: 0.7,
    intermediate: 1.0,
    advanced: 1.3
  }[difficulty] || 1.0;
  
  for (let i = 0; i < duration; i++) {
    const weekNumber = i + 1;
    const weeklyDistance = (template.weeklyDistances?.[i] || 20) * intensityMultiplier;
    
    // Determine week theme
    let theme = 'Build';
    if (weekNumber <= 2) theme = 'Base Building';
    else if (weekNumber === duration - 1) theme = 'Taper';
    else if (weekNumber === duration) theme = 'Race Week';
    else if (weekNumber % 4 === 0) theme = 'Recovery';
    else if (weekNumber > duration * 0.6) theme = 'Peak';
    
    const workouts = generateWeekWorkouts(type, weekNumber, weeklyDistance, difficulty, duration);
    
    weeks.push({
      weekNumber,
      theme,
      totalDistance: weeklyDistance,
      totalDuration: workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      workouts
    });
  }
  
  return weeks;
}

// Helper: Generate workouts for a week
function generateWeekWorkouts(type, weekNumber, weeklyDistance, difficulty, totalWeeks) {
  const workouts = [];
  
  if (type === 'strength') {
    // Strength plan
    workouts.push(
      { day: 1, type: 'lift', name: 'Upper Body', description: 'Push exercises: chest, shoulders, triceps', duration: 45, intensity: 'moderate' },
      { day: 2, type: 'cardio', name: 'Cardio', description: 'Light cardio for recovery', duration: 30, intensity: 'easy' },
      { day: 3, type: 'lift', name: 'Lower Body', description: 'Squats, deadlifts, leg press', duration: 50, intensity: 'hard' },
      { day: 4, type: 'rest', name: 'Rest Day', description: 'Active recovery or stretching', duration: 0, intensity: 'easy' },
      { day: 5, type: 'lift', name: 'Upper Body', description: 'Pull exercises: back, biceps', duration: 45, intensity: 'moderate' },
      { day: 6, type: 'lift', name: 'Full Body', description: 'Compound movements', duration: 40, intensity: 'moderate' },
      { day: 0, type: 'rest', name: 'Rest Day', description: 'Complete rest', duration: 0, intensity: 'easy' }
    );
  } else {
    // Running plans
    const longRunDistance = weeklyDistance * 0.35;
    const tempoDistance = weeklyDistance * 0.2;
    const easyDistance = weeklyDistance * 0.15;
    
    workouts.push(
      { day: 1, type: 'run', name: 'Easy Run', description: 'Conversational pace', duration: easyDistance * 6, distance: easyDistance, intensity: 'easy' },
      { day: 2, type: 'rest', name: 'Rest Day', description: 'Active recovery', duration: 0, intensity: 'easy' },
      { day: 3, type: 'run', name: 'Tempo Run', description: 'Comfortably hard pace', duration: tempoDistance * 5.5, distance: tempoDistance, intensity: 'hard' },
      { day: 4, type: 'cross-training', name: 'Cross Training', description: 'Cycling, swimming, or strength', duration: 40, intensity: 'moderate' },
      { day: 5, type: 'run', name: 'Easy Run', description: 'Recovery pace', duration: easyDistance * 6, distance: easyDistance, intensity: 'easy' },
      { day: 6, type: 'run', name: 'Long Run', description: 'Build endurance at easy pace', duration: longRunDistance * 6.5, distance: longRunDistance, intensity: 'moderate' },
      { day: 0, type: 'rest', name: 'Rest Day', description: 'Full rest day', duration: 0, intensity: 'easy' }
    );
  }
  
  return workouts.map(w => ({
    ...w,
    duration: Math.round(w.duration),
    distance: w.distance ? Math.round(w.distance * 10) / 10 : undefined,
    completed: false
  }));
}
