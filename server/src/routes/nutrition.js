import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  logMeal,
  getMealsForDate,
  getDailySummary,
  getWeeklyStats,
  getNutritionGoal,
  updateNutritionGoal,
  searchFoodsAPI,
  getAllFoods,
  getMealTemplates,
  deleteMeal,
  calculateCalories
} from '../controllers/nutritionController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Meals
router.post('/meals', logMeal);
router.get('/meals/:date', getMealsForDate);
router.delete('/meals/:id', deleteMeal);

// Summaries & Stats
router.get('/summary/:date', getDailySummary);
router.get('/stats', getWeeklyStats);

// Goals
router.get('/goal', getNutritionGoal);
router.put('/goal', updateNutritionGoal);
router.post('/calculate', calculateCalories);

// Foods & Templates
router.get('/search', searchFoodsAPI);
router.get('/foods', getAllFoods);
router.get('/templates', getMealTemplates);

export default router;
