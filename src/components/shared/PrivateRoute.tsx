import { Navigate } from 'react-router';
import { ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
  allowedRoles?: Array<'admin' | 'student'>;
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const role = localStorage.getItem('role') as 'admin' | 'student' | null;

  // No logueado → login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Rol no permitido
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
