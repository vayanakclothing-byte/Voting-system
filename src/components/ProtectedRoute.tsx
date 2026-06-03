import React from 'react';
import { useApp } from '../context/AppContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAdminLoggedIn } = useApp();

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};
