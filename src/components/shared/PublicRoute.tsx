import { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from 'src/context/AuthContext';

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (user?.rol === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    if (user?.rol === 'ESTUDIANTE') {
      return <Navigate to="/student" replace />;
    }
    if (user?.rol === 'DOCENTE') {
      return <Navigate to="/teacher" replace />;
    }
  }

  return children;
};

export default PublicRoute;
