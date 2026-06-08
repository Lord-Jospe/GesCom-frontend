import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { empresaService, tasaBcvService, formatearTasa, formatearFechaHora } from 'src/api/services/empresaService';
import type { EmpresaResponse, TasaBcvResponse, SuscripcionResponse } from 'src/types/empresa';
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

const ahoraISO = () => new Date().toISOString().slice(0, 16);

const MiEmpresaPage = () => {
  const [empresa, setEmpresa] = useState<EmpresaResponse | null>(null);
  const [tasas, setTasas] = useState<TasaBcvResponse[]>([]);
  const [suscripcion, setSuscripcion] = useState<SuscripcionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // formulario inline
  const [form, setForm] = useState({
    nombre: '', rif: '', correo: '', telefono: '', direccion: '', actividad: '',
    ivaActivo: true, ivaPorcentaje: '16', igtfActivo: false,
    facturaPrefijo: '', facturaSiguienteNumero: '1',
  });

  // diálogos
  const [openTasa, setOpenTasa] = useState(false);
  const [openMoneda, setOpenMoneda] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const [emp, t, sub] = await Promise.all([empresaService.obtenerPerfil(), tasaBcvService.historial(), empresaService.obtenerSuscripcion()]);
      setEmpresa(emp);
      setTasas(t.slice(0, 5));
      setSuscripcion(sub);
      setForm({
        nombre: emp.nombre, rif: emp.rif, correo: emp.correo, telefono: emp.telefono || '',
        direccion: emp.direccion || '', actividad: emp.actividad || '',
        ivaActivo: emp.ivaActivo, ivaPorcentaje: String(emp.ivaPorcentaje || 16), igtfActivo: emp.igtfActivo,
        facturaPrefijo: emp.facturaPrefijo || '', facturaSiguienteNumero: String(emp.facturaSiguienteNumero || 1),
      });
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // Escuchar actualizaciones de tasa desde el header
  useEffect(() => {
    const handler = () => cargar();
    window.addEventListener('tasa-bcv-actualizada', handler);
    return () => window.removeEventListener('tasa-bcv-actualizada', handler);
  }, [cargar]);

  const guardar = async () => {
    try {
      setSaving(true);
      const delta: any = {};
      if (!empresa) return;
      if (form.nombre !== empresa.nombre) delta.nombre = form.nombre;
      if (form.rif !== empresa.rif) delta.rif = form.rif;
      if (form.correo !== empresa.correo) delta.correo = form.correo;
      if (form.telefono !== (empresa.telefono || '')) delta.telefono = form.telefono;
      if (form.direccion !== (empresa.direccion || '')) delta.direccion = form.direccion;
      if (form.actividad !== (empresa.actividad || '')) delta.actividad = form.actividad;
      if (form.ivaActivo !== empresa.ivaActivo) delta.ivaActivo = form.ivaActivo;
      if (form.ivaPorcentaje !== String(empresa.ivaPorcentaje || 16)) delta.ivaPorcentaje = Number(form.ivaPorcentaje);
      if (form.igtfActivo !== empresa.igtfActivo) delta.igtfActivo = form.igtfActivo;
      if (form.facturaPrefijo !== (empresa.facturaPrefijo || '')) delta.facturaPrefijo = form.facturaPrefijo;
      if (form.facturaSiguienteNumero !== String(empresa.facturaSiguienteNumero || 1)) delta.facturaSiguienteNumero = Number(form.facturaSiguienteNumero);
      if (Object.keys(delta).length === 0) { toast.info('Sin cambios que guardar'); return; }
      await empresaService.editarPerfil(delta);
      toast.success('Perfil actualizado');
      cargar();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" /></div>;
  if (!empresa) return <p className="text-red-500">No se pudo cargar la información.</p>;

  const tasaActual = tasas.length > 0 ? tasas[0] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi Empresa</h1>
        <p className="text-muted-foreground">Perfil, configuración y suscripción</p>
      </div>

      {/* ── Tasa BCV del día ──────────────────────────────────────── */}
      <CardBox className="shadow-none border border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Icon icon="solar:dollar-minimalistic-linear" width={28} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tasa BCV del día</p>
              <p className="text-2xl font-bold text-foreground">
                {tasaActual ? formatearTasa(tasaActual.tasa) : 'Sin registrar'}
              </p>
              {tasaActual && <p className="text-xs text-muted-foreground">{formatearFechaHora(tasaActual.fechaHora)} · {tasaActual.registradoPor}</p>}
            </div>
          </div>
          <Button onClick={() => setOpenTasa(true)}>
            <Icon icon="solar:refresh-linear" width={16} className="mr-1" /> Actualizar tasa
          </Button>
        </div>
      </CardBox>

      {/* ── Plan y suscripción ───────────────────────────────────── */}
      {suscripcion && (
        <CardBox className="shadow-none border border-border bg-gradient-to-r from-secondary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-secondary/10">
                <Icon icon="solar:star-bold" width={28} className="text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plan activo</p>
                <p className="text-xl font-bold text-foreground">
                  {suscripcion.planNombre}
                  <span className="text-base font-normal text-muted-foreground ml-2">
                    ${suscripcion.precioUsd}/mes
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Vence: {new Date(suscripcion.fechaVence).toLocaleDateString('es-VE')}
                  {' · '}
                  {suscripcion.tieneInventario && '📦 Inventario '}
                  {suscripcion.tieneNomina && '💰 Nómina '}
                  {suscripcion.tieneContabilidad && '📊 Contabilidad'}
                  {!suscripcion.tieneInventario && !suscripcion.tieneNomina && !suscripcion.tieneContabilidad && 'Funcionalidades básicas'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={suscripcion.estado === 'ACTIVA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                {suscripcion.estado}
              </Badge>
              <Link to="/admin/planes">
                <Button variant="outline" size="sm">
                  <Icon icon="solar:arrow-up-linear" width={14} className="mr-1" /> Cambiar de plan
                </Button>
              </Link>
            </div>
          </div>
        </CardBox>
      )}

      {/* ── Perfil de la empresa ──────────────────────────────────── */}
      <CardBox className="shadow-none border border-border">
        <h3 className="text-base font-semibold mb-4">Perfil de la empresa</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5"><Label>Nombre comercial</Label><Input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
          <div className="flex flex-col gap-1.5"><Label>RIF</Label><Input value={form.rif} disabled className="opacity-70" /></div>
          <div className="flex flex-col gap-1.5"><Label>Correo</Label><Input value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} /></div>
          <div className="flex flex-col gap-1.5"><Label>Teléfono</Label><Input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} /></div>
          <div className="flex flex-col gap-1.5"><Label>Actividad económica</Label><Input value={form.actividad} onChange={e => setForm({...form, actividad: e.target.value})} /></div>
          <div className="flex flex-col gap-1.5"><Label>Dirección</Label><Input value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} /></div>
        </div>
      </CardBox>

      {/* ── Configuración fiscal ──────────────────────────────────── */}
      <CardBox className="shadow-none border border-border">
        <h3 className="text-base font-semibold mb-4">Facturación e impuestos</h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-sm">IVA</p><p className="text-xs text-muted-foreground">{form.ivaPorcentaje}%</p></div>
              <Switch checked={form.ivaActivo} onCheckedChange={v => setForm({...form, ivaActivo: v})} />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-sm">IGTF (3%)</p><p className="text-xs text-muted-foreground">Solo transacciones en divisas</p></div>
              <Switch checked={form.igtfActivo} onCheckedChange={v => setForm({...form, igtfActivo: v})} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col gap-1.5"><Label>Prefijo de factura</Label><Input value={form.facturaPrefijo} onChange={e => setForm({...form, facturaPrefijo: e.target.value})} placeholder="Ej: F-" /></div>
            <div className="flex flex-col gap-1.5"><Label>Próximo número</Label><Input type="number" value={form.facturaSiguienteNumero} onChange={e => setForm({...form, facturaSiguienteNumero: e.target.value})} /></div>
          </div>
        </div>
      </CardBox>

      {/* ── Moneda ─────────────────────────────────────────────────── */}
      <CardBox className="shadow-none border border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Moneda base</h3>
            <p className="text-sm text-muted-foreground mt-1">La moneda en que se muestran los reportes y totales</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/10 text-primary text-base px-4 py-2">{empresa.monedaBase}</Badge>
            <Button variant="outline" size="sm" onClick={() => setOpenMoneda(true)}>Cambiar</Button>
          </div>
        </div>
      </CardBox>

      {/* ── Historial de tasas ────────────────────────────────────── */}
      <CardBox className="shadow-none border border-border">
        <h3 className="text-base font-semibold mb-3">Historial de tasas BCV</h3>
        {tasas.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">Sin tasas registradas.</p> : (
          <div className="space-y-1">
            {tasas.map(t => (
              <div key={t.tasaId} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20 text-sm">
                <span>{formatearFechaHora(t.fechaHora)}</span>
                <span className="font-mono font-medium">Bs. {t.tasa.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">{t.registradoPor}</span>
              </div>
            ))}
          </div>
        )}
      </CardBox>

      {/* ── Guardar ────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button onClick={guardar} disabled={saving} size="lg">
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      {/* ── Diálogo tasa ─────────────────────────────────────────── */}
      <DialogTasa open={openTasa} onOpenChange={setOpenTasa} onGuardado={cargar} />

      {/* ── Diálogo moneda ────────────────────────────────────────── */}
      <Dialog open={openMoneda} onOpenChange={setOpenMoneda}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Cambiar moneda base</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Esto cambiará la moneda en que se muestran todos los reportes.</p>
          <div className="flex gap-3 mt-4">
            <Button variant={empresa.monedaBase === 'USD' ? 'default' : 'outline'} className="flex-1"
              onClick={async () => { try { await empresaService.cambiarMoneda({ moneda: 'USD' }); toast.success('Moneda cambiada a USD'); cargar(); setOpenMoneda(false); } catch (e: any) { toast.error(e.message); } }}>
              🇺🇸 USD
            </Button>
            <Button variant={empresa.monedaBase === 'VES' ? 'default' : 'outline'} className="flex-1"
              onClick={async () => { try { await empresaService.cambiarMoneda({ moneda: 'VES' }); toast.success('Moneda cambiada a VES (Bs.)'); cargar(); setOpenMoneda(false); } catch (e: any) { toast.error(e.message); } }}>
              🇻🇪 VES (Bs.)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function DialogTasa({ open, onOpenChange, onGuardado }: {
  open: boolean; onOpenChange: (v: boolean) => void; onGuardado: () => void;
}) {
  const [tasa, setTasa] = useState('');
  const [fecha, setFecha] = useState('');
  const [error, setError] = useState(''); const [g, setG] = useState(false);
  useEffect(() => { setFecha(ahoraISO()); setTasa(''); setError(''); }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Actualizar tasa BCV</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground mb-2">La tasa se usa para convertir montos entre USD y Bs. Puedes registrar varias al día.</p>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md mb-2">{error}</div>}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5"><Label>Fecha y hora</Label><Input type="datetime-local" value={fecha} onChange={e => setFecha(e.target.value)} /></div>
          <div className="flex flex-col gap-1.5"><Label>Tasa (Bs. por USD)</Label><Input type="number" step="0.01" value={tasa} onChange={e => setTasa(e.target.value)} placeholder="Ej: 54.30" /></div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={g}>Cancelar</Button>
          <Button onClick={async () => {
            const n = parseFloat(tasa); if (!n || n <= 0) { setError('Ingresa una tasa válida.'); return; }
            try { setG(true); await tasaBcvService.registrar({ tasa: n, fechaHora: fecha }); toast.success('Tasa BCV registrada'); onOpenChange(false); onGuardado(); }
            catch (e: any) { setError(e.message); } finally { setG(false); }
          }} disabled={g}>{g ? '...' : 'Registrar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MiEmpresaPage;
