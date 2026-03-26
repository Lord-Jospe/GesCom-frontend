import { Navigate } from 'react-router-dom';
import authService from 'src/api/services/auth/authService';


const RoleRedirect = () => {
  
    if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = authService.getUserFromToken();
 
  if (user?.rol === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (user?.rol === 'CONTADOR') {
    return <Navigate to="/contador" replace />;
  }
    if (user?.rol === 'OPERADOR') {
    return <Navigate to="/operador" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default RoleRedirect;
