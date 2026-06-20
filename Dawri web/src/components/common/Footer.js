import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Heart, Github, Twitter, Mail } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Footer = () => {
  const { t, lang } = useLanguage();

  return (
    <footer className="bg-dark-900 text-dark-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">{t('appName')}</h3>
                <p className="text-xs text-dark-400">{t('appSubtitle')}</p>
              </div>
            </div>
            <p className="text-sm text-dark-400 leading-relaxed">
              {lang === 'ar' 
                ? 'نظام إدارة دوري للجامعات. حلول رقمية متقدمة لإدارة الطابور بكفاءة.'
                : 'Dawri queue management system for universities. Advanced digital solutions for efficient queue management.'
              }
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              {lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-2">
              {['Student', 'Guest', 'Staff', 'Admin'].map((role) => (
                <li key={role}>
                  <Link 
                    to={`/${role.toLowerCase()}/dashboard`}
                    className="text-sm text-dark-400 hover:text-primary-400 transition-colors"
                  >
                    {role} {lang === 'ar' ? 'لوحة' : 'Dashboard'}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              {lang === 'ar' ? 'الدعم' : 'Support'}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-dark-400 hover:text-primary-400 transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  support@university.com
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">
                  {lang === 'ar' ? 'مركز المساعدة' : 'Help Center'}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">
                  {lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              {lang === 'ar' ? 'تابعنا' : 'Follow Us'}
            </h4>
            <div className="flex gap-3">
              {[Github, Twitter, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center text-dark-400 hover:bg-primary-600 hover:text-white transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-dark-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-dark-500">
            {t('poweredBy')} | {t('version')}
          </p>
          <p className="text-sm text-dark-500 flex items-center gap-1">
            {lang === 'ar' ? 'صنع بـ' : 'Made with'} <Heart className="w-4 h-4 text-danger-500 fill-danger-500" /> {lang === 'ar' ? 'للجامعة' : 'for University'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
