import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { contabilidadService } from 'src/api/services/contabilidadService';
import type { PlanCuentaResponse, AsientoResponse, CrearAsientoRequest } from 'src/types/contabilidad';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { Plus, Trash2, Calculator, FileDown } from 'lucide-react';
import { exportarExcel, exportarPDF } from 'src/lib/exportUtils';

const hoy = new Date().toISOString().slice(0, 10);

const LibroDiarioPage = () => {
  const [cuentas, setCuentas] = useState<PlanCuentaResponse[]>([]);
  const [asientos, setAsientos] = useState<AsientoResponse[]>([]);
  const [desde, setDesde] = useState(() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); });
  const [hasta, setHasta] = useState(hoy);
  const [loading, setLoading] = useState(false);
  const [openCrear, setOpenCrear] = useState(false);
  const [openDetalle, setOpenDetalle] = useState<AsientoResponse | null>(null);

  const cargar = () => {
    setLoading(true);
    Promise.all([
      contabilidadService.obtenerPlanCuentas(),
      contabilidadService.libroDiario(desde, hasta),
    ]).then(([c, a]) => { setCuentas(c); setAsientos(a); }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []); // eslint-disable-line

  const filtrar = () => { contabilidadService.libroDiario(desde, hasta).then(setAsientos).catch(() => {}); };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-primary/10 shrink-0">
          <Icon icon="solar:book-2-broken" width={32} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Libro Diario</h1>
          <p className="text-muted-foreground">Asientos contables del período</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={() => exportarExcel(asientos.map(a => ({ '#': a.numeroAsiento, Fecha: a.fecha, Descripción: a.descripcion, Débito: a.totalDebito.toFixed(2), Crédito: a.totalCredito.toFixed(2), Tipo: a.esAutomatico ? 'Auto' : 'Manual' })), 'libro-diario')}>
            <FileDown className="size-3.5 mr-1" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportarPDF('Libro Diario', [{header:'#',dataKey:'#'},{header:'Fecha',dataKey:'Fecha'},{header:'Descripción',dataKey:'Descripción'},{header:'Débito',dataKey:'Débito'},{header:'Crédito',dataKey:'Crédito'}], asientos.map(a => ({ '#': a.numeroAsiento, Fecha: a.fecha, Descripción: a.descripcion, Débito: `$ ${a.totalDebito.toFixed(2)}`, Crédito: `$ ${a.totalCredito.toFixed(2)}` })), 'libro-diario')}>
            <FileDown className="size-3.5 mr-1" /> PDF
          </Button>
          <Button onClick={() => setOpenCrear(true)}>
            <Plus className="size-4 mr-1" /> Nuevo Asiento
          </Button>
        </div>
      </div>

      <CardBox className="shadow-none border border-border">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5"><Label className="text-xs">Desde</Label><Input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="h-9 w-40" /></div>
          <div className="flex flex-col gap-1.5"><Label className="text-xs">Hasta</Label><Input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="h-9 w-40" /></div>
          <Button variant="outline" size="sm" onClick={filtrar} className="h-9"><Icon icon="solar:filter-linear" width={16} className="mr-1" /> Filtrar</Button>
        </div>
      </CardBox>

      <CardBox className="shadow-none border border-border p-0! overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-4 py-3 font-semibold w-16">#</th>
                <th className="text-left px-4 py-3 font-semibold">Fecha</th>
                <th className="text-left px-4 py-3 font-semibold">Descripción</th>
                <th className="text-right px-4 py-3 font-semibold">Débito</th>
                <th className="text-right px-4 py-3 font-semibold">Crédito</th>
                <th className="text-center px-4 py-3 font-semibold w-24">Tipo</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">Cargando...</td></tr>
              ) : asientos.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No hay asientos en este período.</td></tr>
              ) : (
                asientos.map(a => (
                  <tr key={a.asientoId} className="border-t hover:bg-muted/10 transition-colors cursor-pointer" onClick={() => setOpenDetalle(a)}>
                    <td className="px-4 py-2.5 font-mono text-xs">{a.numeroAsiento}</td>
                    <td className="px-4 py-2.5">{a.fecha}</td>
                    <td className="px-4 py-2.5 max-w-64 truncate">{a.descripcion}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-sm">$ {a.totalDebito.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-sm">$ {a.totalCredito.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.esAutomatico ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'}`}>
                        {a.esAutomatico ? 'Auto' : 'Manual'}
                      </span>
                    </td>
                    <td className="px-2 py-2.5"><Icon icon="solar:alt-arrow-right-linear" width={16} className="text-muted-foreground" /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardBox>

      {/* Diálogo crear asiento */}
      <DialogCrearAsiento open={openCrear} onOpenChange={setOpenCrear} cuentas={cuentas.filter(c => c.activo)} onCreado={cargar} />

      {/* Diálogo detalle */}
      <Dialog open={!!openDetalle} onOpenChange={() => setOpenDetalle(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Icon icon="solar:document-text-bold" width={20} className="text-primary" />Asiento #{openDetalle?.numeroAsiento}</DialogTitle></DialogHeader>
          {openDetalle && (
            <div className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Fecha:</span> <strong>{openDetalle.fecha}</strong></div>
                <div><span className="text-muted-foreground">Tipo:</span> <strong>{openDetalle.esAutomatico ? 'Automático' : 'Manual'}</strong></div>
                {openDetalle.transaccionId && <div><span className="text-muted-foreground">Transacción:</span> <strong>#{openDetalle.transaccionId}</strong></div>}
                <div><span className="text-muted-foreground">Período:</span> <strong>{openDetalle.periodoCerrado ? 'Cerrado 🔒' : 'Abierto'}</strong></div>
              </div>
              <p className="text-sm font-medium">{openDetalle.descripcion}</p>
              <table className="w-full text-sm border rounded-lg overflow-hidden">
                <thead className="bg-muted/30"><tr><th className="text-left px-3 py-2 font-semibold">Cuenta</th><th className="text-right px-3 py-2 font-semibold w-28">Débito</th><th className="text-right px-3 py-2 font-semibold w-28">Crédito</th></tr></thead>
                <tbody>
                  {openDetalle.lineas.map(l => (
                    <tr key={l.lineaId} className="border-t"><td className="px-3 py-2"><div className="font-mono text-xs text-muted-foreground">{l.cuentaCodigo}</div><div>{l.cuentaNombre}</div></td><td className="px-3 py-2 text-right font-mono">{l.esDebito ? `$ ${l.monto.toFixed(2)}` : ''}</td><td className="px-3 py-2 text-right font-mono">{!l.esDebito ? `$ ${l.monto.toFixed(2)}` : ''}</td></tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/20 font-semibold"><tr><td className="px-3 py-2">Totales</td><td className="px-3 py-2 text-right font-mono">$ {openDetalle.totalDebito.toFixed(2)}</td><td className="px-3 py-2 text-right font-mono">$ {openDetalle.totalCredito.toFixed(2)}</td></tr></tfoot>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function DialogCrearAsiento({ open, onOpenChange, cuentas, onCreado }: { open: boolean; onOpenChange: (v: boolean) => void; cuentas: PlanCuentaResponse[]; onCreado: () => void }) {
  const [fecha, setFecha] = useState(hoy);
  const [descripcion, setDescripcion] = useState('');
  const [lineas, setLineas] = useState<{ cuentaId: number; esDebito: boolean; monto: number }[]>([{ cuentaId: 0, esDebito: true, monto: 0 }, { cuentaId: 0, esDebito: false, monto: 0 }]);
  const [error, setError] = useState(''); const [guardando, setGuardando] = useState(false);
  const totalDebito = lineas.filter(l => l.esDebito).reduce((s, l) => s + (l.monto || 0), 0);
  const totalCredito = lineas.filter(l => !l.esDebito).reduce((s, l) => s + (l.monto || 0), 0);
  const cuadrado = Math.abs(totalDebito - totalCredito) < 0.01;

  const updateLinea = (i: number, f: string, v: any) => setLineas(prev => prev.map((l, idx) => idx === i ? { ...l, [f]: v } : l));
  const addLinea = () => setLineas([...lineas, { cuentaId: 0, esDebito: true, monto: 0 }]);

  const handle = async () => {
    if (!fecha || !descripcion.trim()) { setError('Fecha y descripción son obligatorios.'); return; }
    if (lineas.some(l => !l.cuentaId || l.monto <= 0)) { setError('Cada línea debe tener cuenta y monto mayor a 0.'); return; }
    if (!cuadrado) { setError(`El asiento no está cuadrado. Diferencia: $${(totalDebito - totalCredito).toFixed(2)}`); return; }
    try {
      setGuardando(true);
      await contabilidadService.crearAsiento({ fecha, descripcion: descripcion.trim(), lineas: lineas.map(l => ({ cuentaId: l.cuentaId, esDebito: l.esDebito, monto: l.monto })) });
      toast.success('Asiento creado');
      onOpenChange(false); onCreado();
      setFecha(hoy); setDescripcion(''); setLineas([{ cuentaId: 0, esDebito: true, monto: 0 }, { cuentaId: 0, esDebito: false, monto: 0 }]);
    } catch (e: any) { setError(e.message); } finally { setGuardando(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Calculator className="size-5 text-primary" /> Nuevo Asiento Manual</DialogTitle></DialogHeader>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md">{error}</div>}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="flex flex-col gap-1.5"><Label>Fecha</Label><Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} /></div>
          <div className="flex flex-col gap-1.5"><Label>Descripción</Label><Input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ej: Ajuste de depreciación" /></div>
        </div>
        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between"><Label className="font-semibold">Líneas del asiento</Label><Button variant="outline" size="sm" onClick={addLinea}><Plus className="size-3 mr-1" /> Línea</Button></div>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm"><thead className="bg-muted/30"><tr><th className="text-left px-3 py-2 font-semibold">Cuenta</th><th className="text-center px-2 py-2 font-semibold w-20">Tipo</th><th className="text-right px-3 py-2 font-semibold w-32">Monto</th><th className="w-10"></th></tr></thead>
              <tbody>
                {lineas.map((l, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-2 py-1.5"><Select value={l.cuentaId ? String(l.cuentaId) : ''} onValueChange={v => updateLinea(i, 'cuentaId', Number(v))}><SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Seleccionar cuenta..." /></SelectTrigger><SelectContent>{cuentas.map(c => (<SelectItem key={c.cuentaId} value={String(c.cuentaId)}>{c.codigo} — {c.nombre}</SelectItem>))}</SelectContent></Select></td>
                    <td className="px-2 py-1.5 text-center"><Select value={l.esDebito ? 'debe' : 'haber'} onValueChange={v => updateLinea(i, 'esDebito', v === 'debe')}><SelectTrigger className="h-8 text-sm w-20 mx-auto"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="debe">Debe</SelectItem><SelectItem value="haber">Haber</SelectItem></SelectContent></Select></td>
                    <td className="px-2 py-1.5"><Input type="number" step="0.01" min={0} value={l.monto} onChange={e => updateLinea(i, 'monto', Number(e.target.value))} onFocus={e => e.target.select()} className="h-8 text-sm text-right" /></td>
                    <td className="px-1 py-1.5"><Button variant="ghost" size="sm" className="size-7! text-red-500 hover:bg-red-50" disabled={lineas.length <= 2} onClick={() => setLineas(lineas.filter((_, idx) => idx !== i))}><Trash2 className="size-3.5" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={`flex justify-between text-sm p-3 rounded-lg border ${cuadrado ? 'bg-success/5 border-success/20' : 'bg-red-50 border-red-200'}`}>
            <div className="flex gap-6"><div><span className="text-muted-foreground">Total Debe:</span> <span className="font-mono font-bold">$ {totalDebito.toFixed(2)}</span></div><div><span className="text-muted-foreground">Total Haber:</span> <span className="font-mono font-bold">$ {totalCredito.toFixed(2)}</span></div></div>
            <div>{cuadrado ? <span className="text-success font-bold flex items-center gap-1"><Icon icon="solar:check-circle-bold" width={16} /> Cuadrado</span> : <span className="text-red-600 font-bold">Diferencia: $ {(totalDebito - totalCredito).toFixed(2)}</span>}</div>
          </div>
        </div>
        <DialogFooter className="mt-4"><Button variant="outline" onClick={() => onOpenChange(false)} disabled={guardando}>Cancelar</Button><Button onClick={handle} disabled={guardando || !cuadrado}>{guardando ? <Icon icon="svg-spinners:180-ring" width={16} className="mr-1 animate-spin" /> : null}Guardar Asiento</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LibroDiarioPage;
