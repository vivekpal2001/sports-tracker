import Workout from '../models/Workout.js';
import User from '../models/User.js';

// @desc    Get leaderboard
// @route   GET /api/leaderboard
// @access  Private
export const getLeaderboard = async (req, res, next) => {
  try {
    const { period = 'week', metric = 'workouts' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      default:
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
    }
    
    // Get current user's following + themselves for personalized leaderboard
    const currentUser = await User.findById(req.user._id);
    const relevantUsers = [req.user._id, ...(currentUser.following || [])];
    
    let aggregation;
    
    if (metric === 'workouts') {
      aggregation = await Workout.aggregate([
        {
          $match: {
            user: { $in: relevantUsers },
            date: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$user',
            count: { $sum: 1 },
            totalDuration: { $sum: '$duration' }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 20
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            _id: 1,
            count: 1,
            totalDuration: 1,
            'user.name': 1,
            'user.avatar': 1
          }
        }
      ]);
    } else if (metric === 'distance') {
      aggregation = await Workout.aggregate([
        {
          $match: {
            user: { $in: relevantUsers },
            date: { $gte: startDate },
            type: 'run'
          }
        },
        {
          $group: {
            _id: '$user',
            totalDistance: { $sum: '$run.distance' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { totalDistance: -1 }
        },
        {
          $limit: 20
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            _id: 1,
            totalDistance: 1,
            count: 1,
            'user.name': 1,
            'user.avatar': 1
          }
        }
      ]);
    } else if (metric === 'duration') {
      aggregation = await Workout.aggregate([
        {
          $match: {
            user: { $in: relevantUsers },
            date: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$user',
            totalDuration: { $sum: '$duration' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { totalDuration: -1 }
        },
        {
          $limit: 20
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            _id: 1,
            totalDuration: 1,
            count: 1,
            'user.name': 1,
            'user.avatar': 1
          }
        }
      ]);
    }
    
    // Add rank and isCurrentUser flag
    const leaderboard = aggregation.map((entry, index) => ({
      rank: index + 1,
      userId: entry._id,
      name: entry.user.name,
      avatar: entry.user.avatar,
      value: metric === 'workouts' ? entry.count : 
             metric === 'distance' ? entry.totalDistance :
             entry.totalDuration,
      count: entry.count,
      isCurrentUser: entry._id.toString() === req.user._id.toString()
    }));
    
    res.json({
      success: true,
      data: {
        period,
        metric,
        leaderboard
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get global leaderboard (all users)
// @route   GET /api/leaderboard/global
// @access  Private
export const getGlobalLeaderboard = async (req, res, next) => {
  try {
    const { period = 'week', metric = 'workouts' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
    }
    
    const aggregation = await Workout.aggregate([
      {
        $match: {
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalDistance: { 
            $sum: { 
              $cond: [{ $eq: ['$type', 'run'] }, '$run.distance', 0] 
            }
          }
        }
      },
      {
        $sort: metric === 'distance' ? { totalDistance: -1 } : 
               metric === 'duration' ? { totalDuration: -1 } : { count: -1 }
      },
      {
        $limit: 50
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $match: {
          'user.isPublic': { $ne: false }
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          count: 1,
          totalDuration: 1,
          totalDistance: 1,
          'user.name': 1,
          'user.avatar': 1
        }
      }
    ]);
    
    const leaderboard = aggregation.map((entry, index) => ({
      rank: index + 1,
      userId: entry._id,
      name: entry.user.name,
      avatar: entry.user.avatar,
      value: metric === 'workouts' ? entry.count : 
             metric === 'distance' ? entry.totalDistance :
             entry.totalDuration,
      count: entry.count,
      isCurrentUser: entry._id.toString() === req.user._id.toString()
    }));
    
    res.json({
      success: true,
      data: {
        period,
        metric,
        leaderboard
      }
    });
  } catch (error) {
    next(error);
  }
};

export default { getLeaderboard, getGlobalLeaderboard };
