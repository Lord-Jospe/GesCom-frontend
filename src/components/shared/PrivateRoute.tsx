import { Navigate } from 'react-router';
import { ReactNode } from 'react';
import authService from 'src/api/services/auth/authService';


interface PrivateRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const isAuth = authService.isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  const user = authService.getUserFromToken();

  if (!user || !allowedRoles.includes(user.rol)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
