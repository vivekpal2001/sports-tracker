import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function CircularProgress({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 10,
  color = '#00d4ff',
  bgColor = 'rgba(255, 255, 255, 0.1)',
  showValue = true,
  label,
  animated = true,
  className = '',
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = circumference - (animatedValue / 100) * circumference;
  
  useEffect(() => {
    if (animated) {
      // Animate the value
      const timer = setTimeout(() => {
        setAnimatedValue(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedValue(percentage);
    }
  }, [percentage, animated]);
  
  // Get gradient colors based on value
  const getGradientId = () => {
    if (percentage >= 80) return 'gradientHigh';
    if (percentage >= 50) return 'gradientMid';
    return 'gradientLow';
  };
  
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="gradientHigh" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#84ff00" />
            <stop offset="100%" stopColor="#00d4ff" />
          </linearGradient>
          <linearGradient id="gradientMid" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#ff6b00" />
          </linearGradient>
          <linearGradient id="gradientLow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff6b00" />
            <stop offset="100%" stopColor="#ff3366" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${getGradientId()})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          filter="url(#glow)"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-3xl font-bold text-white"
          >
            {Math.round(animatedValue)}
          </motion.span>
        )}
        {label && (
          <span className="text-xs text-gray-400 mt-1">{label}</span>
        )}
      </div>
    </div>
  );
}
