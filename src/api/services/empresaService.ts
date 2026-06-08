import api from 'src/api/axios';
import type { EmpresaResponse, EditarEmpresaRequest, MonedaRequest, SuscripcionResponse, DashboardResumenResponse, DashboardChartsResponse, TasaBcvResponse, TasaBcvRequest } from 'src/types/empresa';

const handleError = (ctx: string, error: any): never => {
  const data = error.response?.data;
  const msg = data?.error || data?.message || `Error en ${ctx}`;
  console.error(`[${ctx}]`, error.response?.status, msg, data);
  throw new Error(typeof msg === 'string' ? msg : String(msg));
};

export const empresaService = {
  obtenerPerfil: async (): Promise<EmpresaResponse> => {
    try {
      const { data } = await api.get<EmpresaResponse>('/company');
      return data;
    } catch (e: any) { handleError('obtenerPerfil empresa', e); return {} as EmpresaResponse; }
  },

  editarPerfil: async (req: EditarEmpresaRequest): Promise<EmpresaResponse> => {
    try {
      const { data } = await api.put<EmpresaResponse>('/company', req);
      return data;
    } catch (e: any) { return handleError('editarPerfil empresa', e); }
  },

  cambiarMoneda: async (req: MonedaRequest): Promise<void> => {
    try {
      await api.patch('/company/money', req);
    } catch (e: any) { handleError('cambiarMoneda', e); }
  },

  obtenerSuscripcion: async (): Promise<SuscripcionResponse | null> => {
    try {
      const { data } = await api.get<SuscripcionResponse>('/company/subscription');
      return data;
    } catch { return null; }
  },
};

export const tasaBcvService = {
  registrar: async (req: TasaBcvRequest): Promise<TasaBcvResponse> => {
    try {
      const { data } = await api.post<TasaBcvResponse>('/exchange-rate', req);
      // Notificar a otros componentes que la tasa cambió
      window.dispatchEvent(new CustomEvent('tasa-bcv-actualizada', { detail: data }));
      return data;
    } catch (e: any) { return handleError('registrar tasa BCV', e); }
  },

  historial: async (): Promise<TasaBcvResponse[]> => {
    try {
      const { data } = await api.get<TasaBcvResponse[]>('/exchange-rate');
      return data;
    } catch (e: any) { handleError('historial tasas BCV', e); return []; }
  },

  ultima: async (): Promise<TasaBcvResponse | null> => {
    try {
      const { data } = await api.get<TasaBcvResponse>('/exchange-rate/latest');
      return data;
    } catch { return null; }
  },

  obtenerPorFecha: async (fecha: string): Promise<TasaBcvResponse> => {
    try {
      const { data } = await api.get<TasaBcvResponse>(`/exchange-rate/${fecha}`);
      return data;
    } catch (e: any) { handleError('tasa BCV por fecha', e); return {} as TasaBcvResponse; }
  },
};

export const dashboardService = {
  resumenHoy: async (): Promise<DashboardResumenResponse> =>
    (await api.get<DashboardResumenResponse>('/dashboard/today')).data,
  resumenMes: async (): Promise<DashboardResumenResponse> =>
    (await api.get<DashboardResumenResponse>('/dashboard/monthly')).data,
  charts: async (): Promise<DashboardChartsResponse> =>
    (await api.get<DashboardChartsResponse>('/dashboard/charts')).data,
};

export const formatearTasa = (tasa: number | null | undefined) =>
  tasa != null ? `Bs. ${tasa.toFixed(2)}` : 'BCV';

export const formatearFechaHora = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('es-VE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
