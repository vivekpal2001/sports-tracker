import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getFeed,
  getUserActivities,
  likeActivity,
  commentOnActivity,
  deleteComment
} from '../controllers/feedController.js';

const router = express.Router();

// Get main feed
router.get('/', protect, getFeed);

// Get user's activities
router.get('/user/:id', protect, getUserActivities);

// Like/unlike an activity
router.post('/:id/like', protect, likeActivity);

// Comments
router.post('/:id/comment', protect, commentOnActivity);
router.delete('/:id/comment/:commentId', protect, deleteComment);

export default router;
