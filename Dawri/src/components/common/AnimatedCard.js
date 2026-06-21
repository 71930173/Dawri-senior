import React from 'react';
import { motion } from 'framer-motion';

const AnimatedCard = ({ 
  children, 
  className = '', 
  delay = 0,
  hover = true,
  onClick,
  selected = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        bg-white rounded-2xl border-2 transition-all duration-300
        ${hover ? 'shadow-soft hover:shadow-medium cursor-pointer' : 'shadow-soft'}
        ${selected ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' : 'border-dark-100 hover:border-primary-200'}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
