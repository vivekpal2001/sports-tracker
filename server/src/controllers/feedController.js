import Activity from '../models/Activity.js';
import User from '../models/User.js';
import UserBadge from '../models/UserBadge.js';

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
      .populate('reactions.user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Activity.countDocuments({
      user: { $in: feedUsers },
      isPublic: true
    });
    
    // Get badges for each activity's user
    const userIds = [...new Set(activities.map(a => a.user?._id?.toString()).filter(Boolean))];
    const userBadges = await UserBadge.find({ user: { $in: userIds } })
      .select('user badgeId')
      .lean();
    
    const badgesByUser = {};
    userBadges.forEach(b => {
      if (!badgesByUser[b.user.toString()]) {
        badgesByUser[b.user.toString()] = [];
      }
      badgesByUser[b.user.toString()].push(b.badgeId);
    });
    
    // Add reaction info for current user
    const activitiesWithData = activities.map(a => {
      const json = a.toJSON();
      const userReaction = a.reactions?.find(r => r.user?._id?.toString() === req.user._id.toString());
      
      // Summary of reactions
      const reactionSummary = {};
      a.reactions?.forEach(r => {
        reactionSummary[r.type] = (reactionSummary[r.type] || 0) + 1;
      });
      
      return {
        ...json,
        userReaction: userReaction?.type || null,
        reactions: reactionSummary,
        reactionCount: a.reactions?.length || 0,
        isLiked: !!userReaction,
        userBadges: badgesByUser[a.user?._id?.toString()]?.slice(0, 3) || []
      };
    });
    
    res.json({
      success: true,
      data: activitiesWithData,
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

// @desc    React to an activity (supports multiple reaction types)
// @route   POST /api/feed/:id/react
// @access  Private
export const reactToActivity = async (req, res, next) => {
  try {
    const { reactionType = '❤️' } = req.body;
    const validReactions = ['💪', '🔥', '⚡', '🎯', '❤️'];
    
    if (!validReactions.includes(reactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reaction type'
      });
    }
    
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    // Check if user already reacted
    const existingReactionIndex = activity.reactions?.findIndex(
      r => r.user.toString() === req.user._id.toString()
    );
    
    if (existingReactionIndex > -1) {
      const existingReaction = activity.reactions[existingReactionIndex];
      
      if (existingReaction.type === reactionType) {
        // Same reaction - remove it (toggle off)
        activity.reactions.splice(existingReactionIndex, 1);
        await activity.save();
        
        return res.json({
          success: true,
          reacted: false,
          reactionType: null,
          reactionCount: activity.reactions.length,
          reactions: getReactionSummary(activity.reactions)
        });
      } else {
        // Different reaction - update it
        activity.reactions[existingReactionIndex].type = reactionType;
        await activity.save();
        
        return res.json({
          success: true,
          reacted: true,
          reactionType,
          reactionCount: activity.reactions.length,
          reactions: getReactionSummary(activity.reactions)
        });
      }
    }
    
    // Add new reaction
    activity.reactions.push({
      user: req.user._id,
      type: reactionType
    });
    await activity.save();
    
    // Create notification if not own post
    if (activity.user.toString() !== req.user._id.toString()) {
      await createNotification(
        activity.user,
        req.user._id,
        'reaction',
        activity._id,
        reactionType
      );
    }
    
    res.json({
      success: true,
      reacted: true,
      reactionType,
      reactionCount: activity.reactions.length,
      reactions: getReactionSummary(activity.reactions)
    });
  } catch (error) {
    next(error);
  }
};

// Helper to get reaction summary
const getReactionSummary = (reactions) => {
  const summary = {};
  reactions?.forEach(r => {
    summary[r.type] = (summary[r.type] || 0) + 1;
  });
  return summary;
};

// Helper to create notifications
const createNotification = async (recipientId, senderId, type, activityId, reactionType) => {
  // Avoid circular import by requiring inline
  const Notification = (await import('../models/Notification.js')).default;
  
  try {
    await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      activity: activityId,
      reactionType
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// @desc    Like an activity (backward compatibility)
// @route   POST /api/feed/:id/like
// @access  Private
export const likeActivity = async (req, res, next) => {
  // Redirect to react with ❤️
  req.body.reactionType = '❤️';
  return reactToActivity(req, res, next);
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
    
    // Create notification for comment if not own post
    if (activity.user.toString() !== req.user._id.toString()) {
      await createNotification(
        activity.user,
        req.user._id,
        'comment',
        activity._id,
        null
      );
    }
    
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

// @desc    Create a post
// @route   POST /api/feed/post
// @access  Private
export const createPost = async (req, res, next) => {
  try {
    const { content, postType, images } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      });
    }
    
    // Create title based on post type
    let title;
    switch (postType) {
      case 'motivation':
        title = '💪 Motivation';
        break;
      case 'progress':
        title = '📈 Progress Update';
        break;
      case 'photo':
        title = '📸 Photo';
        break;
      default:
        title = '💭 Update';
    }
    
    const activity = await Activity.create({
      user: req.user._id,
      type: 'post',
      postType: postType || 'text',
      title,
      content: content.trim(),
      images: images || [],
      isPublic: true
    });
    
    await activity.populate('user', 'name avatar');
    
    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post
// @route   DELETE /api/feed/:id
// @access  Private
export const deletePost = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Only post owner can delete
    if (activity.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }
    
    await activity.deleteOne();
    
    res.json({
      success: true,
      message: 'Post deleted'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getFeed,
  getUserActivities,
  likeActivity,
  commentOnActivity,
  deleteComment,
  createActivity,
  createPost,
  deletePost
};

