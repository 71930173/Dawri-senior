import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ArrowLeft, UserPlus, DollarSign, GraduationCap, 
  Laptop, Users, HelpCircle, Search, Mic, Sparkles, Check
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import Loading from '../common/Loading';
import AnimatedCard from '../common/AnimatedCard';

const iconMap = {
  'FaUserPlus': UserPlus,
  'FaDollarSign': DollarSign,
  'FaGraduationCap': GraduationCap,
  'FaLaptopCode': Laptop,
  'FaUsers': Users,
  'FaQuestionCircle': HelpCircle,
};

const colorMap = {
  '#2563eb': 'from-blue-500 to-blue-600',
  '#10b981': 'from-emerald-500 to-emerald-600',
  '#f59e0b': 'from-amber-500 to-amber-600',
  '#8b5cf6': 'from-violet-500 to-violet-600',
  '#ec4899': 'from-pink-500 to-pink-600',
  '#64748b': 'from-slate-500 to-slate-600',
};

const IssueTypeSelection = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [issueTypes, setIssueTypes] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    fetchIssueTypes();
  }, []);

  const fetchIssueTypes = async () => {
    try {
      const response = await studentAPI.getIssueTypes();
      setIssueTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching issue types:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice search not supported in this browser');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
    };

    recognition.start();
  };

  const filteredIssues = issueTypes.filter(issue => {
    const query = searchQuery.toLowerCase();
    return (
      issue.name.toLowerCase().includes(query) ||
      (issue.name_ar && issue.name_ar.includes(query)) ||
      (issue.description && issue.description.toLowerCase().includes(query))
    );
  });

  const handleSelect = (issue) => {
    setSelectedIssue(issue);
  };

  const handleContinue = () => {
    if (selectedIssue) {
      navigate(`/student/staff-selection/${selectedIssue.id}`);
    }
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/student/dashboard')}
            className="flex items-center gap-2 text-dark-500 hover:text-dark-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
          </button>

          <h1 className="text-3xl font-bold text-dark-900 mb-2">
            {lang === 'ar' ? 'ما نوع المساعدة التي تحتاجها؟' : 'What do you need help with?'}
          </h1>
          <p className="text-dark-500">
            {lang === 'ar' 
              ? 'اختر نوع المشكلة وسنقوم بتوجيهك إلى الموظف المناسب'
              : 'Select your issue type and we will direct you to the right staff'}
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث عن نوع المشكلة...' : 'Search issue types...'}
              className="w-full pl-12 pr-12 py-4 bg-white border-2 border-dark-200 rounded-2xl text-dark-900 placeholder-dark-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all duration-300"
            />
            <button
              onClick={handleVoiceSearch}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all duration-300 ${
                isListening 
                  ? 'bg-danger-100 text-danger-600 animate-pulse' 
                  : 'text-dark-400 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Issue Types Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredIssues.map((issue, index) => {
              const Icon = iconMap[issue.icon] || HelpCircle;
              const gradient = colorMap[issue.color] || 'from-primary-500 to-primary-600';
              const isSelected = selectedIssue?.id === issue.id;

              return (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelect(issue)}
                >
                  <AnimatedCard
                    selected={isSelected}
                    className={`p-6 h-full ${isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}
                  >
                    <div className="flex flex-col h-full">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      <h3 className="text-lg font-bold text-dark-900 mb-1">
                        {lang === 'ar' && issue.name_ar ? issue.name_ar : issue.name}
                      </h3>

                      <p className="text-sm text-dark-500 flex-1">
                        {issue.description || (lang === 'ar' ? 'لا يوجد وصف' : 'No description')}
                      </p>

                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-4 flex items-center gap-2 text-primary-600 font-semibold"
                        >
                          <Check className="w-5 h-5" />
                          {lang === 'ar' ? 'تم الاختيار' : 'Selected'}
                        </motion.div>
                      )}
                    </div>
                  </AnimatedCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredIssues.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <HelpCircle className="w-12 h-12 text-dark-300 mx-auto mb-4" />
            <p className="text-dark-500">
              {lang === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching results'}
            </p>
          </motion.div>
        )}

        {/* Continue Button */}
        <AnimatePresence>
          {selectedIssue && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 left-0 right-0 px-4 z-40"
            >
              <div className="max-w-xl mx-auto">
                <button
                  onClick={handleContinue}
                  className="w-full py-4 px-6 rounded-2xl bg-primary-600 text-white font-bold text-lg shadow-glow hover:bg-primary-700 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Sparkles className="w-5 h-5" />
                  {lang === 'ar' ? 'متابعة' : 'Continue'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IssueTypeSelection;
