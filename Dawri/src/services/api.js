import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// SECURITY FIX: Read from sessionStorage first, then localStorage fallback
// Also checks for adminToken used by admin interface
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token') || sessionStorage.getItem('adminToken') || sessionStorage.getItem('staffToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - NEVER redirect on 401, just reject
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (credentials, type) => api.post(`/${type}/login`, credentials),
  signup: (data, type) => api.post(`/${type}/signup`, data),
  verify: () => api.get('/auth/verify'),
  logout: () => {
    // SECURITY FIX: Clear both storages to be safe
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userType');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminData');
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
  },
};

// Password Reset API
export const passwordResetAPI = {
  // Step 1: Request reset code
  forgotStudent: (studentId) => api.post('/password-reset/student/forgot', { studentId }),
  forgotGuest: (contactValue) => api.post('/password-reset/guest/forgot', { contactValue }),

  // Step 2: Verify reset code
  verifyCode: (resetToken, resetCode, userType) =>
    api.post('/password-reset/verify-code', { resetToken, resetCode, userType }),

  // Step 3: Reset password
  resetPassword: (resetToken, resetCode, userType, newPassword) =>
    api.post('/password-reset/reset', { resetToken, resetCode, userType, newPassword }),
};

// Student API
export const studentAPI = {
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  getIssueTypes: () => api.get('/student/issue-types'),
  getAvailableStaff: (issueTypeId) => api.get('/student/available-staff', { params: { issueTypeId } }),
  createAppointment: (data) => api.post('/student/appointments', {
    staff_id: parseInt(data.staff_id),
    issue_type_id: parseInt(data.issue_type_id),
    description: data.description || ''
  }),
  getMyAppointments: () => api.get('/student/my-appointments'),
  getActiveAppointment: () => api.get('/student/active-appointment'),
  cancelAppointment: (id) => api.post(`/student/appointments/${id}/cancel`),
  getQueueStatus: (appointmentId) => api.get(`/student/queue-status/${appointmentId}`),
  getNotifications: () => api.get('/student/notifications'),
  markNotificationRead: (id) => api.put(`/student/notifications/${id}/read`),
  deleteNotification: (id) => api.delete(`/student/notifications/${id}`),
  deleteAllNotifications: () => api.delete('/student/notifications/all'),
  getStats: () => api.get('/student/stats'),
  sendEmail: (data) => api.post('/send-email', data),
  sendSMS: (data) => api.post('/send-sms', data),
  sendWhatsApp: (data) => api.post('/send-whatsapp', data),
  send3MinWarning: (appointmentId) => api.post(`/student/queue-status/${appointmentId}/send-3min-warning`),
  send3MinWhatsApp: (appointmentId) => api.post(`/student/queue-status/${appointmentId}/send-3min-whatsapp`),
  sendTurnNowEmail: (appointmentId) => api.post(`/student/queue-status/${appointmentId}/send-turn-now`),
  sendTurnNowWhatsApp: (appointmentId) => api.post(`/student/queue-status/${appointmentId}/send-turn-now-whatsapp`),
};
// Guest API
export const guestAPI = {
  getProfile: () => api.get('/guest/profile'),
  updateProfile: (data) => api.put('/guest/profile', data),
  getIssueTypes: () => api.get('/guest/issue-types'),
  getAvailableStaff: (issueTypeId) => api.get('/guest/available-staff', { params: { issueTypeId } }),
  createAppointment: (data) => api.post('/guest/appointments', {
    staff_id: parseInt(data.staff_id),
    issue_type_id: parseInt(data.issue_type_id),
    description: data.description || ''
  }),
  getMyAppointments: () => api.get('/guest/my-appointments'),
  getActiveAppointment: () => api.get('/guest/active-appointment'),
  cancelAppointment: (id) => api.post(`/guest/appointments/${id}/cancel`),
  getQueueStatus: (appointmentId) => api.get(`/guest/queue-status/${appointmentId}`),
  getNotifications: () => api.get('/guest/notifications'),
  markNotificationRead: (id) => api.put(`/guest/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/guest/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/guest/notifications/${id}`),
  deleteAllNotifications: () => api.delete('/guest/notifications/all'),
  getStats: () => api.get('/guest/stats'),
  send3MinWarning: (appointmentId) => api.post(`/guest/queue-status/${appointmentId}/send-3min-warning`),
  send3MinWhatsApp: (appointmentId) => api.post(`/guest/queue-status/${appointmentId}/send-3min-whatsapp`),
  sendTurnNowEmail: (appointmentId) => api.post(`/guest/queue-status/${appointmentId}/send-turn-now`),
  sendTurnNowWhatsApp: (appointmentId) => api.post(`/guest/queue-status/${appointmentId}/send-turn-now-whatsapp`),
};

// Staff API - FULL VERSION from staff-interface
export const staffAPI = {
  // Queue management
  getMyQueue: () => api.get('/staff/my-queue'),
  serveNext: () => api.post('/staff/serve-next'),
  serveSpecific: (appointmentId) => api.post(`/staff/serve/${appointmentId}`),
  markServed: (appointmentId) => api.post(`/staff/mark-served/${appointmentId}`),
  cancelAppointment: (appointmentId, reason) => api.post(`/staff/cancel/${appointmentId}`, { reason }),
  resolveRemotely: (appointmentId, note = '') => api.post(`/staff/resolve-remotely/${appointmentId}`, { resolutionNote: note }),

  // Availability
  updateAvailability: (data) => api.put('/staff/availability', data),

  // Stats
  getMyStats: (period = 'day') => api.get(`/staff/stats?period=${period}`),

  // Profile
  getProfile: () => api.get('/staff/profile'),
  updateProfile: (data) => api.put('/staff/profile', data),

  // Notifications
  getNotifications: () => api.get('/staff/notifications'),

  // Export
  exportData: (type, params = {}) => api.get(`/export/${type}`, { params }),

  // Legacy endpoints (keep for backward compatibility)
  getQueue: () => api.get('/staff/queue'),
  getCurrentAppointment: () => api.get('/staff/current-appointment'),
  completeCurrent: (data) => api.post('/staff/complete', data),
  pauseQueue: (reason) => api.post('/staff/pause', { reason }),
  resumeQueue: () => api.post('/staff/resume'),
  setAvailability: (available) => api.put('/staff/availability', { is_available: available }),
  getStats: () => api.get('/staff/stats'),
  markNotificationRead: (id) => api.put(`/staff/notifications/${id}/read`),
};

// Admin API - FULL VERSION with all functions from admin-interface
export const adminAPI = {
  // Dashboard stats
  getDashboardStats: (period = 'day') => 
    api.get(`/admin/dashboard?period=${period}`),

  getRecentActivity: (limit = 10) => 
    api.get(`/admin/recent-activity?limit=${limit}`),

  // Staff management
  getAllStaff: () => api.get('/admin/staff'),
  createStaff: (data) => api.post('/admin/staff', data),
  updateStaff: (id, data) => api.put(`/admin/staff/${id}`, data),
  deleteStaff: (id) => api.delete(`/admin/staff/${id}`),
  updateStaffStatus: (id, status) => api.put(`/admin/staff/${id}/status`, { status }),

  // Issue types
  getIssueTypes: () => api.get('/admin/issue-types'),
  createIssueType: (data) => api.post('/admin/issue-types', data),
  updateIssueType: (id, data) => api.put(`/admin/issue-types/${id}`, data),
  deleteIssueType: (id) => api.delete(`/admin/issue-types/${id}`),

  // Peak hours & analytics
  getPeakHours: (period = 'day') => 
    api.get(`/admin/peak-hours?period=${period}`),

  getAnalytics: (period = 'week') => 
    api.get(`/admin/analytics?period=${period}`),

  getStaffPerformance: () => 
    api.get('/admin/staff-performance'),

  // Export data
  exportData: (type, format = 'json', filters = {}) => 
    api.get(`/export/${type}`, { 
      params: { format, ...filters },
      responseType: format === 'csv' ? 'blob' : 'json'
    }),

  // System settings
  getSystemSettings: () => api.get('/admin/settings'),
  updateSystemSetting: (key, value) => api.put('/admin/settings', { key, value }),

  // Notifications
  getNotifications: (limit = 20) => api.get(`/admin/notifications?limit=${limit}`),
  markNotificationRead: (id) => api.put(`/admin/notifications/${id}/read`),

  // Original student-interface admin endpoints (keep for backward compatibility)
  getDashboard: () => api.get('/admin/dashboard'),
  getStaff: () => api.get('/admin/staff'),
  getStudents: () => api.get('/admin/students'),
  getParents: () => api.get('/admin/parents'),
  getAppointments: (params) => api.get('/admin/appointments', { params }),
  getStats: () => api.get('/admin/stats'),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
};

// Export helper for CSV downloads
export const downloadCSV = (blob, filename) => {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Export helper for JSON downloads
export const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
