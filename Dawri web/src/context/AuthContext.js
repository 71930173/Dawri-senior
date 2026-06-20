import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
axios.defaults.baseURL = API_URL;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const isPublicPage = () => {
  const path = window.location.pathname;
  const publicPaths = ['/login', '/signup', '/staff/login', '/guest/login', '/guest/signup', '/admin/login'];
  return publicPaths.some(p => path.startsWith(p)) || path === '/';
};

// ============================================================
// SECURITY FIX: sessionStorage by default. localStorage only if rememberMe=true
// This prevents copy-paste URL in new tab from accessing dashboard
// ============================================================
const authStorage = {
  get: (key) => sessionStorage.getItem(key) || localStorage.getItem(key),
  set: (key, value, remember = false) => {
    sessionStorage.setItem(key, value);
    if (remember) localStorage.setItem(key, value);
  },
  remove: (key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [staff, setStaff] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(authStorage.get('token'));
  const logoutRef = useRef(null);

  const logout = useCallback(() => {
    // Clear all auth storage (student, guest, admin, staff)
    authStorage.remove('token');
    authStorage.remove('userType');
    authStorage.remove('user');
    authStorage.remove('adminToken');
    authStorage.remove('adminData');
    sessionStorage.removeItem('staffToken');
    sessionStorage.removeItem('staffData');
    sessionStorage.removeItem('rememberMe');
    setToken(null);
    setUser(null);
    setAdmin(null);
    setStaff(null);
    setUserType(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
    if (!isPublicPage()) {
      toast.info('Logged out successfully');
    }
  }, []);

  logoutRef.current = logout;

  useEffect(() => {
    const reqInt = axios.interceptors.request.use(
      (config) => {
        // FIX: Build full URL to check (handles both relative and absolute)
        const baseURL = config.baseURL || '';
        const url = config.url || '';
        const fullUrl = baseURL + url;

        // Public endpoints: NEVER send auth token (prevents stale token 401 errors)
        const isPublicEndpoint =
          url.includes('/login') || url.includes('/signup') ||
          url.includes('/forgot') || url.includes('/password-reset') ||
          url.includes('/auth/guest') || url.includes('/auth/student') ||
          url.includes('/auth/admin') || url.includes('/auth/staff');

        if (isPublicEndpoint) {
          // EXPLICITLY delete any existing Authorization header
          if (config.headers) delete config.headers.Authorization;
          return config;
        }

        // Protected endpoints: add token if available
        const t = authStorage.get('token') || authStorage.get('adminToken') || sessionStorage.getItem('staffToken');
        if (t) config.headers.Authorization = 'Bearer ' + t;
        return config;
      },
      (error) => Promise.reject(error)
    );

    const resInt = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const url = error.config && error.config.url ? error.config.url : '';
        const isLoginRequest = url.includes('/login') || url.includes('/signup');
        if (error.response && error.response.status === 401 && !isLoginRequest) {
          if (logoutRef.current) logoutRef.current();
          toast.error('Session expired. Please login again.');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqInt);
      axios.interceptors.response.eject(resInt);
    };
  }, []);

  // FIXED: Only verify token on protected pages, NOT on login/signup
  useEffect(() => {
    const verifyToken = async () => {
      if (isPublicPage()) {
        setIsLoading(false);
        setLoading(false);
        return;
      }

      // First try admin auth
      const adminToken = sessionStorage.getItem('adminToken');
      const storedAdmin = sessionStorage.getItem('adminData');
      
      if (adminToken && storedAdmin) {
        try {
          const parsedAdmin = JSON.parse(storedAdmin);
          setAdmin(parsedAdmin);
          setUser(parsedAdmin);
          setUserType('admin');
          setToken(adminToken);
          setIsAuthenticated(true);
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + adminToken;
          setIsLoading(false);
          setLoading(false);
          return;
        } catch (error) {
          console.error('Admin auth initialization error:', error);
          sessionStorage.removeItem('adminToken');
          sessionStorage.removeItem('adminData');
        }
      }

      // Then try staff auth
      const staffToken = sessionStorage.getItem('staffToken');
      const storedStaff = sessionStorage.getItem('staffData');
      
      if (staffToken && storedStaff) {
        try {
          const parsedStaff = JSON.parse(storedStaff);
          setStaff(parsedStaff);
          setUser(parsedStaff);
          setUserType('staff');
          setToken(staffToken);
          setIsAuthenticated(true);
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + staffToken;
          setIsLoading(false);
          setLoading(false);
          return;
        } catch (error) {
          console.error('Staff auth initialization error:', error);
          sessionStorage.removeItem('staffToken');
          sessionStorage.removeItem('staffData');
        }
      }

      // Then try regular user auth (student/guest)
      const storedToken = authStorage.get('token');
      const storedUserType = authStorage.get('userType');
      const storedUser = authStorage.get('user');

      if (!storedToken || !storedUserType || !storedUser) {
        setIsLoading(false);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/auth/verify', {
          headers: { Authorization: 'Bearer ' + storedToken }
        });

        if (response.data && response.data.valid) {
          setToken(storedToken);
          setUserType(storedUserType);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + storedToken;
        } else {
          if (logoutRef.current) logoutRef.current();
        }
      } catch (error) {
        console.error('Token verification error:', error.message);
        if (logoutRef.current) logoutRef.current();
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // SECURITY FIX: Added rememberMe parameter
  // Supports both signatures:
  //   login(credentials, type, rememberMe) - for student/guest
  //   login(email, password) - for admin and staff direct login
  const login = useCallback(async (credentials, type, rememberMe = false) => {
    // Handle admin direct login: login(email, password) signature
    if (typeof credentials === 'string' && typeof type === 'string') {
      const email = credentials;
      const password = type;
      
      // Try admin login first, then staff login
      // We determine which by checking the URL or trying both
      const isStaffPage = window.location.pathname.startsWith('/staff');
      
      if (isStaffPage) {
        // Staff login
        try {
          const res = await axios.post('/auth/staff/login', { email, password });
          const { token: staffToken, staff: staffData } = res.data;

          if (!staffToken || !staffData) {
            return { success: false, error: 'Invalid server response' };
          }

          sessionStorage.setItem('staffToken', staffToken);
          sessionStorage.setItem('staffData', JSON.stringify(staffData));
          axios.defaults.headers.common['Authorization'] = `Bearer ${staffToken}`;

          setStaff(staffData);
          setUser(staffData);
          setUserType('staff');
          setToken(staffToken);
          setIsAuthenticated(true);
          return { success: true, staff: staffData };
        } catch (err) {
          const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Login failed. Please check your credentials.';
          return { success: false, error: errorMessage };
        }
      } else {
        // Admin login
        try {
          const res = await axios.post('/auth/admin/login', { email, password });
          const { token: adminToken, admin: adminData } = res.data;

          if (!adminToken || !adminData) {
            return { success: false, error: 'Invalid server response' };
          }

          sessionStorage.setItem('adminToken', adminToken);
          sessionStorage.setItem('adminData', JSON.stringify(adminData));
          axios.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

          setAdmin(adminData);
          setUser(adminData);
          setUserType('admin');
          setToken(adminToken);
          setIsAuthenticated(true);
          return { success: true };
        } catch (err) {
          const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Login failed. Please check your credentials.';
          return { success: false, error: errorMessage };
        }
      }
    }

    // Standard login: login(credentials, type, rememberMe)
    try {
      const endpoint = type === 'student' ? '/student/login' :
                      type === 'guest' ? '/guest/login' :
                      type === 'staff' ? '/auth/staff/login' :
                      type === 'admin' ? '/auth/admin/login' : '/auth/login';

      const response = await axios.post(endpoint, credentials, { maxRedirects: 0 });

      if (response.data && response.data.success) {
        const newToken = response.data.token;
        const userData = response.data[type] || response.data.student || response.data.guest || response.data.staff || response.data.admin;

        // SECURITY FIX: Store in sessionStorage. localStorage only if rememberMe=true
        authStorage.set('token', newToken, rememberMe);
        authStorage.set('userType', type, rememberMe);
        authStorage.set('user', JSON.stringify(userData), rememberMe);

        setToken(newToken);
        setUserType(type);
        setUser(userData);
        setIsAuthenticated(true);
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;

        toast.success('Welcome back, ' + (userData.firstName || userData.first_name || userData.name) + '!');
        return { success: true, user: userData };
      } else {
        return { success: false, error: response.data?.error || 'Wrong ID or password' };
      }
    } catch (error) {
      let message = 'Wrong ID or password';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (typeof data === 'string') {
          if (status === 500) message = 'Server error, please try again';
          else if (status === 401) message = 'Wrong ID or password';
          else message = 'Server error, please try again';
        } else if (data && typeof data === 'object') {
          if (data.error) message = data.error;
          else if (data.message) message = data.message;
        }
      } else if (error.request) {
        message = 'Cannot connect to server. Please check your internet.';
      } else if (error.message) {
        message = error.message;
      }

      return { success: false, error: message };
    }
  }, []);

  const signup = useCallback(async (data, type, rememberMe = false) => {
    try {
      // FIX: Guest signup is at /api/auth/guest/signup (NOT /api/guest/signup)
      const endpoint = type === 'student' ? '/student/signup' :
                       type === 'guest' ? '/auth/guest/signup' : '/auth/signup';

      // FIX: Backend expects snake_case for guest signup, frontend sends camelCase
      let requestData = data;
      if (type === 'guest') {
        requestData = {
          first_name: data.firstName || data.first_name,
          last_name: data.lastName || data.last_name,
          contact_value: data.contactValue || data.contact_value,
          contact_method: data.contactMethod || data.contact_method || 'phone',
          password: data.password,
          language: data.language || 'en'
        };
      }

      const response = await axios.post(endpoint, requestData);

      if (response.data && response.data.success) {
        const newToken = response.data.token;
        const userData = response.data[type] || response.data.student || response.data.guest;

        // SECURITY FIX: Same storage logic
        authStorage.set('token', newToken, rememberMe);
        authStorage.set('userType', type, rememberMe);
        authStorage.set('user', JSON.stringify(userData), rememberMe);

        setToken(newToken);
        setUserType(type);
        setUser(userData);
        setIsAuthenticated(true);
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
        toast.success('Account created successfully!');
        return { success: true, user: userData };
      } else {
        return { success: false, error: response.data?.error || 'Signup failed' };
      }
    } catch (error) {
      let message = 'Signup failed';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (typeof data === 'string') {
          if (status === 409) message = 'Student ID or email already exists';
          else if (status === 500) message = 'Server error, please try again';
          else message = 'Signup failed, please try again';
        } else if (data && typeof data === 'object') {
          if (data.error) message = data.error;
          else if (data.message) message = data.message;
        }
      } else if (error.request) {
        message = 'Cannot connect to server. Please check your internet.';
      } else if (error.message) {
        message = error.message;
      }

      return { success: false, error: message };
    }
  }, []);

  // Token refresh mechanism (from admin AuthContext)
  const refreshToken = useCallback(async () => {
    try {
      // Try admin token first
      const adminToken = sessionStorage.getItem('adminToken');
      if (adminToken) {
        const res = await axios.post('/api/auth/refresh', {}, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        if (res.data?.token) {
          sessionStorage.setItem('adminToken', res.data.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
          return true;
        }
        return false;
      }

      // Then try regular token
      const tok = authStorage.get('token');
      if (!tok) return false;

      const res = await axios.post('/api/auth/refresh', {}, {
        headers: { Authorization: `Bearer ${tok}` }
      });

      if (res.data?.token) {
        authStorage.set('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.token;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, []);

  const updateUser = useCallback((updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    // Keep in same storage location as original
    const currentToken = authStorage.get('token');
    const isRemembered = localStorage.getItem('token') === currentToken;
    authStorage.set('user', JSON.stringify(updatedUser), isRemembered);
  }, [user]);

  const updateAdminData = useCallback((newData) => {
    setAdmin(prev => {
      const updated = { ...prev, ...newData };
      sessionStorage.setItem('adminData', JSON.stringify(updated));
      return updated;
    });
    // Also update user to keep them in sync
    setUser(prev => {
      const updated = { ...prev, ...newData };
      return updated;
    });
  }, []);

  const updateStaff = useCallback((updates) => {
    setStaff(prev => {
      const updated = { ...prev, ...updates };
      sessionStorage.setItem('staffData', JSON.stringify(updated));
      return updated;
    });
    setUser(prev => {
      const updated = { ...prev, ...updates };
      return updated;
    });
  }, []);

  const value = {
    user, userType, isAuthenticated, isLoading, loading, token, admin, staff,
    login, signup, logout, updateUser, refreshToken, updateAdminData, updateStaff,
    isStudent: userType === 'student',
    isGuest: userType === 'guest',
    isStaff: userType === 'staff',
    isAdmin: userType === 'admin',
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export default AuthContext;