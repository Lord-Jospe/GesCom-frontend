import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { transaccionService } from 'src/api/services/transaccionService';
import { clienteService } from 'src/api/services/clienteService';
import { proveedorService } from 'src/api/services/proveedorService';
import type {
  TransaccionResponse, CrearTransaccionRequest, AgregarLineaRequest,
  TipoTransaccion, MetodoPago, EstadoTransaccion, FiltroTransaccionRequest,
} from 'src/types/transaccion';
import type { ClienteResponse } from 'src/types/cliente';
import type { ProveedorResponse } from 'src/types/proveedor';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from 'src/components/ui/select';
import { Badge } from 'src/components/ui/badge';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs';

const hoy = new Date().toISOString().slice(0, 10);
const metodoLabel: Record<string, string> = { EFECTIVO: 'Efectivo', TRANSFERENCIA: 'Transferencia', PAGO_MOVIL: 'Pago Móvil', DIVISAS: 'Divisas', OTRO: 'Otro' };
const estadoColor: Record<string, string> = { PENDIENTE: 'bg-yellow-100 text-yellow-700', PAGADA: 'bg-green-100 text-green-700', PARCIAL: 'bg-blue-100 text-blue-700', ANULADA: 'bg-red-100 text-red-700' };

const CajaFacturacionPage = () => {
  const [tab, setTab] = useState('historial');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Caja y Facturación</h1>
        <p className="text-muted-foreground">Registra ventas, gastos y consulta el historial</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="registrar">Registrar transacción</TabsTrigger>
        </TabsList>

        <TabsContent value="historial" className="mt-4">
          <HistorialTab onNueva={() => setTab('registrar')} />
        </TabsContent>
        <TabsContent value="registrar" className="mt-4">
          <RegistrarTab onGuardado={() => { toast.success('Transacción registrada'); setTab('historial'); }} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ── Tab: Historial ────────────────────────────────────────────────────

function HistorialTab({ onNueva }: { onNueva: () => void }) {
  const [data, setData] = useState<TransaccionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<FiltroTransaccionRequest>({});

  const cargar = useCallback(async () => {
    try { setLoading(true); setData(await transaccionService.listar(filtro)); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }, [filtro]);

  useEffect(() => { cargar(); }, [cargar]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={filtro.tipo || 'TODOS'} onValueChange={v => setFiltro({ ...filtro, tipo: v === 'TODOS' ? undefined : v as TipoTransaccion })}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            <SelectItem value="INGRESO">Ingresos</SelectItem>
            <SelectItem value="EGRESO">Egresos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtro.estado || 'TODOS'} onValueChange={v => setFiltro({ ...filtro, estado: v === 'TODOS' ? undefined : v as EstadoTransaccion })}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            <SelectItem value="PENDIENTE">Pendiente</SelectItem>
            <SelectItem value="PAGADA">Pagada</SelectItem>
            <SelectItem value="ANULADA">Anulada</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={filtro.fechaDesde || ''} onChange={e => setFiltro({ ...filtro, fechaDesde: e.target.value || undefined })} className="w-40" />
        <Input type="date" value={filtro.fechaHasta || ''} onChange={e => setFiltro({ ...filtro, fechaHasta: e.target.value || undefined })} className="w-40" />
        <Button variant="outline" size="sm" onClick={cargar}><Icon icon="solar:refresh-linear" width={16} className="mr-1" /> Actualizar</Button>
        <Button size="sm" onClick={onNueva} className="ml-auto"><Icon icon="solar:add-circle-linear" width={18} className="mr-1" /> Nueva</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" /></div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left px-3 py-2 font-semibold">#</th>
              <th className="text-left px-3 py-2 font-semibold">Fecha</th>
              <th className="text-left px-3 py-2 font-semibold">Tipo</th>
              <th className="text-left px-3 py-2 font-semibold">Cliente/Proveedor</th>
              <th className="text-right px-3 py-2 font-semibold">Total</th>
              <th className="text-left px-3 py-2 font-semibold">Estado</th>
            </tr></thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No hay transacciones.</td></tr>
              ) : data.map(t => (
                <tr key={t.transaccionId} className="border-t hover:bg-muted/20">
                  <td className="px-3 py-2 font-mono text-xs">{t.numeroFactura || t.transaccionId}</td>
                  <td className="px-3 py-2">{t.fecha}</td>
                  <td className="px-3 py-2">
                    <Badge className={t.tipo === 'INGRESO' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}>
                      {t.tipo === 'INGRESO' ? 'Ingreso' : t.tipo === 'NOTA_CREDITO' ? 'Nota Créd.' : 'Egreso'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">{t.clienteNombre || t.proveedorNombre || '—'}</td>
                  <td className="px-3 py-2 text-right font-mono font-medium">
                    {t.moneda === 'USD' ? '$' : 'Bs.'} {t.total.toFixed(2)}
                  </td>
                  <td className="px-3 py-2"><Badge className={estadoColor[t.estado] || ''}>{t.estado}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Tab: Registrar ────────────────────────────────────────────────────

function RegistrarTab({ onGuardado }: { onGuardado: () => void }) {
  const [tipo, setTipo] = useState<TipoTransaccion>('INGRESO');
  const [form, setForm] = useState({
    clienteId: 0, proveedorId: 0, fecha: hoy, moneda: 'USD' as 'USD' | 'VES',
    metodoPago: 'EFECTIVO' as MetodoPago, descuentoGlobalPorcentaje: 0, descuentoGlobalMonto: 0, notas: '',
  });
  const [lineas, setLineas] = useState<AgregarLineaRequest[]>([{ descripcion: '', cantidad: 1, precioUnitario: 0 }]);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);

  useEffect(() => {
    if (tipo === 'INGRESO') clienteService.obtenerTodos().then(setClientes).catch(() => {});
    else proveedorService.obtenerTodos().then(setProveedores).catch(() => {});
  }, [tipo]);

  const updateLinea = (i: number, field: keyof AgregarLineaRequest, value: any) => {
    setLineas(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  };

  const addLinea = () => setLineas([...lineas, { descripcion: '', cantidad: 1, precioUnitario: 0 }]);

  const subtotal = lineas.reduce((s, l) => s + l.cantidad * l.precioUnitario, 0);

  const handleSubmit = async () => {
    if (lineas.some(l => !l.descripcion.trim() || l.cantidad <= 0 || l.precioUnitario <= 0)) {
      setError('Completa todas las líneas con descripción, cantidad y precio válidos.'); return;
    }
    try {
      setGuardando(true);
      const req: CrearTransaccionRequest = {
        tipo,
        fecha: form.fecha,
        moneda: form.moneda,
        metodoPago: form.metodoPago,
        descuentoGlobalPorcentaje: form.descuentoGlobalPorcentaje || undefined,
        descuentoGlobalMonto: form.descuentoGlobalMonto || undefined,
        notas: form.notas || undefined,
        lineas,
        ...(tipo === 'INGRESO' ? { clienteId: form.clienteId || undefined } : { proveedorId: form.proveedorId || undefined }),
      };
      await transaccionService.crear(req);
      onGuardado();
    } catch (e: any) { setError(e.message); }
    finally { setGuardando(false); }
  };

  return (
    <CardBox className="shadow-none border border-border">
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md mb-4">{error}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="flex flex-col gap-1.5">
          <Label>Tipo *</Label>
          <Select value={tipo} onValueChange={v => setTipo(v as TipoTransaccion)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="INGRESO">Ingreso (venta)</SelectItem>
              <SelectItem value="EGRESO">Egreso (gasto)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {tipo === 'INGRESO' ? (
          <div className="flex flex-col gap-1.5">
            <Label>Cliente</Label>
            <Select value={form.clienteId ? String(form.clienteId) : ''} onValueChange={v => setForm({ ...form, clienteId: Number(v) })}>
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                {clientes.filter(c => c.isActive).map(c => <SelectItem key={c.clienteId} value={String(c.clienteId)}>{c.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <Label>Proveedor</Label>
            <Select value={form.proveedorId ? String(form.proveedorId) : ''} onValueChange={v => setForm({ ...form, proveedorId: Number(v) })}>
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                {proveedores.filter(p => p.isActive).map(p => <SelectItem key={p.proveedorId} value={String(p.proveedorId)}>{p.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex flex-col gap-1.5"><Label>Fecha</Label><Input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} /></div>
        <div className="flex flex-col gap-1.5"><Label>Método de pago</Label>
          <Select value={form.metodoPago} onValueChange={v => setForm({ ...form, metodoPago: v as MetodoPago })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(metodoLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Líneas */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base">Líneas</Label>
          <Button variant="outline" size="sm" onClick={addLinea}><Icon icon="solar:add-circle-linear" width={16} className="mr-1" /> Agregar línea</Button>
        </div>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted/30"><tr>
              <th className="text-left px-3 py-2 w-1/3">Descripción</th>
              <th className="text-right px-3 py-2 w-20">Cant.</th>
              <th className="text-right px-3 py-2 w-28">Precio Unit.</th>
              <th className="text-right px-3 py-2 w-28">Subtotal</th>
              <th className="w-10"></th>
            </tr></thead>
            <tbody>
              {lineas.map((l, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1.5"><Input value={l.descripcion} onChange={e => updateLinea(i, 'descripcion', e.target.value)} placeholder="Descripción del producto/servicio" className="h-8 text-sm" /></td>
                  <td className="px-2 py-1.5"><Input type="number" min={1} value={l.cantidad} onChange={e => updateLinea(i, 'cantidad', Number(e.target.value))} className="h-8 text-sm text-right" /></td>
                  <td className="px-2 py-1.5"><Input type="number" step="0.01" min={0} value={l.precioUnitario} onChange={e => updateLinea(i, 'precioUnitario', Number(e.target.value))} className="h-8 text-sm text-right" /></td>
                  <td className="px-2 py-1.5 text-right font-mono text-sm">{(l.cantidad * l.precioUnitario).toFixed(2)}</td>
                  <td className="px-2 py-1.5">
                    {lineas.length > 1 && (
                      <Button variant="ghost" size="sm" className="size-7! text-red-500" onClick={() => setLineas(lineas.filter((_, idx) => idx !== i))}>
                        <Icon icon="solar:trash-bin-trash-linear" width={14} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-right mt-3">
          <p className="text-sm text-muted-foreground">Subtotal: <span className="font-mono font-medium text-foreground">{form.moneda === 'USD' ? '$' : 'Bs.'} {subtotal.toFixed(2)}</span></p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => window.history.back()}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={guardando}>
          {guardando ? 'Registrando...' : 'Registrar transacción'}
        </Button>
      </div>
    </CardBox>
  );
}

export default CajaFacturacionPage;
