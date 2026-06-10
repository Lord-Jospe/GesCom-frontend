import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { transaccionService } from 'src/api/services/transaccionService';
import { proveedorService } from 'src/api/services/proveedorService';
import { inventarioService } from 'src/api/services/inventarioService';
import type { CrearTransaccionRequest, AgregarLineaRequest, MetodoPago } from 'src/types/transaccion';
import type { ProveedorResponse, CrearProveedorRequest, CategoriaProveedor } from 'src/types/proveedor';
import type { ProductoResponse } from 'src/types/inventario';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { Plus, Trash2, UserPlus, ArrowLeft } from 'lucide-react';

const hoy = new Date().toISOString().slice(0, 10);
const metodos: MetodoPago[] = ['EFECTIVO', 'TRANSFERENCIA', 'PAGO_MOVIL', 'DIVISAS', 'OTRO'];
const metodoLabel: Record<string, string> = { EFECTIVO: 'Efectivo', TRANSFERENCIA: 'Transferencia', PAGO_MOVIL: 'Pago Móvil', DIVISAS: 'Divisas', OTRO: 'Otro' };
const categorias: CategoriaProveedor[] = ['MERCANCIA', 'SERVICIOS', 'TRANSPORTE', 'OTROS'];

const RegistrarGastoPage = () => {
  const nav = useNavigate();
  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);
  const [productos, setProductos] = useState<ProductoResponse[]>([]);
  const [form, setForm] = useState({ proveedorId: 0, fecha: hoy, moneda: 'USD' as 'USD'|'VES', metodoPago: 'EFECTIVO' as MetodoPago, descuentoGlobalPorcentaje: 0, notas: '' });
  const [lineas, setLineas] = useState<AgregarLineaRequest[]>([{ descripcion: '', cantidad: 1, precioUnitario: 0 }]);
  const [error, setError] = useState(''); const [g, setG] = useState(false);
  const [openCrearProv, setOpenCrearProv] = useState(false);

  const cargarProvs = () => { proveedorService.obtenerTodos().then(setProveedores).catch(() => {}); };
  useEffect(() => { cargarProvs(); inventarioService.obtenerTodos().then(setProductos).catch(() => {}); }, []);

  const updateLinea = (i: number, f: keyof AgregarLineaRequest, v: any) => setLineas(prev => prev.map((l, idx) => idx === i ? { ...l, [f]: v } : l));
  const addLinea = () => setLineas([...lineas, { descripcion: '', cantidad: 1, precioUnitario: 0 }]);
  const seleccionarProducto = (i: number, productoId: number) => {
    const prod = productos.find(p => p.productoId === productoId);
    if (prod) {
      setLineas(prev => prev.map((l, idx) => idx === i ? {
        ...l,
        productoId: prod.productoId,
        descripcion: prod.nombre,
        precioUnitario: prod.costoUnitario ?? 0, // en compras se usa el costo
      } : l));
    } else {
      // Manual: conserva descripción y precio, solo quita la referencia al producto
      setLineas(prev => prev.map((l, idx) => idx === i ? { ...l, productoId: undefined } : l));
    }
  };
  const subtotal = lineas.reduce((s, l) => s + l.cantidad * l.precioUnitario, 0);
  const total = subtotal;

  const handle = async () => {
    if (lineas.some(l => !l.descripcion.trim() || l.cantidad <= 0 || l.precioUnitario <= 0)) { setError('Completa todas las líneas con descripción, cantidad y precio válidos.'); return; }
    try { setG(true);
      await transaccionService.crear({
        tipo: 'EGRESO', proveedorId: form.proveedorId || undefined, fecha: form.fecha, moneda: form.moneda,
        metodoPago: form.metodoPago, notas: form.notas || undefined, lineas,
      });
      toast.success('Gasto registrado');
      nav('/admin/caja-facturacion');
    } catch (e: any) { setError(e.message); } finally { setG(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-destructive/10 shrink-0">
          <Icon icon="solar:cart-cross-bold" width={32} className="text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Registrar gasto</h1>
          <p className="text-muted-foreground">Nueva transacción de egreso</p>
        </div>
        <Button variant="ghost" className="ml-auto" onClick={() => nav('/admin/caja-facturacion')}>
          <ArrowLeft className="size-4 mr-1" /> Volver
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CardBox className="shadow-none border-2 border-destructive/20 bg-gradient-to-b from-destructive/[0.03] to-transparent">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Icon icon="solar:document-text-linear" width={20} className="text-destructive" /> Datos del gasto
            </h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md mb-4">{error}</div>}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Proveedor</Label>
                <div className="flex gap-1">
                  <Select value={form.proveedorId ? String(form.proveedorId) : ''} onValueChange={v => setForm({...form, proveedorId: Number(v)})}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Seleccionar proveedor..." /></SelectTrigger>
                    <SelectContent>{proveedores.filter(p => p.isActive).map(p => <SelectItem key={p.proveedorId} value={String(p.proveedorId)}>{p.nombre}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button size="icon" variant="outline" className="shrink-0" title="Crear proveedor rápido" onClick={() => setOpenCrearProv(true)}>
                    <UserPlus className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5"><Label>Fecha</Label><Input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} /></div>
              <div className="flex flex-col gap-1.5"><Label>Moneda</Label>
                <Select value={form.moneda} onValueChange={v => setForm({...form, moneda: v as 'USD'|'VES'})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="VES">VES (Bs.)</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5"><Label>Método de pago</Label>
                <Select value={form.metodoPago} onValueChange={v => setForm({...form, metodoPago: v as MetodoPago})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{metodos.map(m => <SelectItem key={m} value={m}>{metodoLabel[m]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </CardBox>

          <CardBox className="shadow-none border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Icon icon="solar:list-check-linear" width={20} className="text-primary" /> Líneas
              </h3>
              <Button variant="outline" size="sm" onClick={addLinea}><Plus className="size-3.5 mr-1" /> Agregar línea</Button>
            </div>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/30"><tr>
                  <th className="text-left px-3 py-2.5 font-semibold w-40">Producto</th>
                  <th className="text-left px-3 py-2.5 font-semibold">Descripción</th>
                  <th className="text-right px-3 py-2.5 font-semibold w-20">Cant.</th>
                  <th className="text-right px-3 py-2.5 font-semibold w-28">Precio Unit.</th>
                  <th className="text-right px-3 py-2.5 font-semibold w-28">Subtotal</th>
                  <th className="w-10"></th>
                </tr></thead>
                <tbody>
                  {lineas.map((l, i) => (
                    <tr key={i} className="border-t hover:bg-muted/10 transition-colors">
                      <td className="px-2 py-2">
                        <Select value={l.productoId ? String(l.productoId) : ''} onValueChange={v => seleccionarProducto(i, Number(v))}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">— Manual —</SelectItem>
                            {productos.filter(p => p.activo).map(p => (
                              <SelectItem key={p.productoId} value={String(p.productoId)}>
                                {p.nombre} (Stock: {p.stockActual})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-2"><Input value={l.descripcion} onChange={e => updateLinea(i, 'descripcion', e.target.value)} placeholder="Producto o servicio" className="h-9 text-sm" /></td>
                      <td className="px-2 py-2"><Input type="number" min={1} value={l.cantidad} onChange={e => updateLinea(i, 'cantidad', Number(e.target.value))} className="h-9 text-sm text-right" /></td>
                      <td className="px-2 py-2"><Input type="number" step="0.01" min={0} value={l.precioUnitario} onChange={e => updateLinea(i, 'precioUnitario', Number(e.target.value))} className="h-9 text-sm text-right" /></td>
                      <td className="px-2 py-2 text-right font-mono font-medium text-sm">{(l.cantidad * l.precioUnitario).toFixed(2)}</td>
                      <td className="px-2 py-2">{lineas.length > 1 && <Button variant="ghost" size="sm" className="size-8! text-red-500 hover:bg-red-50" onClick={() => setLineas(lineas.filter((_, idx) => idx !== i))}><Trash2 className="size-4" /></Button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBox>
        </div>

        <div className="space-y-4">
          <CardBox className="shadow-none border-2 border-destructive/20 bg-gradient-to-b from-destructive/[0.05] to-transparent">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Icon icon="solar:calculator-linear" width={20} className="text-destructive" /> Resumen
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono font-medium">{form.moneda === 'USD' ? '$' : 'Bs.'} {subtotal.toFixed(2)}</span></div>
              <div className="border-t pt-3 flex justify-between"><span className="font-semibold">Total</span><span className="font-mono font-bold text-lg text-destructive">{form.moneda === 'USD' ? '$' : 'Bs.'} {total.toFixed(2)}</span></div>
            </div>

            <div className="mt-4">
              <div className="flex flex-col gap-1.5"><Label className="text-xs">Notas</Label><Input value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} placeholder="Opcional" className="h-9" /></div>
            </div>

            <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-border">
              <Button onClick={handle} disabled={g} variant="destructive" className="w-full" size="lg">
                {g ? <Icon icon="svg-spinners:180-ring" width={18} className="mr-1 animate-spin" /> : <Icon icon="solar:cart-cross-bold" width={18} className="mr-1" />}
                {g ? 'Registrando...' : 'Registrar gasto'}
              </Button>
              <Button variant="ghost" onClick={() => nav('/admin/caja-facturacion')} size="sm">Cancelar</Button>
            </div>
          </CardBox>
        </div>
      </div>

      <DialogCrearProveedor open={openCrearProv} onOpenChange={setOpenCrearProv} onCreado={cargarProvs} />
    </div>
  );
};

function DialogCrearProveedor({ open, onOpenChange, onCreado }: { open: boolean; onOpenChange: (v: boolean) => void; onCreado: () => void }) {
  const [f, setF] = useState<CrearProveedorRequest>({ nombre: '', rif: '', email: '', telefono: '', categoria: 'MERCANCIA' });
  const [e, setE] = useState(''); const [g, setG] = useState(false);
  const handle = async () => {
    if (!f.nombre.trim() || !f.rif.trim()) { setE('Nombre y RIF son obligatorios.'); return; }
    try { setG(true); await proveedorService.crear(f); toast.success('Proveedor creado'); onOpenChange(false); onCreado(); }
    catch (err: any) { setE(err.message); } finally { setG(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Crear proveedor rápido</DialogTitle></DialogHeader>
        {e && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md">{e}</div>}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="col-span-2 flex flex-col gap-1.5"><Label>Nombre *</Label><Input value={f.nombre} onChange={e => setF({...f, nombre: e.target.value})} /></div>
          <div className="flex flex-col gap-1.5"><Label>RIF *</Label><Input value={f.rif} onChange={e => setF({...f, rif: e.target.value})} /></div>
          <div className="flex flex-col gap-1.5"><Label>Categoría</Label>
            <Select value={f.categoria} onValueChange={v => setF({...f, categoria: v as CategoriaProveedor})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5"><Label>Email</Label><Input value={f.email} onChange={e => setF({...f, email: e.target.value})} /></div>
          <div className="flex flex-col gap-1.5"><Label>Teléfono</Label><Input value={f.telefono} onChange={e => setF({...f, telefono: e.target.value})} /></div>
        </div>
        <DialogFooter className="mt-4"><Button variant="outline" onClick={() => onOpenChange(false)} disabled={g}>Cancelar</Button><Button onClick={handle} disabled={g}>{g ? '...' : 'Crear proveedor'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RegistrarGastoPage;
