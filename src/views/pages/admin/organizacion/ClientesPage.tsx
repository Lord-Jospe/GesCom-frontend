import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { clienteService } from 'src/api/services/clienteService';
import type { ClienteResponse, CrearClienteRequest, TipoPersona } from 'src/types/cliente';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from 'src/components/ui/select';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from 'src/components/ui/dialog';
import { Badge } from 'src/components/ui/badge';
import { Icon } from '@iconify/react';
import { Pencil, RotateCcw, Trash2 } from 'lucide-react';

type Filtro = 'todos' | 'activos' | 'inactivos';

const tipoPersonaLabel: Record<string, string> = { NATURAL: 'Persona Natural', JURIDICA: 'Jurídica' };

const ClientesPage = () => {
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [busqueda, setBusqueda] = useState('');

  // diálogos
  const [openCrear, setOpenCrear] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openToggle, setOpenToggle] = useState(false);
  const [seleccionado, setSeleccionado] = useState<ClienteResponse | null>(null);

  const cargar = useCallback(async () => {
    try { setLoading(true); setClientes(await clienteService.obtenerTodos()); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const datos = useMemo(() => {
    let r = clientes;
    if (filtro === 'activos') r = r.filter(c => c.isActive);
    if (filtro === 'inactivos') r = r.filter(c => !c.isActive);
    if (busqueda) r = r.filter(c =>
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.rifCedula.toLowerCase().includes(busqueda.toLowerCase())
    );
    return r;
  }, [clientes, filtro, busqueda]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Catálogo de clientes y estado de cuenta</p>
        </div>
        <Button onClick={() => setOpenCrear(true)} className="flex items-center gap-2">
          <Icon icon="solar:user-plus-linear" width={18} />
          Nuevo cliente
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-muted-foreground">Mostrar:</span>
        <Select value={filtro} onValueChange={(v) => setFiltro(v as Filtro)}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="activos">Activos</SelectItem>
            <SelectItem value="inactivos">Inactivos</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Buscar..." className="max-w-xs" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left px-4 py-3 font-semibold">Nombre / RIF</th>
              <th className="text-left px-4 py-3 font-semibold">Contacto</th>
              <th className="text-left px-4 py-3 font-semibold">Tipo</th>
              <th className="text-left px-4 py-3 font-semibold">Estado</th>
              <th className="text-left px-4 py-3 font-semibold">Acciones</th>
            </tr></thead>
            <tbody>
              {datos.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No hay clientes registrados.</td></tr>
              ) : datos.map(c => (
                <tr key={c.clienteId} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.nombre}</p>
                    <p className="text-xs text-muted-foreground">{c.rifCedula}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm">{c.correo}</p>
                    <p className="text-xs text-muted-foreground">{c.telefono}</p>
                  </td>
                  <td className="px-4 py-3"><Badge variant="outline">{tipoPersonaLabel[c.tipoPersona] || c.tipoPersona}</Badge></td>
                  <td className="px-4 py-3">
                    <Badge className={c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {c.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="lightprimary" className="size-8! rounded-full" onClick={() => { setSeleccionado(c); setOpenEditar(true); }} title="Editar"><Pencil className="size-4" /></Button>
                      <Button size="sm" variant={c.isActive ? 'lighterror' : 'lightsuccess'} className="size-8! rounded-full" onClick={() => { setSeleccionado(c); setOpenToggle(true); }} title={c.isActive ? 'Desactivar' : 'Activar'}>
                        {c.isActive ? <Trash2 className="size-4" /> : <RotateCcw className="size-4" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DialogCliente open={openCrear} onOpenChange={setOpenCrear} onGuardado={cargar} />
      <DialogCliente open={openEditar} onOpenChange={setOpenEditar} onGuardado={cargar} cliente={seleccionado} />
      <DialogToggle open={openToggle} onOpenChange={setOpenToggle} onToggleado={cargar} cliente={seleccionado} />
    </div>
  );
};

// ── Diálogo Crear / Editar ──────────────────────────────────────────

function DialogCliente({ open, onOpenChange, onGuardado, cliente }: {
  open: boolean; onOpenChange: (v: boolean) => void; onGuardado: () => void; cliente?: ClienteResponse | null;
}) {
  const esEditar = !!cliente;
  const [form, setForm] = useState<CrearClienteRequest>({ tipoPersona: 'NATURAL', nombre: '', rifCedula: '', correo: '', telefono: '', direccion: '' });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (cliente) setForm({ tipoPersona: cliente.tipoPersona as TipoPersona, nombre: cliente.nombre, rifCedula: cliente.rifCedula, correo: cliente.correo, telefono: cliente.telefono, direccion: cliente.direccion });
    else setForm({ tipoPersona: 'NATURAL', nombre: '', rifCedula: '', correo: '', telefono: '', direccion: '' });
    setError('');
  }, [cliente, open]);

  const handle = async () => {
    if (!form.nombre.trim() || !form.rifCedula.trim()) { setError('Nombre y RIF/Cédula son obligatorios.'); return; }
    try {
      setGuardando(true);
      if (esEditar) {
        const delta: any = {};
        if (form.tipoPersona !== cliente!.tipoPersona) delta.tipoPersona = form.tipoPersona;
        if (form.nombre !== cliente!.nombre) delta.nombre = form.nombre;
        if (form.rifCedula !== cliente!.rifCedula) delta.rifCedula = form.rifCedula;
        if (form.correo !== cliente!.correo) delta.correo = form.correo;
        if (form.telefono !== cliente!.telefono) delta.telefono = form.telefono;
        if (form.direccion !== cliente!.direccion) delta.direccion = form.direccion;
        if (Object.keys(delta).length === 0) { toast.info('Sin cambios'); onOpenChange(false); return; }
        await clienteService.editar(cliente!.clienteId, delta);
        toast.success('Cliente actualizado');
      } else {
        await clienteService.crear(form);
        toast.success('Cliente creado');
      }
      onOpenChange(false); onGuardado();
    } catch (e: any) { setError(e.message); }
    finally { setGuardando(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{esEditar ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle></DialogHeader>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md">{error}</div>}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label>Tipo *</Label>
            <Select value={form.tipoPersona} onValueChange={v => setForm({ ...form, tipoPersona: v as TipoPersona })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NATURAL">Persona Natural</SelectItem>
                <SelectItem value="JURIDICA">Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>RIF / Cédula *</Label>
            <Input value={form.rifCedula} onChange={e => setForm({ ...form, rifCedula: e.target.value })} placeholder="J-12345678-9" />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label>Nombre o razón social *</Label>
            <Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del cliente" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Correo</Label>
            <Input value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} placeholder="cliente@correo.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Teléfono</Label>
            <Input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+58 412-0000000" />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label>Dirección</Label>
            <Input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} placeholder="Dirección" />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={guardando}>Cancelar</Button>
          <Button onClick={handle} disabled={guardando}>{guardando ? 'Guardando...' : esEditar ? 'Guardar' : 'Crear'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Diálogo Activar / Desactivar ─────────────────────────────────────

function DialogToggle({ open, onOpenChange, onToggleado, cliente }: {
  open: boolean; onOpenChange: (v: boolean) => void; onToggleado: () => void; cliente: ClienteResponse | null;
}) {
  const [procesando, setProcesando] = useState(false);
  if (!cliente) return null;
  const activar = !cliente.isActive;

  const confirmar = async () => {
    try {
      setProcesando(true);
      if (activar) await clienteService.activar(cliente.clienteId);
      else await clienteService.desactivar(cliente.clienteId);
      toast.success(`Cliente ${activar ? 'activado' : 'desactivado'}`);
      onOpenChange(false); onToggleado();
    } catch (e: any) { toast.error(e.message); }
    finally { setProcesando(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{activar ? 'Activar cliente' : 'Desactivar cliente'}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          {activar ? `¿Activar a ${cliente.nombre}?` : `¿Desactivar a ${cliente.nombre}? No se eliminará su historial.`}
        </p>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={procesando}>Cancelar</Button>
          <Button variant={activar ? 'default' : 'destructive'} onClick={confirmar} disabled={procesando}>
            {procesando ? 'Procesando...' : activar ? 'Activar' : 'Desactivar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ClientesPage;
