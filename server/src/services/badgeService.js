import mongoose from 'mongoose';
import UserBadge from '../models/UserBadge.js';
import Workout from '../models/Workout.js';
import PersonalRecord from '../models/PersonalRecord.js';
import Goal from '../models/Goal.js';

// Helper to ensure ObjectId type
const toObjectId = (id) => {
  if (typeof id === 'string') return new mongoose.Types.ObjectId(id);
  return id;
};

// Badge definitions
export const BADGES = {
  // Consistency badges
  first_workout: {
    id: 'first_workout',
    name: 'First Steps',
    description: 'Complete your first workout',
    icon: '🎯',
    category: 'milestone',
    rarity: 'common'
  },
  streak_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day workout streak',
    icon: '🔥',
    category: 'consistency',
    rarity: 'common'
  },
  streak_30: {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day workout streak',
    icon: '💪',
    category: 'consistency',
    rarity: 'rare'
  },
  streak_100: {
    id: 'streak_100',
    name: 'Century Champion',
    description: 'Maintain a 100-day workout streak',
    icon: '👑',
    category: 'consistency',
    rarity: 'legendary'
  },
  
  // Workout count badges
  workouts_10: {
    id: 'workouts_10',
    name: 'Getting Started',
    description: 'Complete 10 workouts',
    icon: '🏃',
    category: 'milestone',
    rarity: 'common'
  },
  workouts_50: {
    id: 'workouts_50',
    name: 'Dedicated Athlete',
    description: 'Complete 50 workouts',
    icon: '🏅',
    category: 'milestone',
    rarity: 'rare'
  },
  workouts_100: {
    id: 'workouts_100',
    name: 'Workout Centurion',
    description: 'Complete 100 workouts',
    icon: '🏆',
    category: 'milestone',
    rarity: 'epic'
  },
  workouts_500: {
    id: 'workouts_500',
    name: 'Iron Will',
    description: 'Complete 500 workouts',
    icon: '⚡',
    category: 'milestone',
    rarity: 'legendary'
  },
  
  // Distance badges
  distance_50: {
    id: 'distance_50',
    name: 'First 50K',
    description: 'Run a total of 50 kilometers',
    icon: '📏',
    category: 'distance',
    rarity: 'common'
  },
  distance_100: {
    id: 'distance_100',
    name: 'Century Runner',
    description: 'Run a total of 100 kilometers',
    icon: '🛤️',
    category: 'distance',
    rarity: 'rare'
  },
  distance_500: {
    id: 'distance_500',
    name: 'Long Distance Champion',
    description: 'Run a total of 500 kilometers',
    icon: '🌍',
    category: 'distance',
    rarity: 'epic'
  },
  distance_1000: {
    id: 'distance_1000',
    name: 'Marathon Legend',
    description: 'Run a total of 1000 kilometers',
    icon: '🚀',
    category: 'distance',
    rarity: 'legendary'
  },
  
  // PR badges
  first_pr: {
    id: 'first_pr',
    name: 'Personal Best',
    description: 'Set your first personal record',
    icon: '🏅',
    category: 'achievement',
    rarity: 'common'
  },
  pr_5: {
    id: 'pr_5',
    name: 'Record Breaker',
    description: 'Set 5 personal records',
    icon: '💪',
    category: 'achievement',
    rarity: 'rare'
  },
  pr_10: {
    id: 'pr_10',
    name: 'PR Hunter',
    description: 'Set 10 personal records',
    icon: '🎖️',
    category: 'achievement',
    rarity: 'epic'
  },
  
  // Goal badges
  first_goal: {
    id: 'first_goal',
    name: 'Goal Setter',
    description: 'Complete your first goal',
    icon: '🎯',
    category: 'goals',
    rarity: 'common'
  },
  goals_5: {
    id: 'goals_5',
    name: 'Goal Crusher',
    description: 'Complete 5 goals',
    icon: '✅',
    category: 'goals',
    rarity: 'rare'
  },
  goals_10: {
    id: 'goals_10',
    name: 'Unstoppable',
    description: 'Complete 10 goals',
    icon: '🌟',
    category: 'goals',
    rarity: 'epic'
  },
  
  // Special badges
  early_bird: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a workout before 6 AM',
    icon: '🌅',
    category: 'special',
    rarity: 'rare'
  },
  night_owl: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a workout after 10 PM',
    icon: '🌙',
    category: 'special',
    rarity: 'rare'
  },
  weekend_warrior: {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Work out on both Saturday and Sunday in the same week',
    icon: '🗓️',
    category: 'special',
    rarity: 'common'
  },
  
  // Yoga badges
  yoga_first: {
    id: 'yoga_first',
    name: 'First Flow',
    description: 'Complete your first yoga session',
    icon: '🧘',
    category: 'yoga',
    rarity: 'common'
  },
  yoga_10: {
    id: 'yoga_10',
    name: 'Yogi in Training',
    description: 'Complete 10 yoga sessions',
    icon: '🪷',
    category: 'yoga',
    rarity: 'rare'
  },
  yoga_50: {
    id: 'yoga_50',
    name: 'Mindful Master',
    description: 'Complete 50 yoga sessions',
    icon: '☯️',
    category: 'yoga',
    rarity: 'epic'
  },
  yoga_streak_7: {
    id: 'yoga_streak_7',
    name: 'Daily Zen',
    description: 'Complete yoga sessions for 7 consecutive days',
    icon: '🌅',
    category: 'yoga',
    rarity: 'rare'
  },
  yoga_meditation_100: {
    id: 'yoga_meditation_100',
    name: 'Meditation Master',
    description: 'Accumulate 100 minutes of meditation',
    icon: '🧠',
    category: 'yoga',
    rarity: 'epic'
  },
  yoga_flexibility: {
    id: 'yoga_flexibility',
    name: 'Flexibility Focus',
    description: 'Improve your flexibility score 10 times',
    icon: '🤸',
    category: 'yoga',
    rarity: 'rare'
  },
  
  // Challenge badges
  challenge_winner: {
    id: 'challenge_winner',
    name: 'Challenge Champion',
    description: 'Win a challenge by finishing first',
    icon: '🏆',
    category: 'challenges',
    rarity: 'epic'
  },
  challenge_top3: {
    id: 'challenge_top3',
    name: 'Podium Finish',
    description: 'Finish in the top 3 of a challenge',
    icon: '🥇',
    category: 'challenges',
    rarity: 'rare'
  },
  challenge_finisher: {
    id: 'challenge_finisher',
    name: 'Challenge Finisher',
    description: 'Complete a challenge target',
    icon: '✅',
    category: 'challenges',
    rarity: 'common'
  },
  challenge_creator: {
    id: 'challenge_creator',
    name: 'Challenge Maker',
    description: 'Create 5 challenges',
    icon: '🎯',
    category: 'challenges',
    rarity: 'rare'
  },
  challenge_streak: {
    id: 'challenge_streak',
    name: 'Challenge Warrior',
    description: 'Complete 10 challenges',
    icon: '🔥',
    category: 'challenges',
    rarity: 'epic'
  },
  
  // Nutrition badges
  nutrition_first: {
    id: 'nutrition_first',
    name: 'First Bite',
    description: 'Log your first meal',
    icon: '🍽️',
    category: 'nutrition',
    rarity: 'common'
  },
  nutrition_7day: {
    id: 'nutrition_7day',
    name: 'Consistent Tracker',
    description: 'Track nutrition for 7 consecutive days',
    icon: '📊',
    category: 'nutrition',
    rarity: 'rare'
  },
  nutrition_protein: {
    id: 'nutrition_protein',
    name: 'Protein Champion',
    description: 'Hit protein target 10 days',
    icon: '💪',
    category: 'nutrition',
    rarity: 'rare'
  },
  nutrition_balanced: {
    id: 'nutrition_balanced',
    name: 'Balanced Eater',
    description: 'Stay within calorie goal for a week',
    icon: '⚖️',
    category: 'nutrition',
    rarity: 'rare'
  },
  nutrition_30day: {
    id: 'nutrition_30day',
    name: 'Nutrition Master',
    description: 'Track nutrition for 30 days',
    icon: '🏆',
    category: 'nutrition',
    rarity: 'epic'
  },
  nutrition_hydration: {
    id: 'nutrition_hydration',
    name: 'Hydration Hero',
    description: 'Meet water goal for 7 days',
    icon: '💧',
    category: 'nutrition',
    rarity: 'common'
  }
};

// Check and award badges after workout
export const checkAndAwardBadges = async (userId, workout) => {
  const newBadges = [];
  
  try {
    // Get user's existing badges
    const existingBadges = await UserBadge.find({ user: userId }).select('badgeId');
    const earnedBadgeIds = new Set(existingBadges.map(b => b.badgeId));
    
    // Count total workouts
    const workoutCount = await Workout.countDocuments({ 
      user: userId, 
      type: { $ne: 'biometrics' } 
    });
    
    // First workout badge
    if (workoutCount === 1 && !earnedBadgeIds.has('first_workout')) {
      const badge = await awardBadge(userId, 'first_workout', workout._id);
      if (badge) newBadges.push(badge);
    }
    
    // Workout count badges
    if (workoutCount >= 10 && !earnedBadgeIds.has('workouts_10')) {
      const badge = await awardBadge(userId, 'workouts_10', workout._id);
      if (badge) newBadges.push(badge);
    }
    if (workoutCount >= 50 && !earnedBadgeIds.has('workouts_50')) {
      const badge = await awardBadge(userId, 'workouts_50', workout._id);
      if (badge) newBadges.push(badge);
    }
    if (workoutCount >= 100 && !earnedBadgeIds.has('workouts_100')) {
      const badge = await awardBadge(userId, 'workouts_100', workout._id);
      if (badge) newBadges.push(badge);
    }
    if (workoutCount >= 500 && !earnedBadgeIds.has('workouts_500')) {
      const badge = await awardBadge(userId, 'workouts_500', workout._id);
      if (badge) newBadges.push(badge);
    }
    
    // Distance badges (for running workouts)
    const totalDistance = await calculateTotalDistance(userId);
    
    if (totalDistance >= 50 && !earnedBadgeIds.has('distance_50')) {
      const badge = await awardBadge(userId, 'distance_50', workout._id);
      if (badge) newBadges.push(badge);
    }
    if (totalDistance >= 100 && !earnedBadgeIds.has('distance_100')) {
      const badge = await awardBadge(userId, 'distance_100', workout._id);
      if (badge) newBadges.push(badge);
    }
    if (totalDistance >= 500 && !earnedBadgeIds.has('distance_500')) {
      const badge = await awardBadge(userId, 'distance_500', workout._id);
      if (badge) newBadges.push(badge);
    }
    if (totalDistance >= 1000 && !earnedBadgeIds.has('distance_1000')) {
      const badge = await awardBadge(userId, 'distance_1000', workout._id);
      if (badge) newBadges.push(badge);
    }
    
    // Streak badges
    const streak = await calculateStreak(userId);
    
    if (streak >= 7 && !earnedBadgeIds.has('streak_7')) {
      const badge = await awardBadge(userId, 'streak_7', workout._id);
      if (badge) newBadges.push(badge);
    }
    if (streak >= 30 && !earnedBadgeIds.has('streak_30')) {
      const badge = await awardBadge(userId, 'streak_30', workout._id);
      if (badge) newBadges.push(badge);
    }
    if (streak >= 100 && !earnedBadgeIds.has('streak_100')) {
      const badge = await awardBadge(userId, 'streak_100', workout._id);
      if (badge) newBadges.push(badge);
    }
    
    // Time-based badges
    const workoutHour = new Date(workout.date || workout.createdAt).getHours();
    
    if (workoutHour < 6 && !earnedBadgeIds.has('early_bird')) {
      const badge = await awardBadge(userId, 'early_bird', workout._id);
      if (badge) newBadges.push(badge);
    }
    if (workoutHour >= 22 && !earnedBadgeIds.has('night_owl')) {
      const badge = await awardBadge(userId, 'night_owl', workout._id);
      if (badge) newBadges.push(badge);
    }
    
    // PR badges
    const prCount = await PersonalRecord.countDocuments({ user: userId });
    
    if (prCount >= 1 && !earnedBadgeIds.has('first_pr')) {
      const badge = await awardBadge(userId, 'first_pr', workout._id);
      if (badge) newBadges.push(badge);
    }
    if (prCount >= 5 && !earnedBadgeIds.has('pr_5')) {
      const badge = await awardBadge(userId, 'pr_5', workout._id);
      if (badge) newBadges.push(badge);
    }
    if (prCount >= 10 && !earnedBadgeIds.has('pr_10')) {
      const badge = await awardBadge(userId, 'pr_10', workout._id);
      if (badge) newBadges.push(badge);
    }
    
    // Goal badges
    const completedGoals = await Goal.countDocuments({ 
      user: userId, 
      status: 'completed' 
    });
    
    if (completedGoals >= 1 && !earnedBadgeIds.has('first_goal')) {
      const badge = await awardBadge(userId, 'first_goal', workout._id);
      if (badge) newBadges.push(badge);
    }
    if (completedGoals >= 5 && !earnedBadgeIds.has('goals_5')) {
      const badge = await awardBadge(userId, 'goals_5', workout._id);
      if (badge) newBadges.push(badge);
    }
    if (completedGoals >= 10 && !earnedBadgeIds.has('goals_10')) {
      const badge = await awardBadge(userId, 'goals_10', workout._id);
      if (badge) newBadges.push(badge);
    }
    
    // Yoga badges
    if (workout.type === 'yoga') {
      const yogaCount = await Workout.countDocuments({ 
        user: userId, 
        type: 'yoga' 
      });
      
      // First yoga session
      if (yogaCount === 1 && !earnedBadgeIds.has('yoga_first')) {
        const badge = await awardBadge(userId, 'yoga_first', workout._id);
        if (badge) newBadges.push(badge);
      }
      
      // Yoga count badges
      if (yogaCount >= 10 && !earnedBadgeIds.has('yoga_10')) {
        const badge = await awardBadge(userId, 'yoga_10', workout._id);
        if (badge) newBadges.push(badge);
      }
      if (yogaCount >= 50 && !earnedBadgeIds.has('yoga_50')) {
        const badge = await awardBadge(userId, 'yoga_50', workout._id);
        if (badge) newBadges.push(badge);
      }
      
      // Yoga streak badge
      const yogaStreak = await calculateYogaStreak(userId);
      if (yogaStreak >= 7 && !earnedBadgeIds.has('yoga_streak_7')) {
        const badge = await awardBadge(userId, 'yoga_streak_7', workout._id);
        if (badge) newBadges.push(badge);
      }
      
      // Meditation minutes badge
      const totalMeditationMinutes = await calculateTotalMeditationMinutes(userId);
      if (totalMeditationMinutes >= 100 && !earnedBadgeIds.has('yoga_meditation_100')) {
        const badge = await awardBadge(userId, 'yoga_meditation_100', workout._id);
        if (badge) newBadges.push(badge);
      }
      
      // Flexibility improvement badge
      if (workout.yoga?.flexibility?.preScore && workout.yoga?.flexibility?.postScore) {
        if (workout.yoga.flexibility.postScore > workout.yoga.flexibility.preScore) {
          const flexibilityImprovements = await countFlexibilityImprovements(userId);
          if (flexibilityImprovements >= 10 && !earnedBadgeIds.has('yoga_flexibility')) {
            const badge = await awardBadge(userId, 'yoga_flexibility', workout._id);
            if (badge) newBadges.push(badge);
          }
        }
      }
    }
    
    return newBadges;
  } catch (error) {
    console.error('Error checking badges:', error);
    return [];
  }
};

// Award a badge to user
async function awardBadge(userId, badgeId, workoutId) {
  try {
    const badge = BADGES[badgeId];
    if (!badge) return null;
    
    const userBadge = await UserBadge.create({
      user: userId,
      badgeId,
      workout: workoutId
    });
    
    console.log(`🏅 Badge earned: ${badge.name}`);
    
    return {
      ...badge,
      earnedAt: userBadge.earnedAt
    };
  } catch (error) {
    // Might be duplicate
    if (error.code === 11000) return null;
    console.error('Error awarding badge:', error);
    return null;
  }
}

// Helper: Calculate total distance
async function calculateTotalDistance(userId) {
  const result = await Workout.aggregate([
    {
      $match: {
        user: toObjectId(userId),
        type: { $in: ['run', 'cardio'] }
      }
    },
    {
      $group: {
        _id: null,
        totalDistance: {
          $sum: {
            $cond: [
              { $eq: ['$type', 'run'] },
              { $ifNull: ['$run.distance', 0] },
              { $ifNull: ['$cardio.distance', 0] }
            ]
          }
        }
      }
    }
  ]);
  
  console.log('Total distance calculated:', result[0]?.totalDistance || 0, 'km');
  return result[0]?.totalDistance || 0;
}

// Helper: Calculate streak
async function calculateStreak(userId) {
  const workouts = await Workout.find({
    user: userId,
    type: { $ne: 'biometrics' }
  })
    .sort({ date: -1 })
    .select('date')
    .limit(365);
  
  if (workouts.length === 0) return 0;
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  const workoutDates = new Set(
    workouts.map(w => {
      const d = new Date(w.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );
  
  while (true) {
    if (workoutDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (streak === 0) {
      currentDate.setDate(currentDate.getDate() - 1);
      if (!workoutDates.has(currentDate.getTime())) {
        break;
      }
    } else {
      break;
    }
  }
  
  return streak;
}

// Get all badges for user (earned + locked)
export const getUserBadges = async (userId) => {
  const userBadges = await UserBadge.find({ user: userId })
    .populate('workout', 'title date')
    .sort({ earnedAt: -1 });
  
  const earnedBadgeIds = new Set(userBadges.map(b => b.badgeId));
  
  // Build badge list with earned status
  const allBadges = Object.values(BADGES).map(badge => {
    const earnedBadge = userBadges.find(ub => ub.badgeId === badge.id);
    
    return {
      ...badge,
      earned: earnedBadgeIds.has(badge.id),
      earnedAt: earnedBadge?.earnedAt,
      workout: earnedBadge?.workout
    };
  });
  
  // Group by category
  const byCategory = {
    milestone: [],
    consistency: [],
    distance: [],
    achievement: [],
    goals: [],
    special: [],
    yoga: [],
    challenges: [],
    nutrition: []
  };
  
  allBadges.forEach(badge => {
    if (byCategory[badge.category]) {
      byCategory[badge.category].push(badge);
    }
  });
  
  return {
    all: allBadges,
    byCategory,
    earned: userBadges.length,
    total: Object.keys(BADGES).length
  };
};

// Sync/retroactively award badges for existing data
export const syncUserBadges = async (userId) => {
  const newBadges = [];
  
  try {
    // Get user's existing badges
    const existingBadges = await UserBadge.find({ user: userId }).select('badgeId');
    const earnedBadgeIds = new Set(existingBadges.map(b => b.badgeId));
    
    // Count total workouts
    const workoutCount = await Workout.countDocuments({ 
      user: userId, 
      type: { $ne: 'biometrics' } 
    });
    console.log(`Sync badges for user: ${workoutCount} workouts found`);
    
    // First workout badge
    if (workoutCount >= 1 && !earnedBadgeIds.has('first_workout')) {
      const badge = await awardBadgeSimple(userId, 'first_workout');
      if (badge) newBadges.push(badge);
    }
    
    // Workout count badges
    if (workoutCount >= 10 && !earnedBadgeIds.has('workouts_10')) {
      const badge = await awardBadgeSimple(userId, 'workouts_10');
      if (badge) newBadges.push(badge);
    }
    if (workoutCount >= 50 && !earnedBadgeIds.has('workouts_50')) {
      const badge = await awardBadgeSimple(userId, 'workouts_50');
      if (badge) newBadges.push(badge);
    }
    if (workoutCount >= 100 && !earnedBadgeIds.has('workouts_100')) {
      const badge = await awardBadgeSimple(userId, 'workouts_100');
      if (badge) newBadges.push(badge);
    }
    if (workoutCount >= 500 && !earnedBadgeIds.has('workouts_500')) {
      const badge = await awardBadgeSimple(userId, 'workouts_500');
      if (badge) newBadges.push(badge);
    }
    
    // Distance badges
    const totalDistance = await calculateTotalDistance(userId);
    console.log(`Total distance for badge sync: ${totalDistance} km`);
    
    if (totalDistance >= 50 && !earnedBadgeIds.has('distance_50')) {
      const badge = await awardBadgeSimple(userId, 'distance_50');
      if (badge) newBadges.push(badge);
    }
    if (totalDistance >= 100 && !earnedBadgeIds.has('distance_100')) {
      const badge = await awardBadgeSimple(userId, 'distance_100');
      if (badge) newBadges.push(badge);
    }
    if (totalDistance >= 500 && !earnedBadgeIds.has('distance_500')) {
      const badge = await awardBadgeSimple(userId, 'distance_500');
      if (badge) newBadges.push(badge);
    }
    if (totalDistance >= 1000 && !earnedBadgeIds.has('distance_1000')) {
      const badge = await awardBadgeSimple(userId, 'distance_1000');
      if (badge) newBadges.push(badge);
    }
    
    // PR badges
    const prCount = await PersonalRecord.countDocuments({ user: userId });
    
    if (prCount >= 1 && !earnedBadgeIds.has('first_pr')) {
      const badge = await awardBadgeSimple(userId, 'first_pr');
      if (badge) newBadges.push(badge);
    }
    if (prCount >= 5 && !earnedBadgeIds.has('pr_5')) {
      const badge = await awardBadgeSimple(userId, 'pr_5');
      if (badge) newBadges.push(badge);
    }
    if (prCount >= 10 && !earnedBadgeIds.has('pr_10')) {
      const badge = await awardBadgeSimple(userId, 'pr_10');
      if (badge) newBadges.push(badge);
    }
    
    // Goal badges
    const completedGoals = await Goal.countDocuments({ 
      user: userId, 
      status: 'completed' 
    });
    
    if (completedGoals >= 1 && !earnedBadgeIds.has('first_goal')) {
      const badge = await awardBadgeSimple(userId, 'first_goal');
      if (badge) newBadges.push(badge);
    }
    if (completedGoals >= 5 && !earnedBadgeIds.has('goals_5')) {
      const badge = await awardBadgeSimple(userId, 'goals_5');
      if (badge) newBadges.push(badge);
    }
    if (completedGoals >= 10 && !earnedBadgeIds.has('goals_10')) {
      const badge = await awardBadgeSimple(userId, 'goals_10');
      if (badge) newBadges.push(badge);
    }
    
    console.log(`Badge sync complete: ${newBadges.length} new badges awarded`);
    return newBadges;
  } catch (error) {
    console.error('Error syncing badges:', error);
    return [];
  }
};

// Simple badge award without workout reference
export async function awardBadgeSimple(userId, badgeId) {
  try {
    const badge = BADGES[badgeId];
    if (!badge) return null;
    
    const userBadge = await UserBadge.create({
      user: userId,
      badgeId
    });
    
    console.log(`🏅 Badge awarded (sync): ${badge.name}`);
    
    return {
      ...badge,
      earnedAt: userBadge.earnedAt
    };
  } catch (error) {
    if (error.code === 11000) return null;
    console.error('Error awarding badge:', error);
    return null;
  }
}

// Helper: Calculate yoga streak
async function calculateYogaStreak(userId) {
  const workouts = await Workout.find({
    user: userId,
    type: 'yoga'
  })
    .sort({ date: -1 })
    .select('date')
    .limit(365);
  
  if (workouts.length === 0) return 0;
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  const workoutDates = new Set(
    workouts.map(w => {
      const d = new Date(w.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );
  
  while (true) {
    if (workoutDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (streak === 0) {
      currentDate.setDate(currentDate.getDate() - 1);
      if (!workoutDates.has(currentDate.getTime())) {
        break;
      }
    } else {
      break;
    }
  }
  
  return streak;
}

// Helper: Calculate total meditation minutes
async function calculateTotalMeditationMinutes(userId) {
  const result = await Workout.aggregate([
    {
      $match: {
        user: toObjectId(userId),
        type: 'yoga',
        'yoga.meditation.duration': { $gt: 0 }
      }
    },
    {
      $group: {
        _id: null,
        totalMinutes: { $sum: '$yoga.meditation.duration' }
      }
    }
  ]);
  
  return result[0]?.totalMinutes || 0;
}

// Helper: Count flexibility improvements
async function countFlexibilityImprovements(userId) {
  const result = await Workout.countDocuments({
    user: userId,
    type: 'yoga',
    'yoga.flexibility.preScore': { $exists: true },
    'yoga.flexibility.postScore': { $exists: true },
    $expr: { $gt: ['$yoga.flexibility.postScore', '$yoga.flexibility.preScore'] }
  });
  
  return result;
}
