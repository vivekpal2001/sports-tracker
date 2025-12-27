import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  LayoutDashboard, 
  Dumbbell, 
  Brain, 
  BarChart3, 
  FileDown,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  User,
  Trophy,
  Target,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/dashboard/workouts', icon: Dumbbell, label: 'Workouts' },
  { path: '/dashboard/goals', icon: Target, label: 'Goals' },
  { path: '/dashboard/records', icon: Trophy, label: 'Records' },
  { path: '/dashboard/badges', icon: Award, label: 'Badges' },
  { path: '/dashboard/insights', icon: Brain, label: 'AI Insights' },
  { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-dark-500">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-50
        glass-strong border-r border-white/5
        transform transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 px-2 py-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-lime-500 flex items-center justify-center">
              <Activity className="w-6 h-6 text-dark-500" />
            </div>
            <span className="text-xl font-bold gradient-text">SportTrack</span>
          </Link>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive 
                      ? 'bg-primary-500/20 text-primary-500' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute right-2 w-1.5 h-8 rounded-full bg-primary-500"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* Bottom Section */}
          <div className="border-t border-white/5 pt-4 space-y-1">
            <Link
              to="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-crimson-500 hover:bg-crimson-500/10 transition-all w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
          
          {/* User Info */}
          <div className="mt-4 p-4 rounded-xl bg-dark-300/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-lime-500 flex items-center justify-center">
                <User className="w-5 h-5 text-dark-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 glass-strong border-b border-white/5">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-gray-400"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            {/* Page Title */}
            <h1 className="text-xl font-bold text-white hidden lg:block">
              {NAV_ITEMS.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
            
            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link to="/dashboard/log-workout">
                <Button icon={Plus} size="sm">
                  Log Workout
                </Button>
              </Link>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
      
      {/* Floating Action Button (Mobile) */}
      <Link
        to="/dashboard/log-workout"
        className="lg:hidden fixed bottom-6 right-6 z-40"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-lime-500 flex items-center justify-center shadow-glow-md"
        >
          <Plus className="w-6 h-6 text-dark-500" />
        </motion.div>
      </Link>
    </div>
  );
}
