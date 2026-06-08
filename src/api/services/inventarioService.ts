import api from 'src/api/axios';
import type {
  ProductoResponse, CrearProductoRequest, EditarProductoRequest,
  MovimientoInventarioResponse, RegistrarMovimientoRequest,
} from 'src/types/inventario';
import type { PageResponse } from './clienteService';

const handle = (ctx: string, e: any): never => {
  const d = e.response?.data;
  const msg = d?.error || d?.message || `Error en ${ctx}`;
  console.error(`[${ctx}]`, e.response?.status, msg, d);
  throw new Error(typeof msg === 'string' ? msg : String(msg));
};

export const inventarioService = {
  obtenerTodos: async (): Promise<ProductoResponse[]> => {
    const { data } = await api.get<ProductoResponse[]>('/inventory');
    return data;
  },
  obtenerPaginado: async (pagina = 0, tamano = 10): Promise<PageResponse<ProductoResponse>> => {
    const { data } = await api.get<PageResponse<ProductoResponse>>('/inventory/paged', { params: { pagina, tamano } });
    return data;
  },
  obtenerPorId: async (id: number) => (await api.get<ProductoResponse>(`/inventory/${id}`)).data,
  crear: async (req: CrearProductoRequest): Promise<ProductoResponse> => {
    try { const { data } = await api.post<ProductoResponse>('/inventory', req); return data; }
    catch (e: any) { return handle('crear producto', e); }
  },
  editar: async (id: number, req: EditarProductoRequest): Promise<ProductoResponse> => {
    try { const { data } = await api.put<ProductoResponse>(`/inventory/${id}`, req); return data; }
    catch (e: any) { return handle('editar producto', e); }
  },
  desactivar: async (id: number) => { await api.delete(`/inventory/${id}`); },
  activar: async (id: number) => { await api.patch(`/inventory/${id}/activate`); },
  stockCritico: async (): Promise<ProductoResponse[]> => (await api.get<ProductoResponse[]>('/inventory/critical')).data,
  valorTotal: async (): Promise<number> => (await api.get<{ valorTotal: number }>('/inventory/value')).data.valorTotal,
  registrarMovimiento: async (req: RegistrarMovimientoRequest): Promise<MovimientoInventarioResponse> => {
    try { const { data } = await api.post<MovimientoInventarioResponse>('/inventory/movements', req); return data; }
    catch (e: any) { return handle('movimiento inventario', e); }
  },
  historialMovimientos: async (productoId: number): Promise<MovimientoInventarioResponse[]> =>
    (await api.get<MovimientoInventarioResponse[]>(`/inventory/${productoId}/movements`)).data,
  todosMovimientos: async (pagina = 0, tamano = 20, tipo?: string, desde?: string, hasta?: string): Promise<PageResponse<MovimientoInventarioResponse>> => {
    const { data } = await api.get<PageResponse<MovimientoInventarioResponse>>('/inventory/movements/all', {
      params: { pagina, tamano, tipo: tipo || undefined, desde: desde || undefined, hasta: hasta || undefined },
    });
    return data;
  },
};
