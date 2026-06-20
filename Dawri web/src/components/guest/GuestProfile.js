import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, Save, Heart, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { guestAPI } from '../../services/api';
import AnimatedCard from '../common/AnimatedCard';
import Loading from '../common/Loading';

const GuestProfile = () => {
  const { updateUser } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await guestAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await guestAPI.updateProfile(profile);
      updateUser(profile);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <div className="page-container">
      <div className="content-container">
        <button onClick={() => navigate('/guest/dashboard')} className="flex items-center gap-2 text-dark-500 hover:text-dark-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {lang === 'ar' ? 'رجوع' : 'Back'}
        </button>
        <h1 className="text-2xl font-bold text-dark-900 mb-6">{lang === 'ar' ? 'الملف الشخصي' : 'Profile'}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AnimatedCard className="p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-accent-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-glow">
                <Heart className="w-10 h-10" />
              </div>
              <h2 className="font-bold text-dark-900 text-lg">{profile?.first_name} {profile?.last_name}</h2>
              <p className="text-dark-500">{profile?.contact_value}</p>
              <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-accent-100 text-accent-700 text-sm font-medium rounded-lg">
                <Crown className="w-3 h-3" />
                {lang === 'ar' ? 'ضيف' : 'Guest'}
              </div>
            </AnimatedCard>
          </div>

          <div className="lg:col-span-2">
            <AnimatedCard className="p-6">
              <h3 className="font-bold text-dark-900 mb-4">{lang === 'ar' ? 'تعديل المعلومات' : 'Edit Information'}</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">{lang === 'ar' ? 'الاسم الأول' : 'First Name'}</label>
                    <input type="text" value={profile?.first_name || ''} onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                      className="w-full px-4 py-3 bg-white border-2 border-dark-200 rounded-xl focus:border-accent-500 focus:ring-4 focus:ring-accent-100 focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">{lang === 'ar' ? 'اسم العائلة' : 'Last Name'}</label>
                    <input type="text" value={profile?.last_name || ''} onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                      className="w-full px-4 py-3 bg-white border-2 border-dark-200 rounded-xl focus:border-accent-500 focus:ring-4 focus:ring-accent-100 focus:outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">{lang === 'ar' ? 'طريقة التواصل' : 'Contact Method'}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input type="text" value={profile?.contact_method || ''} readOnly
                      className="w-full pl-12 pr-4 py-3 bg-dark-50 border-2 border-dark-200 rounded-xl text-dark-500 cursor-not-allowed" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">{lang === 'ar' ? 'قيمة التواصل' : 'Contact Value'}</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input type="text" value={profile?.contact_value || ''} readOnly
                      className="w-full pl-12 pr-4 py-3 bg-dark-50 border-2 border-dark-200 rounded-xl text-dark-500 cursor-not-allowed" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">{lang === 'ar' ? 'اللغة' : 'Language'}</label>
                  <select
                    value={profile?.language || 'en'}
                    onChange={(e) => setProfile({...profile, language: e.target.value})}
                    className="w-full px-4 py-3 bg-white border-2 border-dark-200 rounded-xl focus:border-accent-500 focus:ring-4 focus:ring-accent-100 focus:outline-none transition-all"
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
                <button onClick={handleSave} disabled={isSaving}
                  className="btn-primary gap-2 w-full">
                  <Save className="w-4 h-4" />
                  {isSaving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
                </button>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </div>
  );
};
export default GuestProfile;
