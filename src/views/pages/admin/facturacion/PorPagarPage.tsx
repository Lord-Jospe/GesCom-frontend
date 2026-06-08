import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { transaccionService } from 'src/api/services/transaccionService';
import type { TransaccionResponse, RegistrarPagoRequest, MetodoPago } from 'src/types/transaccion';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Badge } from 'src/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';

const hoy = new Date().toISOString().slice(0, 10);
const metodos: MetodoPago[] = ['EFECTIVO', 'TRANSFERENCIA', 'PAGO_MOVIL', 'DIVISAS', 'OTRO'];
const metodoLabel: Record<string, string> = { EFECTIVO: 'Efectivo', TRANSFERENCIA: 'Transferencia', PAGO_MOVIL: 'Pago Móvil', DIVISAS: 'Divisas', OTRO: 'Otro' };
const indicadorColor = (d: number) => d <= 7 ? 'bg-green-500' : d <= 15 ? 'bg-yellow-500' : 'bg-red-500';

const PorPagarPage = () => {
  const [data, setData] = useState<TransaccionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<TransaccionResponse | null>(null);
  const [openPago, setOpenPago] = useState(false);

  const cargar = useCallback(async () => {
    try { setLoading(true); setData(await transaccionService.cuentasPorPagar()); }
    catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const total = data.reduce((s, t) => s + t.saldoPendiente, 0);
  const vencidos = data.filter(t => t.diasTranscurridos > 15).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cuentas por Pagar</h1>
        <p className="text-muted-foreground">Deudas pendientes con proveedores</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <CardBox className="shadow-none border-2 border-destructive/20 bg-gradient-to-b from-destructive/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-destructive/10"><Icon icon="solar:wallet-money-linear" width={24} className="text-destructive" /></div>
            <div><p className="text-xs text-muted-foreground uppercase">Total pendiente</p><p className="text-2xl font-bold">${total.toFixed(2)}</p></div>
          </div>
        </CardBox>
        <CardBox className="shadow-none border-2 border-red-200 dark:border-red-800 bg-gradient-to-b from-red-50/50 to-transparent dark:from-red-950/20 dark:to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950"><Icon icon="solar:danger-triangle-bold" width={24} className="text-red-500 dark:text-red-400" /></div>
            <div><p className="text-xs text-muted-foreground uppercase">Vencidos (&gt;15 días)</p><p className="text-2xl font-bold text-red-600 dark:text-red-400">{vencidos}</p></div>
          </div>
        </CardBox>
        <CardBox className="shadow-none border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950"><Icon icon="solar:document-text-linear" width={24} className="text-blue-500 dark:text-blue-400" /></div>
            <div><p className="text-xs text-muted-foreground uppercase">Total facturas</p><p className="text-2xl font-bold">{data.length}</p></div>
          </div>
        </CardBox>
      </div>

      {loading ? <div className="flex justify-center py-16"><Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" /></div>
      : data.length === 0 ? (
        <div className="text-center py-16"><Icon icon="solar:check-circle-bold" width={48} className="text-green-500 mx-auto mb-3" /><p className="text-lg font-medium">Sin deudas pendientes</p><p className="text-sm text-muted-foreground">Todos los gastos están al día</p></div>
      ) : (
        <div className="space-y-3">
          {data.map(t => {
            const d = t.diasTranscurridos;
            const alerta = d > 15 ? 'border-red-300 bg-red-50/30' : d > 7 ? 'border-yellow-300 bg-yellow-50/30' : '';
            return (
              <CardBox key={t.transaccionId} className={`shadow-none border-2 ${alerta || 'border-border'} hover:shadow-md transition-all`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className={`w-3 h-3 rounded-full shrink-0 ${indicadorColor(d)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{t.proveedorNombre || '—'}</h3>
                      <span className="text-xs text-muted-foreground">{t.numeroFactura || `#${t.transaccionId}`}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">{t.fecha}</span>
                      <span className="font-medium">{d} día(s)</span>
                      <Badge className={d > 15 ? 'bg-red-100 text-red-700' : d > 7 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                        {d > 15 ? 'Vencido' : d > 7 ? 'Próximo' : 'Al día'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:ml-auto">
                    <div className="text-right">
                      <p className="text-lg font-bold font-mono text-destructive">${t.saldoPendiente.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">de ${t.total.toFixed(2)}</p>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => { setSel(t); setOpenPago(true); }}>Registrar pago</Button>
                  </div>
                </div>
              </CardBox>
            );
          })}
        </div>
      )}

      <DialogPago open={openPago} onOpenChange={setOpenPago} transaccion={sel} onGuardado={cargar} />
    </div>
  );
};

function DialogPago({ open, onOpenChange, transaccion, onGuardado }: {
  open: boolean; onOpenChange: (v: boolean) => void; transaccion: TransaccionResponse | null; onGuardado: () => void;
}) {
  const [monto, setMonto] = useState(''); const [fecha, setFecha] = useState(hoy);
  const [metodo, setMetodo] = useState<MetodoPago>('EFECTIVO'); const [ref, setRef] = useState('');
  const [error, setError] = useState(''); const [g, setG] = useState(false);
  useEffect(() => { if (transaccion) { setMonto(String(transaccion.saldoPendiente)); setFecha(hoy); setMetodo('EFECTIVO'); setRef(''); setError(''); } }, [transaccion, open]);
  if (!transaccion) return null;
  const handle = async () => {
    const n = parseFloat(monto); if (!n || n <= 0 || n > transaccion.saldoPendiente) { setError(`Monto inválido. Máximo: $${transaccion.saldoPendiente.toFixed(2)}`); return; }
    try { setG(true); await transaccionService.registrarPago(transaccion.transaccionId, { monto: n, fecha, metodoPago: metodo, referencia: ref || undefined }); toast.success('Pago registrado'); onOpenChange(false); onGuardado(); }
    catch (e: any) { setError(e.message); } finally { setG(false); }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Registrar pago</DialogTitle></DialogHeader>
    <p className="text-sm text-muted-foreground mb-2">{transaccion.proveedorNombre} · Pendiente: <strong>${transaccion.saldoPendiente.toFixed(2)}</strong></p>
    {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md mb-2">{error}</div>}
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5"><Label>Monto</Label><Input type="number" step="0.01" value={monto} onChange={e => setMonto(e.target.value)} /></div>
      <div className="flex flex-col gap-1.5"><Label>Fecha</Label><Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} /></div>
      <div className="flex flex-col gap-1.5"><Label>Método</Label><Select value={metodo} onValueChange={v => setMetodo(v as MetodoPago)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{metodos.map(m => <SelectItem key={m} value={m}>{metodoLabel[m]}</SelectItem>)}</SelectContent></Select></div>
      <div className="flex flex-col gap-1.5"><Label>Referencia</Label><Input value={ref} onChange={e => setRef(e.target.value)} placeholder="Opcional" /></div>
    </div>
    <DialogFooter className="mt-4"><Button variant="outline" onClick={() => onOpenChange(false)} disabled={g}>Cancelar</Button><Button onClick={handle} disabled={g}>{g ? '...' : 'Registrar'}</Button></DialogFooter></DialogContent></Dialog>;
}

export default PorPagarPage;
