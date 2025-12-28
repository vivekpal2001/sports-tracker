import User from '../models/User.js';
import Workout from '../models/Workout.js';
import UserBadge from '../models/UserBadge.js';
import Goal from '../models/Goal.js';

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password');
    
    // Get stats
    const workoutCount = await Workout.countDocuments({ user: req.user._id });
    const badgeCount = await UserBadge.countDocuments({ user: req.user._id });
    const activeGoals = await Goal.countDocuments({ user: req.user._id, status: 'active' });
    
    res.json({
      success: true,
      data: {
        ...user.toJSON(),
        stats: {
          workouts: workoutCount,
          badges: badgeCount,
          activeGoals,
          followers: user.followers?.length || 0,
          following: user.following?.length || 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public profile by ID
// @route   GET /api/users/:id
// @access  Public
export const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name avatar bio profile.sport profile.fitnessLevel isPublic followers following createdAt');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if profile is public or if requester is following
    const isOwner = req.user?._id.toString() === user._id.toString();
    const isFollowing = req.user && user.followers?.some(f => f.toString() === req.user._id.toString());
    
    if (!user.isPublic && !isOwner && !isFollowing) {
      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
          isPublic: false,
          followersCount: user.followers?.length || 0,
          followingCount: user.following?.length || 0
        }
      });
    }
    
    // Get public stats
    const workoutCount = await Workout.countDocuments({ user: user._id });
    const badgeCount = await UserBadge.countDocuments({ user: user._id });
    
    // Get recent workouts (last 5)
    const recentWorkouts = await Workout.find({ user: user._id })
      .sort({ date: -1 })
      .limit(5)
      .select('type date duration run.distance cardio.distance');
    
    // Get earned badges
    const badges = await UserBadge.find({ user: user._id })
      .sort({ earnedAt: -1 })
      .limit(6);
    
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        sport: user.profile?.sport,
        fitnessLevel: user.profile?.fitnessLevel,
        isPublic: user.isPublic,
        joinedAt: user.createdAt,
        stats: {
          workouts: workoutCount,
          badges: badgeCount,
          followers: user.followers?.length || 0,
          following: user.following?.length || 0
        },
        recentWorkouts,
        badges: badges.map(b => b.badgeId),
        isFollowing: isFollowing || false,
        isOwner
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/users/me
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar, profile, preferences, isPublic } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar) updateData.avatar = avatar;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (profile) updateData.profile = { ...req.user.profile, ...profile };
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
export const followUser = async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (userToFollow._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }
    
    // Check if already following
    if (req.user.following?.includes(userToFollow._id)) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user'
      });
    }
    
    // Add to following/followers
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { following: userToFollow._id }
    });
    
    await User.findByIdAndUpdate(userToFollow._id, {
      $addToSet: { followers: req.user._id }
    });
    
    // Create follow notification
    try {
      const Notification = (await import('../models/Notification.js')).default;
      await Notification.create({
        recipient: userToFollow._id,
        sender: req.user._id,
        type: 'follow'
      });
    } catch (notifError) {
      console.error('Error creating follow notification:', notifError);
    }
    
    res.json({
      success: true,
      message: `Now following ${userToFollow.name}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/follow
// @access  Private
export const unfollowUser = async (req, res, next) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    
    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove from following/followers
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: userToUnfollow._id }
    });
    
    await User.findByIdAndUpdate(userToUnfollow._id, {
      $pull: { followers: req.user._id }
    });
    
    res.json({
      success: true,
      message: `Unfollowed ${userToUnfollow.name}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get followers
// @route   GET /api/users/:id/followers
// @access  Private
export const getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name avatar bio');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user.followers || []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get following
// @route   GET /api/users/:id/following
// @access  Private
export const getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'name avatar bio');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user.following || []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
      .select('name avatar bio')
      .limit(10);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMyProfile,
  getPublicProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers
};
