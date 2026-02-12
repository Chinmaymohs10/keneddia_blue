// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import AuthService from "@/modules/auth/authService";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  const currentUser = AuthService.getCurrentUser();

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Inactive user
  if (currentUser && currentUser.isActive === false) {
    AuthService.logout();
    return <Navigate to="/login" replace />;
  }

  // Role mismatch
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(currentUser?.roleName)
  ) {
    // IMPORTANT: redirect inside admin panel, not "/"
    return <Navigate to="/Homepage-Dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
