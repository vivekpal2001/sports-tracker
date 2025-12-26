import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };
  
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className={`${sizes[size]} text-primary-500`} />
      </motion.div>
      {text && (
        <p className="text-gray-400 text-sm">{text}</p>
      )}
    </div>
  );
}

export function LoadingScreen({ text = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-dark-500 flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(0, 212, 255, 0.3)',
                '0 0 60px rgba(0, 212, 255, 0.6)',
                '0 0 20px rgba(0, 212, 255, 0.3)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-lime-500 flex items-center justify-center mx-auto"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <svg viewBox="0 0 100 100" className="w-10 h-10">
                <path
                  d="M35 55 L45 45 L55 55 L65 35"
                  fill="none"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400"
        >
          {text}
        </motion.p>
        
        <div className="mt-4 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-2 h-2 rounded-full bg-primary-500"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
