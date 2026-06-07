import api from "src/api/axios";
import {jwtDecode} from "jwt-decode";
import { AuthResponse, DecodedToken, LoginRequest, RegisterFormData } from "src/types/auth/auth.types";


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
      const data = error.response?.data;
      const msg = data?.error || data?.message || 'Error al iniciar sesión';
      console.error('[login]', error.response?.status, msg, data);
      throw new Error(typeof msg === 'string' ? msg : String(msg));
    }
  },

  // Register
  register: async (userData: RegisterFormData): Promise<AuthResponse> => {
    try {
        const payload = {
            primerNombre:   userData.primerNombre,
            primerApellido: userData.primerApellido,
            email:          userData.email,
            password:       userData.password,
            nombreEmpresa:  userData.nombreEmpresa,
            rif:            userData.rif,
            telefono:       userData.telefono,
        };

        const response = await api.post<AuthResponse>('/auth/register', payload);
        localStorage.setItem('token', response.data.token);
        return response.data;
    } catch (error: any) {
        const data = error.response?.data;
        const msg = data?.error || data?.message || 'Error al registrar usuario';
        console.error('[register]', error.response?.status, msg, data);
        throw new Error(typeof msg === 'string' ? msg : String(msg));
    }
  },

  // Forgot Password
  forgotPassword: async (email: string): Promise<string> => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data?.message || 'Se ha enviado un enlace a tu correo.';
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Error al enviar el correo de recuperación';
      console.error('[forgotPassword]', error.response?.status, msg, error.response?.data);
      throw new Error(typeof msg === 'string' ? msg : String(msg));
    }
  },

  // Reset Password
  resetPassword: async (token: string, newPassword: string): Promise<string> => {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return response.data?.message || 'Contraseña restablecida correctamente.';
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Error al restablecer la contraseña';
      console.error('[resetPassword]', error.response?.status, msg, error.response?.data);
      throw new Error(typeof msg === 'string' ? msg : String(msg));
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