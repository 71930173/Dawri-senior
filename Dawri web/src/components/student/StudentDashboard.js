import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Calendar, Bell, TrendingUp, Clock, 
  Users, ArrowRight, Ticket, MapPin, AlertTriangle,
  ChevronRight, Activity, Award, Zap
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate, formatDuration} from '../../utils/helpers';
import Loading from '../common/Loading';
import PageHeader from '../common/PageHeader';
import AnimatedCard from '../common/AnimatedCard';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import ConfettiEffect from '../common/ConfettiEffect';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [activeAppointment, setActiveAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total_visits: 0, completed: 0, avg_wait: 0 });
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [activeRes, appointmentsRes, statsRes, notifRes] = await Promise.all([
        studentAPI.getActiveAppointment().catch(() => ({ data: null })),
        studentAPI.getMyAppointments().catch(() => ({ data: [] })),
        studentAPI.getStats().catch(() => ({ data: { total_visits: 0, completed: 0, avg_wait: 0 } })),
        studentAPI.getNotifications().catch(() => ({ data: [] }))
      ]);

      setActiveAppointment(activeRes.data);
      setAppointments(appointmentsRes.data?.slice(0, 5) || []);
      setStats(statsRes.data || { total_visits: 0, completed: 0, avg_wait: 0 });
      setNotifications(notifRes.data?.slice(0, 5) || []);

      // Show confetti if recently served
      if (activeRes.data?.status === 'served') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <div className="page-container pt-6 px-4 sm:px-6 lg:px-10 xl:px-16">
      <ConfettiEffect active={showConfetti} />

      <div className="max-w-6xl mx-auto">
      <PageHeader
        title={`${t('welcome')}, ${user?.firstName || user?.first_name || 'Student'}!`}
        subtitle={lang === 'ar' ? 'إليك نظرة عامة على حسابك' : 'Here is your account overview'}
        icon={LayoutDashboard}
        actions={
          <button
            onClick={() => navigate('/student/queue')}
            className="btn-primary gap-2"
          >
            <Zap className="w-4 h-4" />
            {t('selectIssue')}
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { 
            label: t('totalVisits'), 
            value: stats.total_visits || 0, 
            icon: Calendar, 
            color: 'primary',
            trend: '+12%' 
          },
          { 
            label: t('completed'), 
            value: stats.completed || 0, 
            icon: Award, 
            color: 'secondary',
            trend: '+5%' 
          },
          { 
            label: t('averageWait'), 
            value: formatDuration(stats.avg_wait), 
            icon: Clock, 
            color: 'accent',
            trend: '-8%' 
          },
          { 
            label: t('notifications'), 
            value: unreadCount, 
            icon: Bell, 
            color: 'danger',
            trend: 'New' 
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AnimatedCard className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-dark-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-dark-900">{stat.value}</p>
                  <span className={`text-xs font-medium ${
                    stat.trend.startsWith('+') ? 'text-secondary-600' : 
                    stat.trend.startsWith('-') ? 'text-primary-600' : 'text-accent-600'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </AnimatedCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Appointment */}
        <div className="lg:col-span-2">
          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-dark-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-600" />
                {t('activeAppointment')}
              </h2>
              {activeAppointment && (
                <StatusBadge status={activeAppointment.status} />
              )}
            </div>

            {activeAppointment ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-xl border border-primary-200">
                  <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-glow">
                    {activeAppointment.ticket_number}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-dark-900 text-lg">
                      {activeAppointment.issue_type_name || activeAppointment.issue_type_name_ar}
                    </h3>
                    <p className="text-sm text-dark-500">
                      {activeAppointment.staff_name} • {activeAppointment.room_number}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary-600">
                      #{activeAppointment.queue_position}
                    </p>
                    <p className="text-xs text-dark-500">{t('yourPosition')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-dark-50 rounded-xl text-center">
                    <MapPin className="w-5 h-5 text-dark-400 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-dark-700">
                      {activeAppointment.block}, {activeAppointment.floor}
                    </p>
                    <p className="text-xs text-dark-400">{t('block')} / {t('floor')}</p>
                  </div>
                  <div className="p-3 bg-dark-50 rounded-xl text-center">
                    <Clock className="w-5 h-5 text-dark-400 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-dark-700">
                      {activeAppointment.estimated_wait_minutes} {t('minutes')}
                    </p>
                    <p className="text-xs text-dark-400">{t('estimatedWait')}</p>
                  </div>
                  <div className="p-3 bg-dark-50 rounded-xl text-center">
                    <Users className="w-5 h-5 text-dark-400 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-dark-700">
                      {activeAppointment.queue_position - 1}
                    </p>
                    <p className="text-xs text-dark-400">{t('peopleBefore')}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/student/queue-status/${activeAppointment.id}`)}
                    className="flex-1 btn-primary gap-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    {lang === 'ar' ? 'تتبع الطابور' : 'Track Queue'}
                  </button>
                  <button
                    onClick={async () => {
                    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من إلغاء الطابور؟' : 'Are you sure you want to cancel?')) {
                      try {
                        await studentAPI.cancelAppointment(activeAppointment.id);
                        fetchDashboardData();
                      } catch (err) {
                        console.error('Cancel failed:', err);
                      }
                    }
                  }}
                    className="btn-danger gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    {t('cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Ticket}
                title={lang === 'ar' ? 'لا يوجد موعد نشط' : 'No Active Appointment'}
description={lang === 'ar' ? 'ليس لديك موعد نشط حالياً. يمكنك إنشاء واحد الآن.' : 'You do not have an active appointment. Create one now.'}                action={
                  <button
                    onClick={() => navigate('/student/queue')}
                    className="btn-primary gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {t('selectIssue')}
                  </button>
                }
              />
            )}
          </AnimatedCard>
        </div>

        {/* Recent Notifications */}
        <div>
          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-dark-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-600" />
                {t('notifications')}
              </h2>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-danger-100 text-danger-700 text-xs font-bold rounded-lg">
                  {unreadCount} {lang === 'ar' ? 'جديد' : 'New'}
                </span>
              )}
            </div>

            {notifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title={t('noNotifications')}
                description=""
              />
            ) : (
              <div className="space-y-3">
                {notifications.map((notif, index) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                      notif.is_read 
                        ? 'bg-dark-50 border-dark-100' 
                        : 'bg-primary-50 border-primary-200'
                    }`}
                    onClick={() => navigate('/student/notifications')}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        notif.is_read ? 'bg-dark-300' : 'bg-primary-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notif.is_read ? 'text-dark-600' : 'text-dark-900 font-medium'}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-dark-400 mt-1">
                          {formatDate(notif.created_at, lang)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <button
                  onClick={() => navigate('/student/notifications')}
                  className="w-full py-2 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-1 transition-colors"
                >
                  {lang === 'ar' ? 'عرض الكل' : 'View All'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </AnimatedCard>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="mt-6">
        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-dark-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              {t('myAppointments')}
            </h2>
            <button
              onClick={() => navigate('/student/appointments')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              {lang === 'ar' ? 'عرض الكل' : 'View All'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {appointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={lang === 'ar' ? 'لا توجد مواعيد' : 'No Appointments'}
description={lang === 'ar' ? 'لم تقم بإنشاء أي مواعيد بعد.' : 'You have not created any appointments yet.'}            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-100">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-dark-600">{t('ticketNumber')}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-dark-600">{t('issueTypes')}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-dark-600">{t('staffName')}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-dark-600">{t('status')}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-dark-600">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr 
                      key={appt.id} 
                      className="border-b border-dark-50 hover:bg-dark-50/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/student/appointments/${appt.id}`)}
                    >
                      <td className="py-3 px-4">
                        <span className="font-bold text-primary-600">#{appt.ticket_number}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-dark-700">
                        {lang === 'ar' ? appt.issue_type_name_ar : appt.issue_type_name}
                      </td>
                      <td className="py-3 px-4 text-sm text-dark-700">{appt.staff_name}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={appt.status} />
                      </td>
                      <td className="py-3 px-4 text-sm text-dark-500">
                        {formatDate(appt.created_at, lang)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AnimatedCard>
      </div>
    </div>
    </div>
  );
};

export default StudentDashboard;