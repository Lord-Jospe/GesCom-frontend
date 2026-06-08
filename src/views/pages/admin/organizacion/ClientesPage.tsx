import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { clienteService } from 'src/api/services/clienteService';
import { transaccionService } from 'src/api/services/transaccionService';
import type { ClienteResponse, CrearClienteRequest, TipoPersona } from 'src/types/cliente';
import type { TransaccionResponse } from 'src/types/transaccion';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Badge } from 'src/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import { Icon } from '@iconify/react';
import { Pencil, RotateCcw, Trash2, X, ArrowUp, ArrowDown, Building2, User } from 'lucide-react';

const TAM = 12;
const tipoLabel: Record<string, string> = { NATURAL: 'Natural', JURIDICA: 'Jurídica' };
const estadoColor: Record<string, string> = { PAGADA: 'bg-green-100 text-green-700', PENDIENTE: 'bg-yellow-100 text-yellow-700', PARCIAL: 'bg-blue-100 text-blue-700', ANULADA: 'bg-red-100 text-red-700' };

const ClientesPage = () => {
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [openCrear, setOpenCrear] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openToggle, setOpenToggle] = useState(false);
  const [sel, setSel] = useState<ClienteResponse | null>(null);
  const [detalle, setDetalle] = useState<ClienteResponse | null>(null);
  const [transacciones, setTransacciones] = useState<TransaccionResponse[]>([]);

  const cargar = useCallback(async () => {
    try { setLoading(true); const p = await clienteService.obtenerPaginado(pagina, TAM); setClientes(p.contenido); setTotalPaginas(p.totalPaginas); }
    catch { /* */ } finally { setLoading(false); }
  }, [pagina]);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirDetalle = async (c: ClienteResponse) => {
    setDetalle(c);
    try { setTransacciones(await transaccionService.listar({ clienteId: c.clienteId })); }
    catch { setTransacciones([]); }
  };

  const filtrados = busqueda ? clientes.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.rifCedula.toLowerCase().includes(busqueda.toLowerCase())) : clientes;
  const activos = clientes.filter(c => c.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">{clientes.length} clientes · {activos} activos</p>
        </div>
        <Button onClick={() => setOpenCrear(true)} className="flex items-center gap-2"><Icon icon="solar:user-plus-linear" width={18} /> Nuevo cliente</Button>
      </div>

      <div className="flex items-center gap-3">
        <Input placeholder="Buscar por nombre o RIF..." className="max-w-sm" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
      </div>

      {loading ? <div className="flex justify-center py-16"><Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" /></div>
      : filtrados.length === 0 ? <p className="text-center py-16 text-muted-foreground">No hay clientes.</p>
      : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtrados.map(c => (
              <div key={c.clienteId} onClick={() => abrirDetalle(c)}
                className="rounded-xl border-2 border-border bg-white dark:bg-dark p-5 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${c.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {c.tipoPersona === 'JURIDICA' ? <Building2 className="size-5" /> : <User className="size-5" />}
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" className="size-8!" onClick={() => { setSel(c); setOpenEditar(true); }}><Pencil className="size-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="size-8!" onClick={() => { setSel(c); setOpenToggle(true); }}>
                      {c.isActive ? <Trash2 className="size-3.5" /> : <RotateCcw className="size-3.5" />}
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold truncate">{c.nombre}</h3>
                <p className="text-xs text-muted-foreground mb-1">{c.rifCedula}</p>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <Badge variant="outline" className="text-xs">{tipoLabel[c.tipoPersona] || c.tipoPersona}</Badge>
                  <Badge className={c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{c.isActive ? 'Activo' : 'Inactivo'}</Badge>
                  <span className="text-xs text-muted-foreground ml-auto">{c.correo || 'Sin correo'}</span>
                </div>
              </div>
            ))}
          </div>
          {totalPaginas > 1 && (
            <div className="flex justify-center gap-3"><Button variant="outline" size="sm" disabled={pagina === 0} onClick={() => setPagina(p => p - 1)}>Anterior</Button><span className="text-sm text-muted-foreground">Pág. {pagina + 1} de {totalPaginas}</span><Button variant="outline" size="sm" disabled={pagina + 1 >= totalPaginas} onClick={() => setPagina(p => p + 1)}>Siguiente</Button></div>
          )}
        </>
      )}

      {/* Panel detalle */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setDetalle(null)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-dark h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right">
            <div className="sticky top-0 bg-white dark:bg-dark z-10 p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{detalle.nombre}</h2>
                <p className="text-sm text-muted-foreground">{detalle.rifCedula} · {tipoLabel[detalle.tipoPersona]}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setDetalle(null)}><X className="size-5" /></Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl border border-border p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-xs text-muted-foreground uppercase tracking-wide">Correo</span><p className="font-medium mt-0.5">{detalle.correo || '—'}</p></div>
                  <div><span className="text-xs text-muted-foreground uppercase tracking-wide">Teléfono</span><p className="font-medium mt-0.5">{detalle.telefono || '—'}</p></div>
                  <div className="col-span-2"><span className="text-xs text-muted-foreground uppercase tracking-wide">Dirección</span><p className="font-medium mt-0.5">{detalle.direccion || '—'}</p></div>
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
                    {transacciones.slice(0, 20).map(t => {
                      const ingreso = t.tipo === 'INGRESO';
                      return (
                        <div key={t.transaccionId} className="flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-1.5 rounded-full ${ingreso ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                              {ingreso ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{t.numeroFactura || `#${t.transaccionId}`}</p>
                              <p className="text-xs text-muted-foreground">{t.fecha}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <p className={`text-sm font-semibold ${ingreso ? 'text-success' : 'text-destructive'}`}>
                              {ingreso ? '+' : '−'}{t.moneda === 'USD' ? '$' : 'Bs.'} {t.total.toFixed(2)}
                            </p>
                            <Badge className={estadoColor[t.estado] || ''}>{t.estado}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <DialogCliente open={openCrear} onOpenChange={setOpenCrear} onGuardado={cargar} />
      <DialogCliente open={openEditar} onOpenChange={setOpenEditar} onGuardado={cargar} cliente={sel} />
      <DialogToggle open={openToggle} onOpenChange={setOpenToggle} onGuardado={cargar} cliente={sel} />
    </div>
  );
};

function DialogCliente({ open, onOpenChange, onGuardado, cliente }: {
  open: boolean; onOpenChange: (v: boolean) => void; onGuardado: () => void; cliente?: ClienteResponse | null;
}) {
  const esEditar = !!cliente;
  const [form, setForm] = useState<CrearClienteRequest>({ tipoPersona: 'NATURAL', nombre: '', rifCedula: '', correo: '', telefono: '', direccion: '' });
  const [error, setError] = useState(''); const [g, setG] = useState(false);
  useEffect(() => {
    if (cliente) setForm({ tipoPersona: cliente.tipoPersona as TipoPersona, nombre: cliente.nombre, rifCedula: cliente.rifCedula, correo: cliente.correo, telefono: cliente.telefono, direccion: cliente.direccion });
    else setForm({ tipoPersona: 'NATURAL', nombre: '', rifCedula: '', correo: '', telefono: '', direccion: '' });
    setError('');
  }, [cliente, open]);
  const handle = async () => {
    if (!form.nombre.trim() || !form.rifCedula.trim()) { setError('Nombre y RIF/Cédula son obligatorios.'); return; }
    try { setG(true);
      if (esEditar) { const delta: any = {}; if (form.nombre !== cliente!.nombre) delta.nombre = form.nombre; if (form.rifCedula !== cliente!.rifCedula) delta.rifCedula = form.rifCedula; if (form.correo !== cliente!.correo) delta.correo = form.correo; if (form.telefono !== cliente!.telefono) delta.telefono = form.telefono; if (form.direccion !== cliente!.direccion) delta.direccion = form.direccion; if (form.tipoPersona !== cliente!.tipoPersona) delta.tipoPersona = form.tipoPersona; if (Object.keys(delta).length === 0) { toast.info('Sin cambios'); onOpenChange(false); return; } await clienteService.editar(cliente!.clienteId, delta); toast.success('Cliente actualizado'); }
      else { await clienteService.crear(form); toast.success('Cliente creado'); }
      onOpenChange(false); onGuardado();
    } catch (e: any) { setError(e.message); } finally { setG(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{esEditar ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle></DialogHeader>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md">{error}</div>}
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="flex flex-col gap-1.5"><Label>Tipo *</Label><Select value={form.tipoPersona} onValueChange={v => setForm({...form, tipoPersona: v as TipoPersona})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NATURAL">Natural</SelectItem><SelectItem value="JURIDICA">Jurídica</SelectItem></SelectContent></Select></div>
        <div className="flex flex-col gap-1.5"><Label>RIF / Cédula *</Label><Input value={form.rifCedula} onChange={e => setForm({...form, rifCedula: e.target.value})} /></div>
        <div className="col-span-2 flex flex-col gap-1.5"><Label>Nombre o razón social *</Label><Input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
        <div className="flex flex-col gap-1.5"><Label>Correo</Label><Input value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} /></div>
        <div className="flex flex-col gap-1.5"><Label>Teléfono</Label><Input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} /></div>
        <div className="col-span-2 flex flex-col gap-1.5"><Label>Dirección</Label><Input value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} /></div>
      </div>
      <DialogFooter className="mt-4"><Button variant="outline" onClick={() => onOpenChange(false)} disabled={g}>Cancelar</Button><Button onClick={handle} disabled={g}>{g ? '...' : esEditar ? 'Guardar' : 'Crear'}</Button></DialogFooter></DialogContent></Dialog>
  );
}

function DialogToggle({ open, onOpenChange, onGuardado, cliente }: {
  open: boolean; onOpenChange: (v: boolean) => void; onGuardado: () => void; cliente: ClienteResponse | null;
}) {
  const [p, setP] = useState(false); if (!cliente) return null;
  const activar = !cliente.isActive;
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>{activar ? 'Activar' : 'Desactivar'} cliente</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">{activar ? `¿Activar ${cliente.nombre}?` : `¿Desactivar ${cliente.nombre}?`}</p><DialogFooter className="mt-4"><Button variant="outline" onClick={() => onOpenChange(false)} disabled={p}>Cancelar</Button><Button variant={activar ? 'default' : 'destructive'} onClick={async () => { try { setP(true); if (activar) await clienteService.activar(cliente.clienteId); else await clienteService.desactivar(cliente.clienteId); toast.success(`Cliente ${activar ? 'activado' : 'desactivado'}`); onOpenChange(false); onGuardado(); } catch (e: any) { toast.error(e.message); } finally { setP(false); } }} disabled={p}>{p ? '...' : activar ? 'Activar' : 'Desactivar'}</Button></DialogFooter></DialogContent></Dialog>;
}

export default ClientesPage;
