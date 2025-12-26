import Workout from '../models/Workout.js';
import { generateTrainingPlanPDF } from '../services/pdfService.js';
import { analyzePerformance } from '../services/aiService.js';

// @desc    Generate weekly training plan PDF
// @route   GET /api/export/training-plan
// @access  Private
export const exportTrainingPlan = async (req, res, next) => {
  try {
    // Get weekly data
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const workouts = await Workout.find({
      user: req.user._id,
      date: { $gte: oneWeekAgo }
    }).sort({ date: -1 });
    
    // Calculate stats
    const stats = {
      totalWorkouts: workouts.filter(w => w.type !== 'biometrics').length,
      totalDuration: workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      avgRpe: calculateAvg(workouts.map(w => w.rpe).filter(Boolean)),
      runningStats: {
        distance: workouts
          .filter(w => w.type === 'run')
          .reduce((sum, w) => sum + (w.run?.distance || 0), 0)
      }
    };
    
    const weeklyData = { stats, workouts };
    
    // Get AI insights (from last 30 days for better analysis)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const allWorkouts = await Workout.find({
      user: req.user._id,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });
    
    const aiInsights = await analyzePerformance(req.user._id, allWorkouts);
    
    // Generate PDF
    const pdfBuffer = await generateTrainingPlanPDF(req.user, weeklyData, aiInsights);
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=training-plan-${new Date().toISOString().split('T')[0]}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.byteLength);
    
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    next(error);
  }
};

function calculateAvg(nums) {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length * 10) / 10;
}
