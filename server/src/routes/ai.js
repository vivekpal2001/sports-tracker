import express from 'express';
import { protect } from '../middleware/auth.js';
import { getAnalysis, chat, getWeeklySummary } from '../controllers/aiController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/analyze', getAnalysis);
router.post('/chat', chat);
router.get('/weekly-summary', getWeeklySummary);

export default router;
