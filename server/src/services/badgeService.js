import UserBadge from '../models/UserBadge.js';
import Workout from '../models/Workout.js';
import PersonalRecord from '../models/PersonalRecord.js';
import Goal from '../models/Goal.js';

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
        user: userId,
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
              '$run.distance',
              '$cardio.distance'
            ]
          }
        }
      }
    }
  ]);
  
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
    special: []
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
