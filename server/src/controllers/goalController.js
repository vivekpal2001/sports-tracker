import Goal from '../models/Goal.js';
import Workout from '../models/Workout.js';

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    
    const goals = await Goal.find(filter).sort({ createdAt: -1 });
    
    // Check and update expired goals
    const updatedGoals = await Promise.all(goals.map(async (goal) => {
      if (goal.status === 'active' && goal.isExpired) {
        if (goal.progress >= 100) {
          goal.status = 'completed';
          goal.completedAt = goal.endDate;
        } else {
          goal.status = 'failed';
        }
        await goal.save();
      }
      return goal;
    }));
    
    // Calculate summary
    const summary = {
      total: updatedGoals.length,
      active: updatedGoals.filter(g => g.status === 'active').length,
      completed: updatedGoals.filter(g => g.status === 'completed').length,
      failed: updatedGoals.filter(g => g.status === 'failed').length
    };
    
    res.json({
      success: true,
      data: {
        goals: updatedGoals,
        summary
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a goal
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req, res, next) => {
  try {
    const { type, title, description, target, unit, endDate, reminders } = req.body;
    
    // Validate
    if (!type || !title || !target || !unit || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type, title, target, unit, and end date'
      });
    }
    
    // Calculate initial progress based on goal type
    const current = await calculateInitialProgress(req.user._id, type, new Date());
    
    const goal = await Goal.create({
      user: req.user._id,
      type,
      title,
      description,
      target,
      unit,
      current,
      endDate: new Date(endDate),
      reminders: reminders !== false
    });
    
    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }
    
    const allowedUpdates = ['title', 'description', 'target', 'endDate', 'status', 'reminders'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    goal = await Goal.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Goal deleted'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal progress (called after workout creation)
// @route   Internal
// @access  Private
export const updateGoalProgress = async (userId, workout) => {
  try {
    // Get all active goals
    const activeGoals = await Goal.find({
      user: userId,
      status: 'active'
    });
    
    const updatedGoals = [];
    
    for (const goal of activeGoals) {
      let updated = false;
      
      switch (goal.type) {
        case 'weekly_workouts':
        case 'monthly_workouts':
          goal.current = await countWorkoutsInPeriod(
            userId, 
            goal.type === 'weekly_workouts' ? 7 : 30
          );
          updated = true;
          break;
          
        case 'weekly_distance':
        case 'monthly_distance':
          goal.current = await sumDistanceInPeriod(
            userId,
            goal.type === 'weekly_distance' ? 7 : 30
          );
          updated = true;
          break;
          
        case 'weekly_duration':
          goal.current = await sumDurationInPeriod(userId, 7);
          updated = true;
          break;
          
        case 'daily_streak':
          goal.current = await calculateStreak(userId);
          updated = true;
          break;
          
        case 'run_distance':
          // Check if this workout meets the goal
          if (workout.type === 'run' && workout.run?.distance >= goal.target) {
            goal.current = workout.run.distance;
            updated = true;
          }
          break;
      }
      
      if (updated) {
        // Check if goal is completed
        if (goal.current >= goal.target && goal.status === 'active') {
          goal.status = 'completed';
          goal.completedAt = new Date();
          console.log(`🎯 Goal completed: ${goal.title}`);
        }
        
        await goal.save();
        updatedGoals.push(goal);
      }
    }
    
    return updatedGoals;
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return [];
  }
};

// Helper: Calculate initial progress for new goal
async function calculateInitialProgress(userId, type, startDate) {
  try {
    switch (type) {
      case 'weekly_workouts':
        return await countWorkoutsInPeriod(userId, 7);
      case 'monthly_workouts':
        return await countWorkoutsInPeriod(userId, 30);
      case 'weekly_distance':
        return await sumDistanceInPeriod(userId, 7);
      case 'monthly_distance':
        return await sumDistanceInPeriod(userId, 30);
      case 'weekly_duration':
        return await sumDurationInPeriod(userId, 7);
      case 'daily_streak':
        return await calculateStreak(userId);
      default:
        return 0;
    }
  } catch (error) {
    return 0;
  }
}

// Helper: Count workouts in period
async function countWorkoutsInPeriod(userId, days) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const count = await Workout.countDocuments({
    user: userId,
    date: { $gte: startDate },
    type: { $ne: 'biometrics' }
  });
  
  return count;
}

// Helper: Sum distance in period
async function sumDistanceInPeriod(userId, days) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const result = await Workout.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startDate },
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

// Helper: Sum duration in period
async function sumDurationInPeriod(userId, days) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const result = await Workout.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startDate },
        type: { $ne: 'biometrics' }
      }
    },
    {
      $group: {
        _id: null,
        totalDuration: { $sum: '$duration' }
      }
    }
  ]);
  
  return result[0]?.totalDuration || 0;
}

// Helper: Calculate workout streak
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
  
  // Check if there's a workout today
  const workoutDates = new Set(
    workouts.map(w => {
      const d = new Date(w.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );
  
  // Start from today and go backwards
  while (true) {
    if (workoutDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (streak === 0) {
      // Allow starting from yesterday if no workout today
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
