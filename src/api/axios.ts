import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_URL_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Agregar el token a cada petición
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    const method = config.method?.toUpperCase();
    const url = config.url;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[Axios] ${method} ${url} → Token OK (${token.substring(0, 20)}...)`);
    } else {
      console.warn(`[Axios] ${method} ${url} → ⚠ SIN TOKEN en localStorage`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Manejo de errores de respuesta
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();

    // Siempre loggear a consola
    console.error(
      `[Axios] ${method} ${url} → ${status}`,
      error.response?.data,
    );

    // if (status === 401) {
    //   // Guardar el error ANTES de redirigir para no perderlo
    //   try {
    //     const erroresPrevios = JSON.parse(sessionStorage.getItem('__axios_errors') || '[]');
    //     erroresPrevios.push({
    //       timestamp: new Date().toISOString(),
    //       url: `${method} ${url}`,
    //       status,
    //       data: error.response?.data,
    //     });
    //     // Solo guardar los últimos 5
    //     sessionStorage.setItem('__axios_errors', JSON.stringify(erroresPrevios.slice(-5)));
    //   } catch {
    //     // si falla el parseo, no importa
    //   }

    //   console.warn(
    //     '%c[Axios] 401 detectado — sesión expirada o sin permisos. Redirigiendo a login.',
    //     'color: orange; font-weight: bold',
    //   );
    //   console.warn(
    //     '%cAbre sessionStorage → __axios_errors para ver el error después del redirect.',
    //     'color: orange',
    //   );

    //   localStorage.removeItem('token');
    //   localStorage.removeItem('user');
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);

// Helper para recuperar errores 401 después de un redirect
export const recuperarErrores401 = () => {
  try {
    const raw = sessionStorage.getItem('__axios_errors');
    if (raw) {
      const errores = JSON.parse(raw);
      sessionStorage.removeItem('__axios_errors');
      return errores;
    }
  } catch { /* vacío */ }
  return [];
};

export default api;
