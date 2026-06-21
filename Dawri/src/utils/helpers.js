export const formatDate = (dateString, lang = 'en') => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', options);
};

export const formatTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '0 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const getStatusColor = (status) => {
  const colors = {
    waiting: 'bg-primary-100 text-primary-700 border-primary-300',
    serving: 'bg-secondary-100 text-secondary-700 border-secondary-300',
    served: 'bg-dark-100 text-dark-700 border-dark-300',
    cancelled: 'bg-danger-100 text-danger-700 border-danger-300',
    paused: 'bg-accent-100 text-accent-700 border-accent-300',
    no_show: 'bg-dark-200 text-dark-600 border-dark-300',
    resolved_remotely: 'bg-primary-50 text-primary-600 border-primary-200',
  };
  return colors[status] || colors.waiting;
};

export const getStatusLabel = (status, t) => {
  const labels = {
    waiting: t('waiting'),
    serving: t('serving'),
    served: t('served'),
    cancelled: t('cancelled'),
    paused: t('paused'),
    no_show: t('noShow'),
    resolved_remotely: t('resolvedRemotely'),
  };
  return labels[status] || status;
};

export const getPriorityColor = (priority, isGuestPriority) => {
  if (isGuestPriority || priority === 1) {
    return 'bg-accent-100 text-accent-700 border-accent-300';
  }
  return 'bg-primary-100 text-primary-700 border-primary-300';
};

export const getPriorityLabel = (priority, isGuestPriority, t) => {
  if (isGuestPriority || priority === 1) {
    return t('guestPriority');
  }
  return t('studentPriority');
};

export const generateTicketNumber = () => {
  const date = new Date();
  const prefix = date.getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${random}`;
};

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone) => {
  const regex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return !phone || regex.test(phone);
};

export const validateStudentId = (id) => {
  return id && id.length >= 3 && id.length <= 50;
};

export const validatePassword = (password) => {
  if (!password || password.length < 6) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return false;
  return true;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last;
};

export const getRandomColor = () => {
  const colors = [
    'bg-primary-500', 'bg-secondary-500', 'bg-accent-500', 
    'bg-danger-500', 'bg-dark-500'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
};

export const downloadFile = (content, filename, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const calculateQueueProgress = (position, total) => {
  if (total === 0) return 100;
  const progress = ((total - position + 1) / total) * 100;
  return Math.min(100, Math.max(0, progress));
};

export const isRTL = (text) => {
  const rtlRegex = /[֑-߿יִ-﷽ﹰ-﻿]/;
  return rtlRegex.test(text);
};

export const getIssueTypeIcon = (iconName) => {
  const iconMap = {
    'FaUserPlus': 'UserPlus',
    'FaDollarSign': 'DollarSign',
    'FaGraduationCap': 'GraduationCap',
    'FaLaptopCode': 'Laptop',
    'FaUsers': 'Users',
    'FaQuestionCircle': 'HelpCircle',
  };
  return iconMap[iconName] || 'HelpCircle';
};

export const getIssueTypeColor = (color) => {
  const colorMap = {
    '#2563eb': 'primary',
    '#10b981': 'secondary',
    '#f59e0b': 'accent',
    '#8b5cf6': 'purple',
    '#ec4899': 'pink',
    '#64748b': 'dark',
  };
  return colorMap[color] || 'primary';
};
