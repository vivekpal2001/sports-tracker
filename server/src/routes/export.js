import express from 'express';
import { protect } from '../middleware/auth.js';
import { exportTrainingPlan } from '../controllers/exportController.js';

const router = express.Router();

router.use(protect);

router.get('/training-plan', exportTrainingPlan);

export default router;
