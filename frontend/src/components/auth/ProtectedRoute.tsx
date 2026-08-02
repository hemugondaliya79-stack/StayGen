import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';


interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F172A' }}>
    <div className="text-center">
      <div className="w-12 h-12 rounded-2xl gradient-bg mx-auto mb-4 flex items-center justify-center animate-pulse">
        <span className="text-white text-xl font-bold">S</span>
      </div>
      <p className="text-slate-400 text-sm">Loading StayGen...</p>
    </div>
  </div>
);

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export const PublicRoute = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated && user) {
    const redirect = user.role === 'student' ? '/student' :
      user.role === 'security' ? '/security' : '/admin';
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
};
