import api from "src/api/axios";
import {jwtDecode} from "jwt-decode";
import { AuthResponse, DecodedToken, LoginRequest, RegistroEmpresaRequest } from "src/types/auth/auth.types";


const authService = {
  // Login
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      } as LoginRequest);
      
      
      localStorage.setItem('token', response.data.token);

      
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Error al iniciar sesión';
    }
  },

  // Register
  register: async (userData: RegistroEmpresaRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      
      localStorage.setItem('token', response.data.token);

      
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Error al registrar usuario';
    }
  },

  // Logout
  logout: (): void => {
    localStorage.removeItem('token');
  },

  getUserFromToken: (): DecodedToken | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
  }
},

  // Verificar si está autenticado
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      // Verificar si el token no ha expirado
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  },

  // Obtener token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
};

export default authService;