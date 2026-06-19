import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { superAdminService } from 'src/api/services/superAdminService';
import { paymentService } from 'src/api/services/paymentService';
import { Button } from 'src/components/ui/button';
import { Badge } from 'src/components/ui/badge';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { Building2, CreditCard, Image as ImageIcon, Crown, QrCode } from 'lucide-react';

const SuperAdminPage = () => {
  const [comprobantes, setComprobantes] = useState<any[]>([]);
  const [historial, setHistorial] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [paymentStats, setPaymentStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<'pendientes' | 'historial'>(
    searchParams.get('tab') === 'comprobantes' ? 'pendientes' : 'pendientes'
  );
  const qrRef = useRef<HTMLInputElement>(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const [comp, hist, st, pst] = await Promise.all([
        paymentService.comprobantesPendientes(),
        paymentService.historial(),
        superAdminService.estadisticas(),
        paymentService.stats(),
      ]);
      setComprobantes(comp); setHistorial(hist); setStats(st); setPaymentStats(pst);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-yellow-500/10 shrink-0"><Crown className="size-8 text-yellow-500" /></div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Panel Super Admin</h1>
          <p className="text-muted-foreground">Comprobantes de pago y configuración</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats && <CardBox className="shadow-none border border-border text-center"><Building2 className="size-6 text-primary mx-auto mb-1" /><p className="text-xl font-bold">{stats.totalEmpresas}</p><p className="text-xs text-muted-foreground">Empresas</p></CardBox>}
        {stats && <CardBox className="shadow-none border border-border text-center"><CreditCard className="size-6 text-success mx-auto mb-1" /><p className="text-xl font-bold">{stats.suscripcionesActivas}</p><p className="text-xs text-muted-foreground">Activas</p></CardBox>}
        {stats && <CardBox className="shadow-none border border-border text-center"><Crown className="size-6 text-destructive mx-auto mb-1" /><p className="text-xl font-bold">{stats.suscripcionesVencidas}</p><p className="text-xs text-muted-foreground">Vencidas</p></CardBox>}
        {paymentStats && <CardBox className="shadow-none border border-border text-center"><ImageIcon className="size-6 text-blue-500 mx-auto mb-1" /><p className="text-xl font-bold">{paymentStats.pendientes}</p><p className="text-xs text-muted-foreground">Pendientes</p></CardBox>}
      </div>

      {/* QR */}
      <CardBox className="shadow-none border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><QrCode className="size-5 text-primary" /><div><h3 className="text-base font-semibold">QR de pago (Binance)</h3><p className="text-xs text-muted-foreground">Los clientes escanean este QR para pagar</p></div></div>
          <div className="flex items-center gap-2">
            <input ref={qrRef} type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { await paymentService.subirQR(f); toast.success('QR actualizado'); } catch (err: any) { toast.error(err.message); } }} className="hidden" />
            <Button variant="outline" size="sm" onClick={() => qrRef.current?.click()}>Subir QR</Button>
          </div>
        </div>
      </CardBox>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button variant={tab === 'pendientes' ? 'default' : 'outline'} size="sm" onClick={() => setTab('pendientes')}>
          Pendientes ({comprobantes.length})
        </Button>
        <Button variant={tab === 'historial' ? 'default' : 'outline'} size="sm" onClick={() => setTab('historial')}>
          Historial ({historial.length})
        </Button>
      </div>

      {/* Pendientes */}
      {tab === 'pendientes' && (
        <CardBox className="shadow-none border border-border">
          {comprobantes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Sin comprobantes pendientes.</div>
          ) : (
            <div className="space-y-3">
              {comprobantes.map(c => (
                <div key={c.comprobanteId} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/10">
                  <ImageIcon className="size-10 text-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{c.empresaNombre}</p>
                    <p className="text-sm text-muted-foreground">{c.nombreArchivo}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-blue-100 text-blue-700 text-xs">Solicita: {c.planSolicitado || '—'}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('es-VE')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={async () => { try { const blob = await paymentService.descargarComprobante(c.comprobanteId); window.open(URL.createObjectURL(blob), '_blank'); } catch { toast.error('No se pudo abrir'); } }}><ImageIcon className="size-3.5 mr-1" /> Ver</Button>
                    <Button size="sm" className="bg-success hover:bg-success/90" onClick={async () => { try { await paymentService.revisarComprobante(c.comprobanteId, 'APROBADO'); toast.success('Aprobado — plan actualizado'); cargar(); } catch (e: any) { toast.error(e.message); } }}>Aprobar</Button>
                    <Button variant="outline" size="sm" className="text-destructive" onClick={async () => { try { await paymentService.revisarComprobante(c.comprobanteId, 'RECHAZADO', 'No cumple requisitos'); toast.success('Rechazado'); cargar(); } catch (e: any) { toast.error(e.message); } }}>Rechazar</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBox>
      )}

      {/* Historial */}
      {tab === 'historial' && (
        <CardBox className="shadow-none border border-border p-0! overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30"><tr>
                <th className="text-left px-4 py-2.5 font-semibold">Empresa</th>
                <th className="text-left px-4 py-2.5 font-semibold">Archivo</th>
                <th className="text-left px-4 py-2.5 font-semibold">Plan solicitado</th>
                <th className="text-left px-4 py-2.5 font-semibold">Estado</th>
                <th className="text-left px-4 py-2.5 font-semibold">Fecha</th>
              </tr></thead>
              <tbody>
                {historial.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Sin historial.</td></tr> :
                  historial.map(c => (
                    <tr key={c.comprobanteId} className="border-t hover:bg-muted/20">
                      <td className="px-4 py-2.5">{c.empresaNombre}</td>
                      <td className="px-4 py-2.5 text-xs">{c.nombreArchivo}</td>
                      <td className="px-4 py-2.5"><Badge className="bg-blue-50 text-blue-600">{c.planSolicitado || '—'}</Badge></td>
                      <td className="px-4 py-2.5"><Badge className={c.estado === 'APROBADO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{c.estado}</Badge></td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('es-VE')}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardBox>
      )}
    </div>
  );
};

export default SuperAdminPage;
