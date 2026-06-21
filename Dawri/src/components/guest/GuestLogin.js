import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Lock, Phone, Eye, EyeOff, Zap, QrCode, X, ArrowRight, Smartphone, Info, Mic, MicOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

// ============================================================
// QR CODE URL: Change this to your production domain
// Current: uses current window location (auto-detects)
// To hardcode: const QR_BASE_URL = 'https://your-domain.com';
// ============================================================
const QR_BASE_URL = window.location.origin;

// QR Code Modal
const QRCodeModal = ({ isOpen, onClose, lang }) => {
  const guestLoginUrl = `${QR_BASE_URL}/guest/login`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-accent-500/20 flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-7 h-7 text-accent-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {lang === 'ar' ? 'مسح رمز QR' : 'Scan QR Code'}
              </h3>
              <p className="text-white/50 text-sm mt-1">
                {lang === 'ar'
                  ? 'امسح الرمز بهاتفك للدخول كضيف'
                  : 'Scan with your phone to login as guest'
                }
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 mx-auto w-fit shadow-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(guestLoginUrl)}`}
                alt="QR Code for Guest Login"
                className="w-48 h-48"
              />
            </div>
            <div className="flex items-center justify-center gap-2 mt-5 text-white/40 text-xs">
              <Smartphone className="w-4 h-4" />
              <span>
                {lang === 'ar'
                  ? 'افتح كاميرا هاتفك وامسح الرمز'
                  : 'Open your phone camera and scan'
                }
              </span>
            </div>
            <p className="text-center text-white/30 text-xs mt-3 truncate px-4">{guestLoginUrl}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Voice input hook using Web Speech API
const useVoiceInput = (lang) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState(null);

  const startListening = useCallback((onResult) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(lang === 'ar' ? 'المتصفح لا يدعم الميكروفون' : 'Browser does not support voice input');
      return;
    }

    setVoiceError(null);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang === 'ar' ? 'ar-SA' : 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setVoiceError(lang === 'ar' ? 'خطأ في الميكروفون' : 'Microphone error');
      }
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (err) {
      setVoiceError(lang === 'ar' ? 'لا يمكن تشغيل الميكروفون' : 'Cannot start microphone');
    }
  }, [lang]);

  return { isListening, voiceError, startListening };
};

// Microphone button component
const MicButton = ({ isListening, onClick, lang }) => (
  <button
    type="button"
    onClick={onClick}
    title={isListening
      ? (lang === 'ar' ? 'جاري الاستماع...' : 'Listening...')
      : (lang === 'ar' ? 'انقر للتحدث' : 'Click to speak')
    }
    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300 rounded-lg p-1 ${
      isListening
        ? 'text-accent-400 animate-pulse bg-accent-400/10'
        : 'text-white/30 hover:text-accent-400 hover:bg-white/10'
    }`}
  >
    {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
  </button>
);

// Micro input with voice support
const MicroInput = ({ label, name, type = 'text', value, onChange, placeholder, error, icon: Icon, helperText, lang, enableVoice, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { isListening, startListening } = useVoiceInput(lang);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  // Calculate right padding based on which right-side buttons are shown
  let rightPadding = 'pr-4';
  if (isPassword && enableVoice) rightPadding = 'pr-24';
  else if (isPassword || enableVoice) rightPadding = 'pr-12';

  const handleVoiceResult = (transcript) => {
    onChange({ target: { name, value: transcript } });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-white/80 mb-2">
        {label}
        {props.required && <span className="text-danger-400 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />}
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} ${rightPadding} py-3 bg-white/10 border-2 rounded-xl text-white placeholder-white/30 focus:outline-none transition-all duration-300 ${
            error ? 'border-danger-400 focus:border-danger-400' : 'border-white/20 focus:border-accent-400'
          }`}
          {...props}
        />
        {/* Mic button */}
        {enableVoice && !isPassword && (
          <MicButton isListening={isListening} onClick={() => startListening(handleVoiceResult)} lang={lang} />
        )}
        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute top-1/2 -translate-y-1/2 transition-colors ${
              enableVoice ? 'right-12' : 'right-4'
            } text-white/40 hover:text-white`}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {/* Helper text */}
      {helperText && !error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <Info className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
          <p className="text-white/40 text-xs">{helperText}</p>
        </div>
      )}
      {/* Error */}
      {error && (
        <p className="text-danger-400 text-sm mt-1.5 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-danger-400" />
          {error}
        </p>
      )}
    </div>
  );
};

const GuestLogin = () => {
  const { login } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ contactValue: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.contactValue.trim()) newErrors.contactValue = lang === 'ar' ? 'رقم الهاتف أو البريد مطلوب' : 'Phone or email required';
    if (!formData.password) newErrors.password = lang === 'ar' ? 'كلمة المرور مطلوبة' : 'Password required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setIsLoading(true);
    setErrors({});
    const result = await login({ contactValue: formData.contactValue, password: formData.password }, 'guest');
    if (result.success) {
      navigate('/guest/dashboard');
    } else {
      setErrors({ form: result.error || (lang === 'ar' ? 'البيانات غير صحيحة' : 'Invalid credentials') });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-accent-900 flex items-center justify-center px-4 py-12">
      <QRCodeModal isOpen={showQR} onClose={() => setShowQR(false)} lang={lang} />
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{lang === 'ar' ? 'دخول ضيف' : 'Guest Login'}</h1>
          <p className="text-white/60">{lang === 'ar' ? 'أولوية خاصة في الطابور' : 'Special priority in queue'}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-hard">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Form error message */}
            {errors.form && (
              <div className="p-3 rounded-xl bg-danger-500/20 border border-danger-500/30 flex items-center gap-2">
                <span className="text-danger-400 text-sm font-medium">{errors.form}</span>
              </div>
            )}
            <MicroInput
              label={lang === 'ar' ? 'الهاتف أو البريد' : 'Phone or Email'}
              name="contactValue"
              value={formData.contactValue}
              onChange={handleChange}
              placeholder={lang === 'ar' ? 'أدخل رقم الهاتف أو البريد' : 'Enter phone or email'}
              error={errors.contactValue}
              icon={Phone}
              helperText={lang === 'ar'
                ? 'انقر على الميكروفون وتحدث، أو اكتب يدوياً'
                : 'Click the mic and speak, or type manually'
              }
              lang={lang}
              enableVoice={true}
              required
            />
            <MicroInput
              label={lang === 'ar' ? 'كلمة المرور' : 'Password'}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={lang === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'}
              error={errors.password}
              icon={Lock}
              helperText={lang === 'ar' ? '6 أحرف على الأقل' : 'At least 6 characters'}
              lang={lang}
              required
            />
            <div className="flex items-center justify-end">
              <Link to="/forgot-password?type=guest" className="text-sm text-accent-400 hover:text-accent-300 transition-colors">
                {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
              </Link>
            </div>
            <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 rounded-xl bg-accent-600 text-white font-semibold hover:bg-accent-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-glow">
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap className="w-5 h-5" /> {lang === 'ar' ? 'دخول' : 'Login'}</>}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setShowQR(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 rounded-xl border-2 border-white/20 text-white/80 font-medium hover:bg-white/10 hover:border-accent-400/50 hover:text-white transition-all flex items-center justify-center gap-2 group"
            >
              <QrCode className="w-5 h-5 text-accent-400 group-hover:scale-110 transition-transform" />
              <span>{lang === 'ar' ? 'دخول باستخدام QR' : 'Login with QR Code'}</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </form>
          <p className="text-center mt-6 text-white/60">
            {lang === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
            <Link to="/guest/signup" className="text-accent-400 hover:text-accent-300 font-semibold transition-colors">{lang === 'ar' ? 'سجل هنا' : 'Sign up here'}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
export default GuestLogin;