import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.js';
import workoutRoutes from './routes/workouts.js';
import aiRoutes from './routes/ai.js';
import exportRoutes from './routes/export.js';
import prRoutes from './routes/pr.js';
import goalRoutes from './routes/goals.js';
import badgeRoutes from './routes/badges.js';
import trainingPlanRoutes from './routes/trainingPlan.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Sports Performance Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/pr', prRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/training-plans', trainingPlanRoutes);

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  🏃 Sports Performance Tracker API
  ══════════════════════════════════
  🚀 Server running on port ${PORT}
  📊 API: http://localhost:${PORT}/api
  🔑 Health: http://localhost:${PORT}/api/health
  ══════════════════════════════════
  `);
});

export default app;
