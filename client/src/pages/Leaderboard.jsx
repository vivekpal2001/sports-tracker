import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Trophy,
  Medal,
  Crown,
  Timer,
  MapPin,
  Dumbbell,
  Users,
  Globe
} from 'lucide-react';
import { Card, Button, LoadingSpinner } from '../components/ui';
import { leaderboardAPI } from '../services/api';

const PERIODS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' }
];

const METRICS = [
  { value: 'workouts', label: 'Workouts', icon: Dumbbell },
  { value: 'distance', label: 'Distance', icon: MapPin },
  { value: 'duration', label: 'Duration', icon: Timer }
];

export default function Leaderboard() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [metric, setMetric] = useState('workouts');
  const [tab, setTab] = useState('friends'); // friends or global
  const [leaderboard, setLeaderboard] = useState([]);
  
  useEffect(() => {
    fetchLeaderboard();
  }, [period, metric, tab]);
  
  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = tab === 'friends'
        ? await leaderboardAPI.getFriends(period, metric)
        : await leaderboardAPI.getGlobal(period, metric);
      
      setLeaderboard(response.data.data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatValue = (value, metric) => {
    if (metric === 'distance') {
      return `${(value || 0).toFixed(1)} km`;
    } else if (metric === 'duration') {
      const hours = Math.floor((value || 0) / 60);
      const mins = (value || 0) % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }
    return value || 0;
  };
  
  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 text-center font-bold text-gray-400">{rank}</span>;
  };
  
  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
    if (rank === 2) return 'from-gray-400/20 to-gray-500/20 border-gray-400/30';
    if (rank === 3) return 'from-amber-600/20 to-orange-600/20 border-amber-600/30';
    return '';
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-gray-400">Compete with friends and athletes worldwide</p>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('friends')}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
            ${tab === 'friends' 
              ? 'bg-primary-500 text-dark-500' 
              : 'bg-dark-300 text-gray-400 hover:text-white'}
          `}
        >
          <Users className="w-5 h-5" />
          Friends
        </button>
        <button
          onClick={() => setTab('global')}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
            ${tab === 'global' 
              ? 'bg-primary-500 text-dark-500' 
              : 'bg-dark-300 text-gray-400 hover:text-white'}
          `}
        >
          <Globe className="w-5 h-5" />
          Global
        </button>
      </div>
      
      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Period */}
          <div className="flex-1">
            <label className="text-sm text-gray-400 mb-2 block">Time Period</label>
            <div className="flex flex-wrap gap-2">
              {PERIODS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${period === p.value 
                      ? 'bg-primary-500/20 text-primary-500 border border-primary-500/30' 
                      : 'bg-dark-200/50 text-gray-400 hover:text-white'}
                  `}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Metric */}
          <div className="flex-1">
            <label className="text-sm text-gray-400 mb-2 block">Metric</label>
            <div className="flex flex-wrap gap-2">
              {METRICS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMetric(m.value)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${metric === m.value 
                      ? 'bg-primary-500/20 text-primary-500 border border-primary-500/30' 
                      : 'bg-dark-200/50 text-gray-400 hover:text-white'}
                  `}
                >
                  <m.icon className="w-4 h-4" />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Leaderboard */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" text="Loading rankings..." />
        </div>
      ) : leaderboard.length > 0 ? (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`
                relative overflow-hidden transition-all
                ${entry.isCurrentUser ? 'ring-2 ring-primary-500' : ''}
                ${entry.rank <= 3 ? `bg-gradient-to-r ${getRankColor(entry.rank)}` : ''}
              `}>
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-12 h-12 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  {/* Avatar */}
                  <Link to={`/dashboard/profile/${entry.userId}`}>
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg
                      ${entry.rank === 1 ? 'bg-gradient-to-br from-yellow-500 to-amber-500' :
                        entry.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                        entry.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-orange-600' :
                        'bg-gradient-to-br from-primary-500 to-purple-500'}
                    `}>
                      {entry.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  </Link>
                  
                  {/* Name */}
                  <div className="flex-1">
                    <Link to={`/dashboard/profile/${entry.userId}`} className="font-semibold text-white hover:text-primary-500">
                      {entry.name}
                      {entry.isCurrentUser && <span className="ml-2 text-xs text-primary-500">(You)</span>}
                    </Link>
                    <p className="text-sm text-gray-400">{entry.count} workouts</p>
                  </div>
                  
                  {/* Value */}
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      entry.rank === 1 ? 'text-yellow-400' :
                      entry.rank === 2 ? 'text-gray-300' :
                      entry.rank === 3 ? 'text-amber-500' :
                      'text-white'
                    }`}>
                      {formatValue(entry.value, metric)}
                    </p>
                    <p className="text-sm text-gray-400 capitalize">{metric}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Rankings Yet</h3>
          <p className="text-gray-400 mb-6">
            {tab === 'friends' 
              ? 'Follow more athletes and log workouts to see rankings!' 
              : 'Start logging workouts to appear on the leaderboard!'}
          </p>
          <Link to="/dashboard/log-workout">
            <Button>Log a Workout</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
