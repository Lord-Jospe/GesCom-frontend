import api from 'src/api/axios';
import type { ClienteResponse, CrearClienteRequest, EditarClienteRequest } from 'src/types/cliente';

const handleError = (ctx: string, error: any): never => {
  const data = error.response?.data;
  const msg = data?.error || data?.message || `Error en ${ctx}`;
  console.error(`[${ctx}]`, error.response?.status, msg, data);
  throw new Error(typeof msg === 'string' ? msg : String(msg));
};

export const clienteService = {
  obtenerTodos: async (): Promise<ClienteResponse[]> => {
    try {
      const { data } = await api.get<ClienteResponse[]>('/customer');
      return data;
    } catch (e: any) { handleError('obtenerTodos clientes', e); return []; }
  },

  obtenerPorId: async (id: number): Promise<ClienteResponse> => {
    const { data } = await api.get<ClienteResponse>(`/customer/${id}`);
    return data;
  },

  crear: async (req: CrearClienteRequest): Promise<ClienteResponse> => {
    try {
      const { data } = await api.post<ClienteResponse>('/customer', req);
      return data;
    } catch (e: any) { return handleError('crear cliente', e); }
  },

  editar: async (id: number, req: EditarClienteRequest): Promise<ClienteResponse> => {
    try {
      const { data } = await api.put<ClienteResponse>(`/customer/${id}`, req);
      return data;
    } catch (e: any) { return handleError('editar cliente', e); }
  },

  desactivar: async (id: number): Promise<string> => {
    try {
      const { data } = await api.delete(`/customer/${id}`);
      return data;
    } catch (e: any) { return handleError('desactivar cliente', e); }
  },

  activar: async (id: number): Promise<string> => {
    try {
      const { data } = await api.patch(`/customer/${id}/activate`);
      return data;
    } catch (e: any) { return handleError('activar cliente', e); }
  },
};
