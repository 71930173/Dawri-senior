import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Clock, Users, MapPin, Bell, Volume2, VolumeX,
  AlertTriangle, XCircle, RefreshCw, Timer, Sparkles, Phone, Mail, CheckCircle
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Loading from '../common/Loading';
import AnimatedCard from '../common/AnimatedCard';
import ConfettiEffect from '../common/ConfettiEffect';
import PriorityBadge from '../common/PriorityBadge';

// FIXED: Use a more robust tracking system that persists across refreshes
// but resets when appointment changes
const getSentTracker = () => {
  const stored = localStorage.getItem('queue_sent_tracker');
  return stored ? JSON.parse(stored) : {};
};

const setSentTracker = (tracker) => {
  localStorage.setItem('queue_sent_tracker', JSON.stringify(tracker));
};

const isSent = (type, appointmentId) => {
  const tracker = getSentTracker();
  return tracker[`${type}_${appointmentId}`] === true;
};

const markSent = (type, appointmentId) => {
  const tracker = getSentTracker();
  tracker[`${type}_${appointmentId}`] = true;
  setSentTracker(tracker);
};

const QueueStatus = () => {
  const { appointmentId } = useParams();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [threeMinSent, setThreeMinSent] = useState(false);
  const [turnNowSent, setTurnNowSent] = useState(false);
  const [showWebAlert, setShowWebAlert] = useState(null);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // FIXED: fetchQueueStatus now properly handles loading state
  const fetchQueueStatus = useCallback(async () => {
    try {
      setIsLoading(true);  // Show loading on manual refresh
      const response = await studentAPI.getQueueStatus(appointmentId);
      const data = response.data;
      setStatus(data);
      if (data.remaining_seconds !== undefined) {
        setTimeLeft(data.remaining_seconds);
      }
    } catch (error) {
      console.error('Error fetching queue status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchQueueStatus();
    intervalRef.current = setInterval(() => {
      // Auto-refresh without loading spinner
      studentAPI.getQueueStatus(appointmentId).then(response => {
        const data = response.data;
        setStatus(data);
        if (data.remaining_seconds !== undefined) {
          setTimeLeft(data.remaining_seconds);
        }
      }).catch(err => console.error('Auto-refresh error:', err));
    }, 5000);

    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, [appointmentId]);

  useEffect(() => {
    if (status?.status !== 'waiting') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
  }, [status?.status]);

  // FIXED: 3-minute warning - ONLY ONCE when remaining time is around 3 minutes (150-210 seconds)
  useEffect(() => {
    if (!appointmentId) return;
    if (!status?.ticket_number) return;
    if (status?.status !== 'waiting') return;

    // Only trigger when time is between 150-210 seconds (2.5-3.5 min window)
    if (!timeLeft || timeLeft > 210 || timeLeft < 150) return;

    // Check if already sent for this appointment
    if (isSent('threeMin', appointmentId)) return;
    if (threeMinSent) return;

    // Mark as sent immediately to prevent duplicates
    markSent('threeMin', appointmentId);
    setThreeMinSent(true);

    // Play sound
    if (soundEnabled) playNotificationSound();

    // Show web alert with bilingual message
    const alertMsg = lang === 'ar' 
      ? '⏰ تنبيه: دورك قادم خلال 3 دقائق! يرجى الاستعداد.'
      : '⏰ Alert: Your turn is coming in 3 minutes! Please be ready.';
    setShowWebAlert({ type: '3min', message: alertMsg });

    // Auto-hide after 10 seconds
    setTimeout(() => setShowWebAlert(null), 10000);

    // Send notifications
    sendThreeMinNotification();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, status?.status, appointmentId, soundEnabled, lang]);

  // FIXED: Turn now notification - ONLY ONCE when status changes to serving
  useEffect(() => {
    if (!appointmentId) return;
    if (!status?.ticket_number) return;
    if (status?.status !== 'serving') return;

    // Check if already sent for this appointment
    if (isSent('turnNow', appointmentId)) return;
    if (turnNowSent) return;

    // Mark as sent immediately
    markSent('turnNow', appointmentId);
    setTurnNowSent(true);
    setShowConfetti(true);

    // Play sound
    if (soundEnabled) playTurnSound();

    // Show web alert with bilingual message
    const alertMsg = lang === 'ar'
      ? '🎉 دورك الآن! اذهب إلى المكتب، Dr. في انتظارك!'
      : "🎉 It's Your Turn Now! Go to the office, the Dr. is waiting for you!";
    setShowWebAlert({ type: 'turn', message: alertMsg });

    // Auto-hide after 15 seconds
    setTimeout(() => {
      setShowWebAlert(null);
      setShowConfetti(false);
    }, 15000);

    // Send notifications
    sendTurnNotification();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.status, appointmentId, soundEnabled, lang]);

  // FIXED: Send 3-min notification with in-app DB save
  const sendThreeMinNotification = async () => {
    if (!user) return;

    const hasEmail = user.email && user.email.includes('@');
    const hasPhone = user.phone && /^[+\d]/.test(user.phone);

    // Send email notification
    if (hasEmail) {
      try {
        await studentAPI.send3MinWarning(appointmentId);
      } catch (e) {
        console.error('3min email failed:', e);
      }
    }

    // Send WhatsApp notification
    if (hasPhone) {
      try {
        await studentAPI.send3MinWhatsApp(appointmentId);
      } catch (e) {
        console.error('3min WhatsApp failed:', e);
      }
    }
  };

  const sendTurnNotification = async () => {
    if (!user) return;

    const hasEmail = user.email && user.email.includes('@');
    const hasPhone = user.phone && /^[+\d]/.test(user.phone);

    if (hasEmail) {
      try {
        await studentAPI.sendTurnNowEmail(appointmentId);
      } catch (e) {
        console.error('Turn email failed:', e);
      }
    }

    if (hasPhone) {
      try {
        await studentAPI.sendTurnNowWhatsApp(appointmentId);
      } catch (e) {
        console.error('Turn WhatsApp failed:', e);
      }
    }
  };

  const playNotificationSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const audio = new Audio();
      audio.src = '/notification.mp3';
      audio.volume = 0.5;
      audioRef.current = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          console.log('Notification audio play failed (file may be missing)');
        });
      }
    } catch (e) {
      console.log('Audio play failed');
    }
  };

  const playTurnSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const audio = new Audio();
      audio.src = '/turn-now.mp3';
      audio.volume = 0.7;
      audioRef.current = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          console.log('Turn audio play failed (file may be missing)');
        });
      }
    } catch (e) {
      console.log('Audio play failed');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من إلغاء الطابور؟' : 'Are you sure you want to cancel?')) {
      return;
    }

    try {
      await studentAPI.cancelAppointment(appointmentId);
      navigate('/student/dashboard');
    } catch (error) {
      console.error('Cancel failed:', error);
    }
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // FIXED: Show loading only on initial load, not on auto-refresh
  if (isLoading && !status) return <Loading fullScreen />;

  if (!status) {
    return (
      <div className="page-container">
        <div className="content-container text-center py-16">
          <AlertTriangle className="w-16 h-16 text-accent-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark-900 mb-2">
            {lang === 'ar' ? 'لم يتم العثور على الموعد' : 'Appointment Not Found'}
          </h2>
          <button onClick={() => navigate('/student/dashboard')} className="btn-primary gap-2">
            <ArrowLeft className="w-4 h-4" /> {t('back')}
          </button>
        </div>
      </div>
    );
  }

  const isServing = status.status === 'serving';
  const isWaiting = status.status === 'waiting';

  return (
    <div className="page-container">
      <ConfettiEffect active={showConfetti} />

      {/* FIXED: Web Dashboard Alert - Bilingual, shown prominently */}
      <AnimatePresence>
        {showWebAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed top-20 left-4 right-4 z-50 mx-auto max-w-lg ${
              showWebAlert.type === 'turn' 
                ? 'bg-secondary-500 text-white' 
                : 'bg-accent-500 text-white'
            } rounded-2xl shadow-hard p-4 flex items-center gap-3`}
          >
            <div className={`w-12 h-12 rounded-xl ${
              showWebAlert.type === 'turn' ? 'bg-white/20' : 'bg-white/20'
            } flex items-center justify-center flex-shrink-0`}>
              {showWebAlert.type === 'turn' ? (
                <Sparkles className="w-6 h-6" />
              ) : (
                <Clock className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">{showWebAlert.message}</p>
              <p className="text-sm opacity-90">
                {showWebAlert.type === 'turn'
                  ? (lang === 'ar' ? 'Ticket / التذكرة: #' : 'Ticket: #') + status.ticket_number
                  : (lang === 'ar' ? 'Position / الموقع: #' : 'Position: #') + status.queue_position
                }
              </p>
            </div>
            <button 
              onClick={() => setShowWebAlert(null)}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="content-container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate('/student/dashboard')}
            className="flex items-center gap-2 text-dark-500 hover:text-dark-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <AnimatedCard className={`p-8 text-center ${isServing ? 'bg-secondary-50 border-secondary-300' : ''}`}>
            <div className="mb-4">
              <span className="text-sm text-dark-500 uppercase tracking-wider font-semibold">
                {t('ticketNumber')}
              </span>
            </div>

            <motion.div
              animate={isServing ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: isServing ? Infinity : 0, duration: 2 }}
              className="mb-4"
            >
              <span className="text-7xl md:text-9xl font-black gradient-text">
                #{status.ticket_number}
              </span>
            </motion.div>

            {isServing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-100 text-secondary-700 rounded-full font-bold text-lg mb-4"
              >
                <Sparkles className="w-5 h-5" />
                {t('yourTurn')}
              </motion.div>
            )}

            {isWaiting && (
              <div className="space-y-2">
                <p className="text-4xl font-bold text-primary-600 font-mono">
                  {formatTime(timeLeft)}
                </p>
                <p className="text-sm text-dark-500">
                  {t('estimatedWait')}
                </p>
              </div>
            )}

            <div className="mt-4">
              <PriorityBadge 
                priority={status.priority} 
                isGuestPriority={status.is_guest_priority} 
              />
            </div>
          </AnimatedCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-bold text-dark-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                {t('queueStatus')}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-dark-50 rounded-xl">
                  <span className="text-sm text-dark-600">{t('yourPosition')}</span>
                  <span className="text-2xl font-bold text-primary-600">
                    #{status.queue_position}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-dark-50 rounded-xl">
                  <span className="text-sm text-dark-600">{t('peopleBefore')}</span>
                  <span className="text-lg font-semibold text-dark-700">
                    {status.people_before}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-dark-50 rounded-lg text-center">
                    <p className="text-xs text-dark-500">{t('studentsBefore')}</p>
                    <p className="text-lg font-semibold text-dark-700">{status.students_before || 0}</p>
                  </div>
                  <div className="p-2 bg-accent-50 rounded-lg text-center border border-accent-200">
                    <p className="text-xs text-accent-600">{t('guestsBefore')}</p>
                    <p className="text-lg font-semibold text-accent-700">{status.guests_before || 0}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="h-3 bg-dark-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(5, 100 - (status.queue_position * 10))}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        isServing ? 'bg-secondary-500' : 'bg-primary-500'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-dark-500 text-center mt-1">
                    {isServing 
                      ? (lang === 'ar' ? 'دورك الآن!' : 'Your turn now!')
                      : `${Math.round(Math.max(5, 100 - (status.queue_position * 10)))}% ${lang === 'ar' ? 'متبقي' : 'remaining'}`
                    }
                  </p>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-bold text-dark-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                {t('staffInfo')}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark-700">{status.staff_name}</p>
                    <p className="text-xs text-dark-500">{t('staffName')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark-700">
                      {status.block}, {status.floor}
                    </p>
                    <p className="text-xs text-dark-500">{t('block')} / {t('floor')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Timer className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark-700">
                      {status.avg_service_time} {t('minutes')}
                    </p>
                    <p className="text-xs text-dark-500">
                      {lang === 'ar' ? 'متوسط وقت الخدمة' : 'Avg Service Time'}
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-bold text-dark-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-600" />
                {t('notifications')}
              </h3>

              <div className="space-y-3">
                {/* FIXED: 3-min notification status - shows checkmark when sent */}
                <div className={`p-3 rounded-xl border transition-all ${
                  threeMinSent 
                    ? 'bg-accent-50 border-accent-300' 
                    : 'bg-dark-50 border-dark-100'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {threeMinSent ? (
                      <CheckCircle className="w-4 h-4 text-accent-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-dark-400" />
                    )}
                    <span className={`text-sm font-semibold ${threeMinSent ? 'text-accent-700' : 'text-dark-600'}`}>
                      {t('turnAfter3Min')}
                    </span>
                  </div>
                  <p className="text-xs text-dark-500">
                    {threeMinSent 
                      ? (lang === 'ar' ? '✅ تم الإرسال (Email + WhatsApp)' : '✅ Sent (Email + WhatsApp)')
                      : (lang === 'ar' ? '⏳ في الانتظار' : '⏳ Pending')
                    }
                  </p>
                  <div className="flex gap-2 mt-2">
                    {user?.phone && (
                      <span className="inline-flex items-center gap-1 text-xs text-dark-500">
                        <Phone className="w-3 h-3" /> WhatsApp
                      </span>
                    )}
                    {user?.email && (
                      <span className="inline-flex items-center gap-1 text-xs text-dark-500">
                        <Mail className="w-3 h-3" /> Email
                      </span>
                    )}
                  </div>
                </div>

                {/* FIXED: Turn now notification status */}
                <div className={`p-3 rounded-xl border transition-all ${
                  turnNowSent 
                    ? 'bg-secondary-50 border-secondary-300' 
                    : 'bg-dark-50 border-dark-100'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {turnNowSent ? (
                      <CheckCircle className="w-4 h-4 text-secondary-600" />
                    ) : (
                      <Bell className="w-4 h-4 text-dark-400" />
                    )}
                    <span className={`text-sm font-semibold ${turnNowSent ? 'text-secondary-700' : 'text-dark-600'}`}>
                      {t('yourTurn')}
                    </span>
                  </div>
                  <p className="text-xs text-dark-500">
                    {turnNowSent 
                      ? (lang === 'ar' ? '✅ تم الإرسال' : '✅ Sent')
                      : (lang === 'ar' ? '⏳ في الانتظار' : '⏳ Pending')
                    }
                  </p>
                </div>

                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="w-full flex items-center justify-between p-3 bg-dark-50 rounded-xl hover:bg-dark-100 transition-colors"
                >
                  <span className="text-sm text-dark-600">
                    {lang === 'ar' ? 'صوت الإشعارات' : 'Notification Sound'}
                  </span>
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-primary-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-dark-400" />
                  )}
                </button>
              </div>
            </AnimatedCard>
          </motion.div>
        </div>

        {/* FIXED: Refresh button now works properly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex flex-wrap gap-3"
        >
          <button
            onClick={fetchQueueStatus}
            disabled={isLoading}
            className="btn-outline gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? (lang === 'ar' ? 'جاري التحديث...' : 'Refreshing...') : t('refresh')}
          </button>

          {!isServing && (
            <button
              onClick={handleCancel}
              className="btn-danger gap-2 ml-auto"
            >
              <XCircle className="w-4 h-4" />
              {t('cancelQueue')}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default QueueStatus;