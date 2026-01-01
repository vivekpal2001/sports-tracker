import Challenge from '../models/Challenge.js';
import Workout from '../models/Workout.js';
import Notification from '../models/Notification.js';
import { awardBadgeSimple, BADGES } from '../services/badgeService.js';

// @desc    Create a new challenge
// @route   POST /api/challenges
// @access  Private
export const createChallenge = async (req, res, next) => {
  try {
    const { title, description, type, target, unit, startDate, endDate, visibility, category } = req.body;
    
    const challenge = await Challenge.create({
      creator: req.user._id,
      title,
      description,
      type,
      target,
      unit,
      startDate,
      endDate,
      visibility,
      category,
      participants: [{
        user: req.user._id,
        progress: 0,
        joinedAt: new Date()
      }]
    });
    
    // Check for challenge creator badge
    const creatorChallenges = await Challenge.countDocuments({ creator: req.user._id });
    if (creatorChallenges >= 5) {
      await awardBadgeSimple(req.user._id, 'challenge_creator');
    }
    
    await challenge.populate('creator', 'name avatar');
    
    res.status(201).json({
      success: true,
      data: challenge
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's challenges (participating in)
// @route   GET /api/challenges
// @access  Private
export const getMyChallenges = async (req, res, next) => {
  try {
    const { status, limit = 20 } = req.query;
    
    // Update challenge statuses first
    await Challenge.updateChallengeStatuses();
    
    const query = {
      'participants.user': req.user._id
    };
    
    if (status) {
      query.status = status;
    }
    
    const challenges = await Challenge.find(query)
      .populate('creator', 'name avatar')
      .populate('participants.user', 'name avatar')
      .sort({ startDate: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: challenges, 
      count: challenges.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Discover public challenges
// @route   GET /api/challenges/discover
// @access  Private
export const discoverChallenges = async (req, res, next) => {
  try {
    const { category, limit = 20 } = req.query;
    
    // Update statuses
    await Challenge.updateChallengeStatuses();
    
    const query = {
      visibility: 'public',
      status: { $in: ['upcoming', 'active'] },
      'participants.user': { $ne: req.user._id } // Not already participating
    };
    
    if (category) {
      query.category = category;
    }
    
    const challenges = await Challenge.find(query)
      .populate('creator', 'name avatar')
      .sort({ startDate: 1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: challenges,
      count: challenges.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get challenge by ID
// @route   GET /api/challenges/:id
// @access  Private
export const getChallengeById = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('creator', 'name avatar')
      .populate('participants.user', 'name avatar');
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }
    
    // Check if user can view private challenge
    if (challenge.visibility === 'private' && 
        !challenge.isParticipant(req.user._id) &&
        challenge.creator._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this challenge'
      });
    }
    
    // Add leaderboard
    const leaderboard = challenge.getLeaderboard();
    
    res.json({
      success: true,
      data: {
        ...challenge.toJSON(),
        leaderboard
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join a challenge
// @route   POST /api/challenges/:id/join
// @access  Private
export const joinChallenge = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }
    
    // Check if already participating
    if (challenge.isParticipant(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already participating in this challenge'
      });
    }
    
    // Check visibility
    if (challenge.visibility === 'private') {
      return res.status(403).json({
        success: false,
        message: 'This is a private challenge'
      });
    }
    
    if (challenge.visibility === 'invite-only') {
      if (!inviteCode || inviteCode !== challenge.inviteCode) {
        return res.status(403).json({
          success: false,
          message: 'Invalid invite code'
        });
      }
    }
    
    // Check if challenge is still joinable
    if (challenge.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This challenge has already ended'
      });
    }
    
    // Add participant
    challenge.participants.push({
      user: req.user._id,
      progress: 0,
      joinedAt: new Date()
    });
    
    await challenge.save();
    
    // Notify creator
    await Notification.create({
      user: challenge.creator,
      type: 'challenge_join',
      fromUser: req.user._id,
      message: `joined your challenge "${challenge.title}"`,
      link: `/dashboard/challenges/${challenge._id}`
    });
    
    await challenge.populate('participants.user', 'name avatar');
    
    res.json({
      success: true,
      message: 'Successfully joined challenge',
      data: challenge
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get challenge leaderboard
// @route   GET /api/challenges/:id/leaderboard
// @access  Private
export const getChallengeLeaderboard = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('participants.user', 'name avatar');
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }
    
    const leaderboard = challenge.getLeaderboard();
    
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Invite user to challenge
// @route   POST /api/challenges/:id/invite
// @access  Private (Creator only)
export const inviteToChallenge = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }
    
    // Only creator can invite
    if (challenge.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the challenge creator can invite users'
      });
    }
    
    // Send notification to user
    await Notification.create({
      user: userId,
      type: 'challenge_invite',
      fromUser: req.user._id,
      message: `invited you to join the challenge "${challenge.title}"`,
      link: `/dashboard/challenges/${challenge._id}`,
      data: {
        challengeId: challenge._id,
        inviteCode: challenge.inviteCode
      }
    });
    
    res.json({
      success: true,
      message: 'Invitation sent',
      inviteCode: challenge.inviteCode
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync challenge progress from workouts
// @route   POST /api/challenges/:id/sync
// @access  Private
export const syncChallengeProgress = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }
    
    // Find user's participant record
    const participantIndex = challenge.participants.findIndex(p => 
      p.user.toString() === req.user._id.toString()
    );
    
    if (participantIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You are not participating in this challenge'
      });
    }
    
    // Calculate progress based on workouts within challenge dates
    const progress = await calculateUserProgress(
      req.user._id,
      challenge.type,
      challenge.startDate,
      challenge.endDate
    );
    
    challenge.participants[participantIndex].progress = progress;
    challenge.participants[participantIndex].lastUpdated = new Date();
    
    // Update rankings
    challenge.updateRankings();
    
    await challenge.save();
    
    res.json({
      success: true,
      data: {
        progress,
        target: challenge.target,
        progressPercent: Math.min(100, Math.round((progress / challenge.target) * 100))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a challenge
// @route   DELETE /api/challenges/:id
// @access  Private (Creator only)
export const deleteChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }
    
    if (challenge.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the challenge creator can delete it'
      });
    }
    
    await challenge.deleteOne();
    
    res.json({
      success: true,
      message: 'Challenge deleted'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate user's progress for a challenge
async function calculateUserProgress(userId, type, startDate, endDate) {
  const matchQuery = {
    user: userId,
    date: { $gte: startDate, $lte: endDate },
    type: { $ne: 'biometrics' }
  };
  
  let progress = 0;
  
  switch (type) {
    case 'distance':
      const distanceResult = await Workout.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $cond: [
                  { $eq: ['$type', 'run'] },
                  { $ifNull: ['$run.distance', 0] },
                  { $ifNull: ['$cardio.distance', 0] }
                ]
              }
            }
          }
        }
      ]);
      progress = distanceResult[0]?.total || 0;
      break;
      
    case 'duration':
      const durationResult = await Workout.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ['$duration', 0] } }
          }
        }
      ]);
      progress = durationResult[0]?.total || 0;
      break;
      
    case 'workouts':
      progress = await Workout.countDocuments(matchQuery);
      break;
      
    case 'calories':
      const caloriesResult = await Workout.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $add: [
                  { $ifNull: ['$run.calories', 0] },
                  { $ifNull: ['$cardio.calories', 0] },
                  { $ifNull: ['$yoga.caloriesBurned', 0] }
                ]
              }
            }
          }
        }
      ]);
      progress = caloriesResult[0]?.total || 0;
      break;
  }
  
  return Math.round(progress * 100) / 100;
}

// Function to sync all user's active challenges (called after workout creation)
export async function syncUserChallenges(userId, workout) {
  try {
    // Find all active challenges user is participating in
    const challenges = await Challenge.find({
      'participants.user': userId,
      status: 'active'
    });
    
    for (const challenge of challenges) {
      const participantIndex = challenge.participants.findIndex(p => 
        p.user.toString() === userId.toString()
      );
      
      if (participantIndex !== -1) {
        const progress = await calculateUserProgress(
          userId,
          challenge.type,
          challenge.startDate,
          challenge.endDate
        );
        
        challenge.participants[participantIndex].progress = progress;
        challenge.participants[participantIndex].lastUpdated = new Date();
        challenge.updateRankings();
        
        await challenge.save();
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing user challenges:', error);
    return false;
  }
}

// Function to award badges for completed challenges
export async function awardChallengeBadges(challengeId) {
  try {
    const challenge = await Challenge.findById(challengeId);
    
    if (!challenge || challenge.status !== 'completed') {
      return;
    }
    
    const leaderboard = challenge.getLeaderboard();
    
    for (const participant of leaderboard) {
      const userId = participant.user;
      const completed = participant.progress >= challenge.target;
      
      // Award finisher badge if completed target
      if (completed) {
        await awardBadgeSimple(userId, 'challenge_finisher');
        
        // Check for challenge streak badge
        const completedChallenges = await Challenge.countDocuments({
          'participants.user': userId,
          status: 'completed',
          'participants': {
            $elemMatch: {
              user: userId,
              $expr: { $gte: ['$progress', challenge.target] }
            }
          }
        });
        
        if (completedChallenges >= 10) {
          await awardBadgeSimple(userId, 'challenge_streak');
        }
      }
      
      // Award top 3 badge
      if (participant.rank <= 3) {
        await awardBadgeSimple(userId, 'challenge_top3');
      }
      
      // Award winner badge (rank 1)
      if (participant.rank === 1) {
        await awardBadgeSimple(userId, 'challenge_winner');
      }
    }
  } catch (error) {
    console.error('Error awarding challenge badges:', error);
  }
}
