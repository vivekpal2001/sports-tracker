import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  generateTrainingPlan,
  getTrainingPlans,
  getTrainingPlan,
  completeWorkout,
  deleteTrainingPlan
} from '../controllers/trainingPlanController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Generate new training plan
router.post('/generate', generateTrainingPlan);

// Get all plans / Get single plan
router.route('/')
  .get(getTrainingPlans);

router.route('/:id')
  .get(getTrainingPlan)
  .delete(deleteTrainingPlan);

// Complete a workout in the plan
router.put('/:id/workout', completeWorkout);

export default router;
