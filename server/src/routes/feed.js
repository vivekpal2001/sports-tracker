import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getFeed,
  getUserActivities,
  likeActivity,
  reactToActivity,
  commentOnActivity,
  deleteComment,
  createPost,
  deletePost
} from '../controllers/feedController.js';

const router = express.Router();

// Get main feed
router.get('/', protect, getFeed);

// Create a post
router.post('/post', protect, createPost);

// Get user's activities
router.get('/user/:id', protect, getUserActivities);

// Delete a post
router.delete('/:id', protect, deletePost);

// React to an activity (new reactions system)
router.post('/:id/react', protect, reactToActivity);

// Like/unlike an activity (backward compat)
router.post('/:id/like', protect, likeActivity);

// Comments
router.post('/:id/comment', protect, commentOnActivity);
router.delete('/:id/comment/:commentId', protect, deleteComment);

export default router;


