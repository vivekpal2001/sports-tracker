import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Dumbbell, 
  Bike, 
  Heart,
  Calendar,
  Clock,
  Trash2,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { Card, Button, LoadingSpinner } from '../components/ui';
import { workoutAPI } from '../services/api';

const TYPE_CONFIG = {
  run: { icon: Activity, color: 'lime', label: 'Run' },
  lift: { icon: Dumbbell, color: 'orange', label: 'Lift' },
  cardio: { icon: Bike, color: 'primary', label: 'Cardio' },
  biometrics: { icon: Heart, color: 'crimson', label: 'Biometrics' }
};

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState(null);
  
  useEffect(() => {
    fetchWorkouts();
  }, [filter]);
  
  const fetchWorkouts = async () => {
    try {
      const params = { limit: 50 };
      if (filter !== 'all') params.type = filter;
      
      const response = await workoutAPI.getAll(params);
      setWorkouts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch workouts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;
    
    setDeleting(id);
    try {
      await workoutAPI.delete(id);
      setWorkouts(prev => prev.filter(w => w._id !== id));
    } catch (error) {
      console.error('Failed to delete workout:', error);
    } finally {
      setDeleting(null);
    }
  };
  
  const filteredWorkouts = workouts.filter(w => 
    w.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading workouts..." />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Workouts</h1>
          <p className="text-gray-400">{workouts.length} total workouts logged</p>
        </div>
        <Link to="/dashboard/log-workout">
          <Button icon={Plus}>Log Workout</Button>
        </Link>
      </div>
      
      {/* Filters */}
      <Card padding="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search workouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-dark-300/50 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>
          
          {/* Type Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'run', label: 'Runs' },
              { id: 'lift', label: 'Lifts' },
              { id: 'cardio', label: 'Cardio' },
              { id: 'biometrics', label: 'Biometrics' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                  ${filter === f.id 
                    ? 'bg-primary-500 text-dark-500' 
                    : 'bg-dark-300/50 text-gray-400 hover:text-white'}
                `}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>
      
      {/* Workouts List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredWorkouts.length > 0 ? (
            filteredWorkouts.map((workout, i) => {
              const config = TYPE_CONFIG[workout.type];
              const Icon = config?.icon || Activity;
              
              return (
                <motion.div
                  key={workout._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                  layout
                >
                  <Card hover={false} className="flex items-center gap-4 py-4">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                      ${config?.color === 'lime' ? 'bg-lime-500/20 text-lime-500' : ''}
                      ${config?.color === 'orange' ? 'bg-orange-500/20 text-orange-500' : ''}
                      ${config?.color === 'primary' ? 'bg-primary-500/20 text-primary-500' : ''}
                      ${config?.color === 'crimson' ? 'bg-crimson-500/20 text-crimson-500' : ''}
                    `}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{workout.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(workout.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        {workout.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {workout.duration} min
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-6">
                      {workout.type === 'run' && workout.run?.distance && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            {workout.run.distance.toFixed(1)} km
                          </div>
                          {workout.run.pace && (
                            <div className="text-xs text-gray-400">
                              {workout.run.pace.toFixed(1)} min/km
                            </div>
                          )}
                        </div>
                      )}
                      {workout.type === 'cardio' && workout.cardio?.distance && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            {workout.cardio.distance.toFixed(1)} km
                          </div>
                          <div className="text-xs text-gray-400">{workout.cardio.activity}</div>
                        </div>
                      )}
                      {workout.rpe && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            {workout.rpe}
                          </div>
                          <div className="text-xs text-gray-400">RPE</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <button
                      onClick={() => handleDelete(workout._id)}
                      disabled={deleting === workout._id}
                      className="p-2 rounded-lg hover:bg-crimson-500/10 text-gray-400 hover:text-crimson-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Card className="text-center py-16">
              <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No workouts found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery ? 'Try a different search term' : 'Start logging your workouts to see them here'}
              </p>
              <Link to="/dashboard/log-workout">
                <Button icon={Plus}>Log Your First Workout</Button>
              </Link>
            </Card>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
