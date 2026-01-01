import Workout from '../models/Workout.js';
import { parseGPX, parseCSV } from '../utils/fileParser.js';
import { checkAndUpdatePRs } from './prController.js';
import { updateGoalProgress } from './goalController.js';
import { checkAndAwardBadges } from '../services/badgeService.js';
import { calculateRecoveryScore } from '../services/recoveryService.js';
import { createActivity } from './feedController.js';
import { syncUserChallenges } from './challengeController.js';

// @desc    Get all workouts for user
// @route   GET /api/workouts
// @access  Private
export const getWorkouts = async (req, res, next) => {
  try {
    const { type, startDate, endDate, limit = 50, page = 1 } = req.query;
    
    const query = { user: req.user._id };
    
    if (type) {
      query.type = type;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const skip = (page - 1) * limit;
    
    const [workouts, total] = await Promise.all([
      Workout.find(query)
        .sort({ date: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      Workout.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: workouts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
export const getWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }
    
    res.json({
      success: true,
      data: workout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create workout
// @route   POST /api/workouts
// @access  Private
export const createWorkout = async (req, res, next) => {
  try {
    const workoutData = {
      ...req.body,
      user: req.user._id
    };
    
    const workout = await Workout.create(workoutData);
    
    // Check and update personal records
    const newPRs = await checkAndUpdatePRs(req.user._id, workout);
    
    // Update goal progress
    const updatedGoals = await updateGoalProgress(req.user._id, workout);
    
    // Check and award badges
    const newBadges = await checkAndAwardBadges(req.user._id, workout);
    
    // Create activity for social feed
    const workoutTypeLabels = {
      run: '🏃 Run',
      lift: '🏋️ Strength Training',
      cardio: '❤️ Cardio',
      yoga: '🧘 Yoga',
      biometrics: '📊 Biometrics'
    };
    
    await createActivity(req.user._id, 'workout', {
      workout: workout._id,
      title: `Completed a ${workoutTypeLabels[workout.type] || workout.type}`,
      description: workout.notes || `${workout.duration} minute workout`,
      metadata: {
        duration: workout.duration,
        distance: workout.run?.distance || workout.cardio?.distance,
        type: workout.type
      }
    });
    
    // Sync challenge progress
    await syncUserChallenges(req.user._id, workout);
    
    res.status(201).json({
      success: true,
      data: workout,
      newPRs: newPRs.length > 0 ? newPRs : undefined,
      updatedGoals: updatedGoals.length > 0 ? updatedGoals : undefined,
      newBadges: newBadges.length > 0 ? newBadges : undefined
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
export const updateWorkout = async (req, res, next) => {
  try {
    let workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }
    
    workout = await Workout.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: workout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
export const deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }
    
    await Workout.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Workout deleted'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload GPX/CSV file
// @route   POST /api/workouts/upload
// @access  Private
export const uploadWorkoutFile = async (req, res, next) => {
  try {
    console.log('📤 Upload request received');
    
    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const { originalname, filename, path: filepath } = req.file;
    const ext = originalname.split('.').pop().toLowerCase();
    
    console.log('📄 Processing file:', originalname, 'at', filepath);
    
    let parsedData;
    
    if (ext === 'gpx') {
      parsedData = await parseGPX(filepath);
    } else if (ext === 'csv') {
      parsedData = await parseCSV(filepath);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only GPX and CSV files are supported'
      });
    }
    
    console.log('📊 Parsed data:', JSON.stringify(parsedData, null, 2));
    
    // Create workouts from parsed data (now supports multiple)
    const workoutsToCreate = parsedData.workouts.map((w, idx) => ({
      user: req.user._id,
      type: 'run',
      title: w.title || `Imported ${ext.toUpperCase()} workout ${idx + 1}`,
      date: w.date || new Date(),
      duration: w.duration || undefined,
      run: {
        distance: w.distance || undefined,
        pace: w.pace || undefined,
        avgHeartRate: w.avgHeartRate || undefined,
        elevation: w.elevation || undefined
      },
      uploadedFile: {
        filename,
        originalName: originalname,
        type: ext,
        path: filepath
      }
    }));
    
    console.log('💾 Creating', workoutsToCreate.length, 'workouts');
    
    const createdWorkouts = await Workout.insertMany(workoutsToCreate);
    
    console.log('✅ Created', createdWorkouts.length, 'workouts successfully');
    
    res.status(201).json({
      success: true,
      message: `Successfully imported ${createdWorkouts.length} workout(s)`,
      data: createdWorkouts,
      count: createdWorkouts.length
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    next(error);
  }
};

// @desc    Get workout statistics
// @route   GET /api/workouts/stats
// @access  Private
export const getWorkoutStats = async (req, res, next) => {
  try {
    const { period = 'week' } = req.query;
    
    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    const stats = await Workout.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          avgDuration: { $avg: '$duration' },
          avgRpe: { $avg: '$rpe' }
        }
      },
      {
        $project: {
          _id: 1,
          type: '$_id',  // Add type field for frontend compatibility
          count: 1,
          totalDuration: 1,
          avgDuration: 1,
          avgRpe: 1
        }
      }
    ]);
    
    // Get total distance for runs
    const runStats = await Workout.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'run',
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$run.distance' },
          avgPace: { $avg: '$run.pace' },
          totalElevation: { $sum: '$run.elevation' }
        }
      }
    ]);
    
    // Get total distance for cardio (cycling, swimming, etc.)
    const cardioStats = await Workout.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'cardio',
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$cardio.distance' },
          totalCalories: { $sum: '$cardio.calories' }
        }
      }
    ]);
    
    // Calculate streak
    const recentWorkouts = await Workout.find({
      user: req.user._id,
      type: { $ne: 'biometrics' }
    })
      .sort({ date: -1 })
      .limit(30)
      .select('date');
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const workout of recentWorkouts) {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        streak++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }
    
    // Calculate total distance (running + cardio)
    const runDistance = runStats[0]?.totalDistance || 0;
    const cardioDistance = cardioStats[0]?.totalDistance || 0;
    const totalDistance = runDistance + cardioDistance;
    
    res.json({
      success: true,
      data: {
        byType: stats,
        running: runStats[0] || {},
        cardio: cardioStats[0] || {},
        totalDistance,  // Combined distance for all activities
        streak,
        period
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chart data for dashboard and analytics
// @route   GET /api/workouts/chart-data
// @access  Private
export const getChartData = async (req, res, next) => {
  try {
    const { period = 'week', year, month } = req.query;
    
    // User's timezone offset - IST is +05:30 = 330 minutes
    // We'll use this to adjust date extraction in MongoDB
    const timezoneOffset = '+05:30';
    
    const now = new Date();
    let startDate, endDate;
    
    // Determine date range based on period
    if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      endDate = now;
    } else if (period === 'month') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      endDate = now;
    } else if (period === 'year') {
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
      endDate = now;
    } else if (period === 'all') {
      startDate = new Date('2000-01-01');
      endDate = now;
    } else if (period === 'custom' && year && month) {
      // For heatmap calendar view - use UTC dates to avoid timezone issues
      startDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
      endDate = new Date(Date.UTC(parseInt(year), parseInt(month), 0, 23, 59, 59)); // Last day of month
    }
    
    // Get daily aggregated data with timezone-aware date extraction
    const dailyData = await Workout.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate },
          type: { $ne: 'biometrics' }
        }
      },
      {
        $group: {
          _id: {
            // Use timezone-aware date extraction for IST (+05:30)
            year: { $year: { date: '$date', timezone: timezoneOffset } },
            month: { $month: { date: '$date', timezone: timezoneOffset } },
            day: { $dayOfMonth: { date: '$date', timezone: timezoneOffset } }
          },
          totalDuration: { $sum: '$duration' },
          workoutCount: { $sum: 1 },
          totalDistance: { 
            $sum: { 
              $cond: [
                { $eq: ['$type', 'run'] },
                '$run.distance',
                { $cond: [{ $eq: ['$type', 'cardio'] }, '$cardio.distance', 0] }
              ]
            }
          },
          avgRpe: { $avg: '$rpe' },
          types: { $push: '$type' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Format for frontend charts - use the extracted day directly
    const chartData = dailyData.map(d => ({
      date: `${d._id.year}-${String(d._id.month).padStart(2, '0')}-${String(d._id.day).padStart(2, '0')}`,
      duration: d.totalDuration || 0,
      workouts: d.workoutCount,
      distance: d.totalDistance || 0,
      rpe: d.avgRpe || 0,
      types: d.types
    }));
    
    // Get type distribution
    const typeDistribution = await Workout.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' }
        }
      }
    ]);
    
    // Heatmap data - get all days with activity for the given range
    const heatmapData = chartData.map(d => ({
      date: d.date,
      intensity: Math.min(4, d.workouts), // 0-4 scale for heatmap
      duration: d.duration,
      workouts: d.workouts
    }));
    
    res.json({
      success: true,
      data: {
        daily: chartData,
        typeDistribution,
        heatmap: heatmapData,
        period,
        startDate,
        endDate
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recovery score
// @route   GET /api/workouts/recovery
// @access  Private
export const getRecoveryScore = async (req, res, next) => {
  try {
    const recoveryData = await calculateRecoveryScore(req.user._id);
    
    res.json({
      success: true,
      data: recoveryData
    });
  } catch (error) {
    next(error);
  }
};
