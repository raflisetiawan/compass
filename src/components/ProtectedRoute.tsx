
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../stores/userStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useStore();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
