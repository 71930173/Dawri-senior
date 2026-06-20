import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Mail, MessageSquare, Lock, Eye, EyeOff,
  KeyRound, User, Phone, AlertCircle, CheckCircle2,
  RefreshCw, ShieldCheck, Sparkles
} from 'lucide-react';
import { passwordResetAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

// Step indicators
const StepIndicator = ({ currentStep, steps, lang }) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <React.Fragment key={stepNum}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isActive
                    ? 'bg-primary-500 text-white ring-4 ring-primary-500/20'
                    : 'bg-white/10 text-white/40'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
              </div>
              <span className={`text-xs ${isActive ? 'text-white' : 'text-white/40'}`}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 rounded-full transition-all duration-300 ${
                isCompleted ? 'bg-emerald-500' : 'bg-white/10'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const ForgotPassword = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') || 'student';

  const [userType, setUserType] = useState(defaultType); // 'student' or 'guest'
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1 fields
  const [identifier, setIdentifier] = useState(''); // studentId or contactValue
  const [maskContact, setMaskContact] = useState('');

  // Step 2 fields
  const [resetToken, setResetToken] = useState('');
  const [resetCode, setResetCode] = useState('');

  // Step 3 fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const steps = lang === 'ar'
    ? ['الهوية', 'الرمز', 'الكلمة']
    : ['Identify', 'Verify', 'Reset'];

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!identifier.trim()) {
      setError(userType === 'student'
        ? (lang === 'ar' ? 'رقم الطالب مطلوب' : 'Student ID is required')
        : (lang === 'ar' ? 'رقم الهاتف أو البريد مطلوب' : 'Phone or email is required')
      );
      return;
    }

    setIsLoading(true);

    try {
      let response;
      if (userType === 'student') {
        response = await passwordResetAPI.forgotStudent(identifier.trim());
      } else {
        response = await passwordResetAPI.forgotGuest(identifier.trim());
      }

      if (response.data.sent) {
        setResetToken(response.data.resetToken);
        setMaskContact(response.data.maskEmail || response.data.maskContact || '');
        setSuccess(lang === 'ar'
          ? `تم إرسال رمز إعادة التعيين إلى ${response.data.maskEmail || response.data.maskContact || 'بريدك/هاتفك'}`
          : `Reset code sent to ${response.data.maskEmail || response.data.maskContact || 'your email/phone'}`
        );
        setStep(2);
      } else {
        setSuccess(lang === 'ar'
          ? 'إذا كان الحساب موجوداً، سيتم إرسال رمز إعادة التعيين.'
          : 'If an account exists, a reset code has been sent.'
        );
      }
    } catch (err) {
      const msg = err.response?.data?.error || (lang === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong. Please try again.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!resetCode.trim() || resetCode.length !== 6) {
      setError(lang === 'ar' ? 'أدخل الرمز المكون من 6 أرقام' : 'Enter the 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await passwordResetAPI.verifyCode(resetToken, resetCode.trim(), userType);

      if (response.data.valid) {
        setSuccess(lang === 'ar' ? 'تم التحقق! يمكنك الآن تعيين كلمة مرور جديدة.' : 'Verified! You can now set a new password.');
        setStep(3);
      }
    } catch (err) {
      const errCode = err.response?.data?.code;
      let msg;
      if (errCode === 'EXPIRED') {
        msg = lang === 'ar' ? 'انتهت صلاحية الرمز. اطلب رمزاً جديداً.' : 'Code expired. Request a new one.';
      } else if (errCode === 'INVALID_CODE') {
        msg = lang === 'ar' ? 'رمز غير صحيح. حاول مرة أخرى.' : 'Invalid code. Please try again.';
      } else if (errCode === 'ALREADY_USED') {
        msg = lang === 'ar' ? 'تم استخدام هذا الرمز مسبقاً.' : 'This code has already been used.';
      } else {
        msg = err.response?.data?.error || (lang === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong.');
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setError(lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await passwordResetAPI.resetPassword(resetToken, resetCode.trim(), userType, newPassword);

      if (response.data.reset) {
        setSuccess(lang === 'ar'
          ? 'تم إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.'
          : 'Password reset successfully! You can now login.'
        );
        // Redirect to login after 2 seconds
        setTimeout(() => {
          if (userType === 'student') {
            navigate('/login');
          } else {
            navigate('/guest/login');
          }
        }, 2500);
      }
    } catch (err) {
      const msg = err.response?.data?.error || (lang === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
      setSuccess('');
    }
  };

  // Resend code
  const handleResend = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      let response;
      if (userType === 'student') {
        response = await passwordResetAPI.forgotStudent(identifier.trim());
      } else {
        response = await passwordResetAPI.forgotGuest(identifier.trim());
      }

      if (response.data.sent) {
        setResetToken(response.data.resetToken);
        setSuccess(lang === 'ar' ? 'تم إرسال رمز جديد!' : 'New code sent!');
      }
    } catch (err) {
      setError(lang === 'ar' ? 'فشل إعادة الإرسال. حاول لاحقاً.' : 'Failed to resend. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-glow">
            <KeyRound className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
          </h1>
          <p className="text-white/60">
            {lang === 'ar' ? 'لا تقلق، سنساعدك في استعادتها' : "Don't worry, we'll help you recover it"}
          </p>
        </motion.div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} steps={steps} lang={lang} />

        {/* User Type Toggle (only on step 1) */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex bg-white/10 rounded-xl p-1 mb-6"
          >
            <button
              onClick={() => { setUserType('student'); setIdentifier(''); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                userType === 'student'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              {lang === 'ar' ? 'طالب' : 'Student'}
            </button>
            <button
              onClick={() => { setUserType('guest'); setIdentifier(''); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                userType === 'guest'
                  ? 'bg-accent-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Phone className="w-4 h-4" />
              {lang === 'ar' ? 'ضيف' : 'Guest'}
            </button>
          </motion.div>
        )}

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-hard"
        >
          {/* Error / Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-danger-500/20 border border-danger-500/30 flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 text-danger-400 flex-shrink-0 mt-0.5" />
                <p className="text-danger-300 text-sm">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-start gap-2"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-300 text-sm">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 1: Enter Identifier */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRequestCode}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {userType === 'student'
                      ? (lang === 'ar' ? 'رقم الطالب' : 'Student ID')
                      : (lang === 'ar' ? 'الهاتف أو البريد' : 'Phone or Email')
                    }
                    <span className="text-danger-400 ml-1">*</span>
                  </label>
                  <div className="relative">
                    {userType === 'student' ? (
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    ) : (
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    )}
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        userType === 'student'
                          ? (lang === 'ar' ? 'أدخل رقم الطالب' : 'Enter your Student ID')
                          : (lang === 'ar' ? 'أدخل الهاتف أو البريد' : 'Enter phone or email')
                      }
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:border-primary-400"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-glow ${
                    userType === 'student'
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-accent-600 text-white hover:bg-accent-700'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      {lang === 'ar' ? 'إرسال رمز إعادة التعيين' : 'Send Reset Code'}
                    </>
                  )}
                </button>

                {/* Info box */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-white/60">
                      {userType === 'student' ? (
                        lang === 'ar' ? (
                          <p>سنرسل رمز التحقق إلى بريدك المسجل. تأكد من الوصول إلى بريدك الإلكتروني.</p>
                        ) : (
                          <p>We'll send a verification code to your registered email. Make sure you can access your email.</p>
                        )
                      ) : (
                        lang === 'ar' ? (
                          <p>سنرسل رمز التحقق إلى بريدك أو واتسابك المسجل.</p>
                        ) : (
                          <p>We'll send a verification code to your registered email or WhatsApp.</p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </motion.form>
            )}

            {/* STEP 2: Enter Reset Code */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyCode}
                className="space-y-5"
              >
                <div className="text-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-7 h-7 text-primary-400" />
                  </div>
                  <p className="text-white/80 text-sm">
                    {lang === 'ar'
                      ? `أدخل الرمز المكون من 6 أرقام المرسل إلى ${maskContact}`
                      : `Enter the 6-digit code sent to ${maskContact}`
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {lang === 'ar' ? 'رمز إعادة التعيين' : 'Reset Code'}
                    <span className="text-danger-400 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => {
                        // Only allow 6 digits
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setResetCode(val);
                      }}
                      placeholder={lang === 'ar' ? '000000' : '000000'}
                      maxLength={6}
                      inputMode="numeric"
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/30 transition-all duration-300 focus:outline-none focus:border-primary-400 text-center text-2xl tracking-[0.5em] font-mono"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || resetCode.length !== 6}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-glow ${
                    userType === 'student'
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-accent-600 text-white hover:bg-accent-700'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      {lang === 'ar' ? 'تحقق من الرمز' : 'Verify Code'}
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={goBack}
                    className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {lang === 'ar' ? 'رجوع' : 'Back'}
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {lang === 'ar' ? 'إعادة الإرسال' : 'Resend Code'}
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 3: New Password */}
            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleResetPassword}
                className="space-y-5"
              >
                <div className="text-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-7 h-7 text-emerald-400" />
                  </div>
                  <p className="text-white/80 text-sm">
                    {lang === 'ar'
                      ? 'أدخل كلمة المرور الجديدة'
                      : 'Enter your new password'
                    }
                  </p>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                    <span className="text-danger-400 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={lang === 'ar' ? 'كلمة مرور جديدة (6 أحرف على الأقل)' : 'New password (min 6 characters)'}
                      className="w-full pl-12 pr-12 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:border-primary-400"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {newPassword.length > 0 && newPassword.length < 6 && (
                    <p className="text-danger-400 text-xs mt-1">
                      {lang === 'ar' ? 'يجب أن تكون 6 أحرف على الأقل' : 'Must be at least 6 characters'}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                    <span className="text-danger-400 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={lang === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                      className={`w-full pl-12 pr-12 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-white/40 transition-all duration-300 focus:outline-none ${
                        confirmPassword && confirmPassword !== newPassword
                          ? 'border-danger-400'
                          : 'border-white/20 focus:border-primary-400'
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
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-danger-400 text-xs mt-1">
                      {lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !newPassword || newPassword.length < 6 || newPassword !== confirmPassword}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-glow"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      {lang === 'ar' ? 'تعيين كلمة المرور' : 'Set New Password'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={goBack}
                  className="w-full text-center text-sm text-white/50 hover:text-white transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {lang === 'ar' ? 'رجوع' : 'Back'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Back to Login */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6 text-white/60"
        >
          {lang === 'ar' ? 'تذكرت كلمة المرور؟' : 'Remember your password?'}{' '}
          <Link
            to={userType === 'student' ? '/login' : '/guest/login'}
            className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
          >
            {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
          </Link>
        </motion.p>
      </div>
    </div>
  );
};

export default ForgotPassword;
