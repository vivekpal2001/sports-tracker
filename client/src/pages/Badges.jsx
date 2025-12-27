import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Lock,
  CheckCircle,
  Calendar,
  Star,
  RefreshCw
} from 'lucide-react';
import { Card, LoadingSpinner } from '../components/ui';
import { badgeAPI } from '../services/api';

const RARITY_CONFIG = {
  common: { label: 'Common', color: 'gray', bg: 'bg-gray-500/20', text: 'text-gray-400' },
  rare: { label: 'Rare', color: 'primary', bg: 'bg-primary-500/20', text: 'text-primary-500' },
  epic: { label: 'Epic', color: 'purple', bg: 'bg-purple-500/20', text: 'text-purple-500' },
  legendary: { label: 'Legendary', color: 'yellow', bg: 'bg-yellow-500/20', text: 'text-yellow-500' }
};

const CATEGORY_LABELS = {
  milestone: 'Milestones',
  consistency: 'Consistency',
  distance: 'Distance',
  achievement: 'Achievements',
  goals: 'Goals',
  special: 'Special'
};

export default function Badges() {
  const [loading, setLoading] = useState(true);
  const [badgeData, setBadgeData] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [filter, setFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);
  
  useEffect(() => {
    fetchBadges();
  }, []);
  
  const fetchBadges = async () => {
    try {
      const response = await badgeAPI.getAll();
      setBadgeData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await badgeAPI.sync();
      const newBadges = response.data.newBadges || [];
      if (newBadges.length > 0) {
        alert(`🎉 ${newBadges.length} new badge(s) awarded: ${newBadges.map(b => b.name).join(', ')}`);
      } else {
        alert('All badges are up to date!');
      }
      fetchBadges(); // Refresh
    } catch (error) {
      console.error('Failed to sync badges:', error);
      alert('Failed to sync badges');
    } finally {
      setSyncing(false);
    }
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const getFilteredBadges = () => {
    if (!badgeData) return [];
    
    if (filter === 'all') return badgeData.all;
    if (filter === 'earned') return badgeData.all.filter(b => b.earned);
    if (filter === 'locked') return badgeData.all.filter(b => !b.earned);
    
    // Category filter
    return badgeData.byCategory[filter] || [];
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading badges..." />
      </div>
    );
  }
  
  const { earned, total, byCategory } = badgeData || { earned: 0, total: 0, byCategory: {} };
  const filteredBadges = getFilteredBadges();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <Award className="w-8 h-8 text-yellow-500" />
            Badges
          </h1>
          <p className="text-gray-400">
            {earned} of {total} badges earned
          </p>
        </div>
        
        {/* Progress + Sync */}
        <div className="flex items-center gap-4">
          <div className="flex-1 md:w-48 h-2 bg-dark-300 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(earned / total) * 100}%` }}
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
            />
          </div>
          <span className="text-white font-medium">{Math.round((earned / total) * 100)}%</span>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="p-2 rounded-xl bg-dark-200/50 hover:bg-dark-200 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            title="Sync badges for existing workouts"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
          const categoryBadges = byCategory[key] || [];
          const categoryEarned = categoryBadges.filter(b => b.earned).length;
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setFilter(filter === key ? 'all' : key)}
              className={`
                cursor-pointer p-4 rounded-xl border-2 transition-all
                ${filter === key 
                  ? 'border-primary-500 bg-primary-500/10' 
                  : 'border-white/5 bg-dark-200/50 hover:border-white/10'}
              `}
            >
              <p className="text-sm text-gray-400 mb-1">{label}</p>
              <p className="text-lg font-bold text-white">
                {categoryEarned}/{categoryBadges.length}
              </p>
            </motion.div>
          );
        })}
      </div>
      
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'earned', 'locked'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all whitespace-nowrap
              ${filter === f 
                ? 'bg-primary-500 text-dark-500' 
                : 'bg-dark-200/50 text-gray-400 hover:text-white'}
            `}
          >
            {f === 'all' ? 'All Badges' : f === 'earned' ? `Earned (${earned})` : `Locked (${total - earned})`}
          </button>
        ))}
      </div>
      
      {/* Badges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredBadges.map((badge, i) => {
            const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.common;
            
            return (
              <motion.div
                key={badge.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setSelectedBadge(badge)}
                className="cursor-pointer"
              >
                <Card 
                  hover={true}
                  className={`
                    text-center relative overflow-hidden
                    ${!badge.earned ? 'opacity-50 grayscale' : ''}
                  `}
                >
                  {/* Rarity indicator */}
                  <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs ${rarity.bg} ${rarity.text}`}>
                    {rarity.label}
                  </div>
                  
                  {/* Badge icon */}
                  <div className="text-5xl mb-3 mt-2">
                    {badge.icon}
                  </div>
                  
                  {/* Badge name */}
                  <h3 className="font-semibold text-white mb-1 text-sm">{badge.name}</h3>
                  
                  {/* Status */}
                  {badge.earned ? (
                    <div className="flex items-center justify-center gap-1 text-lime-500 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      <span>Earned</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1 text-gray-500 text-xs">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Empty State */}
      {filteredBadges.length === 0 && (
        <Card className="text-center py-16">
          <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No badges found</h3>
          <p className="text-gray-400">
            {filter === 'earned' 
              ? 'Start working out to earn your first badge!' 
              : 'No badges in this category'}
          </p>
        </Card>
      )}
      
      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-dark-300 rounded-2xl p-4 sm:p-6 max-w-sm w-full border border-white/10 text-center max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Badge Icon */}
              <div className={`
                w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl flex items-center justify-center mb-4
                ${selectedBadge.earned 
                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20' 
                  : 'bg-dark-200'}
              `}>
                <span className="text-5xl sm:text-6xl">{selectedBadge.icon}</span>
              </div>
              
              {/* Rarity */}
              <div className={`
                inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm mb-4
                ${RARITY_CONFIG[selectedBadge.rarity]?.bg || 'bg-gray-500/20'}
                ${RARITY_CONFIG[selectedBadge.rarity]?.text || 'text-gray-400'}
              `}>
                <Star className="w-4 h-4" />
                {RARITY_CONFIG[selectedBadge.rarity]?.label || 'Common'}
              </div>
              
              {/* Name */}
              <h3 className="text-2xl font-bold text-white mb-2">{selectedBadge.name}</h3>
              
              {/* Description */}
              <p className="text-gray-400 mb-6">{selectedBadge.description}</p>
              
              {/* Status */}
              {selectedBadge.earned ? (
                <div className="bg-lime-500/10 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-center gap-2 text-lime-500 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Earned!</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedBadge.earnedAt)}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-dark-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Lock className="w-5 h-5" />
                    <span className="font-medium">Not yet earned</span>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-3 bg-dark-200 hover:bg-dark-100 text-white rounded-xl transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
