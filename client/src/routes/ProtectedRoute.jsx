// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import AuthService from '@/modules/auth/authService';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  const currentUser = AuthService.getCurrentUser();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is not active, redirect to login
  if (currentUser && !currentUser.isActive) {
    AuthService.logout();
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check if user has it
  if (requiredRole && currentUser?.roleName !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;