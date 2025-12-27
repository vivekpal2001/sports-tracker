import express from 'express';
import { protect } from '../middleware/auth.js';
import { getBadges, getBadgeDefinitions } from '../controllers/badgeController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all badges (earned + locked)
router.get('/', getBadges);

// Get badge definitions
router.get('/definitions', getBadgeDefinitions);

export default router;
