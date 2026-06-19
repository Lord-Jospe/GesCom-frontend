import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { inventarioService } from 'src/api/services/inventarioService';
import type { ProductoResponse, CrearProductoRequest, UnidadMedida, RegistrarMovimientoRequest } from 'src/types/inventario';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Badge } from 'src/components/ui/badge';
import { Switch } from 'src/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from 'src/components/ui/tooltip';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { Pencil, RotateCcw, Trash2, Plus, Minus, AlertTriangle, ArrowDown, ArrowUp, Info } from 'lucide-react';

const unidades: UnidadMedida[] = ['UNIDAD', 'KG', 'GR', 'LITRO', 'ML', 'GALON', 'METRO', 'CM', 'CAJA', 'PAR', 'DOCENA'];
const TAM = 12;

const alertaConfig: Record<string, { icon: string; color: string; bar: string }> = {
  ROJO:    { icon: 'solar:danger-circle-bold',      color: 'text-red-500 bg-red-50',      bar: 'bg-red-500' },
  AMARILLO:{ icon: 'solar:danger-triangle-bold',     color: 'text-yellow-600 bg-yellow-50', bar: 'bg-yellow-500' },
  VERDE:   { icon: 'solar:check-circle-bold',        color: 'text-green-600 bg-green-50',   bar: 'bg-green-500' },
};

const InventarioPage = () => {
  const [productos, setProductos] = useState<ProductoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [filtroStock, setFiltroStock] = useState<string>('TODOS');
  const [openCrear, setOpenCrear] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openToggle, setOpenToggle] = useState(false);
  const [openMov, setOpenMov] = useState(false);
  const [sel, setSel] = useState<ProductoResponse | null>(null);

  const cargar = useCallback(async () => {
    try { setLoading(true); const p = await inventarioService.obtenerPaginado(pagina, TAM); setProductos(p.contenido); setTotalPaginas(p.totalPaginas); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }, [pagina]);

  useEffect(() => { cargar(); }, [cargar]);

  const filtrados = productos.filter(p => {
    if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase()) && !(p.codigo || '').toLowerCase().includes(busqueda.toLowerCase())) return false;
    if (filtroStock === 'CRITICO') return p.alertaStock === 'ROJO' || p.alertaStock === 'AMARILLO';
    if (filtroStock === 'AGOTADO') return p.alertaStock === 'ROJO';
    if (filtroStock === 'BAJO') return p.alertaStock === 'AMARILLO';
    if (filtroStock === 'OK') return !p.alertaStock || p.alertaStock === 'VERDE';
    return true;
  });

  const criticos = productos.filter(p => p.alertaStock === 'ROJO' || p.alertaStock === 'AMARILLO');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-muted-foreground">{productos.length} productos · {criticos.length} alertas · <ValorInventario /></p>
        </div>
        <div className="flex items-center gap-3">
          <Input placeholder="Buscar..." className="w-48 lg:w-64" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          <Select value={filtroStock} onValueChange={setFiltroStock}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Stock" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              <SelectItem value="CRITICO">Críticos</SelectItem>
              <SelectItem value="AGOTADO">Agotados</SelectItem>
              <SelectItem value="BAJO">Stock bajo</SelectItem>
              <SelectItem value="OK">En stock</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setOpenCrear(true)} className="flex items-center gap-2 shrink-0"><Plus className="size-4" /> Nuevo</Button>
        </div>
      </div>

      {criticos.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm">
          <AlertTriangle className="size-4 text-red-500 shrink-0" />
          <span className="text-red-700 font-medium">{criticos.length} producto(s) con stock crítico</span>
          {criticos.slice(0, 3).map(p => (
            <Badge key={p.productoId} className="bg-red-100 text-red-700 cursor-pointer" onClick={() => { setSel(p); setOpenMov(true); }}>
              {p.nombre} ({p.stockActual})
            </Badge>
          ))}
        </div>
      )}

      {loading ? <div className="flex justify-center py-20"><Icon icon="svg-spinners:180-ring" width={36} className="text-primary animate-spin" /></div>
      : filtrados.length === 0 ? <p className="text-center py-20 text-muted-foreground">No hay productos.</p>
      : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtrados.map(p => {
              const alerta = alertaConfig[p.alertaStock] || alertaConfig.VERDE;
              const pctStock = p.stockMinimo > 0 ? Math.min(100, Math.max(0, (p.stockActual / p.stockMinimo) * 100)) : 100;
              return (
                <CardBox key={p.productoId} className="shadow-none border border-border hover:border-primary/40 hover:shadow-md transition-all group">
                  <div className={`h-1.5 rounded-t-lg -mx-6 -mt-6 mb-4 ${alerta.bar}`} />
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${alerta.color}`}><Icon icon="solar:box-linear" width={24} /></div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" className="size-8!" onClick={() => { setSel(p); setOpenMov(true); }} title="Movimiento"><Icon icon="solar:transfer-horizontal-linear" width={16} /></Button>
                      <Button size="sm" variant="ghost" className="size-8!" onClick={() => { setSel(p); setOpenEditar(true); }}><Pencil className="size-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="size-8!" onClick={() => { setSel(p); setOpenToggle(true); }}>
                        {p.activo ? <Trash2 className="size-3.5" /> : <RotateCcw className="size-3.5" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{p.nombre}</h3>
                    {p.ventaBajoPedido && <Badge className="bg-purple-100 text-purple-700 text-xs shrink-0">Bajo pedido</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{p.codigo || 'Sin código'} · {p.categoria || 'General'}</p>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Stock</span><span className="font-mono font-medium">{p.stockActual} / {p.stockMinimo}</span></div>
                    <div className="w-full h-2 rounded-full bg-muted"><div className={`h-2 rounded-full transition-all ${alerta.bar}`} style={{ width: `${pctStock}%` }} /></div>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-3 border-t border-border">
                    <div><p className="text-xs text-muted-foreground">Costo</p><p className="font-mono font-medium">${p.costoUnitario?.toFixed(2) || '—'}</p></div>
                    <div className="text-right"><p className="text-xs text-muted-foreground">Venta</p><p className="font-mono font-semibold text-primary">${p.precioVenta?.toFixed(2) || '—'}</p></div>
                  </div>
                </CardBox>
              );
            })}
          </div>
          {totalPaginas > 1 && (
            <div className="flex justify-center gap-3 pt-4">
              <Button variant="outline" size="sm" disabled={pagina === 0} onClick={() => setPagina(p => p - 1)}>Anterior</Button>
              <span className="text-sm text-muted-foreground">Pág. {pagina + 1} de {totalPaginas}</span>
              <Button variant="outline" size="sm" disabled={pagina + 1 >= totalPaginas} onClick={() => setPagina(p => p + 1)}>Siguiente</Button>
            </div>
          )}
        </>
      )}

      <DialogProducto open={openCrear} onOpenChange={setOpenCrear} onGuardado={cargar} />
      <DialogProducto open={openEditar} onOpenChange={setOpenEditar} onGuardado={cargar} producto={sel} />
      <DialogToggle open={openToggle} onOpenChange={setOpenToggle} onGuardado={cargar} producto={sel} />
      <MovimientoDialog open={openMov} onOpenChange={setOpenMov} producto={sel} onGuardado={cargar} />
    </div>
  );
};

function DialogProducto({ open, onOpenChange, onGuardado, producto }: {
  open: boolean; onOpenChange: (v: boolean) => void; onGuardado: () => void; producto?: ProductoResponse | null;
}) {
  const esEditar = !!producto;
  const [form, setForm] = useState<CrearProductoRequest>({ nombre: '', unidadMedida: 'UNIDAD', ventaBajoPedido: false });
  const [error, setError] = useState(''); const [g, setG] = useState(false);
  useEffect(() => {
    if (producto) setForm({ codigo: producto.codigo || '', nombre: producto.nombre, descripcion: producto.descripcion || '', categoria: producto.categoria || '', unidadMedida: (producto.unidadMedida as UnidadMedida) || 'UNIDAD', costoUnitario: producto.costoUnitario, precioVenta: producto.precioVenta, stockMinimo: producto.stockMinimo, ventaBajoPedido: producto.ventaBajoPedido });
    else setForm({ nombre: '', unidadMedida: 'UNIDAD', ventaBajoPedido: false });
    setError('');
  }, [producto, open]);
  const handle = async () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return; }
    try { setG(true);
      if (esEditar) { await inventarioService.editar(producto!.productoId, form); toast.success('Producto actualizado'); }
      else { await inventarioService.crear(form); toast.success('Producto creado'); }
      onOpenChange(false); onGuardado();
    } catch (e: any) { setError(e.message); } finally { setG(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{esEditar ? 'Editar producto' : 'Nuevo producto'}</DialogTitle></DialogHeader>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md">{error}</div>}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col gap-1.5"><Label>Código</Label><Input value={form.codigo || ''} onChange={e => setForm({...form, codigo: e.target.value})} /></div>
          <div className="flex flex-col gap-1.5"><Label>Nombre *</Label><Input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
          <div className="flex flex-col gap-1.5"><Label>Categoría</Label><Input value={form.categoria || ''} onChange={e => setForm({...form, categoria: e.target.value})} /></div>
          <div className="flex flex-col gap-1.5"><Label>Unidad *</Label>
            <Select value={form.unidadMedida} onValueChange={v => setForm({...form, unidadMedida: v as UnidadMedida})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{unidades.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5"><Label>Costo unitario</Label><Input type="number" step="0.01" value={form.costoUnitario ?? ''} onChange={e => setForm({...form, costoUnitario: e.target.value ? Number(e.target.value) : undefined})} /></div>
          <div className="flex flex-col gap-1.5"><Label>Precio venta</Label><Input type="number" step="0.01" value={form.precioVenta ?? ''} onChange={e => setForm({...form, precioVenta: e.target.value ? Number(e.target.value) : undefined})} /></div>
          <div className="flex flex-col gap-1.5"><Label>Stock mínimo</Label><Input type="number" value={form.stockMinimo ?? 5} onChange={e => setForm({...form, stockMinimo: Number(e.target.value)})} /></div>
          {esEditar ? null : <div className="flex flex-col gap-1.5"><Label>Stock inicial</Label><Input type="number" value={form.stockInicial ?? ''} onChange={e => setForm({...form, stockInicial: e.target.value ? Number(e.target.value) : undefined})} /></div>}
          <div className="flex items-center gap-3">
            <Switch checked={form.ventaBajoPedido || false} onCheckedChange={v => setForm({...form, ventaBajoPedido: v})} />
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1 cursor-help">
                  <Label className="cursor-help">Venta bajo pedido</Label>
                  <Info className="size-3.5 text-muted-foreground" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                Permite vender este producto aunque no haya stock disponible. El stock quedará en negativo y deberás reponerlo después. Útil para productos que fabricas o compras bajo demanda.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="col-span-2 flex flex-col gap-1.5"><Label>Descripción</Label><Input value={form.descripcion || ''} onChange={e => setForm({...form, descripcion: e.target.value})} /></div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={g}>Cancelar</Button>
          <Button onClick={handle} disabled={g}>{g ? 'Guardando...' : esEditar ? 'Guardar' : 'Crear'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogToggle({ open, onOpenChange, onGuardado, producto }: {
  open: boolean; onOpenChange: (v: boolean) => void; onGuardado: () => void; producto: ProductoResponse | null;
}) {
  const [p, setP] = useState(false);
  if (!producto) return null;
  const activar = !producto.activo;
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>{activar ? 'Activar' : 'Desactivar'} producto</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">{activar ? `¿Activar ${producto.nombre}?` : `¿Desactivar ${producto.nombre}?`}</p><DialogFooter className="mt-4"><Button variant="outline" onClick={() => onOpenChange(false)} disabled={p}>Cancelar</Button><Button variant={activar ? 'default' : 'destructive'} onClick={async () => { try { setP(true); if (activar) await inventarioService.activar(producto.productoId); else await inventarioService.desactivar(producto.productoId); toast.success(`Producto ${activar ? 'activado' : 'desactivado'}`); onOpenChange(false); onGuardado(); } catch (e: any) { toast.error(e.message); } finally { setP(false); } }} disabled={p}>{p ? '...' : activar ? 'Activar' : 'Desactivar'}</Button></DialogFooter></DialogContent></Dialog>;
}

export function MovimientoDialog({ open, onOpenChange, producto, onGuardado }: {
  open: boolean; onOpenChange: (v: boolean) => void; producto: ProductoResponse | null; onGuardado: () => void;
}) {
  const [tipo, setTipo] = useState<'ENTRADA' | 'SALIDA' | 'MERMA'>('ENTRADA');
  const [cantidad, setCantidad] = useState(1); const [motivo, setMotivo] = useState('');
  const [error, setError] = useState(''); const [g, setG] = useState(false);
  if (!producto) return null;
  const handle = async () => {
    if (cantidad <= 0) { setError('Cantidad inválida.'); return; }
    try { setG(true);
      await inventarioService.registrarMovimiento({ productoId: producto.productoId, tipo, cantidad, motivo: motivo || undefined });
      toast.success('Movimiento registrado'); onOpenChange(false); onGuardado();
    } catch (e: any) { setError(e.message); } finally { setG(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Registrar movimiento</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground mb-2">{producto.nombre} — Stock: <strong>{producto.stockActual}</strong></p>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md mb-2">{error}</div>}
        <div className="flex gap-2 mb-3">
          {(['ENTRADA', 'SALIDA', 'MERMA'] as const).map(t => (
            <Button key={t} size="sm" variant={tipo === t ? 'default' : 'outline'} className="flex-1" onClick={() => setTipo(t)}>
              {t === 'ENTRADA' ? <ArrowDown className="size-3.5 mr-1" /> : t === 'SALIDA' ? <ArrowUp className="size-3.5 mr-1" /> : <AlertTriangle className="size-3.5 mr-1" />}
              {t === 'ENTRADA' ? 'Entrada' : t === 'SALIDA' ? 'Salida' : 'Merma'}
            </Button>
          ))}
        </div>
        <div className="flex flex-col gap-3"><div className="flex flex-col gap-1.5"><Label>Cantidad</Label><Input type="number" min={1} value={cantidad} onChange={e => setCantidad(Number(e.target.value))} /></div>
        <div className="flex flex-col gap-1.5"><Label>Motivo</Label><Input value={motivo} onChange={e => setMotivo(e.target.value)} /></div></div>
        <DialogFooter className="mt-4"><Button variant="outline" onClick={() => onOpenChange(false)} disabled={g}>Cancelar</Button><Button onClick={handle} disabled={g}>{g ? '...' : 'Registrar'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ValorInventario() {
  const [valor, setValor] = useState<number | null>(null);
  useEffect(() => { inventarioService.valorTotal().then(setValor).catch(() => {}); }, []);
  if (valor === null) return null;
  return <span className="font-semibold text-primary">Valor total: ${valor.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
}

export default InventarioPage;
