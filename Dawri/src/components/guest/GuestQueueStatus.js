import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, Users, MapPin, Bell, Volume2, VolumeX,
  AlertTriangle, XCircle, RefreshCw, Timer, Sparkles, Phone, Mail, CheckCircle,
  QrCode, Crown, Share2, Download
} from 'lucide-react';
import { guestAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Loading from '../common/Loading';
import AnimatedCard from '../common/AnimatedCard';
import ConfettiEffect from '../common/ConfettiEffect';
import PriorityBadge from '../common/PriorityBadge';

// QR Code Component using free API
const QRCodeDisplay = ({ value, size = 200 }) => {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (value) {
      const encoded = encodeURIComponent(value);
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`);
    }
  }, [value, size]);

  const handleDownload = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = 'queue-qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share && qrUrl) {
      try {
        await navigator.share({
          title: 'My Queue Ticket',
          text: `Ticket #${value}`,
          url: value
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(value);
      alert('Link copied to clipboard!');
    }
  };

  if (!qrUrl) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-4 bg-white rounded-2xl shadow-md border-2 border-accent-200">
        <img
          src={qrUrl}
          alt="Queue QR Code"
          className="w-48 h-48"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 px-3 py-2 bg-accent-100 text-accent-700 rounded-lg text-sm font-medium hover:bg-accent-200 transition-colors"
        >
          <Download className="w-4 h-4" />
          {value?.lang === 'ar' ? 'تحميل' : 'Download'}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1 px-3 py-2 bg-accent-100 text-accent-700 rounded-lg text-sm font-medium hover:bg-accent-200 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          {value?.lang === 'ar' ? 'مشاركة' : 'Share'}
        </button>
      </div>
    </div>
  );
};

// Sent tracker for notifications
const getSentTracker = () => {
  const stored = localStorage.getItem('parent_queue_sent_tracker');
  return stored ? JSON.parse(stored) : {};
};

const setSentTracker = (tracker) => {
  localStorage.setItem('parent_queue_sent_tracker', JSON.stringify(tracker));
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

const GuestQueueStatus = () => {
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
  const [showQR, setShowQR] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // Build ticket URL for QR code
  const ticketUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/guest/queue-status/${appointmentId}`
    : '';

  const fetchQueueStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await guestAPI.getQueueStatus(appointmentId);
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
      guestAPI.getQueueStatus(appointmentId).then(response => {
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
  }, [appointmentId, fetchQueueStatus]);

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

  // 3-minute warning
  useEffect(() => {
    if (!appointmentId) return;
    if (!status?.ticket_number) return;
    if (status?.status !== 'waiting') return;
    if (!timeLeft || timeLeft > 210 || timeLeft < 150) return;
    if (isSent('threeMin', appointmentId)) return;
    if (threeMinSent) return;

    markSent('threeMin', appointmentId);
    setThreeMinSent(true);

    if (soundEnabled) playNotificationSound();

    const alertMsg = lang === 'ar'
      ? '⏰ تنبيه: دورك قادم خلال 3 دقائق! يرجى الاستعداد.'
      : '⏰ Alert: Your turn is coming in 3 minutes! Please be ready.';
    setShowWebAlert({ type: '3min', message: alertMsg });

    setTimeout(() => setShowWebAlert(null), 10000);
    sendThreeMinNotification();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, status?.status, appointmentId, soundEnabled, lang]);

  // Turn now notification
  useEffect(() => {
    if (!appointmentId) return;
    if (!status?.ticket_number) return;
    if (status?.status !== 'serving') return;
    if (isSent('turnNow', appointmentId)) return;
    if (turnNowSent) return;

    markSent('turnNow', appointmentId);
    setTurnNowSent(true);
    setShowConfetti(true);

    if (soundEnabled) playTurnSound();

    const alertMsg = lang === 'ar'
      ? '🎉 دورك الآن! اذهب إلى المكتب، الموظف في انتظارك!'
      : "🎉 It's Your Turn Now! Go to the office, the staff is waiting for you!";
    setShowWebAlert({ type: 'turn', message: alertMsg });

    setTimeout(() => {
      setShowWebAlert(null);
      setShowConfetti(false);
    }, 15000);

    sendTurnNotification();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.status, appointmentId, soundEnabled, lang]);

  const sendThreeMinNotification = async () => {
    if (!user) return;
    const hasEmail = user.email || (user.contactValue && user.contactValue.includes('@'));
    const hasPhone = user.phone || (user.contactValue && /^[+\d]/.test(user.contactValue));

    if (hasEmail) {
      try { await guestAPI.send3MinWarning(appointmentId); } catch (e) { console.error('3min email failed:', e); }
    }
    if (hasPhone) {
      try { await guestAPI.send3MinWhatsApp(appointmentId); } catch (e) { console.error('3min WhatsApp failed:', e); }
    }
  };

  const sendTurnNotification = async () => {
    if (!user) return;
    const hasEmail = user.email || (user.contactValue && user.contactValue.includes('@'));
    const hasPhone = user.phone || (user.contactValue && /^[+\d]/.test(user.contactValue));

    if (hasEmail) {
      try { await guestAPI.sendTurnNowEmail(appointmentId); } catch (e) { console.error('Turn email failed:', e); }
    }
    if (hasPhone) {
      try { await guestAPI.sendTurnNowWhatsApp(appointmentId); } catch (e) { console.error('Turn WhatsApp failed:', e); }
    }
  };

  const playNotificationSound = () => {
    try {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      const audio = new Audio();
      audio.src = '/notification.mp3';
      audio.volume = 0.5;
      audioRef.current = audio;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => { console.log('Notification audio play failed'); });
      }
    } catch (e) { console.log('Audio play failed'); }
  };

  const playTurnSound = () => {
    try {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      const audio = new Audio();
      audio.src = '/turn-now.mp3';
      audio.volume = 0.7;
      audioRef.current = audio;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => { console.log('Turn audio play failed'); });
      }
    } catch (e) { console.log('Audio play failed'); }
  };

  const handleCancel = async () => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من إلغاء الطابور؟' : 'Are you sure you want to cancel?')) {
      return;
    }
    try {
      await guestAPI.cancelAppointment(appointmentId);
      navigate('/guest/dashboard');
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

  if (isLoading && !status) return <Loading fullScreen />;

  if (!status) {
    return (
      <div className="page-container">
        <div className="content-container text-center py-16">
          <AlertTriangle className="w-16 h-16 text-accent-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark-900 mb-2">
            {lang === 'ar' ? 'لم يتم العثور على الموعد' : 'Appointment Not Found'}
          </h2>
          <button onClick={() => navigate('/guest/dashboard')} className="btn-primary gap-2">
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

      {/* Web Dashboard Alert */}
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
            <div className={`w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0`}>
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
            onClick={() => navigate('/guest/dashboard')}
            className="flex items-center gap-2 text-dark-500 hover:text-dark-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
          </button>
        </motion.div>

        {/* Guest Priority Badge */}
        {isWaiting && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-accent-50 border-2 border-accent-300 rounded-xl p-3 flex items-center gap-2"
          >
            <Crown className="w-5 h-5 text-accent-600 flex-shrink-0" />
            <span className="text-sm text-accent-700 font-medium">
              {lang === 'ar'
                ? 'أولوية الضيف: خدمة أسرع من الطلاب'
                : 'Guest Priority: Faster service than students'}
            </span>
          </motion.div>
        )}

        {/* Ticket Display */}
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
                <p className="text-4xl font-bold text-accent-600 font-mono">
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

            {/* QR Code Toggle */}
            <div className="mt-6 pt-4 border-t border-dark-100">
              <button
                onClick={() => setShowQR(!showQR)}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-accent-100 text-accent-700 rounded-xl font-medium hover:bg-accent-200 transition-colors"
              >
                <QrCode className="w-5 h-5" />
                {showQR
                  ? (lang === 'ar' ? 'إخفاء رمز QR' : 'Hide QR Code')
                  : (lang === 'ar' ? 'عرض رمز QR' : 'Show QR Code')
                }
              </button>

              <AnimatePresence>
                {showQR && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="bg-dark-50 rounded-2xl p-6">
                      <p className="text-sm text-dark-600 mb-4">
                        {lang === 'ar'
                          ? 'امسح رمز QR للاطلاع على حالة طابورك'
                          : 'Scan QR code to check your queue status'}
                      </p>
                      <QRCodeDisplay value={ticketUrl} size={180} />
                      <p className="text-xs text-dark-400 mt-3 break-all">
                        {ticketUrl}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </AnimatedCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue Status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-bold text-dark-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent-600" />
                {t('queueStatus')}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-dark-50 rounded-xl">
                  <span className="text-sm text-dark-600">{t('yourPosition')}</span>
                  <span className="text-2xl font-bold text-accent-600">
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
                  <div className="p-2 bg-accent-50 rounded-lg text-center border border-accent-200">
                    <p className="text-xs text-accent-600">{lang === 'ar' ? 'أولياء قبلك' : 'Parents Before'}</p>
                    <p className="text-lg font-semibold text-accent-700">{status.guests_before || 0}</p>
                  </div>
                  <div className="p-2 bg-dark-50 rounded-lg text-center">
                    <p className="text-xs text-dark-500">{lang === 'ar' ? 'طلاب قبلك' : 'Students Before'}</p>
                    <p className="text-lg font-semibold text-dark-700">{status.students_before || 0}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="h-3 bg-dark-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(5, 100 - (status.queue_position * 10))}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        isServing ? 'bg-secondary-500' : 'bg-accent-500'
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

          {/* Staff Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-bold text-dark-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent-600" />
                {t('staffInfo')}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark-700">{status.staff_name}</p>
                    <p className="text-xs text-dark-500">{t('staffName')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-accent-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark-700">
                      {status.block}, {status.floor}
                    </p>
                    <p className="text-xs text-dark-500">{t('block')} / {t('floor')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                    <Timer className="w-5 h-5 text-accent-600" />
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

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-bold text-dark-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-accent-600" />
                {t('notifications')}
              </h3>

              <div className="space-y-3">
                {/* 3-min notification status */}
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
                    {(user?.phone || (user?.contactValue && /^[+\d]/.test(user?.contactValue))) && (
                      <span className="inline-flex items-center gap-1 text-xs text-dark-500">
                        <Phone className="w-3 h-3" /> WhatsApp
                      </span>
                    )}
                    {(user?.email || (user?.contactValue && user?.contactValue?.includes('@'))) && (
                      <span className="inline-flex items-center gap-1 text-xs text-dark-500">
                        <Mail className="w-3 h-3" /> Email
                      </span>
                    )}
                  </div>
                </div>

                {/* Turn now notification status */}
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
                    <Volume2 className="w-5 h-5 text-accent-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-dark-400" />
                  )}
                </button>
              </div>
            </AnimatedCard>
          </motion.div>
        </div>

        {/* Action Buttons */}
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

export default GuestQueueStatus;
