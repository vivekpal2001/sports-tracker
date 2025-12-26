import Workout from '../models/Workout.js';
import { parseGPX, parseCSV } from '../utils/fileParser.js';

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
    
    res.status(201).json({
      success: true,
      data: workout
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
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const { originalname, filename, path: filepath } = req.file;
    const ext = originalname.split('.').pop().toLowerCase();
    
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
    
    // Create workout from parsed data
    const workoutData = {
      user: req.user._id,
      type: 'run',
      title: parsedData.title || `Imported ${ext.toUpperCase()} workout`,
      date: parsedData.date || new Date(),
      duration: parsedData.duration,
      run: {
        distance: parsedData.distance,
        pace: parsedData.pace,
        avgHeartRate: parsedData.avgHeartRate,
        elevation: parsedData.elevation
      },
      uploadedFile: {
        filename,
        originalName: originalname,
        type: ext,
        path: filepath
      }
    };
    
    const workout = await Workout.create(workoutData);
    
    res.status(201).json({
      success: true,
      data: workout,
      parsedData
    });
  } catch (error) {
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
    
    res.json({
      success: true,
      data: {
        byType: stats,
        running: runStats[0] || {},
        streak,
        period
      }
    });
  } catch (error) {
    next(error);
  }
};
