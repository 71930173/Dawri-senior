import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, allowedTypes = [] }) => {
  const { isAuthenticated, isLoading, userType } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading fullScreen text="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(userType)) {
    return <Navigate to={`/${userType}/dashboard`} replace />;
  }

  return children;
};

export default ProtectedRoute;
