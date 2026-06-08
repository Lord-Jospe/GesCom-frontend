import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { proveedorService } from 'src/api/services/proveedorService';
import type { ProveedorResponse, CrearProveedorRequest, CategoriaProveedor } from 'src/types/proveedor';
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

const TAMANO_PAGINA = 10;
const categorias: CategoriaProveedor[] = ['MERCANCIA', 'SERVICIOS', 'TRANSPORTE', 'OTROS'];
const catLabel: Record<string, string> = { MERCANCIA: 'Mercancía', SERVICIOS: 'Servicios', TRANSPORTE: 'Transporte', OTROS: 'Otros' };

const ProveedoresPage = () => {
  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [openCrear, setOpenCrear] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openToggle, setOpenToggle] = useState(false);
  const [seleccionado, setSeleccionado] = useState<ProveedorResponse | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const page = await proveedorService.obtenerPaginado(pagina, TAMANO_PAGINA);
      setProveedores(page.contenido);
      setTotalPaginas(page.totalPaginas);
      setTotalElementos(page.totalElementos);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }, [pagina]);

  useEffect(() => { cargar(); }, [cargar]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Proveedores</h1>
          <p className="text-muted-foreground">Catálogo de proveedores y cuentas por pagar</p>
        </div>
        <Button onClick={() => setOpenCrear(true)} className="flex items-center gap-2">
          <Icon icon="solar:shop-2-linear" width={18} /> Nuevo proveedor
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Input placeholder="Buscar..." className="max-w-xs" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" /></div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left px-4 py-3 font-semibold">Nombre / RIF</th>
              <th className="text-left px-4 py-3 font-semibold">Contacto</th>
              <th className="text-left px-4 py-3 font-semibold">Categoría</th>
              <th className="text-left px-4 py-3 font-semibold">Estado</th>
              <th className="text-left px-4 py-3 font-semibold">Acciones</th>
            </tr></thead>
            <tbody>
              {proveedores.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No hay proveedores registrados.</td></tr>
              ) : proveedores.map(p => (
                <tr key={p.proveedorId} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.nombre}</p>
                    <p className="text-xs text-muted-foreground">{p.rif}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm">{p.email}</p>
                    <p className="text-xs text-muted-foreground">{p.telefono}</p>
                  </td>
                  <td className="px-4 py-3"><Badge variant="outline">{catLabel[p.categoria] || p.categoria}</Badge></td>
                  <td className="px-4 py-3">
                    <Badge className={p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{p.isActive ? 'Activo' : 'Inactivo'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="lightprimary" className="size-8! rounded-full" onClick={() => { setSeleccionado(p); setOpenEditar(true); }}><Pencil className="size-4" /></Button>
                      <Button size="sm" variant={p.isActive ? 'lighterror' : 'lightsuccess'} className="size-8! rounded-full" onClick={() => { setSeleccionado(p); setOpenToggle(true); }}>
                        {p.isActive ? <Trash2 className="size-4" /> : <RotateCcw className="size-4" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{totalElementos} proveedores</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={pagina === 0} onClick={() => setPagina(p => p - 1)}>Anterior</Button>
            <span className="text-sm text-muted-foreground px-2">Pág. {pagina + 1} de {totalPaginas}</span>
            <Button variant="outline" size="sm" disabled={pagina + 1 >= totalPaginas} onClick={() => setPagina(p => p + 1)}>Siguiente</Button>
          </div>
        </div>
      )}

      <DialogProveedor open={openCrear} onOpenChange={setOpenCrear} onGuardado={cargar} />
      <DialogProveedor open={openEditar} onOpenChange={setOpenEditar} onGuardado={cargar} proveedor={seleccionado} />
      <DialogToggle open={openToggle} onOpenChange={setOpenToggle} onToggleado={cargar} proveedor={seleccionado} />
    </div>
  );
};

function DialogProveedor({ open, onOpenChange, onGuardado, proveedor }: {
  open: boolean; onOpenChange: (v: boolean) => void; onGuardado: () => void; proveedor?: ProveedorResponse | null;
}) {
  const esEditar = !!proveedor;
  const [form, setForm] = useState<CrearProveedorRequest>({ nombre: '', rif: '', email: '', telefono: '', categoria: 'MERCANCIA' });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (proveedor) setForm({ nombre: proveedor.nombre, rif: proveedor.rif, email: proveedor.email, telefono: proveedor.telefono, categoria: proveedor.categoria as CategoriaProveedor });
    else setForm({ nombre: '', rif: '', email: '', telefono: '', categoria: 'MERCANCIA' });
    setError('');
  }, [proveedor, open]);

  const handle = async () => {
    if (!form.nombre.trim() || !form.rif.trim()) { setError('Nombre y RIF son obligatorios.'); return; }
    try {
      setGuardando(true);
      if (esEditar) {
        const delta: any = {};
        if (form.nombre !== proveedor!.nombre) delta.nombre = form.nombre;
        if (form.rif !== proveedor!.rif) delta.rif = form.rif;
        if (form.email !== proveedor!.email) delta.email = form.email;
        if (form.telefono !== proveedor!.telefono) delta.telefono = form.telefono;
        if (form.categoria !== proveedor!.categoria) delta.categoria = form.categoria;
        if (Object.keys(delta).length === 0) { toast.info('Sin cambios'); onOpenChange(false); return; }
        await proveedorService.editar(proveedor!.proveedorId, delta);
        toast.success('Proveedor actualizado');
      } else {
        await proveedorService.crear(form);
        toast.success('Proveedor creado');
      }
      onOpenChange(false); onGuardado();
    } catch (e: any) { setError(e.message); }
    finally { setGuardando(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{esEditar ? 'Editar proveedor' : 'Nuevo proveedor'}</DialogTitle></DialogHeader>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md">{error}</div>}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label>Nombre o razón social *</Label>
            <Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>RIF *</Label>
            <Input value={form.rif} onChange={e => setForm({ ...form, rif: e.target.value })} placeholder="J-12345678-9" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Categoría</Label>
            <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v as CategoriaProveedor })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{categorias.map(c => <SelectItem key={c} value={c}>{catLabel[c]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Email</Label>
            <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Teléfono</Label>
            <Input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
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

function DialogToggle({ open, onOpenChange, onToggleado, proveedor }: {
  open: boolean; onOpenChange: (v: boolean) => void; onToggleado: () => void; proveedor: ProveedorResponse | null;
}) {
  const [procesando, setProcesando] = useState(false);
  if (!proveedor) return null;
  const activar = !proveedor.isActive;
  const confirmar = async () => {
    try {
      setProcesando(true);
      if (activar) await proveedorService.activar(proveedor.proveedorId);
      else await proveedorService.desactivar(proveedor.proveedorId);
      toast.success(`Proveedor ${activar ? 'activado' : 'desactivado'}`);
      onOpenChange(false); onToggleado();
    } catch (e: any) { toast.error(e.message); }
    finally { setProcesando(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{activar ? 'Activar' : 'Desactivar'} proveedor</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{activar ? `¿Activar a ${proveedor.nombre}?` : `¿Desactivar a ${proveedor.nombre}?`}</p>
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

export default ProveedoresPage;
