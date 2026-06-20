import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, Mail, Phone, Lock, User, Eye, EyeOff, 
  ArrowRight, CheckCircle, AlertCircle, Sparkles
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { validateEmail, validatePhone, validateStudentId, validatePassword } from '../../utils/helpers';

const StudentSignup = () => {
  const { signup } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!validateStudentId(formData.studentId)) {
      newErrors.studentId = t('enterStudentId');
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('enterFirstName');
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('enterLastName');
    }
    if (!validateEmail(formData.email)) {
      newErrors.email = t('enterEmail');
    }
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!validatePassword(formData.password)) {
      newErrors.password = t('createPassword');
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordMismatch');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const doSignup = async () => {
    // Step 1: validate fields and check for duplicates before going to step 2
    if (step === 1) {
      if (!validateStep1()) return;

      // Check if studentId or email already exists in database
      setIsLoading(true);
      setServerError('');

      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await axios.post(`${API_URL}/student/check-duplicate`, {
          studentId: formData.studentId,
          email: formData.email
        });

        if (response.data && response.data.exists) {
          setServerError(response.data.error || 'Student ID or email already exists');
          setIsLoading(false);
          return; // Stay on step 1
        }

        // No duplicate - proceed to step 2
        setStep(2);
      } catch (err) {
        if (err.response && err.response.status === 409) {
          const data = err.response.data;
          setServerError(data.error || 'Student ID or email already exists');
        } else {
          console.error('Check duplicate error:', err);
          setServerError('Cannot verify. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Step 2: create account
    if (!validateStep2()) return;

    setIsLoading(true);
    setServerError('');

    try {
      const result = await signup({
        studentId: formData.studentId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      }, 'student');

      if (result && result.success) {
        navigate('/student/dashboard');
      } else {
        const errMsg = (result && result.error) || 'Signup failed';
        window.alert(errMsg);
      }
    } catch (err) {
      console.error('Signup error:', err);
      window.alert('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSignup();
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1 } })
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('studentSignup')}</h1>
          <p className="text-white/60">
            {lang === 'ar' ? 'أنشئ حسابك للوصول إلى النظام' : 'Create your account to access the system'}
          </p>
        </motion.div>

        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                step >= s ? 'bg-primary-500 text-white shadow-glow' : 'bg-white/10 text-white/50'
              }`}>
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s === 1 && (
                <div className={`w-12 h-0.5 transition-all duration-300 ${
                  step > 1 ? 'bg-primary-500' : 'bg-white/20'
                }`} />
              )}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-hard"
        >
          <div className="space-y-5">
            {/* Server Error Display */}
            {serverError && (
              <div className="bg-red-500/20 border border-red-400 rounded-xl p-3 flex items-center gap-2 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {step === 1 ? (
              <>
                <motion.div custom={0} variants={inputVariants} initial="hidden" animate="visible">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t('studentId')} <span className="text-danger-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      placeholder={t('enterStudentId')}
                      autoComplete="off"
                      className={`w-full pl-12 pr-4 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none ${
                        errors.studentId ? 'border-danger-400 focus:border-danger-400' : 'border-white/20 focus:border-primary-400'
                      }`}
                    />
                  </div>
                  {errors.studentId && (
                    <p className="text-danger-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.studentId}
                    </p>
                  )}
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div custom={1} variants={inputVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      {t('firstName')} <span className="text-danger-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      placeholder={t('enterFirstName')}
                      autoComplete="off"
                      className={`w-full px-4 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none ${
                        errors.firstName ? 'border-danger-400' : 'border-white/20 focus:border-primary-400'
                      }`}
                    />
                    {errors.firstName && <p className="text-danger-400 text-sm mt-1">{errors.firstName}</p>}
                  </motion.div>

                  <motion.div custom={2} variants={inputVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      {t('lastName')} <span className="text-danger-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      placeholder={t('enterLastName')}
                      autoComplete="off"
                      className={`w-full px-4 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none ${
                        errors.lastName ? 'border-danger-400' : 'border-white/20 focus:border-primary-400'
                      }`}
                    />
                    {errors.lastName && <p className="text-danger-400 text-sm mt-1">{errors.lastName}</p>}
                  </motion.div>
                </div>

                <motion.div custom={3} variants={inputVariants} initial="hidden" animate="visible">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t('email')} <span className="text-danger-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      placeholder={t('enterEmail')}
                      autoComplete="off"
                      className={`w-full pl-12 pr-4 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none ${
                        errors.email ? 'border-danger-400' : 'border-white/20 focus:border-primary-400'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-danger-400 text-sm mt-1">{errors.email}</p>}
                </motion.div>

                <motion.div custom={4} variants={inputVariants} initial="hidden" animate="visible">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t('phone')} <span className="text-white/40">({t('optional')})</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      placeholder={t('enterPhone')}
                      autoComplete="off"
                      className={`w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:border-primary-400 ${
                        errors.phone ? 'border-danger-400' : ''
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-danger-400 text-sm mt-1">{errors.phone}</p>}
                </motion.div>
              </>
            ) : (
              <>
                <motion.div custom={0} variants={inputVariants} initial="hidden" animate="visible">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t('password')} <span className="text-danger-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      placeholder={t('createPassword')}
                      autoComplete="off"
                      className={`w-full pl-12 pr-12 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none ${
                        errors.password ? 'border-danger-400' : 'border-white/20 focus:border-primary-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-danger-400 text-sm mt-1">{errors.password}</p>}

                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            formData.password.length >= level * 2
                              ? level <= 2 ? 'bg-danger-400' : level === 3 ? 'bg-accent-400' : 'bg-secondary-400'
                              : 'bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-white/40 mt-1">
                      {lang === 'ar' ? '6 أحرف على الأقل' : 'At least 6 characters'}
                    </p>
                  </div>
                </motion.div>

                <motion.div custom={1} variants={inputVariants} initial="hidden" animate="visible">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t('confirmPassword')} <span className="text-danger-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      placeholder={t('confirmYourPassword')}
                      autoComplete="off"
                      className={`w-full pl-12 pr-12 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none ${
                        errors.confirmPassword ? 'border-danger-400' : 'border-white/20 focus:border-primary-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-danger-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.confirmPassword}
                    </p>
                  )}
                </motion.div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 rounded-xl border-2 border-white/20 text-white font-medium hover:bg-white/10 transition-all duration-300"
                >
                  {t('back')}
                </button>
              )}
              {/* PLAIN BUTTON - no motion, no type="submit" */}
              <button
                onClick={doSignup}
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : step === 1 ? (
                  <>
                    {t('next')} <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> {t('signup')}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6 text-white/60"
        >
          {t('haveAccount')}{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
            {t('loginHere')}
          </Link>
        </motion.p>
      </div>
    </div>
  );
};

export default StudentSignup;