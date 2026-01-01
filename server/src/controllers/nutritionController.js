import Meal from '../models/Meal.js';
import NutritionGoal from '../models/NutritionGoal.js';
import User from '../models/User.js';
import { FOODS, searchFoods, MEAL_TEMPLATES } from '../data/foodDatabase.js';
import { awardBadgeSimple } from '../services/badgeService.js';

// @desc    Log a meal
// @route   POST /api/nutrition/meals
// @access  Private
export const logMeal = async (req, res, next) => {
  try {
    const { date, type, name, foods, notes, image } = req.body;
    
    const meal = await Meal.create({
      user: req.user._id,
      date: date || new Date(),
      type,
      name,
      foods,
      notes,
      image
    });
    
    // Check for nutrition badges
    await checkNutritionBadges(req.user._id);
    
    res.status(201).json({
      success: true,
      data: meal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get meals for a specific date
// @route   GET /api/nutrition/meals/:date
// @access  Private
export const getMealsForDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    
    // Parse date and get start/end of day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const meals = await Meal.find({
      user: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ createdAt: 1 });
    
    res.json({
      success: true,
      data: meals,
      date
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily nutrition summary
// @route   GET /api/nutrition/summary/:date
// @access  Private
export const getDailySummary = async (req, res, next) => {
  try {
    const { date } = req.params;
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get all meals for the day
    const meals = await Meal.find({
      user: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    
    // Get user's nutrition goals
    const nutritionGoal = await NutritionGoal.findOne({ user: req.user._id });
    
    // Calculate totals
    const totals = meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.totalCalories,
      protein: acc.protein + meal.totalProtein,
      carbs: acc.carbs + meal.totalCarbs,
      fat: acc.fat + meal.totalFat,
      fiber: acc.fiber + meal.totalFiber
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
    
    // Calculate percentages against goals
    const targets = nutritionGoal || { dailyCalories: 2000, macroTargets: { protein: 25, carbs: 50, fat: 25 } };
    const macroGrams = nutritionGoal?.macroGrams || {
      protein: Math.round((targets.dailyCalories * 0.25) / 4),
      carbs: Math.round((targets.dailyCalories * 0.50) / 4),
      fat: Math.round((targets.dailyCalories * 0.25) / 9)
    };
    
    const progress = {
      calories: Math.round((totals.calories / targets.dailyCalories) * 100),
      protein: Math.round((totals.protein / macroGrams.protein) * 100),
      carbs: Math.round((totals.carbs / macroGrams.carbs) * 100),
      fat: Math.round((totals.fat / macroGrams.fat) * 100)
    };
    
    // Group meals by type
    const mealsByType = {};
    meals.forEach(meal => {
      if (!mealsByType[meal.type]) {
        mealsByType[meal.type] = [];
      }
      mealsByType[meal.type].push(meal);
    });
    
    res.json({
      success: true,
      data: {
        date,
        totals,
        targets: {
          calories: targets.dailyCalories,
          protein: macroGrams.protein,
          carbs: macroGrams.carbs,
          fat: macroGrams.fat
        },
        progress,
        remaining: {
          calories: Math.max(0, targets.dailyCalories - totals.calories),
          protein: Math.max(0, macroGrams.protein - totals.protein),
          carbs: Math.max(0, macroGrams.carbs - totals.carbs),
          fat: Math.max(0, macroGrams.fat - totals.fat)
        },
        mealsByType,
        mealCount: meals.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly nutrition stats
// @route   GET /api/nutrition/stats
// @access  Private
export const getWeeklyStats = async (req, res, next) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const dailyStats = await Meal.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          totalCalories: { $sum: '$totalCalories' },
          totalProtein: { $sum: '$totalProtein' },
          totalCarbs: { $sum: '$totalCarbs' },
          totalFat: { $sum: '$totalFat' },
          mealCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Format for chart
    const chartData = dailyStats.map(d => ({
      date: `${d._id.year}-${String(d._id.month).padStart(2, '0')}-${String(d._id.day).padStart(2, '0')}`,
      calories: d.totalCalories,
      protein: d.totalProtein,
      carbs: d.totalCarbs,
      fat: d.totalFat,
      meals: d.mealCount
    }));
    
    // Calculate averages
    const averages = {
      calories: Math.round(dailyStats.reduce((sum, d) => sum + d.totalCalories, 0) / Math.max(1, dailyStats.length)),
      protein: Math.round(dailyStats.reduce((sum, d) => sum + d.totalProtein, 0) / Math.max(1, dailyStats.length)),
      carbs: Math.round(dailyStats.reduce((sum, d) => sum + d.totalCarbs, 0) / Math.max(1, dailyStats.length)),
      fat: Math.round(dailyStats.reduce((sum, d) => sum + d.totalFat, 0) / Math.max(1, dailyStats.length))
    };
    
    res.json({
      success: true,
      data: {
        daily: chartData,
        averages,
        daysTracked: dailyStats.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get/Create nutrition goal
// @route   GET /api/nutrition/goal
// @access  Private
export const getNutritionGoal = async (req, res, next) => {
  try {
    let goal = await NutritionGoal.findOne({ user: req.user._id });
    
    // Create default if doesn't exist
    if (!goal) {
      goal = await NutritionGoal.create({
        user: req.user._id,
        dailyCalories: 2000
      });
    }
    
    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update nutrition goal
// @route   PUT /api/nutrition/goal
// @access  Private
export const updateNutritionGoal = async (req, res, next) => {
  try {
    const { dailyCalories, macroTargets, waterTarget, goalType, activityLevel } = req.body;
    
    let goal = await NutritionGoal.findOne({ user: req.user._id });
    
    if (goal) {
      Object.assign(goal, { dailyCalories, macroTargets, waterTarget, goalType, activityLevel });
      await goal.save();
    } else {
      goal = await NutritionGoal.create({
        user: req.user._id,
        dailyCalories,
        macroTargets,
        waterTarget,
        goalType,
        activityLevel
      });
    }
    
    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search foods
// @route   GET /api/nutrition/search
// @access  Private
export const searchFoodsAPI = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const results = searchFoods(q);
    
    res.json({
      success: true,
      data: results.slice(0, 20)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all foods
// @route   GET /api/nutrition/foods
// @access  Private
export const getAllFoods = async (req, res, next) => {
  try {
    const { category } = req.query;
    
    let foods = FOODS;
    if (category) {
      foods = FOODS.filter(f => f.category === category);
    }
    
    res.json({
      success: true,
      data: foods
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get meal templates
// @route   GET /api/nutrition/templates
// @access  Private
export const getMealTemplates = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: MEAL_TEMPLATES
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a meal
// @route   DELETE /api/nutrition/meals/:id
// @access  Private
export const deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Meal deleted'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate recommended calories
// @route   POST /api/nutrition/calculate
// @access  Private
export const calculateCalories = async (req, res, next) => {
  try {
    const { weight, height, age, gender, activityLevel, goalType } = req.body;
    
    const recommendedCalories = NutritionGoal.calculateRecommendedCalories(
      weight, height, age, gender, activityLevel, goalType
    );
    
    res.json({
      success: true,
      data: {
        recommendedCalories,
        recommendedMacros: {
          protein: Math.round(recommendedCalories * 0.25 / 4),
          carbs: Math.round(recommendedCalories * 0.50 / 4),
          fat: Math.round(recommendedCalories * 0.25 / 9)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Check and award nutrition badges
async function checkNutritionBadges(userId) {
  try {
    const mealCount = await Meal.countDocuments({ user: userId });
    
    // First meal badge
    if (mealCount === 1) {
      await awardBadgeSimple(userId, 'nutrition_first');
    }
    
    // Check for streak
    const last7Days = await checkConsecutiveDays(userId, 7);
    if (last7Days) {
      await awardBadgeSimple(userId, 'nutrition_7day');
    }
    
    // Check for protein target hits
    const proteinDays = await checkProteinTargetDays(userId);
    if (proteinDays >= 10) {
      await awardBadgeSimple(userId, 'nutrition_protein');
    }
  } catch (error) {
    console.error('Error checking nutrition badges:', error);
  }
}

async function checkConsecutiveDays(userId, days) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days + 1);
  
  const dailyMeals = await Meal.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' }
        }
      }
    }
  ]);
  
  return dailyMeals.length >= days;
}

async function checkProteinTargetDays(userId) {
  const goal = await NutritionGoal.findOne({ user: userId });
  if (!goal) return 0;
  
  const proteinTarget = goal.macroGrams?.protein || 100;
  
  const dailySummary = await Meal.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' }
        },
        totalProtein: { $sum: '$totalProtein' }
      }
    },
    { $match: { totalProtein: { $gte: proteinTarget } } }
  ]);
  
  return dailySummary.length;
}
