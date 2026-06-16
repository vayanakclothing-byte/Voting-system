import React from 'react';
import { useApp } from '../context/AppContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAdminLoggedIn, isAuthReady } = useApp();

  if (!isAuthReady) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-indigo-500 font-bold text-sm tracking-widest uppercase animate-pulse">
        Checking Admin Access...
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};
