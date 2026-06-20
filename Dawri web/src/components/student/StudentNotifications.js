import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Clock, ArrowLeft, Trash2, Filter } from 'lucide-react';
import { studentAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/helpers';
import Loading from '../common/Loading';
import PageHeader from '../common/PageHeader';
import AnimatedCard from '../common/AnimatedCard';
import EmptyState from '../common/EmptyState';

const StudentNotifications = () => {
  const { t, lang } = useLanguage();
  const { unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await studentAPI.getNotifications();
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, is_read: 1, read_at: new Date().toISOString() } : n
    ));
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'turn_now': return '🔔';
      case '3min_warning': return '⏰';
      case 'confirmation': return '✅';
      case 'cancelled': return '❌';
      case 'served': return '✨';
      case 'queue_paused': return '⏸️';
      case 'queue_resumed': return '▶️';
      default: return '📌';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'turn_now': return 'bg-secondary-50 border-secondary-300';
      case '3min_warning': return 'bg-accent-50 border-accent-300';
      case 'confirmation': return 'bg-primary-50 border-primary-300';
      case 'cancelled': return 'bg-danger-50 border-danger-300';
      default: return 'bg-dark-50 border-dark-100';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.is_read;
    return n.notification_type === filter;
  });

  if (isLoading) return <Loading fullScreen />;

  return (
    <div className="page-container">
      <div className="content-container">
        <PageHeader
          title={t('notifications')}
          subtitle={lang === 'ar' ? `لديك ${unreadCount} إشعارات غير مقروءة` : `You have ${unreadCount} unread notifications`}
          icon={Bell}
          actions={
            unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="btn-outline gap-2 py-2 px-3 text-sm"
              >
                <Check className="w-4 h-4" />
                {t('markAllRead')}
              </button>
            )
          }
        />

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: 'all', label: lang === 'ar' ? 'الكل' : 'All' },
            { value: 'unread', label: lang === 'ar' ? 'غير مقروء' : 'Unread' },
            { value: 'turn_now', label: lang === 'ar' ? 'دورك' : 'Your Turn' },
            { value: '3min_warning', label: lang === 'ar' ? '3 دقائق' : '3 Min' },
            { value: 'confirmation', label: lang === 'ar' ? 'تأكيد' : 'Confirmation' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.value
                  ? 'bg-primary-600 text-white shadow-glow'
                  : 'bg-white border-2 border-dark-200 text-dark-600 hover:border-primary-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={t('noNotifications')}
            description={
              filter !== 'all'
                ? (lang === 'ar' ? 'لا توجد إشعارات مطابقة' : 'No matching notifications')
                : ''
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif, index) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AnimatedCard className={`p-4 ${getNotificationColor(notif.notification_type)}`}>
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">{getNotificationIcon(notif.notification_type)}</span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-sm ${!notif.is_read ? 'font-semibold text-dark-900' : 'text-dark-700'}`}>
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-dark-400" />
                            <span className="text-xs text-dark-400">
                              {formatDate(notif.created_at, lang)}
                            </span>
                            {notif.ticket_number && (
                              <span className="text-xs text-primary-600 font-medium">
                                Ticket #{notif.ticket_number}
                              </span>
                            )}
                          </div>
                        </div>

                        {!notif.is_read && (
                          <button
                            onClick={() => handleMarkRead(notif.id)}
                            className="p-2 rounded-lg hover:bg-white/50 transition-colors flex-shrink-0"
                          >
                            <Check className="w-4 h-4 text-primary-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotifications;
