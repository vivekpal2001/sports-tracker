import express from 'express';
import { protect, optionalAuth } from '../middleware/auth.js';
import {
  getMyProfile,
  getPublicProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers
} from '../controllers/userController.js';

const router = express.Router();

// Search users (must be before :id routes)
router.get('/search', protect, searchUsers);

// Current user profile
router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateProfile);

// Public profile (optional auth for personalized response)
router.get('/:id', optionalAuth, getPublicProfile);

// Follow/unfollow
router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);

// Followers/following lists
router.get('/:id/followers', protect, getFollowers);
router.get('/:id/following', protect, getFollowing);

export default router;
