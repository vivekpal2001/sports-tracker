import PersonalRecord from '../models/PersonalRecord.js';
import Workout from '../models/Workout.js';

// @desc    Get all personal records for user
// @route   GET /api/pr
// @access  Private
export const getPersonalRecords = async (req, res, next) => {
  try {
    const records = await PersonalRecord.find({ user: req.user._id })
      .populate('workout', 'title date type')
      .sort({ achievedAt: -1 });
    
    // Group by category
    const grouped = {
      running: [],
      cardio: [],
      strength: [],
      general: []
    };
    
    records.forEach(record => {
      const typeInfo = PersonalRecord.getPRTypeInfo(record.type);
      const prData = {
        _id: record._id,
        type: record.type,
        value: record.value,
        unit: record.unit,
        workout: record.workout,
        previousValue: record.previousValue,
        improvement: record.improvement,
        achievedAt: record.achievedAt,
        ...typeInfo
      };
      
      if (grouped[typeInfo.category]) {
        grouped[typeInfo.category].push(prData);
      } else {
        grouped.general.push(prData);
      }
    });
    
    res.json({
      success: true,
      data: {
        records,
        grouped,
        totalPRs: records.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get PR history for a specific type
// @route   GET /api/pr/history/:type
// @access  Private
export const getPRHistory = async (req, res, next) => {
  try {
    const { type } = req.params;
    
    // Get all PRs of this type (historical)
    const history = await PersonalRecord.find({ 
      user: req.user._id,
      type
    })
      .populate('workout', 'title date type')
      .sort({ achievedAt: -1 });
    
    const typeInfo = PersonalRecord.getPRTypeInfo(type);
    
    res.json({
      success: true,
      data: {
        type,
        ...typeInfo,
        history,
        currentRecord: history[0] || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check and update PRs after workout
// @route   Internal use only
// @access  Private
export const checkAndUpdatePRs = async (userId, workout) => {
  const newPRs = [];
  
  try {
    // Check running PRs
    if (workout.type === 'run' && workout.run) {
      const distance = workout.run.distance;
      const duration = workout.duration;
      
      // Longest run
      if (distance) {
        const existingLongest = await PersonalRecord.findOne({
          user: userId,
          type: 'longest_run'
        }).sort({ value: -1 });
        
        if (!existingLongest || distance > existingLongest.value) {
          const pr = await createOrUpdatePR(userId, 'longest_run', distance, 'km', workout._id, existingLongest?.value);
          if (pr) newPRs.push(pr);
        }
      }
      
      // Fastest 5K (if distance >= 5km)
      if (distance >= 5 && duration) {
        const pace = duration / distance; // min/km
        const time5k = pace * 5; // time for 5K
        
        const existing5k = await PersonalRecord.findOne({
          user: userId,
          type: 'fastest_5k'
        }).sort({ value: 1 }); // Lower is better for time
        
        if (!existing5k || time5k < existing5k.value) {
          const pr = await createOrUpdatePR(userId, 'fastest_5k', time5k, 'min', workout._id, existing5k?.value);
          if (pr) newPRs.push(pr);
        }
      }
      
      // Fastest 10K (if distance >= 10km)
      if (distance >= 10 && duration) {
        const pace = duration / distance;
        const time10k = pace * 10;
        
        const existing10k = await PersonalRecord.findOne({
          user: userId,
          type: 'fastest_10k'
        }).sort({ value: 1 });
        
        if (!existing10k || time10k < existing10k.value) {
          const pr = await createOrUpdatePR(userId, 'fastest_10k', time10k, 'min', workout._id, existing10k?.value);
          if (pr) newPRs.push(pr);
        }
      }
      
      // Highest elevation
      if (workout.run.elevation) {
        const existingElevation = await PersonalRecord.findOne({
          user: userId,
          type: 'highest_elevation_run'
        }).sort({ value: -1 });
        
        if (!existingElevation || workout.run.elevation > existingElevation.value) {
          const pr = await createOrUpdatePR(userId, 'highest_elevation_run', workout.run.elevation, 'm', workout._id, existingElevation?.value);
          if (pr) newPRs.push(pr);
        }
      }
    }
    
    // Check cardio PRs
    if (workout.type === 'cardio' && workout.cardio) {
      // Longest cardio duration
      if (workout.duration) {
        const existingLongestCardio = await PersonalRecord.findOne({
          user: userId,
          type: 'longest_cardio'
        }).sort({ value: -1 });
        
        if (!existingLongestCardio || workout.duration > existingLongestCardio.value) {
          const pr = await createOrUpdatePR(userId, 'longest_cardio', workout.duration, 'min', workout._id, existingLongestCardio?.value);
          if (pr) newPRs.push(pr);
        }
      }
      
      // Longest cycling
      if (workout.cardio.activity === 'cycling' && workout.cardio.distance) {
        const existingLongestCycling = await PersonalRecord.findOne({
          user: userId,
          type: 'longest_cycling'
        }).sort({ value: -1 });
        
        if (!existingLongestCycling || workout.cardio.distance > existingLongestCycling.value) {
          const pr = await createOrUpdatePR(userId, 'longest_cycling', workout.cardio.distance, 'km', workout._id, existingLongestCycling?.value);
          if (pr) newPRs.push(pr);
        }
      }
    }
    
    // Check strength PRs
    if (workout.type === 'lift' && workout.lift?.exercises) {
      for (const exercise of workout.lift.exercises) {
        const exerciseName = exercise.name?.toLowerCase() || '';
        
        // Check for specific lifts
        if (exerciseName.includes('deadlift')) {
          await checkStrengthPR(userId, 'heaviest_deadlift', exercise.weight, workout._id, newPRs);
        }
        if (exerciseName.includes('squat')) {
          await checkStrengthPR(userId, 'heaviest_squat', exercise.weight, workout._id, newPRs);
        }
        if (exerciseName.includes('bench')) {
          await checkStrengthPR(userId, 'heaviest_bench', exercise.weight, workout._id, newPRs);
        }
      }
    }
    
    // Longest workout (any type)
    if (workout.duration) {
      const existingLongest = await PersonalRecord.findOne({
        user: userId,
        type: 'longest_workout'
      }).sort({ value: -1 });
      
      if (!existingLongest || workout.duration > existingLongest.value) {
        const pr = await createOrUpdatePR(userId, 'longest_workout', workout.duration, 'min', workout._id, existingLongest?.value);
        if (pr) newPRs.push(pr);
      }
    }
    
    return newPRs;
  } catch (error) {
    console.error('Error checking PRs:', error);
    return [];
  }
};

// Helper function to check strength PRs
async function checkStrengthPR(userId, type, weight, workoutId, newPRs) {
  if (!weight) return;
  
  const existing = await PersonalRecord.findOne({
    user: userId,
    type
  }).sort({ value: -1 });
  
  if (!existing || weight > existing.value) {
    const pr = await createOrUpdatePR(userId, type, weight, 'kg', workoutId, existing?.value);
    if (pr) newPRs.push(pr);
  }
}

// Helper function to create or update PR
async function createOrUpdatePR(userId, type, value, unit, workoutId, previousValue) {
  try {
    const improvement = previousValue 
      ? ((value - previousValue) / previousValue * 100).toFixed(1)
      : null;
    
    const pr = await PersonalRecord.create({
      user: userId,
      type,
      value,
      unit,
      workout: workoutId,
      previousValue,
      improvement: improvement ? parseFloat(improvement) : null
    });
    
    console.log(`🏆 New PR! ${type}: ${value} ${unit}`);
    return pr;
  } catch (error) {
    console.error('Error creating PR:', error);
    return null;
  }
}
