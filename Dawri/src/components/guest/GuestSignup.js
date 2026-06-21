import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Lock, Phone, Eye, EyeOff, Zap, CheckCircle, User, Info, Mic, MicOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';

// Voice input hook using Web Speech API (no package needed)
const useVoiceInput = (lang) => {
  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback((onResult) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'ar' ? 'المتصفح لا يدعم الإدخال الصوتي' : 'Browser does not support voice input');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        console.error('Speech error:', event.error);
      }
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };
    try { recognition.start(); } catch (err) { setIsListening(false); }
  }, [lang]);

  return { isListening, startListening };
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
        {enableVoice && !isPassword && (
          <MicButton isListening={isListening} onClick={() => startListening(handleVoiceResult)} lang={lang} />
        )}
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
      {helperText && !error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <Info className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
          <p className="text-white/40 text-xs">{helperText}</p>
        </div>
      )}
      {error && (
        <p className="text-danger-400 text-sm mt-1.5 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-danger-400" />
          {error}
        </p>
      )}
    </div>
  );
};

const GuestSignup = () => {
  const { signup } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', contactValue: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = lang === 'ar' ? 'الاسم الأول مطلوب' : 'First name required';
    if (!formData.lastName.trim()) newErrors.lastName = lang === 'ar' ? 'الاسم الأخير مطلوب' : 'Last name required';
    if (!formData.contactValue.trim()) newErrors.contactValue = lang === 'ar' ? 'الهاتف أو البريد مطلوب' : 'Phone or email required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    const hasUpper = /[A-Z]/.test(formData.password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password);
    
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = lang === 'ar' ? '6 أحرف على الأقل' : 'Password min 6 chars';
    } else if (!hasUpper) {
      newErrors.password = lang === 'ar' ? 'يجب أن تحتوي على حرف كبير' : 'Must contain 1 uppercase letter';
    } else if (!hasSpecial) {
      newErrors.password = lang === 'ar' ? 'يجب أن تحتوي على رمز خاص' : 'Must contain 1 special character';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Step 1: validate fields and check for duplicate contact before going to step 2
    if (step === 1) {
      if (!validateStep1()) return;

      // Check if contactValue (email or phone) already exists
      setIsLoading(true);
      setServerError('');

      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await axios.post(`${API_URL}/guest/check-duplicate`, {
          contactValue: formData.contactValue
        });

        if (response.data && response.data.exists) {
          setServerError(response.data.error || (lang === 'ar' ? 'الهاتف أو البريد مستخدم بالفعل' : 'Phone or email already exists'));
          setIsLoading(false);
          return; // Stay on step 1
        }

        // No duplicate - proceed to step 2
        setStep(2);
      } catch (err) {
        if (err.response && err.response.status === 409) {
          const data = err.response.data;
          setServerError(data.error || (lang === 'ar' ? 'الهاتف أو البريد مستخدم بالفعل' : 'Phone or email already exists'));
        } else {
          console.error('Check duplicate error:', err);
          setServerError(lang === 'ar' ? 'لا يمكن التحقق. حاول مرة أخرى.' : 'Cannot verify. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Step 2: create account
    if (!validateStep2()) return;
    setIsLoading(true);
    const result = await signup({
      firstName: formData.firstName, lastName: formData.lastName,
      contactValue: formData.contactValue, password: formData.password, confirmPassword: formData.confirmPassword
    }, 'guest');
    if (result.success) navigate('/guest/dashboard');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-accent-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{lang === 'ar' ? 'تسجيل ضيف' : 'Guest Registration'}</h1>
        </motion.div>
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s ? 'bg-accent-500 text-white shadow-glow' : 'bg-white/10 text-white/50'}`}>
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s === 1 && <div className={`w-12 h-0.5 transition-all ${step > 1 ? 'bg-accent-500' : 'bg-white/20'}`} />}
            </div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-hard">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Server Error Display */}
            {serverError && (
              <div className="bg-red-500/20 border border-red-400 rounded-xl p-3 flex items-center gap-2 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {step === 1 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <MicroInput
                    label={lang === 'ar' ? 'الاسم الأول' : 'First Name'}
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder={lang === 'ar' ? 'محمد' : 'John'}
                    error={errors.firstName}
                    icon={User}
                    helperText={lang === 'ar' ? 'انقر الميكروفون وقل اسمك' : 'Click mic and say your name'}
                    lang={lang}
                    enableVoice={true}
                    required
                  />
                  <MicroInput
                    label={lang === 'ar' ? 'الاسم الأخير' : 'Last Name'}
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder={lang === 'ar' ? 'أحمد' : 'Doe'}
                    error={errors.lastName}
                    icon={User}
                    helperText={lang === 'ar' ? 'انقر الميكروفون وقل اسمك' : 'Click mic and say your name'}
                    lang={lang}
                    enableVoice={true}
                    required
                  />
                </div>
                <MicroInput
                  label={lang === 'ar' ? 'الهاتف أو البريد' : 'Phone or Email'}
                  name="contactValue"
                  value={formData.contactValue}
                  onChange={handleChange}
                  placeholder={lang === 'ar' ? 'أدخل رقم الهاتف أو البريد' : 'Enter phone or email'}
                  error={errors.contactValue}
                  icon={Phone}
                  helperText={lang === 'ar'
                    ? 'انقر الميكروفون وقل رقمك أو بريدك'
                    : 'Click mic and say your phone or email'
                  }
                  lang={lang}
                  enableVoice={true}
                  required
                />
              </>
            ) : (
              <>
                <MicroInput
                  label={lang === 'ar' ? 'كلمة المرور' : 'Password'}
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={lang === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'}
                  error={errors.password}
                  icon={Lock}
                  lang={lang}
                  required
                />
                {/* Password strength bars */}
                <div className="mt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => {
                      const hasUpper = /[A-Z]/.test(formData.password);
                      const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password);
                      const length = formData.password.length;
                      
                      let filled = false;
                      if (level === 1) filled = length >= 1;
                      if (level === 2) filled = length >= 6;
                      if (level === 3) filled = length >= 6 && hasUpper;
                      if (level === 4) filled = length >= 6 && hasUpper && hasSpecial;
                      
                      return (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            filled
                              ? level <= 2 ? 'bg-danger-400' : level === 3 ? 'bg-accent-400' : 'bg-secondary-400'
                              : 'bg-white/20'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-xs text-white/40 mt-1">
                    {lang === 'ar' 
                      ? '6 أحرف على الأقل، حرف كبير، ورمز خاص' 
                      : 'At least 6 chars, 1 uppercase, 1 special character'}
                  </p>
                </div>

                <MicroInput
                  label={lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={lang === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                  error={errors.confirmPassword}
                  icon={Lock}
                  lang={lang}
                  required
                />
              </>
            )}
            <div className="flex gap-3 pt-4">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 px-4 rounded-xl border-2 border-white/20 text-white font-medium hover:bg-white/10 transition-all">
                  {lang === 'ar' ? 'رجوع' : 'Back'}
                </button>
              )}
              <button type="submit" disabled={isLoading} className="flex-1 py-3 px-4 rounded-xl bg-accent-600 text-white font-semibold hover:bg-accent-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap className="w-5 h-5" /> {step === 1 ? (lang === 'ar' ? 'التالي' : 'Next') : (lang === 'ar' ? 'تسجيل' : 'Sign Up')}</>}
              </button>
            </div>
          </form>
        </motion.div>
        <p className="text-center mt-6 text-white/60">
          {lang === 'ar' ? 'لديك حساب؟' : 'Have an account?'}{' '}
          <Link to="/guest/login" className="text-accent-400 hover:text-accent-300 font-semibold transition-colors">{lang === 'ar' ? 'سجل دخول' : 'Login here'}</Link>
        </p>
      </div>
    </div>
  );
};
export default GuestSignup;