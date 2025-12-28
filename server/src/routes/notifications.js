import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// Get all notifications
router.get('/', protect, getNotifications);

// Get unread count
router.get('/count', protect, getUnreadCount);

// Mark all as read
router.put('/read-all', protect, markAllAsRead);

// Mark single as read
router.put('/:id/read', protect, markAsRead);

// Delete notification
router.delete('/:id', protect, deleteNotification);

export default router;
