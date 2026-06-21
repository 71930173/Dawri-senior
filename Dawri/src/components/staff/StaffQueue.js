import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, CheckCircle, SkipForward, Pause, Play, XCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import PageHeader from '../common/PageHeader';
import AnimatedCard from '../common/AnimatedCard';

const StaffQueue = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const queue = [
    { id: 1, name: 'Ahmad Khalid', type: 'Admission', ticket: 'A-101', wait: '5 min', priority: 2 },
    { id: 2, name: 'Sarah Smith', type: 'Financial', ticket: 'A-102', wait: '10 min', priority: 1 },
    { id: 3, name: 'John Doe', type: 'Academic', ticket: 'A-103', wait: '15 min', priority: 2 },
  ];

  return (
    <div className="page-container">
      <div className="content-container">
        <button onClick={() => navigate('/staff/dashboard')} className="flex items-center gap-2 text-dark-500 hover:text-dark-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {lang === 'ar' ? 'رجوع' : 'Back'}
        </button>
        <PageHeader title={lang === 'ar' ? 'إدارة الطابور' : 'Queue Management'} icon={Users} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {queue.map((item, index) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <AnimatedCard className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${item.priority === 1 ? 'bg-accent-100 text-accent-700' : 'bg-primary-100 text-primary-700'}`}>
                      {item.priority === 1 ? 'P1' : 'P2'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-dark-900">{item.name}</p>
                      <p className="text-sm text-dark-500">{item.type} • Ticket #{item.ticket}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors" title="Serve">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button className="p-2 bg-accent-100 text-accent-700 rounded-lg hover:bg-accent-200 transition-colors" title="Skip">
                        <SkipForward className="w-5 h-5" />
                      </button>
                      <button className="p-2 bg-danger-100 text-danger-700 rounded-lg hover:bg-danger-200 transition-colors" title="Cancel">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </AnimatedCard>
              </motion.div>
            ))}
          </div>

          <div>
            <AnimatedCard className="p-6">
              <h3 className="font-bold text-dark-900 mb-4">{lang === 'ar' ? 'الإجراءات السريعة' : 'Quick Actions'}</h3>
              <div className="space-y-3">
                <button className="w-full py-3 px-4 rounded-xl bg-secondary-600 text-white font-semibold hover:bg-secondary-700 transition-all flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" /> {lang === 'ar' ? 'خدمة التالي' : 'Serve Next'}
                </button>
                <button className="w-full py-3 px-4 rounded-xl bg-accent-100 text-accent-700 font-semibold hover:bg-accent-200 transition-all flex items-center justify-center gap-2">
                  <Pause className="w-5 h-5" /> {lang === 'ar' ? 'إيقاف مؤقت' : 'Pause Queue'}
                </button>
                <button className="w-full py-3 px-4 rounded-xl bg-primary-100 text-primary-700 font-semibold hover:bg-primary-200 transition-all flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" /> {lang === 'ar' ? 'استئناف' : 'Resume'}
                </button>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </div>
  );
};
export default StaffQueue;
