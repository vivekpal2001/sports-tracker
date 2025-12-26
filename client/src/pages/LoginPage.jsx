import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Activity, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, error, clearError } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    clearError();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };
  
  const fillDemoCredentials = () => {
    setFormData({ email: 'demo@athlete.com', password: 'demo123' });
  };
  
  return (
    <div className="min-h-screen bg-dark-500 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-glow-primary opacity-20" />
      <div className="absolute top-0 -left-40 w-80 h-80 bg-primary-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 -right-40 w-80 h-80 bg-lime-500/10 rounded-full blur-[100px]" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-lime-500 flex items-center justify-center"
          >
            <Activity className="w-7 h-7 text-dark-500" />
          </motion.div>
          <span className="text-2xl font-bold gradient-text">SportTrack AI</span>
        </Link>
        
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-3xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to continue your journey</p>
          </div>
          
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-4 mb-6 rounded-xl bg-crimson-500/10 border border-crimson-500/30"
            >
              <AlertCircle className="w-5 h-5 text-crimson-500 flex-shrink-0" />
              <p className="text-crimson-400 text-sm">{error}</p>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="athlete@example.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-600 bg-dark-200 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary-500 hover:text-primary-400 transition-colors">
                Forgot password?
              </a>
            </div>
            
            <Button 
              type="submit" 
              fullWidth 
              size="lg" 
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Sign In
            </Button>
          </form>
          
          {/* Demo Account */}
          <div className="mt-6 p-4 rounded-xl bg-primary-500/5 border border-primary-500/20">
            <p className="text-sm text-gray-400 mb-2">Try the demo account:</p>
            <button
              onClick={fillDemoCredentials}
              className="text-sm text-primary-500 hover:text-primary-400 transition-colors flex items-center gap-1"
            >
              demo@athlete.com / demo123
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-sm text-gray-500 bg-dark-200">or</span>
            </div>
          </div>
          
          {/* Register Link */}
          <p className="text-center text-gray-400">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-primary-500 hover:text-primary-400 font-medium transition-colors"
            >
              Sign up free
            </Link>
          </p>
        </motion.div>
        
        {/* Motivational Quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-500 text-sm mt-8"
        >
          "The only bad workout is the one that didn't happen."
        </motion.p>
      </motion.div>
    </div>
  );
}
