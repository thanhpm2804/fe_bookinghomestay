import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, getUserRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const userRole = getUserRole();
    
    if (userRole !== requiredRole) {
      // Redirect based on role
      if (userRole === 'Admin') {
        return <Navigate to="/admin" replace />;
      } else if (userRole === 'Owner') {
        return <Navigate to="/owner/rooms" replace />;
      } else {
        return <Navigate to="/home" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute; 