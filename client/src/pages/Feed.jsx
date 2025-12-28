import { useState, useEffect, useRef } from 'react';
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
  MapPin,
  Plus,
  Image,
  Sparkles,
  Trash2,
  Upload
} from 'lucide-react';
import { Card, Button, LoadingSpinner } from '../components/ui';
import { feedAPI, userAPI, uploadAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const POST_TYPES = [
  { value: 'text', label: '💭 Update', description: 'Share your thoughts' },
  { value: 'motivation', label: '💪 Motivation', description: 'Inspire others' },
  { value: 'progress', label: '📈 Progress', description: 'Show your gains' },
  { value: 'photo', label: '📸 Photo', description: 'Share a pic' }
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function Feed() {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [commentText, setCommentText] = useState({});
  const fileInputRef = useRef(null);
  
  // Create post state
  const [newPost, setNewPost] = useState({
    content: '',
    postType: 'text',
    images: []
  });
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  
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
  
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
        // Create preview URL
        setPreviewImages(prev => [...prev, URL.createObjectURL(files[i])]);
      }
      
      const response = await uploadAPI.images(formData);
      
      // Add uploaded URLs to post
      setNewPost(prev => ({
        ...prev,
        postType: 'photo',
        images: [...prev.images, ...response.data.data.map(img => ({ url: img.url }))]
      }));
    } catch (error) {
      console.error('Failed to upload images:', error);
      alert('Failed to upload images. Max 5MB per image.');
    } finally {
      setUploading(false);
    }
  };
  
  const removeImage = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setNewPost(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  const handleCreatePost = async () => {
    if (!newPost.content.trim()) return;
    
    setPosting(true);
    try {
      const response = await feedAPI.createPost({
        content: newPost.content,
        postType: newPost.postType,
        images: newPost.images
      });
      
      // Add new post to top of feed
      setActivities(prev => [response.data.data, ...prev]);
      setShowCreatePost(false);
      setNewPost({ content: '', postType: 'text', images: [] });
      setPreviewImages([]);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setPosting(false);
    }
  };
  
  const handleDeletePost = async (activityId) => {
    if (!confirm('Delete this post?')) return;
    
    try {
      await feedAPI.deletePost(activityId);
      setActivities(prev => prev.filter(a => a._id !== activityId));
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };
  
  const REACTIONS = ['💪', '🔥', '⚡', '🎯', '❤️'];
  const [showReactions, setShowReactions] = useState({});
  
  const handleReaction = async (activityId, reactionType) => {
    try {
      const response = await feedAPI.react(activityId, reactionType);
      setActivities(prev => prev.map(a => 
        a._id === activityId 
          ? { 
              ...a, 
              isLiked: response.data.reacted,
              userReaction: response.data.reactionType,
              reactionCount: response.data.reactionCount,
              reactions: response.data.reactions
            }
          : a
      ));
      setShowReactions(prev => ({ ...prev, [activityId]: false }));
    } catch (error) {
      console.error('Failed to react:', error);
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
          <p className="text-gray-400">Share updates and connect with athletes</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            icon={Plus}
            onClick={() => setShowCreatePost(true)}
          >
            Post
          </Button>
          <Button 
            variant="secondary" 
            icon={Search}
            onClick={() => setShowSearch(!showSearch)}
          >
            Find
          </Button>
        </div>
      </div>
      
      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={() => setShowCreatePost(false)}
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
                <h2 className="text-lg sm:text-xl font-bold text-white">Create Post</h2>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                {/* Post Type Selector */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Post Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {POST_TYPES.map(type => (
                      <button
                        key={type.value}
                        onClick={() => setNewPost(prev => ({ ...prev, postType: type.value }))}
                        className={`
                          p-3 rounded-xl text-left transition-all border-2
                          ${newPost.postType === type.value 
                            ? 'border-primary-500 bg-primary-500/10' 
                            : 'border-transparent bg-dark-200/50 hover:bg-dark-200'}
                        `}
                      >
                        <span className="font-medium text-white text-sm">{type.label}</span>
                        <p className="text-xs text-gray-400">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Content Input */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">What's on your mind?</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Share your thoughts, progress, or motivation..."
                    rows={4}
                    maxLength={2000}
                    className="w-full bg-dark-200/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">{newPost.content.length}/2000</p>
                </div>
                
                {/* Image Upload Section */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Add Photos</label>
                  
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  
                  {/* Image Previews */}
                  {previewImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {previewImages.map((src, i) => (
                        <div key={i} className="relative group">
                          <img 
                            src={src} 
                            alt={`Preview ${i + 1}`} 
                            className="w-full h-32 object-cover rounded-xl"
                          />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || previewImages.length >= 4}
                    className="w-full border-2 border-dashed border-white/10 rounded-xl p-4 text-center hover:border-primary-500/50 transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <Upload className="w-5 h-5" />
                        <span>{previewImages.length >= 4 ? 'Max 4 images' : 'Upload Images'}</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-4 sm:p-6 border-t border-white/10 flex-shrink-0">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="flex-1 py-3 bg-dark-200 hover:bg-dark-100 text-white rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPost.content.trim() || posting}
                    className="flex-1 py-3 bg-primary-500 hover:bg-primary-400 text-dark-500 font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {posting ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Post
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
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
                    <div className="flex items-center gap-2">
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${activity.type === 'workout' ? 'bg-primary-500/20 text-primary-500' :
                          activity.type === 'badge' ? 'bg-yellow-500/20 text-yellow-500' :
                          activity.type === 'pr' ? 'bg-lime-500/20 text-lime-500' :
                          activity.type === 'goal_completed' ? 'bg-purple-500/20 text-purple-500' :
                          activity.type === 'post' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'}
                      `}>
                        {activity.type === 'post' ? activity.postType?.replace('_', ' ') : activity.type.replace('_', ' ')}
                      </span>
                      {/* Delete button for own posts */}
                      {activity.user?._id === currentUser?._id && activity.type === 'post' && (
                        <button
                          onClick={() => handleDeletePost(activity._id)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-crimson-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Activity Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-1">{activity.title}</h3>
                    {activity.content && (
                      <p className="text-gray-300 whitespace-pre-wrap">{activity.content}</p>
                    )}
                    {!activity.content && activity.description && (
                      <p className="text-gray-400">{activity.description}</p>
                    )}
                    
                    {/* Images */}
                    {activity.images && activity.images.length > 0 && (
                      <div className="mt-3 grid gap-2">
                        {activity.images.map((img, i) => (
                          <img 
                            key={i} 
                            src={img.url.startsWith('http') ? img.url : `${API_URL}${img.url}`} 
                            alt={img.caption || 'Post image'} 
                            className="w-full rounded-xl object-cover max-h-96" 
                          />
                        ))}
                      </div>
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
                  {/* User Badges */}
                  {activity.userBadges && activity.userBadges.length > 0 && (
                    <div className="flex items-center gap-1 mb-3">
                      {activity.userBadges.map((badge, i) => (
                        <span key={i} className="text-lg" title={badge.replace(/_/g, ' ')}>
                          {badge.includes('run') ? '🏃' : badge.includes('lift') ? '🏋️' : badge.includes('streak') ? '🔥' : '🏅'}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Actions with Reactions */}
                  <div className="flex items-center gap-6 border-t border-white/10 pt-4 relative">
                    {/* Reaction Button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowReactions(prev => ({ ...prev, [activity._id]: !prev[activity._id] }))}
                        onMouseEnter={() => setShowReactions(prev => ({ ...prev, [activity._id]: true }))}
                        className={`flex items-center gap-2 transition-colors ${
                          activity.isLiked ? 'text-primary-500' : 'text-gray-400 hover:text-primary-500'
                        }`}
                      >
                        <span className="text-xl">{activity.userReaction || '❤️'}</span>
                        <span>{activity.reactionCount || 0}</span>
                      </button>
                      
                      {/* Reaction Picker */}
                      <AnimatePresence>
                        {showReactions[activity._id] && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            onMouseLeave={() => setShowReactions(prev => ({ ...prev, [activity._id]: false }))}
                            className="absolute bottom-full left-0 mb-2 p-2 bg-dark-400 rounded-2xl border border-white/10 shadow-xl flex gap-1 z-10"
                          >
                            {REACTIONS.map(r => (
                              <button
                                key={r}
                                onClick={() => handleReaction(activity._id, r)}
                                className={`
                                  text-2xl p-2 rounded-xl transition-all hover:scale-125 hover:bg-white/10
                                  ${activity.userReaction === r ? 'bg-primary-500/20 scale-110' : ''}
                                `}
                              >
                                {r}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {/* Reaction Summary */}
                    {activity.reactions && Object.keys(activity.reactions).length > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        {Object.entries(activity.reactions).slice(0, 3).map(([type, count]) => (
                          <span key={type} className="flex items-center gap-0.5">
                            <span>{type}</span>
                            <span className="text-gray-400">{count}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <button className="flex items-center gap-2 text-gray-400 hover:text-primary-500 transition-colors ml-auto">
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
                Be the first to post or follow other athletes!
              </p>
              <div className="flex justify-center gap-3">
                <Button icon={Plus} onClick={() => setShowCreatePost(true)}>
                  Create Post
                </Button>
                <Button variant="secondary" icon={Search} onClick={() => setShowSearch(true)}>
                  Find Friends
                </Button>
              </div>
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
