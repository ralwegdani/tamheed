// Wraps pages that need a logged-in user (pattern from the React lecture).
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Remember the page so we can return to it after login.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
