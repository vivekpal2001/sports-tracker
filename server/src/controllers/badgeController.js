import { getUserBadges, BADGES, syncUserBadges } from '../services/badgeService.js';

// @desc    Get all badges (earned + locked)
// @route   GET /api/badges
// @access  Private
export const getBadges = async (req, res, next) => {
  try {
    const badgeData = await getUserBadges(req.user._id);
    
    res.json({
      success: true,
      data: badgeData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get badge definitions
// @route   GET /api/badges/definitions
// @access  Private
export const getBadgeDefinitions = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: BADGES
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync/retroactively award badges
// @route   POST /api/badges/sync
// @access  Private
export const syncBadges = async (req, res, next) => {
  try {
    const newBadges = await syncUserBadges(req.user._id);
    
    res.json({
      success: true,
      message: `Synced badges. ${newBadges.length} new badges awarded.`,
      newBadges
    });
  } catch (error) {
    next(error);
  }
};
