import React from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const EmptyState = ({ 
  icon: Icon = Inbox, 
  title, 
  description, 
  action,
  className = '' 
}) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}
    >
      <div className="w-20 h-20 rounded-2xl bg-dark-100 flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-dark-400" />
      </div>
      <h3 className="text-lg font-semibold text-dark-700 mb-2">
        {title || t('noData')}
      </h3>
      {description && (
        <p className="text-sm text-dark-500 text-center max-w-md mb-6">
          {description}
        </p>
      )}
      {action}
    </motion.div>
  );
};

export default EmptyState;
