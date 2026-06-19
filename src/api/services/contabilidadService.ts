import api from 'src/api/axios';
import type {
  PlanCuentaResponse, AsientoResponse, LibroMayorResponse,
  BalanceGeneralResponse, EstadoResultadosResponse, CrearAsientoRequest,
} from 'src/types/contabilidad';

const handle = (ctx: string, e: any): never => {
  const d = e.response?.data;
  const msg = d?.error || d?.message || `Error en ${ctx}`;
  console.error(`[${ctx}]`, e.response?.status, msg, d);
  throw new Error(typeof msg === 'string' ? msg : String(msg));
};

export const contabilidadService = {
  // Plan de cuentas
  obtenerPlanCuentas: async (): Promise<PlanCuentaResponse[]> => {
    const { data } = await api.get<PlanCuentaResponse[]>('/accounting/chart-of-accounts');
    return data;
  },

  crearCuenta: async (body: { tipoCuenta: string; codigo: string; nombre: string; cuentaPadreId?: number }): Promise<PlanCuentaResponse> => {
    try {
      const { data } = await api.post<PlanCuentaResponse>('/accounting/chart-of-accounts', body);
      return data;
    } catch (e: any) { return handle('crear cuenta', e); }
  },

  desactivarCuenta: async (id: number): Promise<void> => {
    try { await api.delete(`/accounting/chart-of-accounts/${id}`); }
    catch (e: any) { handle('desactivar cuenta', e); }
  },

  // Asientos
  crearAsiento: async (req: CrearAsientoRequest): Promise<AsientoResponse> => {
    try {
      const { data } = await api.post<AsientoResponse>('/accounting/entries', req);
      return data;
    } catch (e: any) { return handle('crear asiento', e); }
  },

  obtenerAsiento: async (id: number): Promise<AsientoResponse> => {
    const { data } = await api.get<AsientoResponse>(`/accounting/entries/${id}`);
    return data;
  },

  // Libro Diario
  libroDiario: async (desde?: string, hasta?: string): Promise<AsientoResponse[]> => {
    const { data } = await api.get<AsientoResponse[]>('/accounting/journal', {
      params: { desde: desde || undefined, hasta: hasta || undefined },
    });
    return data;
  },

  // Libro Mayor
  libroMayor: async (cuentaId: number, desde?: string, hasta?: string): Promise<LibroMayorResponse> => {
    const { data } = await api.get<LibroMayorResponse>(`/accounting/ledger/${cuentaId}`, {
      params: { desde: desde || undefined, hasta: hasta || undefined },
    });
    return data;
  },

  // Estado de Resultados
  estadoResultados: async (desde: string, hasta: string): Promise<EstadoResultadosResponse> => {
    const { data } = await api.get<EstadoResultadosResponse>('/accounting/income-statement', {
      params: { desde, hasta },
    });
    return data;
  },

  // Balance General
  balanceGeneral: async (fecha: string): Promise<BalanceGeneralResponse> => {
    const { data } = await api.get<BalanceGeneralResponse>('/accounting/balance-sheet', {
      params: { fecha },
    });
    return data;
  },

  // Cierre de período
  cerrarPeriodo: async (desde: string, hasta: string): Promise<void> => {
    try {
      await api.post('/accounting/close-period', null, { params: { desde, hasta } });
    } catch (e: any) { handle('cerrar período', e); }
  },

  // PDF: descarga via blob y abre en pestaña nueva
  descargarPDF: async (path: string) => {
    try {
      const { data } = await api.get(path, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (e: any) { handle('descargar PDF', e); }
  },
};
