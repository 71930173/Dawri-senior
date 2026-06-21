import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, userType, user } = useAuth();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading] = useState(false);
  const intervalRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !userType || !user) return;

    try {
      const endpoint = userType === 'student' ? '/student/notifications' :
                      userType === 'guest' ? '/guest/notifications' :
                      userType === 'staff' ? '/staff/notifications' : '/admin/notifications';

      const response = await axios.get(endpoint);
      if (response.data) {
        setNotifications(response.data);
        const unread = response.data.filter(n => !n.is_read).length;
        setUnreadCount(unread);

        response.data.forEach(n => {
          if (n.is_read) return;

          const notificationKey = `shown_notification_${n.id}`;

          if (localStorage.getItem(notificationKey)) {
            return;
          }

          localStorage.setItem(notificationKey, 'true');

          if (n.notification_type === 'turn_now') {
            toast.success(n.message || t('yourTurn'), {
              autoClose: false,
              closeOnClick: false,
            });
          } else if (n.notification_type === '3min_warning') {
            toast.warning(n.message || t('turnAfter3Min'), {
              autoClose: 10000,
            });
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [isAuthenticated, userType, user, t]);

  // Poll for notifications every 10 seconds
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      intervalRef.current = setInterval(fetchNotifications, 10000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const endpoint = userType === 'student' ? `/student/notifications/${notificationId}/read` :
                      userType === 'guest' ? `/guest/notifications/${notificationId}/read` :
                      userType === 'staff' ? `/staff/notifications/${notificationId}/read` : `/admin/notifications/${notificationId}/read`;

      await axios.put(endpoint);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: 1, read_at: new Date().toISOString() } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [userType]);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(unreadNotifications.map(n => markAsRead(n.id)));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [notifications, markAsRead]);

  // DELETE SINGLE NOTIFICATION
  const deleteNotification = useCallback(async (id) => {
    try {
      const endpoint = userType === 'student' ? `/student/notifications/${id}` :
                      userType === 'guest' ? `/guest/notifications/${id}` :
                      userType === 'staff' ? `/staff/notifications/${id}` : `/admin/notifications/${id}`;

      await axios.delete(endpoint);
      setNotifications(prev => {
        const updated = prev.filter(n => n.id !== id);
        const unread = updated.filter(n => !n.is_read).length;
        setUnreadCount(unread);
        return updated;
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error(t('deleteFailed') || 'Failed to delete notification');
      throw error;
    }
  }, [userType, t]);

  // DELETE ALL NOTIFICATIONS
  const deleteAllNotifications = useCallback(async () => {
    try {
      const endpoint = userType === 'student' ? '/student/notifications/all' :
                      userType === 'guest' ? '/guest/notifications/all' :
                      userType === 'staff' ? '/staff/notifications/all' : '/admin/notifications/all';

      await axios.delete(endpoint);
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
      toast.error(t('deleteAllFailed') || 'Failed to delete all notifications');
      throw error;
    }
  }, [userType, t]);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.is_read) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    addNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export default NotificationContext;