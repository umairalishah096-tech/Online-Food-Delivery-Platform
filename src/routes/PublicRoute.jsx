import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Redirects logged-in users away from login/register pages
const PublicRoute = ({ children }) => {
  const { currentUser, userProfile } = useAuth();

  if (currentUser) {
    if (userProfile?.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
