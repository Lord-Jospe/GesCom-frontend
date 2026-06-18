import api from 'src/api/axios';

export interface MovimientoBancoResponse {
  movimientoBancoId: number;
  fecha: string;
  descripcion: string;
  monto: number;
  tipo: string;
  transaccionId: number | null;
  numeroFactura: string | null;
  conciliado: boolean;
  fechaConciliacion: string | null;
}

export interface TxConciliar {
  transaccionId: number;
  tipo: string;
  clienteProveedor: string | null;
  numeroFactura: string | null;
  fecha: string;
  moneda: string;
  total: number;
  estado: string;
  metodoPago: string;
}

export interface ConciliacionResponse {
  conciliados: MovimientoBancoResponse[];
  sinConciliarBanco: MovimientoBancoResponse[];
  sinConciliarGesCom: TxConciliar[];
}

const handle = (ctx: string, e: any): never => {
  const d = e.response?.data;
  const msg = d?.error || d?.message || `Error en ${ctx}`;
  throw new Error(typeof msg === 'string' ? msg : String(msg));
};

export const conciliacionService = {
  obtener: async (): Promise<ConciliacionResponse> => {
    try { const { data } = await api.get<ConciliacionResponse>('/reconciliation'); return data; }
    catch (e: any) { return handle('conciliación', e); }
  },

  agregarMovimiento: async (body: { fecha: string; descripcion: string; monto: number; tipo: string }): Promise<MovimientoBancoResponse> => {
    try { const { data } = await api.post<MovimientoBancoResponse>('/reconciliation/movements', body); return data; }
    catch (e: any) { return handle('agregar movimiento', e); }
  },

  vincular: async (movBancoId: number, transaccionId: number): Promise<void> => {
    try { await api.post(`/reconciliation/match/${movBancoId}`, { transaccionId }); }
    catch (e: any) { handle('vincular', e); }
  },

  desvincular: async (movBancoId: number): Promise<void> => {
    try { await api.post(`/reconciliation/unmatch/${movBancoId}`); }
    catch (e: any) { handle('desvincular', e); }
  },

  importarCSV: async (csv: string): Promise<void> => {
    try { await api.post('/reconciliation/import-csv', { csv }); }
    catch (e: any) { handle('importar CSV', e); }
  },

  conciliarManual: async (movBancoId: number): Promise<void> => {
    try { await api.post(`/reconciliation/reconcile/${movBancoId}`); }
    catch (e: any) { handle('conciliar manual', e); }
  },

  eliminarMovimiento: async (movBancoId: number): Promise<void> => {
    try { await api.delete(`/reconciliation/movements/${movBancoId}`); }
    catch (e: any) { handle('eliminar movimiento', e); }
  },
};
