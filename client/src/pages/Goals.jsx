import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Calendar,
  Clock,
  Flame,
  TrendingUp,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronRight,
  X
} from 'lucide-react';
import { Card, Button, LoadingSpinner } from '../components/ui';
import { goalAPI } from '../services/api';

const GOAL_TYPES = [
  { type: 'weekly_workouts', name: 'Weekly Workouts', icon: '🏋️', unit: 'workouts', defaultTarget: 5 },
  { type: 'weekly_distance', name: 'Weekly Distance', icon: '🏃', unit: 'km', defaultTarget: 30 },
  { type: 'weekly_duration', name: 'Weekly Training Time', icon: '⏱️', unit: 'min', defaultTarget: 300 },
  { type: 'monthly_workouts', name: 'Monthly Workouts', icon: '📅', unit: 'workouts', defaultTarget: 20 },
  { type: 'monthly_distance', name: 'Monthly Distance', icon: '📏', unit: 'km', defaultTarget: 100 },
  { type: 'daily_streak', name: 'Workout Streak', icon: '🔥', unit: 'days', defaultTarget: 7 },
  { type: 'run_distance', name: 'Distance Milestone', icon: '🎯', unit: 'km', defaultTarget: 10 }
];

export default function Goals() {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('active');
  const [creating, setCreating] = useState(false);
  
  // New goal form
  const [newGoal, setNewGoal] = useState({
    type: 'weekly_workouts',
    title: '',
    target: 5,
    unit: 'workouts',
    endDate: ''
  });
  
  useEffect(() => {
    fetchGoals();
  }, [filter]);
  
  const fetchGoals = async () => {
    try {
      const response = await goalAPI.getAll(filter === 'all' ? undefined : filter);
      setGoals(response.data.data.goals);
      setSummary(response.data.data.summary);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTypeChange = (type) => {
    const goalType = GOAL_TYPES.find(g => g.type === type);
    setNewGoal(prev => ({
      ...prev,
      type,
      title: goalType?.name || '',
      target: goalType?.defaultTarget || 5,
      unit: goalType?.unit || 'count'
    }));
  };
  
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      const goalData = {
        type: newGoal.type,
        title: newGoal.title || GOAL_TYPES.find(g => g.type === newGoal.type)?.name,
        target: newGoal.target,
        unit: newGoal.unit,
        endDate: newGoal.endDate || getDefaultEndDate(newGoal.type)
      };
      
      await goalAPI.create(goalData);
      
      setShowCreateModal(false);
      setNewGoal({
        type: 'weekly_workouts',
        title: '',
        target: 5,
        unit: 'workouts',
        endDate: ''
      });
      fetchGoals();
    } catch (error) {
      console.error('Failed to create goal:', error);
    } finally {
      setCreating(false);
    }
  };
  
  const handleDeleteGoal = async (id) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      await goalAPI.delete(id);
      fetchGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };
  
  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-lime-500';
    if (progress >= 75) return 'bg-primary-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };
  
  const getDefaultEndDate = (type) => {
    const date = new Date();
    if (type.includes('weekly')) {
      date.setDate(date.getDate() + 7);
    } else if (type.includes('monthly')) {
      date.setMonth(date.getMonth() + 1);
    } else {
      date.setDate(date.getDate() + 30);
    }
    return date.toISOString().split('T')[0];
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading goals..." />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <Target className="w-8 h-8 text-primary-500" />
            Goals
          </h1>
          <p className="text-gray-400">
            Set and track your fitness goals
          </p>
        </div>
        
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
          New Goal
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active', value: summary.active || 0, icon: Target, color: 'primary' },
          { label: 'Completed', value: summary.completed || 0, icon: CheckCircle, color: 'lime' },
          { label: 'Failed', value: summary.failed || 0, icon: XCircle, color: 'crimson' },
          { label: 'Total', value: summary.total || 0, icon: TrendingUp, color: 'purple' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <div className={`
                w-10 h-10 rounded-xl mb-3 flex items-center justify-center
                ${stat.color === 'primary' ? 'bg-primary-500/20 text-primary-500' : ''}
                ${stat.color === 'lime' ? 'bg-lime-500/20 text-lime-500' : ''}
                ${stat.color === 'crimson' ? 'bg-crimson-500/20 text-crimson-500' : ''}
                ${stat.color === 'purple' ? 'bg-purple-500/20 text-purple-500' : ''}
              `}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['active', 'completed', 'failed', 'all'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all
              ${filter === f 
                ? 'bg-primary-500 text-dark-500' 
                : 'bg-dark-200/50 text-gray-400 hover:text-white'}
            `}
          >
            {f}
          </button>
        ))}
      </div>
      
      {/* Goals List */}
      <div className="space-y-4">
        <AnimatePresence>
          {goals.length > 0 ? (
            goals.map((goal, i) => {
              const goalType = GOAL_TYPES.find(g => g.type === goal.type);
              
              return (
                <motion.div
                  key={goal._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="relative overflow-hidden">
                    {/* Progress bar background */}
                    <div 
                      className={`absolute inset-0 ${getProgressColor(goal.progress)} opacity-10`}
                      style={{ width: `${goal.progress}%` }}
                    />
                    
                    <div className="relative flex items-center gap-4">
                      {/* Icon */}
                      <div className="text-4xl">{goalType?.icon || '🎯'}</div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white truncate">{goal.title}</h3>
                          {goal.status === 'completed' && (
                            <span className="px-2 py-0.5 bg-lime-500/20 text-lime-500 text-xs rounded-full">
                              Completed
                            </span>
                          )}
                          {goal.status === 'failed' && (
                            <span className="px-2 py-0.5 bg-crimson-500/20 text-crimson-500 text-xs rounded-full">
                              Failed
                            </span>
                          )}
                        </div>
                        
                        {/* Progress */}
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex-1 h-2 bg-dark-300 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, goal.progress)}%` }}
                              className={`h-full ${getProgressColor(goal.progress)} rounded-full`}
                            />
                          </div>
                          <span className="text-white font-medium min-w-[50px] text-right">
                            {goal.progress}%
                          </span>
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                          <span>
                            {goal.current} / {goal.target} {goal.unit}
                          </span>
                          {goal.status === 'active' && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {goal.daysRemaining} days left
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        className="p-2 rounded-lg hover:bg-crimson-500/10 text-gray-400 hover:text-crimson-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Card className="text-center py-16">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No {filter !== 'all' ? filter : ''} goals</h3>
              <p className="text-gray-400 mb-6">
                {filter === 'active' 
                  ? 'Create your first goal to start tracking!' 
                  : 'No goals found in this category'}
              </p>
              {filter === 'active' && (
                <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
                  Create Goal
                </Button>
              )}
            </Card>
          )}
        </AnimatePresence>
      </div>
      
      {/* Create Goal Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-dark-300 rounded-2xl w-full max-w-lg border border-white/10 max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
                <h2 className="text-lg sm:text-xl font-bold text-white">Create New Goal</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Form */}
              <form onSubmit={handleCreateGoal} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {/* Goal Type */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Goal Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                    {GOAL_TYPES.map((goalType) => (
                      <button
                        key={goalType.type}
                        type="button"
                        onClick={() => handleTypeChange(goalType.type)}
                        className={`
                          p-3 rounded-xl text-left transition-all border-2 flex items-center gap-3 sm:block
                          ${newGoal.type === goalType.type 
                            ? 'border-primary-500 bg-primary-500/10' 
                            : 'border-transparent bg-dark-200/50 hover:bg-dark-200'}
                        `}
                      >
                        <span className="text-xl sm:text-2xl sm:mb-1 sm:block">{goalType.icon}</span>
                        <span className="text-sm text-white font-medium">{goalType.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Title */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Goal Title</label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={GOAL_TYPES.find(g => g.type === newGoal.type)?.name}
                    className="w-full bg-dark-200/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>
                
                {/* Target */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Target</label>
                    <input
                      type="number"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 0 }))}
                      min="1"
                      className="w-full bg-dark-200/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Unit</label>
                    <input
                      type="text"
                      value={newGoal.unit}
                      readOnly
                      className="w-full bg-dark-300/50 border border-white/10 rounded-xl px-4 py-3 text-gray-400"
                    />
                  </div>
                </div>
                
                {/* End Date */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">End Date</label>
                  <input
                    type="date"
                    value={newGoal.endDate || getDefaultEndDate(newGoal.type)}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, endDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-dark-200/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>
                
                {/* Submit */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 bg-dark-200 hover:bg-dark-100 text-white rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 py-3 bg-primary-500 hover:bg-primary-400 text-dark-500 font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Goal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
