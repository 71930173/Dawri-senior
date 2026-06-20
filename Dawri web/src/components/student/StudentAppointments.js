import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, ChevronRight, Search,
  Download, Printer, Clock, MapPin, User
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { formatDate,} from '../../utils/helpers';
import Loading from '../common/Loading';
import PageHeader from '../common/PageHeader';
import AnimatedCard from '../common/AnimatedCard';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';

const StudentAppointments = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    let filtered = appointments;

    if (filter !== 'all') {
      filtered = filtered.filter(a => a.status === filter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.ticket_number?.toString().includes(query) ||
        a.staff_name?.toLowerCase().includes(query) ||
        a.issue_type_name?.toLowerCase().includes(query)
      );
    }

    setFilteredAppointments(filtered);
  }, [appointments, filter, searchQuery]);

  const fetchAppointments = async () => {
    try {
      const response = await studentAPI.getMyAppointments();
      setAppointments(response.data || []);
      setFilteredAppointments(response.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filters = [
    { value: 'all', label: lang === 'ar' ? 'الكل' : 'All' },
    { value: 'waiting', label: t('waiting') },
    { value: 'serving', label: t('serving') },
    { value: 'served', label: t('served') },
    { value: 'cancelled', label: t('cancelled') },
  ];

  if (isLoading) return <Loading fullScreen />;

  return (
    <div className="page-container">
      <div className="content-container">
        <PageHeader
          title={t('myAppointments')}
          subtitle={lang === 'ar' ? 'سجل جميع مواعيدك' : 'History of all your appointments'}
          icon={Calendar}
          actions={
            <div className="flex gap-2">
              <button className="btn-outline gap-2 py-2 px-3 text-sm">
                <Download className="w-4 h-4" />
                {t('download')}
              </button>
              <button className="btn-outline gap-2 py-2 px-3 text-sm">
                <Printer className="w-4 h-4" />
                {t('print')}
              </button>
            </div>
          }
        />

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث في المواعيد...' : 'Search appointments...'}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-dark-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  filter === f.value
                    ? 'bg-primary-600 text-white shadow-glow'
                    : 'bg-white border-2 border-dark-200 text-dark-600 hover:border-primary-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={lang === 'ar' ? 'لا توجد مواعيد' : 'No Appointments'}
            description={
              searchQuery || filter !== 'all'
                ? (lang === 'ar' ? 'لا توجد نتائج مطابقة للتصفية' : 'No matching results for your filter')
: (lang === 'ar' ? 'لم تقم بإنشاء أي مواعيد بعد' : 'You have not created any appointments yet')            }
          />
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appt, index) => (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AnimatedCard
                  className="p-5"
                  onClick={() => navigate(`/student/queue-status/${appt.id}`)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Ticket Number */}
                    <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-primary-600">#{appt.ticket_number}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-dark-900">
                          {lang === 'ar' && appt.issue_type_name_ar ? appt.issue_type_name_ar : appt.issue_type_name}
                        </h3>
                        <StatusBadge status={appt.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-dark-500">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {appt.staff_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {appt.room_number}, {appt.block}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(appt.created_at, lang)}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-dark-400 hidden sm:block" />
                  </div>
                </AnimatedCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAppointments;
