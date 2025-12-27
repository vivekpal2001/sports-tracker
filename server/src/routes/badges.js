import express from 'express';
import { protect } from '../middleware/auth.js';
import { getBadges, getBadgeDefinitions, syncBadges } from '../controllers/badgeController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all badges (earned + locked)
router.get('/', getBadges);

// Get badge definitions
router.get('/definitions', getBadgeDefinitions);

// Sync/retroactively award badges
router.post('/sync', syncBadges);

export default router;
