import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Clock, 
  Activity, 
  Dumbbell, 
  Bike, 
  Heart,
  TrendingUp,
  Flame,
  MapPin
} from 'lucide-react';

const TYPE_CONFIG = {
  run: { icon: Activity, color: 'lime', label: 'Run' },
  lift: { icon: Dumbbell, color: 'orange', label: 'Lift' },
  cardio: { icon: Bike, color: 'primary', label: 'Cardio' },
  biometrics: { icon: Heart, color: 'crimson', label: 'Biometrics' }
};

export default function WorkoutDetailModal({ workout, onClose }) {
  if (!workout) return null;
  
  const config = TYPE_CONFIG[workout.type] || TYPE_CONFIG.run;
  const Icon = config.icon;
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-dark-300 rounded-2xl w-full max-w-lg border border-white/10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`
            p-6 border-b border-white/10 relative
            ${config.color === 'lime' ? 'bg-lime-500/10' : ''}
            ${config.color === 'orange' ? 'bg-orange-500/10' : ''}
            ${config.color === 'primary' ? 'bg-primary-500/10' : ''}
            ${config.color === 'crimson' ? 'bg-crimson-500/10' : ''}
          `}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className={`
                w-14 h-14 rounded-xl flex items-center justify-center
                ${config.color === 'lime' ? 'bg-lime-500/20 text-lime-500' : ''}
                ${config.color === 'orange' ? 'bg-orange-500/20 text-orange-500' : ''}
                ${config.color === 'primary' ? 'bg-primary-500/20 text-primary-500' : ''}
                ${config.color === 'crimson' ? 'bg-crimson-500/20 text-crimson-500' : ''}
              `}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{workout.title}</h2>
                <p className="text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(workout.date)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              {workout.duration && (
                <div className="bg-dark-200/50 rounded-xl p-4 text-center">
                  <Clock className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{workout.duration}</p>
                  <p className="text-xs text-gray-400">minutes</p>
                </div>
              )}
              
              {workout.rpe && (
                <div className="bg-dark-200/50 rounded-xl p-4 text-center">
                  <Flame className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{workout.rpe}</p>
                  <p className="text-xs text-gray-400">RPE</p>
                </div>
              )}
              
              {/* Type-Specific Stats */}
              {workout.type === 'run' && workout.run?.distance && (
                <div className="bg-dark-200/50 rounded-xl p-4 text-center">
                  <TrendingUp className="w-5 h-5 text-lime-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{workout.run.distance.toFixed(1)}</p>
                  <p className="text-xs text-gray-400">kilometers</p>
                </div>
              )}
              
              {workout.type === 'cardio' && workout.cardio?.distance && (
                <div className="bg-dark-200/50 rounded-xl p-4 text-center">
                  <TrendingUp className="w-5 h-5 text-primary-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{workout.cardio.distance.toFixed(1)}</p>
                  <p className="text-xs text-gray-400">kilometers</p>
                </div>
              )}
            </div>
            
            {/* Run Details */}
            {workout.type === 'run' && workout.run && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Run Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  {workout.run.pace && (
                    <div className="flex items-center gap-3 bg-dark-200/30 rounded-lg p-3">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-400">Pace</p>
                        <p className="text-white font-medium">{workout.run.pace.toFixed(2)} min/km</p>
                      </div>
                    </div>
                  )}
                  {workout.run.avgHeartRate && (
                    <div className="flex items-center gap-3 bg-dark-200/30 rounded-lg p-3">
                      <Heart className="w-5 h-5 text-crimson-500" />
                      <div>
                        <p className="text-sm text-gray-400">Avg Heart Rate</p>
                        <p className="text-white font-medium">{workout.run.avgHeartRate} bpm</p>
                      </div>
                    </div>
                  )}
                  {workout.run.elevation && (
                    <div className="flex items-center gap-3 bg-dark-200/30 rounded-lg p-3">
                      <TrendingUp className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-400">Elevation</p>
                        <p className="text-white font-medium">{workout.run.elevation} m</p>
                      </div>
                    </div>
                  )}
                  {workout.run.terrain && (
                    <div className="flex items-center gap-3 bg-dark-200/30 rounded-lg p-3">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-400">Terrain</p>
                        <p className="text-white font-medium capitalize">{workout.run.terrain}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Lift Details */}
            {workout.type === 'lift' && workout.lift && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Exercises</h3>
                <div className="space-y-2">
                  {workout.lift.exercises?.map((exercise, i) => (
                    <div key={i} className="flex items-center justify-between bg-dark-200/30 rounded-lg p-3">
                      <span className="text-white font-medium">{exercise.name}</span>
                      <span className="text-gray-400">
                        {exercise.sets} × {exercise.reps} @ {exercise.weight} kg
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Cardio Details */}
            {workout.type === 'cardio' && workout.cardio && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Cardio Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  {workout.cardio.activity && (
                    <div className="flex items-center gap-3 bg-dark-200/30 rounded-lg p-3">
                      <Bike className="w-5 h-5 text-primary-500" />
                      <div>
                        <p className="text-sm text-gray-400">Activity</p>
                        <p className="text-white font-medium capitalize">{workout.cardio.activity}</p>
                      </div>
                    </div>
                  )}
                  {workout.cardio.calories && (
                    <div className="flex items-center gap-3 bg-dark-200/30 rounded-lg p-3">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-gray-400">Calories</p>
                        <p className="text-white font-medium">{workout.cardio.calories} kcal</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Notes */}
            {workout.notes && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Notes</h3>
                <p className="text-gray-300 bg-dark-200/30 rounded-lg p-4">{workout.notes}</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
