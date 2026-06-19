import api from 'src/api/axios';

const handle = (ctx: string, e: any): never => {
  const d = e.response?.data;
  const msg = d?.error || d?.message || `Error en ${ctx}`;
  throw new Error(typeof msg === 'string' ? msg : String(msg));
};

export const paymentService = {
  obtenerQR: async (): Promise<Blob | null> => {
    try { const { data } = await api.get('/payment/qr', { responseType: 'blob' }); return data; }
    catch { return null; }
  },

  subirQR: async (file: File): Promise<void> => {
    const form = new FormData(); form.append('file', file);
    try { await api.post('/payment/qr', form); } catch (e: any) { handle('subir QR', e); }
  },

  subirComprobante: async (file: File): Promise<void> => {
    const form = new FormData(); form.append('file', file);
    try { await api.post('/payment/proof', form); } catch (e: any) { handle('subir comprobante', e); }
  },

  misComprobantes: async (): Promise<any[]> => {
    const { data } = await api.get('/payment/proof'); return data;
  },

  descargarComprobante: async (id: number): Promise<Blob> => {
    const { data } = await api.get(`/payment/proof/${id}/download`, { responseType: 'blob' });
    return data;
  },

  // Super admin
  comprobantesPendientes: async (): Promise<any[]> => {
    const { data } = await api.get('/payment/admin/proofs'); return data;
  },

  revisarComprobante: async (id: number, estado: string, notas?: string): Promise<void> => {
    try { await api.post(`/payment/admin/proofs/${id}`, { estado, notas }); }
    catch (e: any) { handle('revisar comprobante', e); }
  },

  stats: async (): Promise<any> => {
    const { data } = await api.get('/payment/admin/stats'); return data;
  },
};
