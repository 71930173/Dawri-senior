import React from 'react';
import { getStatusColor, getStatusLabel } from '../../utils/helpers';
import { useLanguage } from '../../context/LanguageContext';

const StatusBadge = ({ status, className = '' }) => {
  const { t } = useLanguage();

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)} ${className}`}>
      {getStatusLabel(status, t)}
    </span>
  );
};

export default StatusBadge;
