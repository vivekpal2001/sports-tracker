import Workout from '../models/Workout.js';
import { analyzePerformance, generateChatResponse } from '../services/aiService.js';

// @desc    Get AI performance analysis
// @route   GET /api/ai/analyze
// @access  Private
export const getAnalysis = async (req, res, next) => {
  try {
    // Get user's workouts from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const workouts = await Workout.find({
      user: req.user._id,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });
    
    if (workouts.length === 0) {
      return res.json({
        success: true,
        data: {
          performanceScore: 0,
          message: "Log some workouts to get AI-powered insights!",
          recommendations: [{
            priority: "high",
            category: "training",
            title: "Start Logging Workouts",
            description: "Begin by logging your first workout to start receiving personalized insights."
          }]
        }
      });
    }
    
    const analysis = await analyzePerformance(req.user._id, workouts);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Chat with AI coach
// @route   POST /api/ai/chat
// @access  Private
export const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    // Get recent workout context
    const recentWorkouts = await Workout.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(10)
      .lean();
    
    const workoutContext = recentWorkouts.map(w => ({
      type: w.type,
      title: w.title,
      date: w.date,
      duration: w.duration,
      rpe: w.rpe,
      ...(w.type === 'run' && { distance: w.run?.distance, pace: w.run?.pace }),
      ...(w.type === 'biometrics' && { 
        sleep: w.biometrics?.sleepHours, 
        mood: w.biometrics?.mood 
      })
    }));
    
    const response = await generateChatResponse(req.user._id, message, workoutContext);
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly summary
// @route   GET /api/ai/weekly-summary
// @access  Private
export const getWeeklySummary = async (req, res, next) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const workouts = await Workout.find({
      user: req.user._id,
      date: { $gte: oneWeekAgo }
    }).sort({ date: -1 });
    
    // Calculate weekly stats
    const stats = {
      totalWorkouts: workouts.filter(w => w.type !== 'biometrics').length,
      totalDuration: workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      byType: {},
      avgRpe: 0,
      runningStats: { distance: 0, avgPace: 0 },
      liftingStats: { sessions: 0, totalVolume: 0 }
    };
    
    let rpeSum = 0;
    let rpeCount = 0;
    let paceSum = 0;
    let paceCount = 0;
    
    workouts.forEach(w => {
      // Count by type
      stats.byType[w.type] = (stats.byType[w.type] || 0) + 1;
      
      // RPE
      if (w.rpe) {
        rpeSum += w.rpe;
        rpeCount++;
      }
      
      // Running
      if (w.type === 'run' && w.run) {
        stats.runningStats.distance += w.run.distance || 0;
        if (w.run.pace) {
          paceSum += w.run.pace;
          paceCount++;
        }
      }
      
      // Lifting
      if (w.type === 'lift' && w.lift) {
        stats.liftingStats.sessions++;
        stats.liftingStats.totalVolume += w.lift.totalVolume || 0;
      }
    });
    
    stats.avgRpe = rpeCount > 0 ? Math.round(rpeSum / rpeCount * 10) / 10 : 0;
    stats.runningStats.avgPace = paceCount > 0 
      ? Math.round(paceSum / paceCount * 100) / 100 
      : 0;
    
    res.json({
      success: true,
      data: {
        period: {
          start: oneWeekAgo,
          end: new Date()
        },
        stats,
        workouts: workouts.map(w => ({
          id: w._id,
          type: w.type,
          title: w.title,
          date: w.date,
          duration: w.duration,
          rpe: w.rpe
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};
