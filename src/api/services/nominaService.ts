import api from 'src/api/axios';
import type { NominaResponse, CalcularNominaRequest } from 'src/types/nomina';

const handle = (ctx: string, e: any): never => {
  const d = e.response?.data;
  const msg = d?.error || d?.message || `Error en ${ctx}`;
  console.error(`[${ctx}]`, e.response?.status, msg, d);
  throw new Error(typeof msg === 'string' ? msg : String(msg));
};

export const nominaService = {
  calcular: async (req: CalcularNominaRequest): Promise<NominaResponse> => {
    try { const { data } = await api.post<NominaResponse>('/payroll', req); return data; }
    catch (e: any) { return handle('calcular nómina', e); }
  },
  listar: async (): Promise<NominaResponse[]> => (await api.get<NominaResponse[]>('/payroll')).data,
  porId: async (id: number) => (await api.get<NominaResponse>(`/payroll/${id}`)).data,
  porEmpleado: async (usuarioId: number): Promise<NominaResponse[]> =>
    (await api.get<NominaResponse[]>(`/payroll/employee/${usuarioId}`)).data,
  pagar: async (id: number) => { await api.patch(`/payroll/${id}/pay`); },
  anular: async (id: number) => { await api.patch(`/payroll/${id}/cancel`); },

  descargarPDF: async () => {
    try {
      const { data } = await api.get('/reports/payroll', { responseType: 'blob' });
      window.open(URL.createObjectURL(new Blob([data], { type: 'application/pdf' })), '_blank');
    } catch (e: any) { handle('PDF nómina', e); }
  },
};
