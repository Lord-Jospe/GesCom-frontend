import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { nominaService } from 'src/api/services/nominaService';
import { usuariosServices } from 'src/api/services/usuarioService';
import type { NominaResponse, CalcularNominaRequest, ConceptoExtraRequest } from 'src/types/nomina';
import type { UsuarioResponse } from 'src/types/usuario';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Badge } from 'src/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { Icon } from '@iconify/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs';
import CardBox from 'src/components/shared/CardBox';
import { FileDown } from 'lucide-react';
import { exportarExcel } from 'src/lib/exportUtils';

const hoy = new Date().toISOString().slice(0, 10);
const inicioMes = hoy.slice(0, 7) + '-01';
const estadoColor: Record<string, string> = { CALCULADA: 'bg-yellow-100 text-yellow-700', PAGADA: 'bg-green-100 text-green-700', ANULADA: 'bg-red-100 text-red-700' };

const NominaPage = () => {
  const [tab, setTab] = useState('historial');

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Nómina</h1><p className="text-muted-foreground">Cálculo de nómina con deducciones legales venezolanas</p></div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="historial">Historial</TabsTrigger><TabsTrigger value="calcular">Calcular nómina</TabsTrigger></TabsList>
        <TabsContent value="historial" className="mt-4"><HistorialTab /></TabsContent>
        <TabsContent value="calcular" className="mt-4"><CalcularTab onCalculada={() => setTab('historial')} /></TabsContent>
      </Tabs>
    </div>
  );
};

// ── Historial ──────────────────────────────────────────────────────

function HistorialTab() {
  const [nominas, setNominas] = useState<NominaResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    try { setLoading(true); setNominas(await nominaService.listar()); }
    catch { /* sin datos */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const pagar = async (id: number) => { try { await nominaService.pagar(id); toast.success('Nómina pagada'); cargar(); } catch (e: any) { toast.error(e.message); } };

  if (loading) return <div className="flex justify-center py-12"><Icon icon="svg-spinners:180-ring" width={28} className="text-primary animate-spin" /></div>;

  return (
    <div>
      {nominas.length > 0 && (
        <div className="flex justify-end gap-2 mb-3">
          <Button variant="outline" size="sm" onClick={() => exportarExcel(nominas.map(n => ({ Empleado: n.nombreEmpleado, Período: `${n.periodoInicio} → ${n.periodoFin}`, 'Salario base': n.salarioBase, Deducciones: n.totalDeducciones, Neto: n.salarioNeto, Estado: n.estado })), 'nomina')}>
            <FileDown className="size-3.5 mr-1" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => nominaService.descargarPDF()}>
            <FileDown className="size-3.5 mr-1" /> PDF
          </Button>
        </div>
      )}
      <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-muted/40"><tr>
          <th className="text-left px-3 py-2 font-semibold">Empleado</th>
          <th className="text-left px-3 py-2 font-semibold">Período</th>
          <th className="text-right px-3 py-2 font-semibold">Salario base</th>
          <th className="text-right px-3 py-2 font-semibold">Deducciones</th>
          <th className="text-right px-3 py-2 font-semibold">Neto</th>
          <th className="text-left px-3 py-2 font-semibold">Estado</th>
          <th className=""></th>
        </tr></thead>
        <tbody>
          {nominas.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">Sin nóminas calculadas.</td></tr> :
            nominas.map(n => (
              <tr key={n.nominaId} className="border-t hover:bg-muted/20">
                <td className="px-3 py-2 font-medium">{n.nombreEmpleado}</td>
                <td className="px-3 py-2 text-muted-foreground">{n.periodoInicio} → {n.periodoFin}</td>
                <td className="px-3 py-2 text-right font-mono">${n.salarioBase.toFixed(2)}</td>
                <td className="px-3 py-2 text-right font-mono text-destructive">−${n.totalDeducciones.toFixed(2)}</td>
                <td className="px-3 py-2 text-right font-mono font-bold">${n.salarioNeto.toFixed(2)}</td>
                <td className="px-3 py-2"><Badge className={estadoColor[n.estado] || ''}>{n.estado}</Badge></td>
                <td className="px-3 py-2">{n.estado === 'CALCULADA' ? <Button size="sm" variant="lightprimary" onClick={() => pagar(n.nominaId)}>Pagar</Button> : null}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
    </div>
  );
}

// ── Calcular ───────────────────────────────────────────────────────

function CalcularTab({ onCalculada }: { onCalculada: () => void }) {
  const [empleados, setEmpleados] = useState<UsuarioResponse[]>([]);
  const [usuarioId, setUsuarioId] = useState(0);
  const [periodoInicio, setPeriodoInicio] = useState(inicioMes);
  const [periodoFin, setPeriodoFin] = useState(hoy);
  const [extras, setExtras] = useState<ConceptoExtraRequest[]>([]);
  const [notas, setNotas] = useState('');
  const [error, setError] = useState(''); const [g, setG] = useState(false);

  useEffect(() => { usuariosServices.getAllUsuarios().then(setEmpleados).catch(() => {}); }, []);

  const addExtra = () => setExtras([...extras, { tipo: 'ASIGNACION', descripcion: '', monto: 0 }]);

  const empleadoSel = empleados.find(e => e.usuarioId === usuarioId);

  const handle = async () => {
    if (!usuarioId) { setError('Selecciona un empleado.'); return; }
    try { setG(true);
      const req: CalcularNominaRequest = { usuarioId, periodoInicio, periodoFin, extras: extras.filter(e => e.descripcion && e.monto > 0), notas: notas || undefined };
      await nominaService.calcular(req);
      toast.success('Nómina calculada'); onCalculada();
    } catch (e: any) { setError(e.message); } finally { setG(false); }
  };

  return (
    <CardBox className="shadow-none border border-border">
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md mb-4">{error}</div>}

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col gap-1.5">
          <Label>Empleado *</Label>
          <Select value={usuarioId ? String(usuarioId) : ''} onValueChange={v => setUsuarioId(Number(v))}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>
              {empleados.filter(e => e.activo).map(e => (
                <SelectItem key={e.usuarioId} value={String(e.usuarioId)}>
                  {e.primerNombre} {e.primerApellido} {e.sueldo ? `($${e.sueldo})` : '(sin sueldo)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5"><Label>Desde</Label><Input type="date" value={periodoInicio} onChange={e => setPeriodoInicio(e.target.value)} /></div>
        <div className="flex flex-col gap-1.5"><Label>Hasta</Label><Input type="date" value={periodoFin} onChange={e => setPeriodoFin(e.target.value)} /></div>
      </div>

      {empleadoSel?.sueldo && (
        <div className="bg-muted/20 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold mb-2">Previsualización</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Salario base</span><span className="text-right font-mono">{empleadoSel.monedaSueldo || 'USD'} {empleadoSel.sueldo.toFixed(2)}</span>
            <span className="text-muted-foreground">SSO (4%)</span><span className="text-right font-mono text-destructive">−{(empleadoSel.sueldo * 0.04).toFixed(2)}</span>
            <span className="text-muted-foreground">INCES (0.5%)</span><span className="text-right font-mono text-destructive">−{(empleadoSel.sueldo * 0.005).toFixed(2)}</span>
            <span className="text-muted-foreground">FAOV (1%)</span><span className="text-right font-mono text-destructive">−{(empleadoSel.sueldo * 0.01).toFixed(2)}</span>
            <span className="font-semibold border-t pt-1 mt-1">Neto estimado</span>
            <span className="text-right font-mono font-bold border-t pt-1 mt-1">{(empleadoSel.sueldo * 0.945).toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2"><Label>Conceptos extra</Label><Button variant="outline" size="sm" onClick={addExtra}><Icon icon="solar:add-circle-linear" width={14} className="mr-1" /> Agregar</Button></div>
        {extras.map((ex, i) => (
          <div key={i} className="grid grid-cols-7 gap-2 mb-2 items-center">
            <Select value={ex.tipo} onValueChange={v => { const n = [...extras]; n[i] = {...n[i], tipo: v as any}; setExtras(n); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="ASIGNACION">Asignación</SelectItem><SelectItem value="DEDUCCION">Deducción</SelectItem></SelectContent>
            </Select>
            <Input className="col-span-3" value={ex.descripcion} onChange={e => { const n = [...extras]; n[i] = {...n[i], descripcion: e.target.value}; setExtras(n); }} placeholder="Concepto" />
            <Input type="number" step="0.01" value={ex.monto || ''} onChange={e => { const n = [...extras]; n[i] = {...n[i], monto: Number(e.target.value)}; setExtras(n); }} placeholder="0.00" />
            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setExtras(extras.filter((_, idx) => idx !== i))}><Icon icon="solar:trash-bin-trash-linear" width={14} /></Button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1.5 mb-4"><Label>Notas</Label><Input value={notas} onChange={e => setNotas(e.target.value)} placeholder="Opcional" /></div>

      <div className="flex justify-end gap-3">
        <Button onClick={handle} disabled={g}>{g ? 'Calculando...' : 'Calcular nómina'}</Button>
      </div>
    </CardBox>
  );
}

export default NominaPage;
