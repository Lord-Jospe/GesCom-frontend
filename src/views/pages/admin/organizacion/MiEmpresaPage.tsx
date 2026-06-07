import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { empresaService, tasaBcvService } from 'src/api/services/empresaService';
import type { EmpresaResponse, TasaBcvResponse } from 'src/types/empresa';
import CardBox from 'src/components/shared/CardBox';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Switch } from 'src/components/ui/switch';
import { Badge } from 'src/components/ui/badge';
import { Icon } from '@iconify/react';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from 'src/components/ui/dialog';

const hoy = new Date().toISOString().slice(0, 10);

const MiEmpresaPage = () => {
  const [empresa, setEmpresa] = useState<EmpresaResponse | null>(null);
  const [tasas, setTasas] = useState<TasaBcvResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // diálogos
  const [openPerfil, setOpenPerfil] = useState(false);
  const [openTasa, setOpenTasa] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const [emp, tasasData] = await Promise.all([
        empresaService.obtenerPerfil(),
        tasaBcvService.historial(),
      ]);
      setEmpresa(emp);
      setTasas(tasasData.slice(0, 10));
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" />
    </div>
  );

  if (!empresa) return <p className="text-red-500">No se pudo cargar la información de la empresa.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi Empresa</h1>
        <p className="text-muted-foreground">Perfil, configuración y suscripción</p>
      </div>

      {/* Perfil */}
      <CardBox className="shadow-none border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Perfil de la empresa</h3>
          <Button variant="outline" size="sm" onClick={() => setOpenPerfil(true)}>
            <Icon icon="solar:pen-linear" width={14} className="mr-1" /> Editar
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Nombre:</span> <span className="font-medium">{empresa.nombre}</span></div>
          <div><span className="text-muted-foreground">RIF:</span> <span className="font-medium">{empresa.rif}</span></div>
          <div><span className="text-muted-foreground">Correo:</span> <span className="font-medium">{empresa.correo}</span></div>
          <div><span className="text-muted-foreground">Teléfono:</span> <span className="font-medium">{empresa.telefono || '—'}</span></div>
          <div><span className="text-muted-foreground">Dirección:</span> <span className="font-medium">{empresa.direccion || '—'}</span></div>
          <div><span className="text-muted-foreground">Actividad:</span> <span className="font-medium">{empresa.actividad || '—'}</span></div>
        </div>
      </CardBox>

      {/* Moneda e Impuestos */}
      <div className="grid sm:grid-cols-2 gap-6">
        <CardBox className="shadow-none border border-border">
          <h3 className="text-base font-semibold mb-4">Moneda y numeración</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Moneda base</span>
              <Badge className="bg-primary/10 text-primary">{empresa.monedaBase}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Facturas emitidas</span>
              <span className="font-medium">{empresa.facturaPrefijo || ''}{empresa.facturaSiguienteNumero}</span>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={async () => {
              const nueva = empresa.monedaBase === 'USD' ? 'VES' : 'USD';
              try { await empresaService.cambiarMoneda({ moneda: nueva }); toast.success(`Moneda cambiada a ${nueva}`); cargar(); }
              catch (e: any) { toast.error(e.message); }
            }}>
              Cambiar a {empresa.monedaBase === 'USD' ? 'VES (Bolívares)' : 'USD (Dólares)'}
            </Button>
          </div>
        </CardBox>

        <CardBox className="shadow-none border border-border">
          <h3 className="text-base font-semibold mb-4">Impuestos</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">IVA ({empresa.ivaPorcentaje}%)</span>
              <Badge className={empresa.ivaActivo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                {empresa.ivaActivo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">IGTF (3%)</span>
              <Badge className={empresa.igtfActivo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                {empresa.igtfActivo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </CardBox>
      </div>

      {/* Tasa BCV */}
      <CardBox className="shadow-none border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Tasa BCV</h3>
          <Button variant="outline" size="sm" onClick={() => setOpenTasa(true)}>
            <Icon icon="solar:add-circle-linear" width={16} className="mr-1" /> Registrar tasa
          </Button>
        </div>
        {tasas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Sin tasas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30"><tr>
                <th className="text-left px-3 py-2 font-semibold">Fecha</th>
                <th className="text-left px-3 py-2 font-semibold">Tasa (Bs. por USD)</th>
                <th className="text-left px-3 py-2 font-semibold">Registrada por</th>
              </tr></thead>
              <tbody>
                {tasas.map(t => (
                  <tr key={t.tasaId} className="border-t">
                    <td className="px-3 py-2">{t.fecha}</td>
                    <td className="px-3 py-2 font-mono font-medium">{t.tasa.toFixed(2)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{t.registradoPor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBox>

      {/* Diálogo editar perfil */}
      <DialogEditarPerfil open={openPerfil} onOpenChange={setOpenPerfil} empresa={empresa} onGuardado={cargar} />
      {/* Diálogo registrar tasa */}
      <DialogTasa open={openTasa} onOpenChange={setOpenTasa} onGuardado={cargar} />
    </div>
  );
};

// ── Diálogo editar perfil ─────────────────────────────────────────────

function DialogEditarPerfil({ open, onOpenChange, empresa, onGuardado }: {
  open: boolean; onOpenChange: (v: boolean) => void; empresa: EmpresaResponse; onGuardado: () => void;
}) {
  const [form, setForm] = useState({ nombre: '', rif: '', correo: '', telefono: '', direccion: '', actividad: '', ivaActivo: true, ivaPorcentaje: 16, igtfActivo: false, facturaPrefijo: '', facturaSiguienteNumero: 1 });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setForm({
      nombre: empresa.nombre, rif: empresa.rif, correo: empresa.correo, telefono: empresa.telefono || '',
      direccion: empresa.direccion || '', actividad: empresa.actividad || '',
      ivaActivo: empresa.ivaActivo, ivaPorcentaje: empresa.ivaPorcentaje, igtfActivo: empresa.igtfActivo,
      facturaPrefijo: empresa.facturaPrefijo || '', facturaSiguienteNumero: empresa.facturaSiguienteNumero,
    });
  }, [empresa, open]);

  const handle = async () => {
    if (!form.nombre.trim() || !form.rif.trim()) { setError('Nombre y RIF son obligatorios.'); return; }
    try {
      setGuardando(true);
      const delta: any = {};
      if (form.nombre !== empresa.nombre) delta.nombre = form.nombre;
      if (form.rif !== empresa.rif) delta.rif = form.rif;
      if (form.correo !== empresa.correo) delta.correo = form.correo;
      if (form.telefono !== (empresa.telefono || '')) delta.telefono = form.telefono;
      if (form.direccion !== (empresa.direccion || '')) delta.direccion = form.direccion;
      if (form.actividad !== (empresa.actividad || '')) delta.actividad = form.actividad;
      if (form.ivaActivo !== empresa.ivaActivo) delta.ivaActivo = form.ivaActivo;
      if (form.ivaPorcentaje !== empresa.ivaPorcentaje) delta.ivaPorcentaje = form.ivaPorcentaje;
      if (form.igtfActivo !== empresa.igtfActivo) delta.igtfActivo = form.igtfActivo;
      if (form.facturaPrefijo !== (empresa.facturaPrefijo || '')) delta.facturaPrefijo = form.facturaPrefijo;
      if (form.facturaSiguienteNumero !== empresa.facturaSiguienteNumero) delta.facturaSiguienteNumero = form.facturaSiguienteNumero;
      if (Object.keys(delta).length === 0) { toast.info('Sin cambios'); onOpenChange(false); return; }
      await empresaService.editarPerfil(delta);
      toast.success('Perfil actualizado');
      onOpenChange(false); onGuardado();
    } catch (e: any) { setError(e.message); }
    finally { setGuardando(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Editar perfil</DialogTitle></DialogHeader>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md">{error}</div>}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="col-span-2 flex flex-col gap-1.5"><Label>Nombre *</Label><Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
          <div className="flex flex-col gap-1.5"><Label>RIF *</Label><Input value={form.rif} onChange={e => setForm({ ...form, rif: e.target.value })} disabled /></div>
          <div className="flex flex-col gap-1.5"><Label>Correo</Label><Input value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} /></div>
          <div className="flex flex-col gap-1.5"><Label>Teléfono</Label><Input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} /></div>
          <div className="flex flex-col gap-1.5"><Label>Actividad</Label><Input value={form.actividad} onChange={e => setForm({ ...form, actividad: e.target.value })} /></div>
          <div className="col-span-2 flex flex-col gap-1.5"><Label>Dirección</Label><Input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} /></div>
          <div className="flex items-center justify-between"><Label>IVA activo</Label><Switch checked={form.ivaActivo} onCheckedChange={v => setForm({ ...form, ivaActivo: v })} /></div>
          <div className="flex items-center justify-between"><Label>IGTF activo</Label><Switch checked={form.igtfActivo} onCheckedChange={v => setForm({ ...form, igtfActivo: v })} /></div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={guardando}>Cancelar</Button>
          <Button onClick={handle} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Diálogo registrar tasa ────────────────────────────────────────────

function DialogTasa({ open, onOpenChange, onGuardado }: {
  open: boolean; onOpenChange: (v: boolean) => void; onGuardado: () => void;
}) {
  const [tasa, setTasa] = useState('');
  const [fecha, setFecha] = useState(hoy);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => { setFecha(hoy); setTasa(''); setError(''); }, [open]);

  const handle = async () => {
    const n = parseFloat(tasa);
    if (!tasa || isNaN(n) || n <= 0) { setError('Ingresa una tasa válida.'); return; }
    try {
      setGuardando(true);
      await tasaBcvService.registrar({ tasa: n, fecha });
      toast.success('Tasa BCV registrada');
      onOpenChange(false); onGuardado();
    } catch (e: any) { setError(e.message); }
    finally { setGuardando(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Registrar tasa BCV</DialogTitle></DialogHeader>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md">{error}</div>}
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5"><Label>Fecha</Label><Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} /></div>
          <div className="flex flex-col gap-1.5"><Label>Tasa (Bs. por USD)</Label><Input type="number" step="0.01" value={tasa} onChange={e => setTasa(e.target.value)} placeholder="Ej: 35.40" /></div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={guardando}>Cancelar</Button>
          <Button onClick={handle} disabled={guardando}>{guardando ? 'Registrando...' : 'Registrar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MiEmpresaPage;
