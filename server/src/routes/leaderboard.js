import express from 'express';
import { protect } from '../middleware/auth.js';
import { getLeaderboard, getGlobalLeaderboard } from '../controllers/leaderboardController.js';

const router = express.Router();

// Friends leaderboard
router.get('/', protect, getLeaderboard);

// Global leaderboard
router.get('/global', protect, getGlobalLeaderboard);

export default router;
