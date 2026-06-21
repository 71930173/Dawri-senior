import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Bell, Heart, Shield, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import AnimatedCard from '../common/AnimatedCard';

const GuestSettings = () => {
  const { lang, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="content-container">
        <button onClick={() => navigate('/guest/dashboard')} className="flex items-center gap-2 text-dark-500 hover:text-dark-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {lang === 'ar' ? 'رجوع' : 'Back'}
        </button>
        <h1 className="text-2xl font-bold text-dark-900 mb-6">{lang === 'ar' ? 'الإعدادات' : 'Settings'}</h1>

        <div className="space-y-4 max-w-2xl">
          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-accent-600" />
                </div>
                <div>
                  <p className="font-semibold text-dark-900">{lang === 'ar' ? 'اللغة' : 'Language'}</p>
                  <p className="text-sm text-dark-500">{lang === 'ar' ? 'تبديل بين العربية والإنجليزية' : 'Toggle between Arabic and English'}</p>
                </div>
              </div>
              <button onClick={toggleLanguage}
                className="px-4 py-2 rounded-xl bg-accent-100 text-accent-700 font-semibold hover:bg-accent-200 transition-all">
                {lang === 'ar' ? 'English' : 'العربية'}
              </button>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-accent-600" />
                </div>
                <div>
                  <p className="font-semibold text-dark-900">{lang === 'ar' ? 'الإشعارات' : 'Notifications'}</p>
                  <p className="text-sm text-dark-500">{lang === 'ar' ? 'تفعيل أو إيقاف الإشعارات' : 'Enable or disable notifications'}</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-secondary-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => navigate('/guest/profile')}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-accent-600" />
                </div>
                <div>
                  <p className="font-semibold text-dark-900">{lang === 'ar' ? 'الملف الشخصي' : 'Profile'}</p>
                  <p className="text-sm text-dark-500">{lang === 'ar' ? 'تعديل معلومات حسابك' : 'Edit your account information'}</p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-dark-400 rotate-180" />
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-dark-900">{lang === 'ar' ? 'الأمان' : 'Security'}</p>
                  <p className="text-sm text-dark-500">{lang === 'ar' ? 'تغيير كلمة المرور' : 'Change your password'}</p>
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-dark-900">{lang === 'ar' ? 'المساعدة' : 'Help'}</p>
                  <p className="text-sm text-dark-500">{lang === 'ar' ? 'الأسئلة الشائعة والدعم' : 'FAQ and support'}</p>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
};
export default GuestSettings;
