import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users,
  Heart,
  MessageCircle,
  Send,
  Search,
  X,
  Timer,
  MapPin
} from 'lucide-react';
import { Card, Button, LoadingSpinner } from '../components/ui';
import { feedAPI, userAPI } from '../services/api';

export default function Feed() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [commentText, setCommentText] = useState({});
  
  useEffect(() => {
    fetchFeed();
  }, []);
  
  const fetchFeed = async (pageNum = 1) => {
    try {
      const response = await feedAPI.getFeed(pageNum);
      if (pageNum === 1) {
        setActivities(response.data.data);
      } else {
        setActivities(prev => [...prev, ...response.data.data]);
      }
      setHasMore(response.data.pagination.page < response.data.pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch feed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLike = async (activityId) => {
    try {
      const response = await feedAPI.like(activityId);
      setActivities(prev => prev.map(a => 
        a._id === activityId 
          ? { ...a, isLiked: response.data.liked, likeCount: response.data.likeCount }
          : a
      ));
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };
  
  const handleComment = async (activityId) => {
    const text = commentText[activityId];
    if (!text?.trim()) return;
    
    try {
      const response = await feedAPI.comment(activityId, text);
      setActivities(prev => prev.map(a => 
        a._id === activityId 
          ? { ...a, comments: [...(a.comments || []), response.data.data], commentCount: (a.commentCount || 0) + 1 }
          : a
      ));
      setCommentText(prev => ({ ...prev, [activityId]: '' }));
    } catch (error) {
      console.error('Failed to comment:', error);
    }
  };
  
  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await userAPI.search(q);
      setSearchResults(response.data.data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };
  
  const handleFollow = async (userId) => {
    try {
      await userAPI.follow(userId);
      setSearchResults(prev => prev.filter(u => u._id !== userId));
    } catch (error) {
      console.error('Failed to follow:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading feed..." />
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-500" />
            Activity Feed
          </h1>
          <p className="text-gray-400">See what your friends are up to</p>
        </div>
        
        <Button 
          variant="secondary" 
          icon={Search}
          onClick={() => setShowSearch(!showSearch)}
        >
          Find Friends
        </Button>
      </div>
      
      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search users..."
                  className="flex-1 bg-dark-200/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map(user => (
                    <div key={user._id} className="flex items-center justify-between p-3 rounded-xl bg-dark-200/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          {user.bio && <p className="text-sm text-gray-400 truncate max-w-[200px]">{user.bio}</p>}
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleFollow(user._id)}>
                        Follow
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {searchQuery.length >= 2 && searchResults.length === 0 && (
                <p className="text-center text-gray-400 py-4">No users found</p>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Activity Feed */}
      <div className="space-y-4">
        <AnimatePresence>
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  {/* Activity Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <Link to={`/dashboard/profile/${activity.user?._id}`}>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {activity.user?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    </Link>
                    <div className="flex-1">
                      <Link to={`/dashboard/profile/${activity.user?._id}`} className="font-semibold text-white hover:text-primary-500">
                        {activity.user?.name || 'Unknown User'}
                      </Link>
                      <p className="text-sm text-gray-400">
                        {new Date(activity.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${activity.type === 'workout' ? 'bg-primary-500/20 text-primary-500' :
                        activity.type === 'badge' ? 'bg-yellow-500/20 text-yellow-500' :
                        activity.type === 'pr' ? 'bg-lime-500/20 text-lime-500' :
                        activity.type === 'goal_completed' ? 'bg-purple-500/20 text-purple-500' :
                        'bg-gray-500/20 text-gray-400'}
                    `}>
                      {activity.type.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {/* Activity Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-1">{activity.title}</h3>
                    {activity.description && (
                      <p className="text-gray-400">{activity.description}</p>
                    )}
                    
                    {/* Workout metadata */}
                    {activity.metadata && (
                      <div className="flex items-center gap-4 mt-3">
                        {activity.metadata.duration && (
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Timer className="w-4 h-4" />
                            {activity.metadata.duration} min
                          </div>
                        )}
                        {activity.metadata.distance && (
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <MapPin className="w-4 h-4" />
                            {activity.metadata.distance} km
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-6 border-t border-white/10 pt-4">
                    <button
                      onClick={() => handleLike(activity._id)}
                      className={`flex items-center gap-2 transition-colors ${
                        activity.isLiked ? 'text-crimson-500' : 'text-gray-400 hover:text-crimson-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${activity.isLiked ? 'fill-current' : ''}`} />
                      <span>{activity.likeCount || 0}</span>
                    </button>
                    
                    <button className="flex items-center gap-2 text-gray-400 hover:text-primary-500 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span>{activity.commentCount || 0}</span>
                    </button>
                  </div>
                  
                  {/* Comments */}
                  {activity.comments && activity.comments.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                      {activity.comments.slice(-3).map((comment, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-dark-200 flex items-center justify-center text-xs text-gray-400">
                            {comment.user?.name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1 bg-dark-200/50 rounded-lg px-3 py-2">
                            <span className="font-medium text-white text-sm">{comment.user?.name}</span>
                            <p className="text-gray-300 text-sm">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Comment */}
                  <div className="flex items-center gap-2 mt-4">
                    <input
                      type="text"
                      value={commentText[activity._id] || ''}
                      onChange={(e) => setCommentText(prev => ({ ...prev, [activity._id]: e.target.value }))}
                      placeholder="Add a comment..."
                      className="flex-1 bg-dark-200/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-primary-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleComment(activity._id)}
                    />
                    <button
                      onClick={() => handleComment(activity._id)}
                      className="p-2 rounded-lg bg-primary-500 text-dark-500 hover:bg-primary-400"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="text-center py-16">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Activities Yet</h3>
              <p className="text-gray-400 mb-6">
                Follow other athletes to see their activities here!
              </p>
              <Button icon={Search} onClick={() => setShowSearch(true)}>
                Find Friends
              </Button>
            </Card>
          )}
        </AnimatePresence>
        
        {/* Load More */}
        {hasMore && activities.length > 0 && (
          <div className="text-center">
            <Button variant="secondary" onClick={() => fetchFeed(page + 1)}>
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
