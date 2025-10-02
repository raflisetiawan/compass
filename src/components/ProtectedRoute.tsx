
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUserStore();
  const token = localStorage.getItem('userToken');

  if (!user && !token) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
