import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Clock, Trash2, AlertTriangle } from 'lucide-react';
import { guestAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/helpers';
import Loading from '../common/Loading';
import PageHeader from '../common/PageHeader';
import AnimatedCard from '../common/AnimatedCard';
import EmptyState from '../common/EmptyState';

const GuestNotifications = () => {
  const { t, lang } = useLanguage();
  const { unreadCount, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = useNotifications();

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await guestAPI.getNotifications();
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

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      setDeleteConfirm(null);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications();
      setNotifications([]);
      setDeleteConfirm(null);
    } catch (error) {
      setDeleteConfirm(null);
    }
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
      case 'confirmation': return 'bg-accent-50 border-accent-300';
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
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={() => setDeleteConfirm('all')}
                  className="btn-outline gap-2 py-2 px-3 text-sm text-danger-600 border-danger-200 hover:bg-danger-50 hover:border-danger-300"
                >
                  <Trash2 className="w-4 h-4" />
                  {lang === 'ar' ? 'حذف الكل' : 'Delete All'}
                </button>
              )}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="btn-outline gap-2 py-2 px-3 text-sm"
                >
                  <Check className="w-4 h-4" />
                  {t('markAllRead')}
                </button>
              )}
            </div>
          }
        />

        {/* Delete All Confirmation */}
        {deleteConfirm === 'all' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-danger-50 border-2 border-danger-200 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-danger-500 flex-shrink-0" />
              <p className="text-sm text-danger-700 flex-1">
                {lang === 'ar' ? 'هل أنت متأكد من حذف جميع الإشعارات؟' : 'Are you sure you want to delete all notifications?'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-white border border-dark-200 text-dark-600 hover:bg-dark-50"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="px-3 py-1.5 text-sm rounded-lg bg-danger-500 text-white hover:bg-danger-600"
                >
                  {lang === 'ar' ? 'حذف' : 'Delete'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

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
                  ? 'bg-accent-600 text-white shadow-glow'
                  : 'bg-white border-2 border-dark-200 text-dark-600 hover:border-accent-300'
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
                              <span className="text-xs text-accent-600 font-medium">
                                Ticket #{notif.ticket_number}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notif.is_read && (
                            <button
                              onClick={() => handleMarkRead(notif.id)}
                              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                              title={lang === 'ar' ? 'تحديد كمقروء' : 'Mark as read'}
                            >
                              <Check className="w-4 h-4 text-accent-600" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(notif.id)}
                            className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                            title={lang === 'ar' ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4 text-danger-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Single Delete Confirmation */}
                  {deleteConfirm === notif.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-dark-100"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0" />
                        <p className="text-xs text-danger-600 flex-1">
                          {lang === 'ar' ? 'هل أنت متأكد من حذف هذا الإشعار؟' : 'Are you sure you want to delete this notification?'}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 text-xs rounded-lg bg-white border border-dark-200 text-dark-600 hover:bg-dark-50"
                          >
                            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                          </button>
                          <button
                            onClick={() => handleDelete(notif.id)}
                            className="px-2 py-1 text-xs rounded-lg bg-danger-500 text-white hover:bg-danger-600"
                          >
                            {lang === 'ar' ? 'حذف' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatedCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestNotifications;