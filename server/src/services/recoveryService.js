import Workout from '../models/Workout.js';

/**
 * Recovery Score Service
 * Calculates a 0-100 recovery score based on recent training load and patterns
 */

// Constants for scoring
const RECOVERY_WEIGHTS = {
  recentLoad: 0.35,      // How hard last 3 days were
  weeklyVolume: 0.25,    // Training volume vs typical
  restDays: 0.25,        // Rest between sessions
  rpe: 0.15              // Overall RPE trend
};

// Status thresholds
const RECOVERY_STATUS = {
  FRESH: { min: 80, label: 'Fresh', color: 'lime', icon: '💪', message: 'Ready for high intensity!' },
  RECOVERED: { min: 60, label: 'Recovered', color: 'primary', icon: '✅', message: 'Good to train normally' },
  MODERATE: { min: 40, label: 'Moderate', color: 'yellow', icon: '⚠️', message: 'Consider lighter training' },
  FATIGUED: { min: 0, label: 'Fatigued', color: 'red', icon: '🔴', message: 'Recovery day recommended' }
};

/**
 * Calculate recovery score for a user
 * @param {ObjectId} userId - User's ID
 * @returns {Object} Recovery score data
 */
export const calculateRecoveryScore = async (userId) => {
  try {
    const now = new Date();
    
    // Get workouts from last 14 days for analysis
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const workouts = await Workout.find({
      user: userId,
      type: { $ne: 'biometrics' },
      date: { $gte: twoWeeksAgo }
    }).sort({ date: -1 });
    
    // If no recent workouts, user is fully recovered
    if (workouts.length === 0) {
      return {
        score: 100,
        status: RECOVERY_STATUS.FRESH,
        factors: {
          recentLoad: 100,
          weeklyVolume: 100,
          restDays: 100,
          rpe: 100
        },
        insights: ['No recent workouts - you\'re fully recovered!'],
        lastWorkout: null,
        recommendation: 'Ready for any workout intensity'
      };
    }
    
    // Calculate individual factors
    const recentLoadScore = calculateRecentLoadScore(workouts, now);
    const weeklyVolumeScore = calculateWeeklyVolumeScore(workouts, now);
    const restDaysScore = calculateRestDaysScore(workouts, now);
    const rpeScore = calculateRPEScore(workouts);
    
    // Weighted average
    const score = Math.round(
      recentLoadScore * RECOVERY_WEIGHTS.recentLoad +
      weeklyVolumeScore * RECOVERY_WEIGHTS.weeklyVolume +
      restDaysScore * RECOVERY_WEIGHTS.restDays +
      rpeScore * RECOVERY_WEIGHTS.rpe
    );
    
    // Determine status
    const status = getRecoveryStatus(score);
    
    // Generate insights
    const insights = generateInsights(recentLoadScore, weeklyVolumeScore, restDaysScore, rpeScore);
    
    // Get last workout info
    const lastWorkout = workouts[0] ? {
      date: workouts[0].date,
      type: workouts[0].type,
      duration: workouts[0].duration,
      daysAgo: Math.floor((now - new Date(workouts[0].date)) / (1000 * 60 * 60 * 24))
    } : null;
    
    return {
      score,
      status,
      factors: {
        recentLoad: recentLoadScore,
        weeklyVolume: weeklyVolumeScore,
        restDays: restDaysScore,
        rpe: rpeScore
      },
      insights,
      lastWorkout,
      recommendation: getRecommendation(score, lastWorkout)
    };
  } catch (error) {
    console.error('Error calculating recovery score:', error);
    throw error;
  }
};

/**
 * Calculate how hard the last 3 days were
 */
function calculateRecentLoadScore(workouts, now) {
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  const recentWorkouts = workouts.filter(w => new Date(w.date) >= threeDaysAgo);
  
  if (recentWorkouts.length === 0) return 100;
  
  // Calculate load based on duration and intensity
  let totalLoad = 0;
  recentWorkouts.forEach(w => {
    const intensity = w.rpe || 5; // Default RPE of 5
    const duration = w.duration || 30;
    totalLoad += (intensity / 10) * duration;
  });
  
  // Normalize: assume 60 min at RPE 7 per day is moderate
  const expectedLoad = 3 * 60 * 0.7; // 126
  const loadRatio = totalLoad / expectedLoad;
  
  // Score inversely proportional to load
  if (loadRatio <= 0.5) return 100;
  if (loadRatio >= 2) return 20;
  
  return Math.round(100 - (loadRatio - 0.5) * 53);
}

/**
 * Compare this week's volume to typical/last week
 */
function calculateWeeklyVolumeScore(workouts, now) {
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  const thisWeek = workouts.filter(w => new Date(w.date) >= oneWeekAgo);
  const lastWeek = workouts.filter(w => 
    new Date(w.date) >= twoWeeksAgo && new Date(w.date) < oneWeekAgo
  );
  
  const thisWeekDuration = thisWeek.reduce((sum, w) => sum + (w.duration || 0), 0);
  const lastWeekDuration = lastWeek.reduce((sum, w) => sum + (w.duration || 0), 0);
  
  if (lastWeekDuration === 0) {
    // No baseline - score based on absolute volume
    if (thisWeekDuration < 120) return 90;
    if (thisWeekDuration > 420) return 40;
    return 70;
  }
  
  const ratio = thisWeekDuration / lastWeekDuration;
  
  // Optimal is 0.9-1.1x (10% increase limit)
  if (ratio <= 0.9) return 95;
  if (ratio <= 1.1) return 85;
  if (ratio <= 1.3) return 60;
  if (ratio <= 1.5) return 40;
  return 25;
}

/**
 * Score based on rest between workouts
 */
function calculateRestDaysScore(workouts, now) {
  if (workouts.length === 0) return 100;
  
  const lastWorkoutDate = new Date(workouts[0].date);
  const daysSinceLastWorkout = Math.floor(
    (now - lastWorkoutDate) / (1000 * 60 * 60 * 24)
  );
  
  // Ideal: 1-2 rest days
  if (daysSinceLastWorkout === 0) return 50; // Training today
  if (daysSinceLastWorkout === 1) return 80;
  if (daysSinceLastWorkout === 2) return 95;
  if (daysSinceLastWorkout >= 3) return 100;
  
  return 70;
}

/**
 * Score based on average RPE of recent workouts
 */
function calculateRPEScore(workouts) {
  const workoutsWithRPE = workouts.filter(w => w.rpe);
  
  if (workoutsWithRPE.length === 0) return 70; // Neutral if no RPE data
  
  const avgRPE = workoutsWithRPE.slice(0, 5).reduce((sum, w) => sum + w.rpe, 0) 
    / Math.min(5, workoutsWithRPE.length);
  
  // Lower RPE = better recovery
  if (avgRPE <= 4) return 95;
  if (avgRPE <= 6) return 75;
  if (avgRPE <= 7) return 55;
  if (avgRPE <= 8) return 40;
  return 25;
}

/**
 * Get recovery status based on score
 */
function getRecoveryStatus(score) {
  if (score >= RECOVERY_STATUS.FRESH.min) return RECOVERY_STATUS.FRESH;
  if (score >= RECOVERY_STATUS.RECOVERED.min) return RECOVERY_STATUS.RECOVERED;
  if (score >= RECOVERY_STATUS.MODERATE.min) return RECOVERY_STATUS.MODERATE;
  return RECOVERY_STATUS.FATIGUED;
}

/**
 * Generate training insights based on factors
 */
function generateInsights(recentLoad, weeklyVolume, restDays, rpe) {
  const insights = [];
  
  if (recentLoad < 50) {
    insights.push('High training load in the last 3 days');
  }
  
  if (weeklyVolume < 50) {
    insights.push('Training volume increased significantly this week');
  }
  
  if (restDays < 60) {
    insights.push('Consider taking a rest day');
  }
  
  if (rpe < 50) {
    insights.push('Recent workouts have been high intensity');
  }
  
  if (insights.length === 0) {
    if (recentLoad > 80 && restDays > 80) {
      insights.push('Well-rested with balanced training');
    } else {
      insights.push('Training load is manageable');
    }
  }
  
  return insights;
}

/**
 * Get workout recommendation based on score
 */
function getRecommendation(score, lastWorkout) {
  if (score >= 80) {
    if (!lastWorkout || lastWorkout.daysAgo >= 2) {
      return 'Perfect time for a challenging workout or PR attempt';
    }
    return 'Ready for normal training intensity';
  }
  
  if (score >= 60) {
    return 'Good for moderate training. Avoid max efforts.';
  }
  
  if (score >= 40) {
    return 'Light training recommended: easy run, mobility, or technique work';
  }
  
  return 'Rest day recommended. Focus on sleep, nutrition, and stretching.';
}

export default { calculateRecoveryScore };
