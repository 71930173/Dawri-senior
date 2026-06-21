import React from 'react';
import { getPriorityColor, getPriorityLabel } from '../../utils/helpers';
import { useLanguage } from '../../context/LanguageContext';
import { Crown } from 'lucide-react';

const PriorityBadge = ({ priority, isGuestPriority, className = '' }) => {
  const { t } = useLanguage();
  const isGuest = isGuestPriority || priority === 1;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${getPriorityColor(priority, isGuestPriority)} ${className}`}>
      {isGuest && <Crown className="w-3 h-3" />}
      {getPriorityLabel(priority, isGuestPriority, t)}
    </span>
  );
};

export default PriorityBadge;
