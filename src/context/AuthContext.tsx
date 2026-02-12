import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from 'src/types/auth/auth.types';
import authService from 'src/api/services/auth/authService';

interface AuthContextType {
  user: DecodedToken | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔹 Cargar usuario al iniciar app
  useEffect(() => {
    const token = authService.getToken();

    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);

        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
          setIsAuthenticated(true);
        } else {
          authService.logout();
        }
      } catch {
        authService.logout();
      }
    }
  }, []);

  // 🔹 Login
  const login = async (email: string, password: string) => {
    const token = await authService.login(email, password);
    const decoded = jwtDecode<DecodedToken>(token);

    setUser(decoded);
    setIsAuthenticated(true);
  };

  // 🔹 Logout
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
