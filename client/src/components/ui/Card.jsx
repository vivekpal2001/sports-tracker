import { motion } from 'framer-motion';

export default function Card({
  children,
  className = '',
  glow = false,
  hover = true,
  padding = 'p-6',
  onClick,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      onClick={onClick}
      className={`
        relative rounded-2xl overflow-hidden
        glass
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${glow ? 'glow-border' : ''}
        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-xl font-bold text-white ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-gray-400 mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-4 border-t border-white/5 ${className}`}>
      {children}
    </div>
  );
}
