import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, Heart, MessageCircle, User } from 'lucide-react';
import { notificationAPI } from '../services/api';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  
  // Fetch unread count on mount
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
    }
  };
  
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationAPI.getAll();
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpen = () => {
    setOpen(!open);
    if (!open) {
      fetchNotifications();
    }
  };
  
  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };
  
  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => 
        n._id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };
  
  const getNotificationIcon = (type, reactionType) => {
    if (type === 'reaction') {
      return <span className="text-lg">{reactionType || '❤️'}</span>;
    }
    if (type === 'comment') {
      return <MessageCircle className="w-5 h-5 text-blue-400" />;
    }
    if (type === 'follow') {
      return <User className="w-5 h-5 text-purple-400" />;
    }
    return <Bell className="w-5 h-5 text-gray-400" />;
  };
  
  const getNotificationText = (notification) => {
    const name = notification.sender?.name || 'Someone';
    switch (notification.type) {
      case 'reaction':
        return `${name} reacted ${notification.reactionType || '❤️'} to your post`;
      case 'comment':
        return `${name} commented on your post`;
      case 'follow':
        return `${name} started following you`;
      case 'badge':
        return `You earned a new badge!`;
      default:
        return notification.message || 'New notification';
    }
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-crimson-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-dark-400 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-400"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
            </div>
            
            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-400">
                  Loading...
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => !notification.read && handleMarkRead(notification._id)}
                    className={`
                      flex items-start gap-3 p-4 border-b border-white/5 cursor-pointer
                      hover:bg-white/5 transition-colors
                      ${!notification.read ? 'bg-primary-500/5' : ''}
                    `}
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-full bg-dark-300 flex items-center justify-center flex-shrink-0">
                      {getNotificationIcon(notification.type, notification.reactionType)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">
                        {getNotificationText(notification)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Bell className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400">No notifications yet</p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            {notifications.length > 0 && (
              <Link
                to="/dashboard/notifications"
                className="block p-3 text-center text-sm text-primary-500 hover:bg-white/5 border-t border-white/10"
                onClick={() => setOpen(false)}
              >
                View All
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
