import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, User, Activity, ArrowRight, ArrowLeft,
  AlertCircle, Check, Bike, Dumbbell, Waves, Trophy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';

const SPORTS = [
  { id: 'running', name: 'Running', icon: Activity },
  { id: 'cycling', name: 'Cycling', icon: Bike },
  { id: 'swimming', name: 'Swimming', icon: Waves },
  { id: 'weightlifting', name: 'Weightlifting', icon: Dumbbell },
  { id: 'crossfit', name: 'CrossFit', icon: Trophy },
];

const FITNESS_LEVELS = [
  { id: 'beginner', name: 'Beginner', desc: 'Just starting out' },
  { id: 'intermediate', name: 'Intermediate', desc: '1-2 years experience' },
  { id: 'advanced', name: 'Advanced', desc: '3+ years experience' },
  { id: 'elite', name: 'Elite', desc: 'Competitive athlete' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, error, clearError } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    sport: 'running',
    fitnessLevel: 'intermediate'
  });
  const [validationError, setValidationError] = useState('');
  
  const handleChange = (e) => {
    clearError();
    setValidationError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setValidationError('Please fill in all fields');
      return false;
    }
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }
    return true;
  };
  
  const nextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };
  
  const prevStep = () => {
    setStep(1);
    setValidationError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      {
        sport: formData.sport,
        fitnessLevel: formData.fitnessLevel
      }
    );
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };
  
  const displayError = validationError || error;
  
  return (
    <div className="min-h-screen bg-dark-500 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-glow-lime opacity-10" />
      <div className="absolute top-0 -right-40 w-80 h-80 bg-lime-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 -left-40 w-80 h-80 bg-primary-500/10 rounded-full blur-[100px]" />
      
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
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: step >= s ? 1 : 0.9,
                  backgroundColor: step >= s ? '#00d4ff' : 'rgba(255,255,255,0.1)',
                }}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${step >= s ? 'text-dark-500' : 'text-gray-500'}
                `}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </motion.div>
              {s < 2 && (
                <div className={`w-12 h-0.5 ${step > 1 ? 'bg-primary-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>
        
        {/* Card */}
        <motion.div
          layout
          className="glass-strong rounded-3xl p-8"
        >
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                  <p className="text-gray-400">Start your performance journey</p>
                </div>
                
                {displayError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-4 mb-6 rounded-xl bg-crimson-500/10 border border-crimson-500/30"
                  >
                    <AlertCircle className="w-5 h-5 text-crimson-500 flex-shrink-0" />
                    <p className="text-crimson-400 text-sm">{displayError}</p>
                  </motion.div>
                )}
                
                <div className="space-y-5">
                  <Input
                    label="Full Name"
                    type="text"
                    name="name"
                    placeholder="John Athlete"
                    icon={User}
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  
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
                  
                  <Input
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    icon={Lock}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  
                  <Button 
                    onClick={nextStep}
                    fullWidth 
                    size="lg"
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">Your Sport</h1>
                  <p className="text-gray-400">Personalize your experience</p>
                </div>
                
                {/* Sport Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Primary Sport
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {SPORTS.map((sport) => {
                      const Icon = sport.icon;
                      return (
                        <motion.button
                          key={sport.id}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFormData({ ...formData, sport: sport.id })}
                          className={`
                            p-3 rounded-xl flex flex-col items-center gap-1 transition-all
                            ${formData.sport === sport.id 
                              ? 'bg-primary-500/20 border-2 border-primary-500' 
                              : 'bg-dark-200/50 border-2 border-transparent hover:border-white/20'}
                          `}
                        >
                          <Icon className={`w-5 h-5 ${formData.sport === sport.id ? 'text-primary-500' : 'text-gray-400'}`} />
                          <span className={`text-xs ${formData.sport === sport.id ? 'text-primary-500' : 'text-gray-400'}`}>
                            {sport.name}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Fitness Level Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Fitness Level
                  </label>
                  <div className="space-y-2">
                    {FITNESS_LEVELS.map((level) => (
                      <motion.button
                        key={level.id}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, fitnessLevel: level.id })}
                        className={`
                          w-full p-4 rounded-xl flex items-center justify-between transition-all
                          ${formData.fitnessLevel === level.id 
                            ? 'bg-primary-500/20 border-2 border-primary-500' 
                            : 'bg-dark-200/50 border-2 border-transparent hover:border-white/20'}
                        `}
                      >
                        <div className="text-left">
                          <div className={formData.fitnessLevel === level.id ? 'text-primary-500 font-medium' : 'text-white'}>
                            {level.name}
                          </div>
                          <div className="text-xs text-gray-400">{level.desc}</div>
                        </div>
                        {formData.fitnessLevel === level.id && (
                          <Check className="w-5 h-5 text-primary-500" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="ghost"
                    onClick={prevStep}
                    icon={ArrowLeft}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    fullWidth
                    size="lg"
                    loading={loading}
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    Create Account
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {step === 1 && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 text-sm text-gray-500 bg-dark-200">or</span>
                </div>
              </div>
              
              <p className="text-center text-gray-400">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-primary-500 hover:text-primary-400 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
