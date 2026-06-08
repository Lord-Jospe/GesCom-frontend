import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { transaccionService } from 'src/api/services/transaccionService';
import { proveedorService } from 'src/api/services/proveedorService';
import type { CrearTransaccionRequest, AgregarLineaRequest, MetodoPago } from 'src/types/transaccion';
import type { ProveedorResponse } from 'src/types/proveedor';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { Plus, Trash2 } from 'lucide-react';

const hoy = new Date().toISOString().slice(0, 10);
const metodos: MetodoPago[] = ['EFECTIVO', 'TRANSFERENCIA', 'PAGO_MOVIL', 'DIVISAS', 'OTRO'];
const metodoLabel: Record<string, string> = { EFECTIVO: 'Efectivo', TRANSFERENCIA: 'Transferencia', PAGO_MOVIL: 'Pago Móvil', DIVISAS: 'Divisas', OTRO: 'Otro' };

const RegistrarGastoPage = () => {
  const nav = useNavigate();
  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);
  const [form, setForm] = useState({ proveedorId: 0, fecha: hoy, moneda: 'USD' as 'USD'|'VES', metodoPago: 'EFECTIVO' as MetodoPago, descuentoGlobalPorcentaje: 0, notas: '' });
  const [lineas, setLineas] = useState<AgregarLineaRequest[]>([{ descripcion: '', cantidad: 1, precioUnitario: 0 }]);
  const [error, setError] = useState(''); const [g, setG] = useState(false);

  useEffect(() => { proveedorService.obtenerTodos().then(setProveedores).catch(() => {}); }, []);

  const updateLinea = (i: number, f: keyof AgregarLineaRequest, v: any) => setLineas(prev => prev.map((l, idx) => idx === i ? { ...l, [f]: v } : l));
  const addLinea = () => setLineas([...lineas, { descripcion: '', cantidad: 1, precioUnitario: 0 }]);
  const subtotal = lineas.reduce((s, l) => s + l.cantidad * l.precioUnitario, 0);

  const handle = async () => {
    if (lineas.some(l => !l.descripcion.trim() || l.cantidad <= 0 || l.precioUnitario <= 0)) { setError('Completa todas las líneas.'); return; }
    try { setG(true);
      const req: CrearTransaccionRequest = {
        tipo: 'EGRESO', proveedorId: form.proveedorId || undefined, fecha: form.fecha, moneda: form.moneda,
        metodoPago: form.metodoPago, descuentoGlobalPorcentaje: form.descuentoGlobalPorcentaje || undefined,
        notas: form.notas || undefined, lineas,
      };
      await transaccionService.crear(req);
      toast.success('Gasto registrado');
      nav('/admin/caja-facturacion');
    } catch (e: any) { setError(e.message); } finally { setG(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Registrar gasto</h1>
        <p className="text-muted-foreground">Nueva transacción de egreso</p>
      </div>

      <CardBox className="shadow-none border-2 border-destructive/20 bg-gradient-to-b from-destructive/5 to-transparent">
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md mb-4">{error}</div>}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <Label>Proveedor</Label>
            <Select value={form.proveedorId ? String(form.proveedorId) : ''} onValueChange={v => setForm({...form, proveedorId: Number(v)})}>
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>{proveedores.filter(p => p.isActive).map(p => <SelectItem key={p.proveedorId} value={String(p.proveedorId)}>{p.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5"><Label>Fecha</Label><Input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} /></div>
          <div className="flex flex-col gap-1.5"><Label>Moneda</Label>
            <Select value={form.moneda} onValueChange={v => setForm({...form, moneda: v as 'USD'|'VES'})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="VES">VES (Bs.)</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5"><Label>Método de pago</Label>
            <Select value={form.metodoPago} onValueChange={v => setForm({...form, metodoPago: v as MetodoPago})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{metodos.map(m => <SelectItem key={m} value={m}>{metodoLabel[m]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2"><Label className="text-base">Líneas</Label><Button variant="outline" size="sm" onClick={addLinea}><Plus className="size-3.5 mr-1" /> Línea</Button></div>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted/30"><tr>
                <th className="text-left px-3 py-2">Descripción</th>
                <th className="text-right px-3 py-2 w-20">Cant.</th>
                <th className="text-right px-3 py-2 w-28">Precio</th>
                <th className="text-right px-3 py-2 w-28">Subtotal</th>
                <th className="w-10"></th>
              </tr></thead>
              <tbody>
                {lineas.map((l, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-2 py-1.5"><Input value={l.descripcion} onChange={e => updateLinea(i, 'descripcion', e.target.value)} placeholder="Producto o servicio" className="h-8 text-sm" /></td>
                    <td className="px-2 py-1.5"><Input type="number" min={1} value={l.cantidad} onChange={e => updateLinea(i, 'cantidad', Number(e.target.value))} className="h-8 text-sm text-right" /></td>
                    <td className="px-2 py-1.5"><Input type="number" step="0.01" min={0} value={l.precioUnitario} onChange={e => updateLinea(i, 'precioUnitario', Number(e.target.value))} className="h-8 text-sm text-right" /></td>
                    <td className="px-2 py-1.5 text-right font-mono text-sm">{(l.cantidad * l.precioUnitario).toFixed(2)}</td>
                    <td className="px-2 py-1.5">{lineas.length > 1 && <Button variant="ghost" size="sm" className="size-7! text-red-500" onClick={() => setLineas(lineas.filter((_, idx) => idx !== i))}><Trash2 className="size-3.5" /></Button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="text-lg font-semibold font-mono">{form.moneda === 'USD' ? '$' : 'Bs.'} {subtotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1.5"><Label>Notas</Label><Input value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} placeholder="Opcional" /></div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => nav('/admin/caja-facturacion')}>Cancelar</Button>
          <Button onClick={handle} disabled={g} variant="destructive">{g ? 'Registrando...' : 'Registrar gasto'}</Button>
        </div>
      </CardBox>
    </div>
  );
};

export default RegistrarGastoPage;
