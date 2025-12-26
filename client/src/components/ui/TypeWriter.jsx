import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function TypeWriter({
  text,
  speed = 30,
  delay = 0,
  className = '',
  onComplete,
}) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  
  useEffect(() => {
    const delayTimer = setTimeout(() => {
      setStarted(true);
    }, delay);
    
    return () => clearTimeout(delayTimer);
  }, [delay]);
  
  useEffect(() => {
    if (!started) return;
    
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, started, onComplete]);
  
  return (
    <span className={className}>
      {displayText}
      {currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-5 bg-primary-500 ml-0.5 align-middle"
        />
      )}
    </span>
  );
}
