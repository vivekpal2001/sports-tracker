import Activity from '../models/Activity.js';
import User from '../models/User.js';

// @desc    Get activity feed (from followed users + own activities)
// @route   GET /api/feed
// @access  Private
export const getFeed = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    // Get users the current user follows + themselves
    const user = await User.findById(req.user._id);
    const followedUsers = user.following || [];
    const feedUsers = [...followedUsers, req.user._id];
    
    const activities = await Activity.find({
      user: { $in: feedUsers },
      isPublic: true
    })
      .populate('user', 'name avatar')
      .populate('workout', 'type date duration run.distance')
      .populate('targetUser', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Activity.countDocuments({
      user: { $in: feedUsers },
      isPublic: true
    });
    
    // Add isLiked flag for current user
    const activitiesWithLiked = activities.map(a => ({
      ...a.toJSON(),
      isLiked: a.likes?.some(l => l.toString() === req.user._id.toString())
    }));
    
    res.json({
      success: true,
      data: activitiesWithLiked,
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

// @desc    Get user's activities (for profile)
// @route   GET /api/feed/user/:id
// @access  Private
export const getUserActivities = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check visibility
    const isOwner = req.user._id.toString() === targetUser._id.toString();
    const isFollowing = targetUser.followers?.some(f => f.toString() === req.user._id.toString());
    
    if (!targetUser.isPublic && !isOwner && !isFollowing) {
      return res.json({
        success: true,
        data: [],
        message: 'This profile is private'
      });
    }
    
    const activities = await Activity.find({ user: req.params.id, isPublic: true })
      .populate('user', 'name avatar')
      .populate('workout', 'type date duration run.distance')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: activities.map(a => ({
        ...a.toJSON(),
        isLiked: a.likes?.some(l => l.toString() === req.user._id.toString())
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like an activity
// @route   POST /api/feed/:id/like
// @access  Private
export const likeActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    const alreadyLiked = activity.likes?.some(l => l.toString() === req.user._id.toString());
    
    if (alreadyLiked) {
      // Unlike
      await Activity.findByIdAndUpdate(req.params.id, {
        $pull: { likes: req.user._id }
      });
      
      res.json({
        success: true,
        liked: false,
        likeCount: activity.likes.length - 1
      });
    } else {
      // Like
      await Activity.findByIdAndUpdate(req.params.id, {
        $addToSet: { likes: req.user._id }
      });
      
      res.json({
        success: true,
        liked: true,
        likeCount: activity.likes.length + 1
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Comment on an activity
// @route   POST /api/feed/:id/comment
// @access  Private
export const commentOnActivity = async (req, res, next) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }
    
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    const comment = {
      user: req.user._id,
      text: text.trim()
    };
    
    activity.comments.push(comment);
    await activity.save();
    
    // Populate the new comment's user info
    await activity.populate('comments.user', 'name avatar');
    
    res.json({
      success: true,
      data: activity.comments[activity.comments.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/feed/:id/comment/:commentId
// @access  Private
export const deleteComment = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    const comment = activity.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Only comment author or activity owner can delete
    if (comment.user.toString() !== req.user._id.toString() && 
        activity.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }
    
    comment.deleteOne();
    await activity.save();
    
    res.json({
      success: true,
      message: 'Comment deleted'
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Create an activity (called from other controllers)
export const createActivity = async (userId, type, data) => {
  try {
    const activity = await Activity.create({
      user: userId,
      type,
      ...data
    });
    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    return null;
  }
};

export default {
  getFeed,
  getUserActivities,
  likeActivity,
  commentOnActivity,
  deleteComment,
  createActivity
};
