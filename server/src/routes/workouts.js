import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/auth.js';
import {
  getWorkouts,
  getWorkout,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  uploadWorkoutFile,
  getWorkoutStats,
  getChartData
} from '../controllers/workoutController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.gpx', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only GPX and CSV files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// All routes are protected
router.use(protect);

// Stats route (must be before :id route)
router.get('/stats', getWorkoutStats);

// Chart data for dashboard and analytics
router.get('/chart-data', getChartData);

// File upload route
router.post('/upload', upload.single('file'), uploadWorkoutFile);

// CRUD routes
router.route('/')
  .get(getWorkouts)
  .post(createWorkout);

router.route('/:id')
  .get(getWorkout)
  .put(updateWorkout)
  .delete(deleteWorkout);

export default router;
