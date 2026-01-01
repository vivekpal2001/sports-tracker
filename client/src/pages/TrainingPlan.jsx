import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Trash2,
  X,
  Play,
  Target,
  Sparkles,
  Lightbulb,
  Clock,
  Flame,
  Heart,
  Dumbbell,
  Info
} from 'lucide-react';
import { Card, Button, LoadingSpinner } from '../components/ui';
import { trainingPlanAPI } from '../services/api';

const PLAN_TYPES = [
  { type: '5k', name: '5K Race', icon: '🏃', weeks: 8, description: 'Beginner to intermediate 5K training' },
  { type: '10k', name: '10K Race', icon: '🏃‍♀️', weeks: 10, description: 'Build endurance for 10K distance' },
  { type: 'half_marathon', name: 'Half Marathon', icon: '🏅', weeks: 12, description: 'Train for your first or fastest half' },
  { type: 'marathon', name: 'Marathon', icon: '🏆', weeks: 16, description: 'Complete marathon preparation' },
  { type: 'general_fitness', name: 'General Fitness', icon: '💪', weeks: 8, description: 'Overall fitness improvement' },
  { type: 'strength', name: 'Strength Building', icon: '🏋️', weeks: 8, description: 'Build muscle and strength' }
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'New to training or returning after a break' },
  { value: 'intermediate', label: 'Intermediate', description: 'Training regularly for 6+ months' },
  { value: 'advanced', label: 'Advanced', description: 'Experienced athlete seeking performance gains' }
];

export default function TrainingPlan() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  
  // Create wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [newPlan, setNewPlan] = useState({
    type: '5k',
    goal: '',
    difficulty: 'intermediate',
    startDate: new Date().toISOString().split('T')[0]
  });
  
  useEffect(() => {
    fetchPlans();
  }, []);
  
  const fetchPlans = async () => {
    try {
      const response = await trainingPlanAPI.getAll();
      const allPlans = response.data.data;
      setPlans(allPlans);
      
      // Set active plan
      const active = allPlans.find(p => p.status === 'active');
      if (active) {
        setActivePlan(active);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreatePlan = async () => {
    setCreating(true);
    try {
      const planType = PLAN_TYPES.find(p => p.type === newPlan.type);
      const response = await trainingPlanAPI.generate({
        ...newPlan,
        duration: planType?.weeks || 8
      });
      
      setShowCreateModal(false);
      setWizardStep(1);
      setNewPlan({
        type: '5k',
        goal: '',
        difficulty: 'intermediate',
        startDate: new Date().toISOString().split('T')[0]
      });
      
      setActivePlan(response.data.data);
      fetchPlans();
    } catch (error) {
      console.error('Failed to create plan:', error);
    } finally {
      setCreating(false);
    }
  };
  
  const handleCompleteWorkout = async (weekNumber, day) => {
    if (!activePlan) return;
    
    try {
      const response = await trainingPlanAPI.completeWorkout(activePlan._id, {
        weekNumber,
        day
      });
      setActivePlan(response.data.data);
    } catch (error) {
      console.error('Failed to complete workout:', error);
    }
  };
  
  const handleDeletePlan = async (id) => {
    if (!confirm('Are you sure you want to delete this training plan?')) return;
    
    try {
      await trainingPlanAPI.delete(id);
      if (activePlan?._id === id) {
        setActivePlan(null);
      }
      fetchPlans();
    } catch (error) {
      console.error('Failed to delete plan:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading training plans..." />
      </div>
    );
  }
  
  const currentWeek = activePlan?.weeks?.find(w => w.weekNumber === activePlan.currentWeek);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary-500" />
            Training Plans
          </h1>
          <p className="text-gray-400">
            AI-generated training schedules tailored to your goals
          </p>
        </div>
        
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
          New Plan
        </Button>
      </div>
      
      {/* Active Plan */}
      {activePlan ? (
        <div className="space-y-6">
          {/* Plan Header */}
          <Card glow className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {PLAN_TYPES.find(p => p.type === activePlan.type)?.icon || '📋'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">{activePlan.name}</h2>
                      {activePlan.aiGenerated && (
                        <span className="px-2 py-0.5 bg-primary-500/20 text-primary-500 text-xs rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          AI Personalized
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      Week {activePlan.currentWeek} of {activePlan.duration} • {currentWeek?.theme || 'Training'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{activePlan.progressPercentage}%</p>
                  <p className="text-sm text-gray-400">Complete</p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-dark-300 relative flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="#00d4ff"
                      strokeWidth="4"
                      strokeDasharray={`${(activePlan.progressPercentage / 100) * 176} 176`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <Target className="w-6 h-6 text-primary-500" />
                </div>
              </div>
            </div>
          </Card>
          
          {/* AI Tips */}
          {activePlan.tips && activePlan.tips.length > 0 && (
            <Card className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 border-primary-500/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">AI Training Tips</h3>
                  <ul className="space-y-1">
                    {activePlan.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-primary-500">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}
          
          {/* Current Week Schedule */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Week {activePlan.currentWeek} Schedule
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const prevWeek = activePlan.weeks.find(w => w.weekNumber === activePlan.currentWeek - 1);
                    if (prevWeek) {
                      setActivePlan({...activePlan, currentWeek: activePlan.currentWeek - 1});
                    }
                  }}
                  disabled={activePlan.currentWeek <= 1}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const nextWeek = activePlan.weeks.find(w => w.weekNumber === activePlan.currentWeek + 1);
                    if (nextWeek) {
                      setActivePlan({...activePlan, currentWeek: activePlan.currentWeek + 1});
                    }
                  }}
                  disabled={activePlan.currentWeek >= activePlan.duration}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {DAYS.map((day, i) => {
                const workout = currentWeek?.workouts?.find(w => w.day === i);
                const isRest = workout?.type === 'rest';
                const isCompleted = workout?.completed;
                
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`
                      p-3 rounded-xl border-2 transition-all cursor-pointer
                      ${isCompleted 
                        ? 'border-lime-500 bg-lime-500/10' 
                        : isRest 
                          ? 'border-white/5 bg-dark-200/50' 
                          : 'border-white/10 bg-dark-200/50 hover:border-primary-500/50'}
                    `}
                    onClick={() => workout && setSelectedWorkout({ ...workout, weekNumber: activePlan.currentWeek })}
                  >
                    <p className="text-xs text-gray-500 mb-1">{day}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg mb-1">
                        {workout?.type === 'run' && '🏃'}
                        {workout?.type === 'lift' && '🏋️'}
                        {workout?.type === 'cardio' && '❤️'}
                        {workout?.type === 'cross-training' && '🚴'}
                        {workout?.type === 'yoga' && '🧘'}
                        {workout?.type === 'rest' && '😴'}
                      </span>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-lime-500" />
                      ) : !isRest && (
                        <Info className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    <p className="text-xs font-medium text-white truncate">{workout?.name}</p>
                    {workout?.distance && (
                      <p className="text-xs text-gray-400">{workout.distance} km</p>
                    )}
                    {workout?.duration && !isRest && (
                      <p className="text-xs text-gray-400">{workout.duration} min</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </Card>
          
          {/* Week Overview */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">All Weeks</h3>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {activePlan.weeks.map((week) => {
                const completedCount = week.workouts.filter(w => w.completed).length;
                const totalWorkouts = week.workouts.filter(w => w.type !== 'rest').length;
                const isCurrentWeek = week.weekNumber === activePlan.currentWeek;
                
                return (
                  <motion.button
                    key={week.weekNumber}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setActivePlan({...activePlan, currentWeek: week.weekNumber})}
                    className={`
                      p-3 rounded-xl text-center transition-all
                      ${isCurrentWeek 
                        ? 'bg-primary-500 text-dark-500' 
                        : completedCount === totalWorkouts && totalWorkouts > 0
                          ? 'bg-lime-500/20 text-lime-500'
                          : 'bg-dark-200/50 text-gray-400 hover:bg-dark-200'}
                    `}
                  >
                    <p className="text-xs font-medium">Week {week.weekNumber}</p>
                    <p className="text-lg font-bold">{completedCount}/{totalWorkouts}</p>
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="text-center py-16">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Active Training Plan</h3>
          <p className="text-gray-400 mb-6">
            Create a personalized training plan to reach your goals
          </p>
          <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
            Create Training Plan
          </Button>
        </Card>
      )}
      
      {/* Past Plans */}
      {plans.filter(p => p.status !== 'active').length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Past Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.filter(p => p.status !== 'active').map((plan) => (
              <Card key={plan._id} className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {PLAN_TYPES.find(p => p.type === plan.type)?.icon || '📋'}
                    </span>
                    <div>
                      <h4 className="font-semibold text-white">{plan.name}</h4>
                      <p className="text-sm text-gray-400">{plan.duration} weeks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`
                      px-2 py-1 rounded-full text-xs
                      ${plan.status === 'completed' ? 'bg-lime-500/20 text-lime-500' : 'bg-gray-500/20 text-gray-400'}
                    `}>
                      {plan.status}
                    </span>
                    <button
                      onClick={() => handleDeletePlan(plan._id)}
                      className="p-2 rounded-lg hover:bg-crimson-500/10 text-gray-400 hover:text-crimson-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Create Plan Modal */}
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
                <h2 className="text-lg sm:text-xl font-bold text-white">Create Training Plan</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Wizard Steps */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                {/* Step 1: Choose Plan Type */}
                {wizardStep === 1 && (
                  <div className="space-y-4">
                    <p className="text-gray-400 mb-4">Choose your training goal:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-h-[300px] overflow-y-auto pr-1">
                      {PLAN_TYPES.map((plan) => (
                        <button
                          key={plan.type}
                          onClick={() => setNewPlan(prev => ({ ...prev, type: plan.type }))}
                          className={`
                            p-3 sm:p-4 rounded-xl text-left transition-all border-2
                            ${newPlan.type === plan.type 
                              ? 'border-primary-500 bg-primary-500/10' 
                              : 'border-transparent bg-dark-200/50 hover:bg-dark-200'}
                          `}
                        >
                          <span className="text-xl sm:text-2xl mb-1 sm:mb-2 block">{plan.icon}</span>
                          <span className="text-white font-medium block text-sm">{plan.name}</span>
                          <span className="text-xs text-gray-400 hidden sm:block">{plan.weeks} weeks</span>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setWizardStep(2)}
                      className="w-full mt-4 py-3 bg-primary-500 hover:bg-primary-400 text-dark-500 font-medium rounded-xl transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                )}
                
                {/* Step 2: Difficulty & Start Date */}
                {wizardStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Your Experience Level</label>
                      <div className="space-y-2">
                        {DIFFICULTY_LEVELS.map((level) => (
                          <button
                            key={level.value}
                            onClick={() => setNewPlan(prev => ({ ...prev, difficulty: level.value }))}
                            className={`
                              w-full p-4 rounded-xl text-left transition-all border-2
                              ${newPlan.difficulty === level.value 
                                ? 'border-primary-500 bg-primary-500/10' 
                                : 'border-transparent bg-dark-200/50 hover:bg-dark-200'}
                            `}
                          >
                            <span className="text-white font-medium block">{level.label}</span>
                            <span className="text-xs text-gray-400">{level.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={newPlan.startDate}
                        onChange={(e) => setNewPlan(prev => ({ ...prev, startDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-dark-200/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Goal (optional)</label>
                      <input
                        type="text"
                        value={newPlan.goal}
                        onChange={(e) => setNewPlan(prev => ({ ...prev, goal: e.target.value }))}
                        placeholder="e.g., Run 5K in under 25 minutes"
                        className="w-full bg-dark-200/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => setWizardStep(1)}
                        className="flex-1 py-3 bg-dark-200 hover:bg-dark-100 text-white rounded-xl transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleCreatePlan}
                        disabled={creating}
                        className="flex-1 py-3 bg-primary-500 hover:bg-primary-400 text-dark-500 font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {creating ? (
                          <>
                            <Sparkles className="w-4 h-4 animate-pulse" />
                            Analyzing & Creating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generate AI Plan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Workout Detail Modal */}
      <AnimatePresence>
        {selectedWorkout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedWorkout(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-dark-300 rounded-2xl w-full max-w-2xl border border-white/10 max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {selectedWorkout.type === 'run' && '🏃'}
                    {selectedWorkout.type === 'lift' && '🏋️'}
                    {selectedWorkout.type === 'cardio' && '❤️'}
                    {selectedWorkout.type === 'cross-training' && '🚴'}
                    {selectedWorkout.type === 'yoga' && '🧘'}
                    {selectedWorkout.type === 'rest' && '😴'}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedWorkout.name}</h2>
                    <p className="text-sm text-gray-400">
                      {selectedWorkout.dayName || DAYS[selectedWorkout.day]} • Week {selectedWorkout.weekNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWorkout(null)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4">
                  {selectedWorkout.duration > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-dark-200/50 rounded-xl">
                      <Clock className="w-4 h-4 text-primary-500" />
                      <span className="text-sm text-white">{selectedWorkout.duration} min</span>
                    </div>
                  )}
                  {selectedWorkout.distance && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-dark-200/50 rounded-xl">
                      <Target className="w-4 h-4 text-lime-500" />
                      <span className="text-sm text-white">{selectedWorkout.distance} km</span>
                    </div>
                  )}
                  {selectedWorkout.intensity && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                      selectedWorkout.intensity === 'easy' ? 'bg-lime-500/20 text-lime-500' :
                      selectedWorkout.intensity === 'moderate' ? 'bg-yellow-500/20 text-yellow-500' :
                      selectedWorkout.intensity === 'hard' ? 'bg-orange-500/20 text-orange-500' :
                      'bg-crimson-500/20 text-crimson-500'
                    }`}>
                      <Flame className="w-4 h-4" />
                      <span className="text-sm capitalize">{selectedWorkout.intensity.replace('_', ' ')}</span>
                    </div>
                  )}
                  {selectedWorkout.targetHeartRate && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-crimson-500/20 rounded-xl">
                      <Heart className="w-4 h-4 text-crimson-500" />
                      <span className="text-sm text-crimson-400">{selectedWorkout.targetHeartRate}</span>
                    </div>
                  )}
                </div>
                
                {/* Warm Up */}
                {selectedWorkout.warmUp && (
                  <div className="p-4 rounded-xl bg-lime-500/10 border border-lime-500/20">
                    <h3 className="font-semibold text-lime-500 mb-2 flex items-center gap-2">
                      <span className="text-lg">🔥</span> Warm-Up
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{selectedWorkout.warmUp}</p>
                  </div>
                )}
                
                {/* Main Workout */}
                {selectedWorkout.mainWorkout && (
                  <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                    <h3 className="font-semibold text-primary-500 mb-2 flex items-center gap-2">
                      <span className="text-lg">💪</span> Main Workout
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{selectedWorkout.mainWorkout}</p>
                  </div>
                )}
                
                {/* Cool Down */}
                {selectedWorkout.coolDown && (
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <h3 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                      <span className="text-lg">🧊</span> Cool-Down
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{selectedWorkout.coolDown}</p>
                  </div>
                )}
                
                {/* Coaching Notes */}
                {selectedWorkout.coachingNotes && (
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <h3 className="font-semibold text-yellow-500 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" /> Coach's Tips
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{selectedWorkout.coachingNotes}</p>
                  </div>
                )}
                
                {/* Equipment Needed */}
                {selectedWorkout.equipmentNeeded && (
                  <div className="p-4 rounded-xl bg-dark-200/50 border border-white/10">
                    <h3 className="font-semibold text-gray-400 mb-2 flex items-center gap-2">
                      <Dumbbell className="w-4 h-4" /> Equipment Needed
                    </h3>
                    <p className="text-gray-300 text-sm">{selectedWorkout.equipmentNeeded}</p>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="p-6 border-t border-white/10 flex gap-3">
                {!selectedWorkout.completed && selectedWorkout.type !== 'rest' && (
                  <button
                    onClick={() => {
                      handleCompleteWorkout(selectedWorkout.weekNumber, selectedWorkout.day);
                      setSelectedWorkout(null);
                    }}
                    className="flex-1 py-3 bg-lime-500 hover:bg-lime-400 text-dark-500 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark as Complete
                  </button>
                )}
                <button
                  onClick={() => setSelectedWorkout(null)}
                  className="px-6 py-3 bg-dark-200 hover:bg-dark-100 text-white rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
