import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createChallenge,
  getMyChallenges,
  discoverChallenges,
  getChallengeById,
  joinChallenge,
  getChallengeLeaderboard,
  inviteToChallenge,
  syncChallengeProgress,
  updateChallenge,
  deleteChallenge
} from '../controllers/challengeController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Challenge CRUD
router.post('/', createChallenge);
router.get('/', getMyChallenges);
router.get('/discover', discoverChallenges);
router.get('/:id', getChallengeById);
router.put('/:id', updateChallenge);
router.delete('/:id', deleteChallenge);

// Participation
router.post('/:id/join', joinChallenge);
router.post('/:id/invite', inviteToChallenge);

// Progress & Leaderboard
router.get('/:id/leaderboard', getChallengeLeaderboard);
router.post('/:id/sync', syncChallengeProgress);

export default router;
