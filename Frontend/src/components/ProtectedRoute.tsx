import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';

const ProtectedRoute = () => {
  const { user } = useAppContext();
  // If user is not authenticated, redirect to signin
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
