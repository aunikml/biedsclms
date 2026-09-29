import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Box, LinearProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const location = useLocation();

  // If the user object isn't loaded yet but they are authenticated, we might need a loading state.
  // But our AuthContext handles fetching on mount. For now, if not authenticated, redirect to login.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user object is still loading
  if (!user) {
    return (
      <Box sx={{ width: '100%', mt: 4, px: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>Loading profile...</Typography>
        <LinearProgress sx={{ width: '100%', maxWidth: 400 }} />
      </Box>
    );
  }

  // Check roles if specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // Redirect unauthorized users to their dashboard or home
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
