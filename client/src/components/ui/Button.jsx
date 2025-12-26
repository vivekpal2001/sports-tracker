import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-gradient-to-r from-primary-500 to-primary-400 text-dark-500 hover:shadow-glow-md',
  secondary: 'bg-dark-100 border border-primary-500/30 text-primary-400 hover:bg-dark-50 hover:border-primary-500',
  lime: 'bg-gradient-to-r from-lime-500 to-lime-400 text-dark-500 hover:shadow-glow-lime',
  crimson: 'bg-gradient-to-r from-crimson-500 to-crimson-400 text-white hover:shadow-glow-crimson',
  ghost: 'bg-transparent text-gray-300 hover:text-white hover:bg-white/5',
  outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500/10',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
  xl: 'px-10 py-5 text-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  fullWidth = false,
  ...props
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`
        relative inline-flex items-center justify-center gap-2
        font-semibold rounded-xl
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
        </>
      )}
    </motion.button>
  );
}
