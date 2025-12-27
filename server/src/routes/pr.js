import express from 'express';
import { protect } from '../middleware/auth.js';
import { getPersonalRecords, getPRHistory } from '../controllers/prController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all PRs
router.get('/', getPersonalRecords);

// Get PR history for specific type
router.get('/history/:type', getPRHistory);

export default router;
