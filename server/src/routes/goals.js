import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  getGoals, 
  createGoal, 
  updateGoal, 
  deleteGoal 
} from '../controllers/goalController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Goals CRUD
router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;
