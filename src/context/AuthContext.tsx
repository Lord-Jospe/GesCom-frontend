import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthResponse, DecodedToken, RegisterFormData } from 'src/types/auth/auth.types';
import authService from 'src/api/services/auth/authService';

interface AuthContextType {
  user: DecodedToken | null;
  authData: AuthResponse | null;
  login: (email: string, password: string) => Promise<DecodedToken>;
  registro: (userData: RegisterFormData) => Promise<DecodedToken>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [authData, setAuthData] = useState<AuthResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔹 Cargar usuario al iniciar app
  useEffect(() => {
    const token = authService.getToken();
    if (!token) return;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (decoded.exp * 1000 > Date.now()) {
        setUser(decoded);
        setIsAuthenticated(true);
        // authData no se puede recuperar del localStorage porque
        // el backend no lo guarda, pero el token tiene lo esencial
      } else {
        authService.logout();
      }
    } catch {
      authService.logout();
    }
  }, []);

  // Login
  const login = async (email: string, password: string): Promise<DecodedToken> => {
    const data = await authService.login(email, password);
    const decoded = jwtDecode<DecodedToken>(data.token);
    setUser(decoded);
    setAuthData(data);
    setIsAuthenticated(true);
    return decoded;
  };

  // Registro
  const registro = async (userData: RegisterFormData): Promise<DecodedToken> => {
    const data = await authService.register(userData);
    const decoded = jwtDecode<DecodedToken>(data.token);
    setUser(decoded);
    setAuthData(data);
    setIsAuthenticated(true);
    return decoded;
  };

  //  Logout
  const logout = () => {
    authService.logout();
    setUser(null);
    setAuthData(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authData,
        login,
        registro,
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
