import api from 'src/api/axios';
import type {
  TransaccionResponse, CrearTransaccionRequest, EditarTransaccionRequest,
  FiltroTransaccionRequest, RegistrarPagoRequest, PagoResponse, AdjuntoResponse,
} from 'src/types/transaccion';

const handleError = (ctx: string, error: any): never => {
  const data = error.response?.data;
  const msg = data?.error || data?.message || `Error en ${ctx}`;
  console.error(`[${ctx}]`, error.response?.status, msg, data);
  throw new Error(typeof msg === 'string' ? msg : String(msg));
};

export const transaccionService = {
  crear: async (req: CrearTransaccionRequest): Promise<TransaccionResponse> => {
    try {
      const { data } = await api.post<TransaccionResponse>('/transactions', req);
      return data;
    } catch (e: any) { return handleError('crear transacción', e); }
  },

  listar: async (filtro?: FiltroTransaccionRequest): Promise<TransaccionResponse[]> => {
    try {
      const { data } = await api.get<TransaccionResponse[]>('/transactions', { params: filtro });
      return data;
    } catch (e: any) { handleError('listar transacciones', e); return []; }
  },

  obtenerPorId: async (id: number): Promise<TransaccionResponse> => {
    const { data } = await api.get<TransaccionResponse>(`/transactions/${id}`);
    return data;
  },

  editar: async (id: number, req: EditarTransaccionRequest): Promise<TransaccionResponse> => {
    try {
      const { data } = await api.put<TransaccionResponse>(`/transactions/${id}`, req);
      return data;
    } catch (e: any) { return handleError('editar transacción', e); }
  },

  anular: async (id: number, motivo: string): Promise<void> => {
    try {
      await api.patch(`/transactions/${id}/cancel`, { motivo });
    } catch (e: any) { handleError('anular transacción', e); }
  },

  cuentasPorCobrar: async (): Promise<TransaccionResponse[]> => {
    const { data } = await api.get<TransaccionResponse[]>('/transactions/receivable');
    return data;
  },

  cuentasPorPagar: async (): Promise<TransaccionResponse[]> => {
    const { data } = await api.get<TransaccionResponse[]>('/transactions/payable');
    return data;
  },

  registrarPago: async (id: number, req: RegistrarPagoRequest): Promise<PagoResponse> => {
    try {
      const { data } = await api.post<PagoResponse>(`/transactions/${id}/payments`, req);
      return data;
    } catch (e: any) { return handleError('registrar pago', e); }
  },

  historialPagos: async (id: number): Promise<PagoResponse[]> => {
    const { data } = await api.get<PagoResponse[]>(`/transactions/${id}/payments`);
    return data;
  },

  subirAdjunto: async (id: number, archivo: File): Promise<AdjuntoResponse> => {
    const form = new FormData();
    form.append('file', archivo);
    const { data } = await api.post<AdjuntoResponse>(`/transactions/${id}/attachments`, form);
    return data;
  },

  listarAdjuntos: async (id: number): Promise<AdjuntoResponse[]> => {
    const { data } = await api.get<AdjuntoResponse[]>(`/transactions/${id}/attachments`);
    return data;
  },

  notaCredito: async (id: number, motivo: string, monto: number): Promise<TransaccionResponse> => {
    try {
      const { data } = await api.post<TransaccionResponse>(`/transactions/${id}/credit-note`, { motivo, monto: String(monto) });
      return data;
    } catch (e: any) { return handleError('emitir nota de crédito', e); }
  },

  descargarFactura: async (id: number): Promise<Blob> => {
    const { data } = await api.get(`/transactions/${id}/invoice`, { responseType: 'blob' });
    return data;
  },

  listarTodosAdjuntos: async (): Promise<AdjuntoResponse[]> => {
    const { data } = await api.get<AdjuntoResponse[]>('/transactions/documents');
    return data;
  },

  subirDocumentoSuelto: async (archivo: File): Promise<AdjuntoResponse> => {
    const form = new FormData();
    form.append('file', archivo);
    const { data } = await api.post<AdjuntoResponse>('/transactions/documents/upload', form);
    return data;
  },

  descargarAdjunto: async (adjuntoId: number): Promise<Blob> => {
    const { data } = await api.get(`/transactions/attachments/${adjuntoId}`, { responseType: 'blob' });
    return data;
  },

  eliminarAdjunto: async (adjuntoId: number): Promise<void> => {
    try { await api.delete(`/transactions/attachments/${adjuntoId}`); }
    catch (e: any) { handleError('eliminar adjunto', e); }
  },
};
