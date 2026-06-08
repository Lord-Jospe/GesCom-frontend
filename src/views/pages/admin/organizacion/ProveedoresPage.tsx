import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { proveedorService } from 'src/api/services/proveedorService';
import { transaccionService } from 'src/api/services/transaccionService';
import type { ProveedorResponse, CrearProveedorRequest, CategoriaProveedor } from 'src/types/proveedor';
import type { TransaccionResponse } from 'src/types/transaccion';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Badge } from 'src/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import { Icon } from '@iconify/react';
import { Pencil, RotateCcw, Trash2, X, ArrowUp, ArrowDown, Truck, Store } from 'lucide-react';

const TAM = 12;
const categorias: CategoriaProveedor[] = ['MERCANCIA', 'SERVICIOS', 'TRANSPORTE', 'OTROS'];
const catConfig: Record<string, { icon: any; color: string }> = {
  MERCANCIA: { icon: Store, color: 'text-blue-600 bg-blue-50' }, SERVICIOS: { icon: Truck, color: 'text-purple-600 bg-purple-50' },
  TRANSPORTE: { icon: Truck, color: 'text-orange-600 bg-orange-50' }, OTROS: { icon: Store, color: 'text-gray-600 bg-gray-50' },
};
const estadoColorT: Record<string, string> = { PAGADA: 'bg-green-100 text-green-700', PENDIENTE: 'bg-yellow-100 text-yellow-700', PARCIAL: 'bg-blue-100 text-blue-700', ANULADA: 'bg-red-100 text-red-700' };

const ProveedoresPage = () => {
  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [openCrear, setOpenCrear] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openToggle, setOpenToggle] = useState(false);
  const [sel, setSel] = useState<ProveedorResponse | null>(null);
  const [detalle, setDetalle] = useState<ProveedorResponse | null>(null);
  const [transacciones, setTransacciones] = useState<TransaccionResponse[]>([]);

  const cargar = useCallback(async () => {
    try { setLoading(true); const p = await proveedorService.obtenerPaginado(pagina, TAM); setProveedores(p.contenido); setTotalPaginas(p.totalPaginas); }
    catch { /* */ } finally { setLoading(false); }
  }, [pagina]);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirDetalle = async (p: ProveedorResponse) => {
    setDetalle(p);
    try { setTransacciones(await transaccionService.listar({ proveedorId: p.proveedorId })); }
    catch { setTransacciones([]); }
  };

  const filtrados = busqueda ? proveedores.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase())) : proveedores;
  const activos = proveedores.filter(p => p.isActive).length;
  const cfg = (cat: string) => catConfig[cat] || catConfig.OTROS;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Proveedores</h1><p className="text-muted-foreground">{proveedores.length} proveedores · {activos} activos</p></div>
        <Button onClick={() => setOpenCrear(true)} className="flex items-center gap-2"><Icon icon="solar:shop-2-linear" width={18} /> Nuevo proveedor</Button>
      </div>

      <div className="flex items-center gap-3">
        <Input placeholder="Buscar por nombre..." className="max-w-sm" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
      </div>

      {loading ? <div className="flex justify-center py-16"><Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" /></div>
      : filtrados.length === 0 ? <p className="text-center py-16 text-muted-foreground">No hay proveedores.</p>
      : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtrados.map(p => {
              const c = cfg(p.categoria);
              const CIcon = c.icon;
              return (
                <div key={p.proveedorId} onClick={() => abrirDetalle(p)}
                  className="rounded-xl border-2 border-border bg-white dark:bg-dark p-5 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${c.color}`}><CIcon className="size-5" /></div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" className="size-8!" onClick={() => { setSel(p); setOpenEditar(true); }}><Pencil className="size-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="size-8!" onClick={() => { setSel(p); setOpenToggle(true); }}>
                        {p.isActive ? <Trash2 className="size-3.5" /> : <RotateCcw className="size-3.5" />}
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold truncate">{p.nombre}</h3>
                  <p className="text-xs text-muted-foreground mb-1">{p.rif}</p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <Badge variant="outline" className="text-xs">{p.categoria}</Badge>
                    <Badge className={p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{p.isActive ? 'Activo' : 'Inactivo'}</Badge>
                    <span className="text-xs text-muted-foreground ml-auto truncate">{p.email || 'Sin correo'}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {totalPaginas > 1 && (
            <div className="flex justify-center gap-3"><Button variant="outline" size="sm" disabled={pagina === 0} onClick={() => setPagina(p => p - 1)}>Anterior</Button><span className="text-sm text-muted-foreground">Pág. {pagina + 1} de {totalPaginas}</span><Button variant="outline" size="sm" disabled={pagina + 1 >= totalPaginas} onClick={() => setPagina(p => p + 1)}>Siguiente</Button></div>
          )}
        </>
      )}

      {detalle && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setDetalle(null)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-dark h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-dark z-10 p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{detalle.nombre}</h2>
                <p className="text-sm text-muted-foreground">{detalle.rif} · {detalle.categoria}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setDetalle(null)}><X className="size-5" /></Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl border border-border p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-xs text-muted-foreground uppercase tracking-wide">Email</span><p className="font-medium mt-0.5">{detalle.email || '—'}</p></div>
                  <div><span className="text-xs text-muted-foreground uppercase tracking-wide">Teléfono</span><p className="font-medium mt-0.5">{detalle.telefono || '—'}</p></div>
                </div>
                <div className="flex items-center gap-4 pt-2 border-t border-border">
                  <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Estado</span><Badge className={detalle.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{detalle.isActive ? 'Activo' : 'Inactivo'}</Badge></div>
                  <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Registrado</span><span className="text-sm font-medium">{new Date(detalle.createdAt).toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Transacciones ({transacciones.length})</h3>
                {transacciones.length === 0 ? <p className="text-sm text-muted-foreground py-4">Sin transacciones.</p> : (
                  <div className="space-y-2">
                    {transacciones.slice(0, 20).map(t => (
                      <div key={t.transaccionId} className="flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-1.5 rounded-full ${t.tipo === 'EGRESO' ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                            {t.tipo === 'EGRESO' ? <ArrowDown className="size-3.5" /> : <ArrowUp className="size-3.5" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{t.numeroFactura || `#${t.transaccionId}`}</p>
                            <p className="text-xs text-muted-foreground">{t.fecha}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-sm font-semibold text-destructive">−{t.moneda === 'USD' ? '$' : 'Bs.'} {t.total.toFixed(2)}</p>
                          <Badge className={estadoColorT[t.estado] || ''}>{t.estado}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <DialogProveedor open={openCrear} onOpenChange={setOpenCrear} onGuardado={cargar} />
      <DialogProveedor open={openEditar} onOpenChange={setOpenEditar} onGuardado={cargar} proveedor={sel} />
      <DialogToggle open={openToggle} onOpenChange={setOpenToggle} onGuardado={cargar} proveedor={sel} />
    </div>
  );
};

function DialogProveedor({ open, onOpenChange, onGuardado, proveedor }: {
  open: boolean; onOpenChange: (v: boolean) => void; onGuardado: () => void; proveedor?: ProveedorResponse | null;
}) {
  const esEditar = !!proveedor;
  const [form, setForm] = useState<CrearProveedorRequest>({ nombre: '', rif: '', email: '', telefono: '', categoria: 'MERCANCIA' });
  const [error, setError] = useState(''); const [g, setG] = useState(false);
  useEffect(() => {
    if (proveedor) setForm({ nombre: proveedor.nombre, rif: proveedor.rif, email: proveedor.email, telefono: proveedor.telefono, categoria: proveedor.categoria as CategoriaProveedor });
    else setForm({ nombre: '', rif: '', email: '', telefono: '', categoria: 'MERCANCIA' });
    setError('');
  }, [proveedor, open]);
  const handle = async () => {
    if (!form.nombre.trim() || !form.rif.trim()) { setError('Nombre y RIF son obligatorios.'); return; }
    try { setG(true);
      if (esEditar) { const delta: any = {}; if (form.nombre !== proveedor!.nombre) delta.nombre = form.nombre; if (form.rif !== proveedor!.rif) delta.rif = form.rif; if (form.email !== proveedor!.email) delta.email = form.email; if (form.telefono !== proveedor!.telefono) delta.telefono = form.telefono; if (form.categoria !== proveedor!.categoria) delta.categoria = form.categoria; if (Object.keys(delta).length === 0) { toast.info('Sin cambios'); onOpenChange(false); return; } await proveedorService.editar(proveedor!.proveedorId, delta); toast.success('Proveedor actualizado'); }
      else { await proveedorService.crear(form); toast.success('Proveedor creado'); }
      onOpenChange(false); onGuardado();
    } catch (e: any) { setError(e.message); } finally { setG(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{esEditar ? 'Editar proveedor' : 'Nuevo proveedor'}</DialogTitle></DialogHeader>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md">{error}</div>}
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="col-span-2 flex flex-col gap-1.5"><Label>Nombre *</Label><Input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
        <div className="flex flex-col gap-1.5"><Label>RIF *</Label><Input value={form.rif} onChange={e => setForm({...form, rif: e.target.value})} /></div>
        <div className="flex flex-col gap-1.5"><Label>Categoría</Label><Select value={form.categoria} onValueChange={v => setForm({...form, categoria: v as CategoriaProveedor})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
        <div className="flex flex-col gap-1.5"><Label>Email</Label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
        <div className="flex flex-col gap-1.5"><Label>Teléfono</Label><Input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} /></div>
      </div>
      <DialogFooter className="mt-4"><Button variant="outline" onClick={() => onOpenChange(false)} disabled={g}>Cancelar</Button><Button onClick={handle} disabled={g}>{g ? '...' : esEditar ? 'Guardar' : 'Crear'}</Button></DialogFooter></DialogContent></Dialog>
  );
}

function DialogToggle({ open, onOpenChange, onGuardado, proveedor }: {
  open: boolean; onOpenChange: (v: boolean) => void; onGuardado: () => void; proveedor: ProveedorResponse | null;
}) {
  const [p, setP] = useState(false); if (!proveedor) return null;
  const activar = !proveedor.isActive;
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>{activar ? 'Activar' : 'Desactivar'} proveedor</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">{activar ? `¿Activar ${proveedor.nombre}?` : `¿Desactivar ${proveedor.nombre}?`}</p><DialogFooter className="mt-4"><Button variant="outline" onClick={() => onOpenChange(false)} disabled={p}>Cancelar</Button><Button variant={activar ? 'default' : 'destructive'} onClick={async () => { try { setP(true); if (activar) await proveedorService.activar(proveedor.proveedorId); else await proveedorService.desactivar(proveedor.proveedorId); toast.success(`Proveedor ${activar ? 'activado' : 'desactivado'}`); onOpenChange(false); onGuardado(); } catch (e: any) { toast.error(e.message); } finally { setP(false); } }} disabled={p}>{p ? '...' : activar ? 'Activar' : 'Desactivar'}</Button></DialogFooter></DialogContent></Dialog>;
}

export default ProveedoresPage;
