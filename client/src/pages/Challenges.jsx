import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Plus, 
  Users, 
  Calendar, 
  Target,
  TrendingUp,
  Clock,
  X,
  Copy,
  Check,
  ChevronRight,
  Search,
  Crown,
  Medal,
  Award,
  Pencil
} from 'lucide-react';
import { Button, Card, Input } from '../components/ui';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Challenge type configurations
const CHALLENGE_TYPES = {
  distance: { icon: '🏃', name: 'Distance', unit: 'km', color: 'lime' },
  duration: { icon: '⏱️', name: 'Duration', unit: 'min', color: 'primary' },
  workouts: { icon: '💪', name: 'Workouts', unit: 'count', color: 'orange' },
  calories: { icon: '🔥', name: 'Calories', unit: 'kcal', color: 'crimson' }
};

const CATEGORIES = [
  { id: 'general', name: 'General', icon: '⭐' },
  { id: 'running', name: 'Running', icon: '🏃' },
  { id: 'cycling', name: 'Cycling', icon: '🚴' },
  { id: 'strength', name: 'Strength', icon: '💪' },
  { id: 'yoga', name: 'Yoga', icon: '🧘' },
  { id: 'custom', name: 'Custom', icon: '✨' }
];

export default function Challenges() {
  const [activeTab, setActiveTab] = useState('active');
  const [challenges, setChallenges] = useState([]);
  const [discoverChallenges, setDiscoverChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [editingChallenge, setEditingChallenge] = useState(null);
  
  const tabs = [
    { id: 'active', name: 'Active', icon: TrendingUp },
    { id: 'upcoming', name: 'Upcoming', icon: Calendar },
    { id: 'discover', name: 'Discover', icon: Search },
    { id: 'completed', name: 'Completed', icon: Trophy }
  ];
  
  useEffect(() => {
    fetchChallenges();
    if (activeTab === 'discover') {
      fetchDiscoverChallenges();
    }
  }, [activeTab]);
  
  const fetchChallenges = async () => {
    try {
      const token = localStorage.getItem('token');
      const status = activeTab === 'discover' ? undefined : activeTab;
      const url = status 
        ? `${API_URL}/api/challenges?status=${status}`
        : `${API_URL}/api/challenges`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setChallenges(data.data);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchDiscoverChallenges = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/challenges/discover`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDiscoverChallenges(data.data);
      }
    } catch (error) {
      console.error('Error fetching discover challenges:', error);
    }
  };
  
  const handleJoinChallenge = async (challengeId, inviteCode = null) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/challenges/${challengeId}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inviteCode })
      });
      const data = await res.json();
      if (data.success) {
        fetchChallenges();
        fetchDiscoverChallenges();
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };
  
  const displayedChallenges = activeTab === 'discover' ? discoverChallenges : challenges;
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary-500" />
            Challenges
          </h1>
          <p className="text-gray-400 mt-1">Compete with friends and achieve your goals</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} icon={Plus}>
          Create Challenge
        </Button>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-dark-100'
                  : 'bg-dark-200/50 text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>
      
      {/* Challenges Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-dark-200/50 rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : displayedChallenges.length === 0 ? (
        <Card padding="p-12" className="text-center">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {activeTab === 'discover' ? 'No challenges to discover' : `No ${activeTab} challenges`}
          </h3>
          <p className="text-gray-400 mb-6">
            {activeTab === 'discover'
              ? 'Check back later for new public challenges'
              : 'Create your first challenge and invite friends!'}
          </p>
          <Button onClick={() => setShowCreateModal(true)} icon={Plus}>
            Create Challenge
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge._id}
              challenge={challenge}
              onJoin={handleJoinChallenge}
              onClick={() => setSelectedChallenge(challenge)}
              isDiscover={activeTab === 'discover'}
            />
          ))}
        </div>
      )}
      
      {/* Create Challenge Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateChallengeModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchChallenges();
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Challenge Detail Modal */}
      <AnimatePresence>
        {selectedChallenge && (
          <ChallengeDetailModal
            challenge={selectedChallenge}
            onClose={() => setSelectedChallenge(null)}
            onJoin={handleJoinChallenge}
            onEdit={(challenge) => {
              setSelectedChallenge(null);
              setEditingChallenge(challenge);
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Edit Challenge Modal */}
      <AnimatePresence>
        {editingChallenge && (
          <EditChallengeModal
            challenge={editingChallenge}
            onClose={() => setEditingChallenge(null)}
            onSuccess={() => {
              setEditingChallenge(null);
              fetchChallenges();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Challenge Card Component
function ChallengeCard({ challenge, onJoin, onClick, isDiscover }) {
  const typeConfig = CHALLENGE_TYPES[challenge.type];
  // Use userProgressPercent from API if available, fallback to calculation
  const progressPercent = challenge.userProgressPercent ?? 0;
  const userProgress = challenge.userProgress ?? 0;
  
  const daysRemaining = Math.max(0, Math.ceil(
    (new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)
  ));
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-dark-200/50 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* Header with category color */}
      <div className={`h-2 bg-${typeConfig.color}-500`} />
      
      <div className="p-6">
        {/* Title & Type */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white text-lg mb-1">{challenge.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{typeConfig.icon}</span>
              <span>{typeConfig.name}</span>
              <span>•</span>
              <Users className="w-4 h-4" />
              <span>{challenge.participants?.length || 0}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            challenge.status === 'active' 
              ? 'bg-lime-500/20 text-lime-400'
              : challenge.status === 'upcoming'
              ? 'bg-primary-500/20 text-primary-400'
              : 'bg-gray-500/20 text-gray-400'
          }`}>
            {challenge.status}
          </div>
        </div>
        
        {/* Target */}
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-primary-500" />
          <span className="text-white font-medium">{challenge.target}</span>
          <span className="text-gray-400">{challenge.unit}</span>
        </div>
        
        {/* Progress Bar (for participating challenges) */}
        {!isDiscover && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Your Progress</span>
              <span className="text-primary-400">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-primary-500 to-lime-500 rounded-full"
              />
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{daysRemaining} days left</span>
          </div>
          
          {isDiscover ? (
            <Button 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onJoin(challenge._id);
              }}
            >
              Join
            </Button>
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Create Challenge Modal
function CreateChallengeModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'workouts',
    target: '',
    category: 'general',
    visibility: 'public',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const typeConfig = CHALLENGE_TYPES[formData.type];
      
      const res = await fetch(`${API_URL}/api/challenges`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          target: parseInt(formData.target),
          unit: typeConfig.unit
        })
      });
      
      const data = await res.json();
      if (data.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-dark-100 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Create Challenge</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Input
            label="Challenge Title"
            placeholder="e.g., January Running Challenge"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              placeholder="Describe your challenge..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-dark-200/50 border border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Challenge Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(CHALLENGE_TYPES).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: key })}
                  className={`p-4 rounded-xl border transition-all ${
                    formData.type === key
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-2xl">{config.icon}</span>
                  <p className="text-white font-medium mt-2">{config.name}</p>
                  <p className="text-gray-400 text-sm">{config.unit}</p>
                </button>
              ))}
            </div>
          </div>
          
          <Input
            label={`Target (${CHALLENGE_TYPES[formData.type].unit})`}
            type="number"
            placeholder="e.g., 100"
            value={formData.target}
            onChange={(e) => setFormData({ ...formData, target: e.target.value })}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Visibility</label>
            <div className="flex gap-3">
              {['public', 'invite-only', 'private'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setFormData({ ...formData, visibility: v })}
                  className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    formData.visibility === v
                      ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                      : 'border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={onClose} fullWidth>
              Cancel
            </Button>
            <Button type="submit" loading={loading} fullWidth>
              Create Challenge
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// Challenge Detail Modal
function ChallengeDetailModal({ challenge, onClose, onJoin, onEdit }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const isCreator = challenge.creator?._id === JSON.parse(atob(localStorage.getItem('token')?.split('.')[1] || 'e30='))?.id;
  
  const typeConfig = CHALLENGE_TYPES[challenge.type];
  
  useEffect(() => {
    fetchLeaderboard();
  }, []);
  
  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/challenges/${challenge._id}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const copyInviteCode = () => {
    if (challenge.inviteCode) {
      navigator.clipboard.writeText(challenge.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const syncProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/challenges/${challenge._id}/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLeaderboard();
    } catch (error) {
      console.error('Error syncing progress:', error);
    }
  };
  
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-orange-400" />;
      default: return <span className="text-gray-400 font-medium">{rank}</span>;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-dark-100 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`h-2 bg-${typeConfig.color}-500`} />
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{challenge.title}</h2>
              <p className="text-gray-400 mt-1">{challenge.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {isCreator && (
                <button 
                  onClick={() => onEdit(challenge)} 
                  className="p-2 hover:bg-white/5 rounded-lg"
                  title="Edit Challenge"
                >
                  <Pencil className="w-5 h-5 text-primary-400" />
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="p-6 grid grid-cols-3 gap-4 border-b border-white/10">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{challenge.target}</p>
            <p className="text-gray-400 text-sm">{challenge.unit} Target</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{challenge.participants?.length || 0}</p>
            <p className="text-gray-400 text-sm">Participants</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">
              {Math.max(0, Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)))}
            </p>
            <p className="text-gray-400 text-sm">Days Left</p>
          </div>
        </div>
        
        {/* Invite Code (if invite-only) */}
        {challenge.inviteCode && (
          <div className="px-6 py-4 border-b border-white/10">
            <p className="text-sm text-gray-400 mb-2">Invite Code</p>
            <div className="flex items-center gap-3">
              <code className="flex-1 px-4 py-2 bg-dark-200 rounded-lg text-primary-400 font-mono text-lg">
                {challenge.inviteCode}
              </code>
              <Button size="sm" variant="ghost" onClick={copyInviteCode}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
        
        {/* Leaderboard */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary-500" />
              Leaderboard
            </h3>
            <Button size="sm" variant="ghost" onClick={syncProgress}>
              Sync Progress
            </Button>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-dark-200/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No participants yet</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((participant, index) => (
                <motion.div
                  key={participant.user?._id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    index < 3 ? 'bg-gradient-to-r from-primary-500/10 to-transparent' : 'bg-dark-200/30'
                  }`}
                >
                  <div className="w-8 flex justify-center">
                    {getRankIcon(participant.rank)}
                  </div>
                  <img
                    src={participant.user?.avatar || `https://ui-avatars.com/api/?name=${participant.user?.name}&background=random`}
                    alt={participant.user?.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-white">{participant.user?.name}</p>
                    <p className="text-sm text-gray-400">
                      {participant.progress} / {challenge.target} {challenge.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-400">
                      {participant.progressPercent}%
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Edit Challenge Modal
function EditChallengeModal({ challenge, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: challenge.title || '',
    description: challenge.description || '',
    target: challenge.target || '',
    startDate: challenge.startDate?.split('T')[0] || '',
    endDate: challenge.endDate?.split('T')[0] || '',
    visibility: challenge.visibility || 'public'
  });
  
  const typeConfig = CHALLENGE_TYPES[challenge.type];
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_URL}/api/challenges/${challenge._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          target: parseInt(formData.target),
          unit: challenge.unit
        })
      });
      
      const data = await res.json();
      if (data.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating challenge:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-dark-100 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Edit Challenge</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Input
            label="Challenge Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-dark-200/50 border border-white/10 text-white"
            />
          </div>
          
          <div className="p-4 bg-dark-200/30 rounded-xl">
            <p className="text-sm text-gray-400 mb-2">Challenge Type</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{typeConfig.icon}</span>
              <span className="text-white font-medium">{typeConfig.name}</span>
            </div>
          </div>
          
          <Input
            label={`Target (${challenge.unit})`}
            type="number"
            value={formData.target}
            onChange={(e) => setFormData({ ...formData, target: e.target.value })}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={onClose} fullWidth>Cancel</Button>
            <Button type="submit" loading={loading} fullWidth>Save Changes</Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
