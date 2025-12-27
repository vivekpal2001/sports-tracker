import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  TrendingUp, 
  Clock, 
  Activity, 
  Dumbbell,
  Bike,
  Mountain,
  Calendar,
  ChevronRight,
  Flame
} from 'lucide-react';
import { Card, LoadingSpinner } from '../components/ui';
import { prAPI } from '../services/api';

const CATEGORY_CONFIG = {
  running: { 
    label: 'Running', 
    icon: Activity, 
    color: 'lime',
    gradient: 'from-lime-500 to-green-500'
  },
  cardio: { 
    label: 'Cardio', 
    icon: Bike, 
    color: 'primary',
    gradient: 'from-primary-500 to-cyan-500'
  },
  strength: { 
    label: 'Strength', 
    icon: Dumbbell, 
    color: 'orange',
    gradient: 'from-orange-500 to-red-500'
  },
  general: { 
    label: 'General', 
    icon: Trophy, 
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500'
  }
};

const PR_ICONS = {
  fastest_1k: '🏃',
  fastest_5k: '🏃',
  fastest_10k: '🏃',
  fastest_half_marathon: '🏃‍♂️',
  fastest_marathon: '🏃‍♀️',
  longest_run: '📏',
  highest_elevation_run: '⛰️',
  longest_cardio: '❤️',
  longest_cycling: '🚴',
  longest_workout: '⏱️',
  highest_weekly_distance: '📅',
  highest_monthly_distance: '📆',
  most_workouts_week: '🔥',
  heaviest_deadlift: '🏋️',
  heaviest_squat: '🏋️',
  heaviest_bench: '🏋️'
};

export default function PersonalRecords() {
  const [loading, setLoading] = useState(true);
  const [prData, setPrData] = useState(null);
  const [selectedPR, setSelectedPR] = useState(null);
  
  useEffect(() => {
    fetchPRs();
  }, []);
  
  const fetchPRs = async () => {
    try {
      const response = await prAPI.getAll();
      setPrData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch PRs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatValue = (value, unit) => {
    if (unit === 'min') {
      const mins = Math.floor(value);
      const secs = Math.round((value - mins) * 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    if (unit === 'km' || unit === 'kg') {
      return value.toFixed(1);
    }
    return value;
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading personal records..." />
      </div>
    );
  }
  
  const { grouped, totalPRs } = prData || { grouped: {}, totalPRs: 0 };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Personal Records
          </h1>
          <p className="text-gray-400">
            {totalPRs} personal records achieved
          </p>
        </div>
      </div>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(CATEGORY_CONFIG).map(([key, config], i) => {
          const count = grouped[key]?.length || 0;
          const Icon = config.icon;
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-10`} />
                <div className="relative">
                  <div className={`
                    w-10 h-10 rounded-xl mb-3 flex items-center justify-center
                    ${config.color === 'lime' ? 'bg-lime-500/20 text-lime-500' : ''}
                    ${config.color === 'primary' ? 'bg-primary-500/20 text-primary-500' : ''}
                    ${config.color === 'orange' ? 'bg-orange-500/20 text-orange-500' : ''}
                    ${config.color === 'purple' ? 'bg-purple-500/20 text-purple-500' : ''}
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-gray-400 text-sm">{config.label}</p>
                  <p className="text-2xl font-bold text-white">{count} PRs</p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {/* PR Categories */}
      {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
        const prs = grouped[category] || [];
        if (prs.length === 0) return null;
        
        const Icon = config.icon;
        
        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  ${config.color === 'lime' ? 'bg-lime-500/20 text-lime-500' : ''}
                  ${config.color === 'primary' ? 'bg-primary-500/20 text-primary-500' : ''}
                  ${config.color === 'orange' ? 'bg-orange-500/20 text-orange-500' : ''}
                  ${config.color === 'purple' ? 'bg-purple-500/20 text-purple-500' : ''}
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">{config.label} PRs</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prs.map((pr, i) => (
                  <motion.div
                    key={pr._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedPR(selectedPR?._id === pr._id ? null : pr)}
                    className="cursor-pointer"
                  >
                    <div className={`
                      bg-dark-200/50 rounded-xl p-4 border-2 transition-all
                      hover:border-${config.color}-500/50 hover:bg-dark-200
                      ${selectedPR?._id === pr._id ? `border-${config.color}-500` : 'border-transparent'}
                    `}>
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">{PR_ICONS[pr.type] || '🏆'}</span>
                        {pr.improvement && (
                          <span className="px-2 py-1 bg-lime-500/20 text-lime-500 text-xs font-medium rounded-full flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {pr.improvement > 0 ? '+' : ''}{pr.improvement}%
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-medium text-white mb-1">{pr.name}</h3>
                      
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className={`text-2xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                          {formatValue(pr.value, pr.unit)}
                        </span>
                        <span className="text-gray-400 text-sm">{pr.unit}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(pr.achievedAt)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        );
      })}
      
      {/* Empty State */}
      {totalPRs === 0 && (
        <Card className="text-center py-16">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Personal Records Yet</h3>
          <p className="text-gray-400 mb-6">
            Start logging workouts to set your first personal records!
          </p>
        </Card>
      )}
      
      {/* PR Detail Modal */}
      <AnimatePresence>
        {selectedPR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPR(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-dark-300 rounded-2xl p-6 max-w-md w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <span className="text-6xl mb-4 block">{PR_ICONS[selectedPR.type] || '🏆'}</span>
                <h3 className="text-2xl font-bold text-white">{selectedPR.name}</h3>
              </div>
              
              <div className="text-center mb-6">
                <span className="text-5xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  {formatValue(selectedPR.value, selectedPR.unit)}
                </span>
                <span className="text-xl text-gray-400 ml-2">{selectedPR.unit}</span>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between bg-dark-200/50 rounded-lg p-3">
                  <span className="text-gray-400">Achieved</span>
                  <span className="text-white">{formatDate(selectedPR.achievedAt)}</span>
                </div>
                
                {selectedPR.previousValue && (
                  <div className="flex items-center justify-between bg-dark-200/50 rounded-lg p-3">
                    <span className="text-gray-400">Previous Record</span>
                    <span className="text-white">
                      {formatValue(selectedPR.previousValue, selectedPR.unit)} {selectedPR.unit}
                    </span>
                  </div>
                )}
                
                {selectedPR.improvement && (
                  <div className="flex items-center justify-between bg-lime-500/10 rounded-lg p-3">
                    <span className="text-gray-400">Improvement</span>
                    <span className="text-lime-500 font-medium">
                      {selectedPR.improvement > 0 ? '+' : ''}{selectedPR.improvement}%
                    </span>
                  </div>
                )}
                
                {selectedPR.workout && (
                  <div className="flex items-center justify-between bg-dark-200/50 rounded-lg p-3">
                    <span className="text-gray-400">Workout</span>
                    <span className="text-white">{selectedPR.workout.title || 'Workout'}</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setSelectedPR(null)}
                className="w-full mt-6 py-3 bg-dark-200 hover:bg-dark-100 text-white rounded-xl transition-colors"
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
