import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import StudentLogin from './components/student/StudentLogin';
import StudentSignup from './components/student/StudentSignup';
import ForgotPassword from './components/common/ForgotPassword';
import StudentDashboard from './components/student/StudentDashboard';
import IssueTypeSelection from './components/student/IssueTypeSelection';
import StaffSelection from './components/student/StaffSelection';
import QueueStatus from './components/student/QueueStatus';
import StudentAppointments from './components/student/StudentAppointments';
import StudentNotifications from './components/student/StudentNotifications';
import StudentProfile from './components/student/StudentProfile';
import StudentSettings from './components/student/StudentSettings';

// Guest
import GuestLogin from './components/guest/GuestLogin';
import GuestSignup from './components/guest/GuestSignup';
import GuestDashboard from './components/guest/GuestDashboard';
import GuestQueue from './components/guest/GuestQueue';
import GuestStaffSelection from './components/guest/GuestStaffSelection';
import GuestQueueStatus from './components/guest/GuestQueueStatus';
import GuestAppointments from './components/guest/GuestAppointments';
import GuestNotifications from './components/guest/GuestNotifications';
import GuestProfile from './components/guest/GuestProfile';
import GuestSettings from './components/guest/GuestSettings';

// Staff - NEW from staff-interface
import StaffLogin from './components/staff/StaffLogin';
import StaffLayout from './components/staff/StaffLayout';
import StaffDashboard from './components/staff/StaffDashboard';
import StaffMyQueue from './components/staff/StaffMyQueue';
import StaffMyStats from './components/staff/StaffMyStats';
import StaffSettings from './components/staff/StaffSettings';

// Admin - NEW from admin-interface
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import StaffManagement from './components/admin/StaffManagement';
import IssueTypes from './components/admin/IssueTypes';
import PeakHours from './components/admin/PeakHours';
import Analytics from './components/admin/Analytics';

// Admin ProtectedRoute wrapper that also provides AdminLayout
const AdminProtectedRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedTypes={['admin']}>
      <AdminLayout>
        {children}
      </AdminLayout>
    </ProtectedRoute>
  );
};

// Staff ProtectedRoute wrapper that also provides StaffLayout
const StaffProtectedRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedTypes={['staff']}>
      <StaffLayout>
        {children}
      </StaffLayout>
    </ProtectedRoute>
  );
};

const AppContent = () => {
  const { isLoading } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  const isStaffRoute = location.pathname.startsWith('/staff') && location.pathname !== '/staff/login';
  const hideNavbar = isAdminRoute || isStaffRoute;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-dark-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-dark-50 ${!hideNavbar ? 'pt-16' : ''}`}>
      {!hideNavbar && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/signup" element={<StudentSignup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedTypes={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/queue" element={
            <ProtectedRoute allowedTypes={['student']}>
              <IssueTypeSelection />
            </ProtectedRoute>
          } />
          <Route path="/student/staff-selection/:issueTypeId" element={
            <ProtectedRoute allowedTypes={['student']}>
              <StaffSelection />
            </ProtectedRoute>
          } />
          <Route path="/student/queue-status/:appointmentId" element={
            <ProtectedRoute allowedTypes={['student']}>
              <QueueStatus />
            </ProtectedRoute>
          } />
          <Route path="/student/appointments" element={
            <ProtectedRoute allowedTypes={['student']}>
              <StudentAppointments />
            </ProtectedRoute>
          } />
          <Route path="/student/notifications" element={
            <ProtectedRoute allowedTypes={['student']}>
              <StudentNotifications />
            </ProtectedRoute>
          } />
          <Route path="/student/profile" element={
            <ProtectedRoute allowedTypes={['student']}>
              <StudentProfile />
            </ProtectedRoute>
          } />
          <Route path="/student/settings" element={
            <ProtectedRoute allowedTypes={['student']}>
              <StudentSettings />
            </ProtectedRoute>
          } />

          {/* Guest Routes */}
          <Route path="/guest/login" element={<GuestLogin />} />
          <Route path="/guest/signup" element={<GuestSignup />} />
          <Route path="/guest/dashboard" element={
            <ProtectedRoute allowedTypes={['guest']}>
              <GuestDashboard />
            </ProtectedRoute>
          } />
          <Route path="/guest/queue" element={
            <ProtectedRoute allowedTypes={['guest']}>
              <GuestQueue />
            </ProtectedRoute>
          } />
          <Route path="/guest/staff-selection/:issueTypeId" element={
            <ProtectedRoute allowedTypes={['guest']}>
              <GuestStaffSelection />
            </ProtectedRoute>
          } />
          <Route path="/guest/queue-status/:appointmentId" element={
            <ProtectedRoute allowedTypes={['guest']}>
              <GuestQueueStatus />
            </ProtectedRoute>
          } />
          <Route path="/guest/appointments" element={
            <ProtectedRoute allowedTypes={['guest']}>
              <GuestAppointments />
            </ProtectedRoute>
          } />
          <Route path="/guest/notifications" element={
            <ProtectedRoute allowedTypes={['guest']}>
              <GuestNotifications />
            </ProtectedRoute>
          } />
          <Route path="/guest/profile" element={
            <ProtectedRoute allowedTypes={['guest']}>
              <GuestProfile />
            </ProtectedRoute>
          } />
          <Route path="/guest/settings" element={
            <ProtectedRoute allowedTypes={['guest']}>
              <GuestSettings />
            </ProtectedRoute>
          } />

          {/* Staff Routes - NEW from staff-interface */}
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/staff/dashboard" element={
            <StaffProtectedRoute>
              <StaffDashboard />
            </StaffProtectedRoute>
          } />
          <Route path="/staff/queue" element={
            <StaffProtectedRoute>
              <StaffMyQueue />
            </StaffProtectedRoute>
          } />
          <Route path="/staff/stats" element={
            <StaffProtectedRoute>
              <StaffMyStats />
            </StaffProtectedRoute>
          } />
          <Route path="/staff/settings" element={
            <StaffProtectedRoute>
              <StaffSettings />
            </StaffProtectedRoute>
          } />

          {/* Admin Routes - NEW from admin-interface */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <AdminProtectedRoute>
              <Dashboard />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/staff" element={
            <AdminProtectedRoute>
              <StaffManagement />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/issues" element={
            <AdminProtectedRoute>
              <IssueTypes />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/peak-hours" element={
            <AdminProtectedRoute>
              <PeakHours />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <AdminProtectedRoute>
              <Analytics />
            </AdminProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="*" element={<AppContent />} />
    </Routes>
  );
};

export default App;
