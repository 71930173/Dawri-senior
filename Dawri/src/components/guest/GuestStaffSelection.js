import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Clock, Users, Crown,
  CheckCircle, AlertTriangle, Sparkles,
  Building2, DoorOpen, Loader
} from 'lucide-react';
import { guestAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import Loading from '../common/Loading';
import AnimatedCard from '../common/AnimatedCard';

const GuestStaffSelection = () => {
  const { issueTypeId } = useParams();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [confirmError, setConfirmError] = useState(null);

      useEffect(() => {
    const fetchStaffList = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await guestAPI.getAvailableStaff(issueTypeId);

        let staffArray = [];
        if (response.data) {
          if (Array.isArray(response.data)) {
            staffArray = response.data;
          } else if (response.data.staff && Array.isArray(response.data.staff)) {
            staffArray = response.data.staff;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            staffArray = response.data.data;
          } else if (response.data.id) {
            staffArray = [response.data];
          }
        }

        setStaffList(staffArray);
      } catch (error) {
        console.error('Error fetching staff:', error);
        setError(error.response?.data?.error || 'Failed to fetch staff');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffList();
  }, [issueTypeId]);
  const handleSelectStaff = (staff) => {
    setSelectedStaff(staff);
    setShowConfirm(true);
    setConfirmError(null);
  };

  const handleConfirm = async () => {
    if (!selectedStaff) return;

    setIsConfirming(true);
    setConfirmError(null);

    try {
      const response = await guestAPI.createAppointment({
        staff_id: parseInt(selectedStaff.id),
        issue_type_id: parseInt(issueTypeId),
        description: description || ''
      });

      if (response.data && response.data.id) {
        navigate(`/guest/queue-status/${response.data.id}`);
      } else {
        setConfirmError(lang === 'ar' ? 'خطأ: لم يتم إرجاع معرف الموعد' : 'Error: No appointment ID returned');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      const errorMsg = error.response?.data?.error ||
        (lang === 'ar' ? 'فشل إنشاء الموعد' : 'Failed to create appointment');
      setConfirmError(errorMsg);
    } finally {
      setIsConfirming(false);
    }
  };

  const getQueueInfo = (staff) => {
    const currentQueue = staff.current_queue || 0;
    const avgServiceTime = staff.avg_service_time || 5;
    return {
      currentQueue,
      estimatedWait: currentQueue * avgServiceTime,
      avgServiceTime,
      studentsBefore: Math.floor(currentQueue * 0.7),
      parentsBefore: Math.floor(currentQueue * 0.3),
    };
  };

  if (isLoading) return <Loading fullScreen />;

  if (error) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="text-center py-16">
            <AlertTriangle className="w-16 h-16 text-accent-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-dark-900 mb-2">
              {lang === 'ar' ? 'خطأ في تحميل الموظفين' : 'Error Loading Staff'}
            </h2>
            <p className="text-dark-500 mb-6">{error}</p>
            <button
              onClick={() => navigate('/guest/queue')}
              className="btn-primary gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (staffList.length === 0) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="text-center py-16">
            <AlertTriangle className="w-16 h-16 text-accent-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-dark-900 mb-2">
              {lang === 'ar' ? 'لا يوجد موظف متاح' : 'No Staff Available'}
            </h2>
            <p className="text-dark-500 mb-6">
              {lang === 'ar'
                ? 'لا يوجد موظف متاح لهذا النوع من المشاكل حالياً'
                : 'No staff is currently available for this issue type'}
            </p>
            <button
              onClick={() => navigate('/guest/queue')}
              className="btn-primary gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/guest/queue')}
            className="flex items-center gap-2 text-dark-500 hover:text-dark-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
          </button>

          <h1 className="text-3xl font-bold text-dark-900 mb-2">
            {lang === 'ar' ? 'اختر الموظف' : 'Select Staff'}
          </h1>
          <p className="text-dark-500">
            {lang === 'ar'
              ? `يوجد ${staffList.length} موظف متاح. اختر الموظف المناسب من القائمة أدناه`
              : `There are ${staffList.length} staff available. Choose the appropriate staff from the list below`}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {staffList.map((staff, index) => {
            const qInfo = getQueueInfo(staff);
            return (
              <motion.div
                key={staff.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AnimatedCard
                  className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedStaff?.id === staff.id ? 'ring-2 ring-accent-500 bg-accent-50' : ''
                  }`}
                  onClick={() => handleSelectStaff(staff)}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-accent-600 flex items-center justify-center text-white text-xl font-bold shadow-glow">
                      {staff.first_name?.[0]}{staff.last_name?.[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-dark-900">
                        {staff.first_name} {staff.last_name}
                      </h2>
                      <p className="text-dark-500 text-sm">{staff.issue_type || staff.issue_type_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-secondary-100 text-secondary-700 text-xs font-semibold rounded-lg">
                          {lang === 'ar' ? 'متاح' : 'Available'}
                        </span>
                        <span className="px-2 py-0.5 bg-accent-100 text-accent-700 text-xs font-semibold rounded-lg">
                          {lang === 'ar' ? 'أولوية ضيف' : 'Guest Priority'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-dark-50 rounded-xl">
                      <Building2 className="w-4 h-4 text-accent-600" />
                      <div>
                        <p className="text-xs text-dark-500">{t('block')}</p>
                        <p className="text-sm font-semibold text-dark-700">{staff.block}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 bg-dark-50 rounded-xl">
                      <MapPin className="w-4 h-4 text-accent-600" />
                      <div>
                        <p className="text-xs text-dark-500">{t('floor')}</p>
                        <p className="text-sm font-semibold text-dark-700">{staff.floor}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 bg-dark-50 rounded-xl">
                      <DoorOpen className="w-4 h-4 text-accent-600" />
                      <div>
                        <p className="text-xs text-dark-500">{t('roomNumber')}</p>
                        <p className="text-sm font-semibold text-dark-700">{staff.room_number}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 bg-accent-50 rounded-xl border border-accent-200">
                      <Clock className="w-4 h-4 text-accent-600" />
                      <div>
                        <p className="text-xs text-accent-600">{t('estimatedWait')}</p>
                        <p className="text-sm font-bold text-accent-700">{qInfo.estimatedWait} {t('minutes')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 bg-dark-50 rounded-xl">
                      <Users className="w-4 h-4 text-dark-400" />
                      <div>
                        <p className="text-xs text-dark-500">{t('currentQueue')}</p>
                        <p className="text-sm font-semibold text-dark-700">{qInfo.currentQueue} {lang === 'ar' ? 'شخص' : 'people'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-dark-100">
                    <button className="w-full py-2 rounded-xl bg-accent-600 text-white font-semibold hover:bg-accent-700 transition-all flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {lang === 'ar' ? 'اختيار' : 'Select'}
                    </button>
                  </div>
                </AnimatedCard>
              </motion.div>
            );
          })}
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirm && selectedStaff && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-dark-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowConfirm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-hard max-h-[90vh] overflow-y-auto"
              >
                <div className="w-16 h-16 rounded-2xl bg-accent-100 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-accent-600" />
                </div>
                <h2 className="text-2xl font-bold text-dark-900 text-center mb-2">
                  {lang === 'ar' ? 'تأكيد الطابور' : 'Confirm Queue'}
                </h2>
                <p className="text-dark-500 text-center mb-6">
                  {lang === 'ar'
                    ? `هل أنت متأكد من الانضمام إلى طابور ${selectedStaff.first_name}؟`
                    : `Are you sure you want to join ${selectedStaff.first_name}'s queue?`}
                </p>

                <div className="bg-dark-50 rounded-xl p-4 mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-500">{t('staffName')}</span>
                    <span className="font-semibold text-dark-700">{selectedStaff.first_name} {selectedStaff.last_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-500">{t('estimatedWait')}</span>
                    <span className="font-semibold text-accent-600">{getQueueInfo(selectedStaff).estimatedWait} {t('minutes')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-500">{t('peopleBefore')}</span>
                    <span className="font-semibold text-dark-700">{getQueueInfo(selectedStaff).currentQueue}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-500">{lang === 'ar' ? 'الموقع' : 'Location'}</span>
                    <span className="font-semibold text-dark-700">{selectedStaff.block}, {selectedStaff.floor}, {selectedStaff.room_number}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-500">{lang === 'ar' ? 'الأولوية' : 'Priority'}</span>
                    <span className="font-semibold text-accent-600 flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      {lang === 'ar' ? 'ضيف' : 'Guest'}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-dark-700 mb-2">
                    {lang === 'ar' ? 'وصف المشكلة (اختياري)' : 'Issue Description (Optional)'}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={lang === 'ar' ? 'صف مشكلتك باختصار...' : 'Briefly describe your issue...'}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border-2 border-dark-200 rounded-xl text-dark-900 placeholder-dark-400 focus:border-accent-500 focus:ring-4 focus:ring-accent-100 focus:outline-none transition-all duration-300 resize-none"
                  />
                </div>

                <AnimatePresence>
                  {confirmError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-3 rounded-xl bg-danger-50 border border-danger-200 text-danger-700 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>{confirmError}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-3 rounded-xl border-2 border-dark-200 text-dark-700 font-semibold hover:bg-dark-50 transition-all"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    className="flex-1 py-3 rounded-xl bg-accent-600 text-white font-semibold hover:bg-accent-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isConfirming ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        {t('confirm')}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GuestStaffSelection;
