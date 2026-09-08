import { ReactNode } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { isTokenValid } from '@/utils/auth';

interface ProtectedRouteProps {
  children?: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // If token is invalid or expired, immediately navigate to /login with return location
  if (!isTokenValid()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a valid token format is in storage, wait for initial profile fetch
  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Loading…</span>
      </div>
    );
  }

  // If profile verification failed
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
