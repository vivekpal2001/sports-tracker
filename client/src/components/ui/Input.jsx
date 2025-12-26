import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  icon: Icon,
  className = '',
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-dark-200/50 border
            text-white placeholder:text-gray-500
            transition-all duration-300
            focus:outline-none
            ${Icon ? 'pl-12' : ''}
            ${isPassword ? 'pr-12' : ''}
            ${error 
              ? 'border-crimson-500 focus:border-crimson-400' 
              : focused 
                ? 'border-primary-500 shadow-glow-sm' 
                : 'border-white/10 hover:border-white/20'
            }
          `}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
        
        {/* Focus glow effect */}
        <AnimatePresence>
          {focused && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 -z-10 rounded-xl bg-primary-500/10 blur-xl"
            />
          )}
        </AnimatePresence>
      </div>
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-crimson-400 text-sm mt-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
