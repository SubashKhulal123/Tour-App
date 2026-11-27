import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingState from "./LoadingState";

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, loading, token, user } = useAuth();
  const location = useLocation();

  if (loading || (token && !user)) {
    return <LoadingState label="Checking session" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
