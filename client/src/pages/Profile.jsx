import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User,
  Calendar,
  Award,
  TrendingUp,
  Users,
  UserPlus,
  UserMinus,
  Settings,
  Lock
} from 'lucide-react';
import { Card, Button, LoadingSpinner } from '../components/ui';
import { userAPI, feedAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [following, setFollowing] = useState(false);
  
  const isOwnProfile = !id || id === currentUser?._id;
  
  useEffect(() => {
    fetchProfile();
  }, [id]);
  
  const fetchProfile = async () => {
    setLoading(true);
    try {
      let response;
      if (isOwnProfile) {
        response = await userAPI.getMyProfile();
      } else {
        response = await userAPI.getPublicProfile(id);
      }
      setProfile(response.data.data);
      setFollowing(response.data.data.isFollowing || false);
      
      // Fetch activities if profile is viewable
      if (response.data.data.isPublic !== false || isOwnProfile) {
        const activitiesRes = await feedAPI.getUserActivities(id || currentUser._id);
        setActivities(activitiesRes.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFollow = async () => {
    try {
      if (following) {
        await userAPI.unfollow(id);
        setFollowing(false);
        setProfile(prev => ({
          ...prev,
          stats: { ...prev.stats, followers: prev.stats.followers - 1 }
        }));
      } else {
        await userAPI.follow(id);
        setFollowing(true);
        setProfile(prev => ({
          ...prev,
          stats: { ...prev.stats, followers: prev.stats.followers + 1 }
        }));
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }
  
  if (!profile) {
    return (
      <Card className="text-center py-16">
        <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Profile Not Found</h3>
        <p className="text-gray-400">This user doesn't exist or has been deleted.</p>
      </Card>
    );
  }
  
  // Private profile
  if (profile.isPublic === false && !isOwnProfile && !following) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center py-16">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold mb-4">
            {profile.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{profile.name}</h2>
          <div className="flex items-center justify-center gap-1 text-gray-400 mb-6">
            <Lock className="w-4 h-4" />
            Private Profile
          </div>
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{profile.followersCount || 0}</p>
              <p className="text-sm text-gray-400">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{profile.followingCount || 0}</p>
              <p className="text-sm text-gray-400">Following</p>
            </div>
          </div>
          <Button icon={UserPlus} onClick={handleFollow}>
            Follow to View
          </Button>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card glow className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-4xl md:text-5xl font-bold flex-shrink-0">
            {profile.name?.charAt(0).toUpperCase()}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{profile.name}</h1>
              {profile.sport && (
                <span className="px-3 py-1 bg-primary-500/20 text-primary-500 text-sm rounded-full capitalize">
                  {profile.sport}
                </span>
              )}
            </div>
            
            {profile.bio && (
              <p className="text-gray-400 mb-4">{profile.bio}</p>
            )}
            
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{profile.stats?.workouts || 0}</p>
                <p className="text-sm text-gray-400">Workouts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{profile.stats?.badges || 0}</p>
                <p className="text-sm text-gray-400">Badges</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{profile.stats?.followers || 0}</p>
                <p className="text-sm text-gray-400">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{profile.stats?.following || 0}</p>
                <p className="text-sm text-gray-400">Following</p>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            {isOwnProfile ? (
              <Button variant="secondary" icon={Settings} onClick={() => navigate('/dashboard/settings')}>
                Edit Profile
              </Button>
            ) : (
              <Button 
                icon={following ? UserMinus : UserPlus}
                variant={following ? 'secondary' : 'primary'}
                onClick={handleFollow}
              >
                {following ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </div>
        </div>
      </Card>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: 'Workouts', value: profile.stats?.workouts || 0, color: 'primary' },
          { icon: Award, label: 'Badges', value: profile.stats?.badges || 0, color: 'yellow' },
          { icon: Users, label: 'Followers', value: profile.stats?.followers || 0, color: 'purple' },
          { icon: Calendar, label: 'Member Since', value: (() => {
            const dateStr = profile.joinedAt || profile.createdAt;
            if (!dateStr) return 'N/A';
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          })(), color: 'lime' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="text-center">
              <stat.icon className={`w-6 h-6 mx-auto mb-2 text-${stat.color}-500`} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Recent Workouts */}
      {profile.recentWorkouts && profile.recentWorkouts.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Recent Workouts</h3>
          <div className="space-y-3">
            {profile.recentWorkouts.map((workout, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-dark-200/50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {workout.type === 'run' && '🏃'}
                    {workout.type === 'lift' && '🏋️'}
                    {workout.type === 'cardio' && '❤️'}
                    {workout.type === 'biometrics' && '📊'}
                  </span>
                  <div>
                    <p className="font-medium text-white capitalize">{workout.type}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(workout.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">{workout.duration} min</p>
                  {(workout.run?.distance || workout.cardio?.distance) && (
                    <p className="text-sm text-gray-400">
                      {workout.run?.distance || workout.cardio?.distance} km
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Badges */}
      {profile.badges && profile.badges.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Earned Badges</h3>
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((badgeId, i) => (
              <div key={i} className="px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl text-sm text-yellow-500">
                🏅 {badgeId.replace(/_/g, ' ')}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
