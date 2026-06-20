import React from 'react';
import { Bell, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import EmptyState from '../common/EmptyState';

const StaffNotifications = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <div className="content-container">
        <button onClick={() => navigate('/staff/dashboard')} className="flex items-center gap-2 text-dark-500 hover:text-dark-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {lang === 'ar' ? 'رجوع' : 'Back'}
        </button>
        <h1 className="text-2xl font-bold text-dark-900 mb-6">{lang === 'ar' ? 'إشعارات الموظف' : 'Staff Notifications'}</h1>
        <EmptyState icon={Bell} title={lang === 'ar' ? 'لا توجد إشعارات' : 'No Notifications'} />
      </div>
    </div>
  );
};
export default StaffNotifications;
