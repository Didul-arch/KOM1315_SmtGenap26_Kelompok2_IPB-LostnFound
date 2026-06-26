import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute – wraps a route element to enforce authentication & role checks.
 *
 * Props:
 *  - children        : the page component to render when access is granted
 *  - requiredRole    : (optional) e.g. "Admin" – if set, only users with this role can access
 *  - redirectTo      : where to send unauthorized users (default: "/login" for guests, "/" for wrong role)
 */
const ProtectedRoute = ({ children, requiredRole = null, redirectTo = null }) => {
  const { user, loading } = useAuth();

  // While auth state is still being restored from localStorage, show nothing
  // (prevents a flash-redirect on hard refresh)
  if (loading) {
    return null;
  }

  // Not logged in → send to login page
  if (!user) {
    return <Navigate to={redirectTo || "/login"} replace />;
  }

  // Logged in but wrong role → send to home
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={redirectTo || "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;
