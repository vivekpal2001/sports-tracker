import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Moon, Zap } from 'lucide-react';
import { Card } from './ui';
import { workoutAPI } from '../services/api';

const STATUS_COLORS = {
  lime: { stroke: '#84cc16', bg: 'bg-lime-500/20', text: 'text-lime-500' },
  primary: { stroke: '#00d4ff', bg: 'bg-primary-500/20', text: 'text-primary-500' },
  yellow: { stroke: '#eab308', bg: 'bg-yellow-500/20', text: 'text-yellow-500' },
  red: { stroke: '#ef4444', bg: 'bg-red-500/20', text: 'text-red-500' }
};

export default function RecoveryScoreCard() {
  const [recovery, setRecovery] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchRecoveryScore();
  }, []);
  
  const fetchRecoveryScore = async () => {
    try {
      const response = await workoutAPI.getRecoveryScore();
      setRecovery(response.data.data);
    } catch (error) {
      console.error('Failed to fetch recovery score:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Card className="h-full">
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    );
  }
  
  if (!recovery) {
    return (
      <Card className="h-full">
        <div className="text-center text-gray-400 py-8">
          Unable to calculate recovery
        </div>
      </Card>
    );
  }
  
  const { score, status, factors, insights, recommendation } = recovery;
  const colorConfig = STATUS_COLORS[status.color] || STATUS_COLORS.primary;
  
  // SVG circle dimensions
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  
  return (
    <Card className="h-full">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary-500" />
        <h3 className="font-semibold text-white">Recovery Score</h3>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Circular Progress */}
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colorConfig.stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl">{status.icon}</span>
            <motion.span 
              className="text-2xl font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {score}
            </motion.span>
          </div>
        </div>
        
        {/* Status and info */}
        <div className="flex-1">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colorConfig.bg} ${colorConfig.text} text-sm font-medium mb-2`}>
            {status.label}
          </div>
          
          <p className="text-gray-400 text-sm mb-3">
            {status.message}
          </p>
          
          {/* Factor bars */}
          <div className="space-y-2">
            {[
              { label: 'Load', value: factors.recentLoad, icon: Zap },
              { label: 'Volume', value: factors.weeklyVolume, icon: TrendingUp },
              { label: 'Rest', value: factors.restDays, icon: Moon }
            ].map((factor) => (
              <div key={factor.label} className="flex items-center gap-2">
                <factor.icon className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500 w-12">{factor.label}</span>
                <div className="flex-1 h-1.5 bg-dark-300 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${factor.value}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full rounded-full ${
                      factor.value >= 70 ? 'bg-lime-500' : 
                      factor.value >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8">{factor.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recommendation */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <p className="text-sm text-gray-400">
          <span className="text-white font-medium">Recommendation:</span> {recommendation}
        </p>
      </div>
    </Card>
  );
}
