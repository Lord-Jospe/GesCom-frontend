import api from 'src/api/axios';

const handle = (ctx: string, e: any): never => {
  const d = e.response?.data;
  const msg = d?.error || d?.message || `Error en ${ctx}`;
  throw new Error(typeof msg === 'string' ? msg : String(msg));
};

export const superAdminService = {
  listarEmpresas: async (): Promise<any[]> => {
    try { const { data } = await api.get('/super-admin/empresas'); return data; }
    catch (e: any) { return handle('listar empresas', e); }
  },
  actualizarSuscripcion: async (empresaId: number, body: { fechaVence?: string; planId?: number; estado?: string }): Promise<void> => {
    try { await api.post(`/super-admin/suscripcion/${empresaId}`, body); }
    catch (e: any) { handle('actualizar suscripción', e); }
  },
  listarComprobantes: async (): Promise<any[]> => {
    try { const { data } = await api.get('/super-admin/comprobantes'); return data; }
    catch (e: any) { handle('comprobantes', e); }
  },
  estadisticas: async (): Promise<any> => {
    try { const { data } = await api.get('/super-admin/estadisticas'); return data; }
    catch (e: any) { handle('estadisticas', e); }
  },
};
