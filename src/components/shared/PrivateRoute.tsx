// src/components/PrivateRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';

interface PrivateRouteProps {
  role: 'admin' | 'student'; // roles posibles
}

const PrivateRoute = ({ role }: PrivateRouteProps) => {
  const storedRole = localStorage.getItem('userRole'); 

  if (!storedRole) {
    return <Navigate to="/login" />;
  }

  if (storedRole !== role) {
    return <Navigate to="/" />;
  }

  return <Outlet />; // Si el rol coincide, muestra las rutas hijas
};

export default PrivateRoute;
