import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedCounter({
  value,
  duration = 2,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTime;
    let animationFrame;
    const startValue = displayValue;
    const endValue = value;
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const current = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(current);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);
  
  const formattedValue = displayValue.toFixed(decimals);
  
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`tabular-nums ${className}`}
    >
      {prefix}{formattedValue}{suffix}
    </motion.span>
  );
}
