
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../models/User';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  roles
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  
  console.log('ProtectedRoute check:', {
    isAuthenticated,
    hasUser: !!user,
    isLoading,
    currentPath: location.pathname
  });
  
  if (isLoading) {
    // You could render a loading spinner here
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page, but save the current location they tried to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check for role-based access if roles are specified
  if (roles && roles.length > 0 && user) {
    if (!roles.includes(user.role)) {
      // User doesn't have the required role
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // If they're authenticated and have the right role, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
