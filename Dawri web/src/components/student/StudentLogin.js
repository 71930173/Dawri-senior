import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Lock, User, Eye, EyeOff, 
  AlertCircle, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const StudentLogin = () => {
  const { login } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentId: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const doLogin = async () => {
    const newErrors = {};
    if (!formData.studentId.trim()) {
      newErrors.studentId = t('enterStudentId');
    }
    if (!formData.password) {
      newErrors.password = t('enterPassword');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // SECURITY FIX: Pass rememberMe to login so token storage respects the choice
      const result = await login({
        studentId: formData.studentId,
        password: formData.password
      }, 'student', rememberMe);

      if (result && result.success) {
        navigate('/student/dashboard');
      } else {
        const errMsg = (result && result.error) || 'Wrong ID or password';
        window.alert(errMsg);
      }
    } catch (err) {
      console.error('Login error:', err);
      window.alert('Wrong ID or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-glow">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('studentLogin')}</h1>
          <p className="text-white/60">
            {lang === 'ar' ? 'سجل دخولك للوصول إلى النظام' : 'Login to access your account'}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-hard">
          <div className="space-y-5">
            <div>
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
                    errors.studentId ? 'border-danger-400' : 'border-white/20 focus:border-primary-400'
                  }`}
                />
              </div>
              {errors.studentId && (
                <p className="text-danger-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.studentId}
                </p>
              )}
            </div>

            <div>
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
                  placeholder={t('enterPassword')}
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
              {errors.password && (
                <p className="text-danger-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-primary-500 focus:ring-primary-400"
                />
                <span className="text-sm text-white/60">{t('rememberMe')}</span>
              </label>
              <Link to="/forgot-password?type=student" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                {t('forgotPassword')}
              </Link>
            </div>

            <button
              onClick={doLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-glow"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-5 h-5" /> {t('login')}
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center mt-6 text-white/60">
          {t('noAccount')}{' '}
          <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
            {t('signupHere')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;