// components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AuthService from "@/modules/auth/authService";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authenticated = AuthService.isAuthenticated();
    const user = AuthService.getCurrentUser();

    setIsAuthenticated(authenticated);
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && currentUser && currentUser.isActive === false) {
      AuthService.logout();
    }
  }, [currentUser, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Inactive user
  if (currentUser && currentUser.isActive === false) {
    return <div>Loading...</div>;
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
