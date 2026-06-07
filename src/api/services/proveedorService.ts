import api from 'src/api/axios';
import type { ProveedorResponse, CrearProveedorRequest, EditarProveedorRequest } from 'src/types/proveedor';

const handleError = (ctx: string, error: any): never => {
  const data = error.response?.data;
  const msg = data?.error || data?.message || `Error en ${ctx}`;
  console.error(`[${ctx}]`, error.response?.status, msg, data);
  throw new Error(typeof msg === 'string' ? msg : String(msg));
};

export const proveedorService = {
  obtenerTodos: async (): Promise<ProveedorResponse[]> => {
    try {
      const { data } = await api.get<ProveedorResponse[]>('/provider');
      return data;
    } catch (e: any) { handleError('obtenerTodos proveedores', e); return []; }
  },

  crear: async (req: CrearProveedorRequest): Promise<ProveedorResponse> => {
    try {
      const { data } = await api.post<ProveedorResponse>('/provider', req);
      return data;
    } catch (e: any) { return handleError('crear proveedor', e); }
  },

  editar: async (id: number, req: EditarProveedorRequest): Promise<ProveedorResponse> => {
    try {
      const { data } = await api.put<ProveedorResponse>(`/provider/${id}`, req);
      return data;
    } catch (e: any) { return handleError('editar proveedor', e); }
  },

  desactivar: async (id: number): Promise<string> => {
    try {
      const { data } = await api.delete(`/provider/${id}`);
      return data;
    } catch (e: any) { return handleError('desactivar proveedor', e); }
  },

  activar: async (id: number): Promise<string> => {
    try {
      const { data } = await api.patch(`/provider/${id}/activate`);
      return data;
    } catch (e: any) { return handleError('activar proveedor', e); }
  },
};
