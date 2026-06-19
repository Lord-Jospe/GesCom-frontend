import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { contabilidadService } from 'src/api/services/contabilidadService';
import type { PlanCuentaResponse, LibroMayorResponse, BalanceGeneralResponse, EstadoResultadosResponse } from 'src/types/contabilidad';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';

const hoy = new Date().toISOString().slice(0, 10);
const inicioMes = () => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); };
const inicioAnio = () => `${new Date().getFullYear()}-01-01`;

const ReportesFinancierosPage = () => {
  const [cuentas, setCuentas] = useState<PlanCuentaResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Libro Mayor
  const [cuentaId, setCuentaId] = useState<number>(0);
  const [desdeLM, setDesdeLM] = useState(inicioMes);
  const [hastaLM, setHastaLM] = useState(hoy);
  const [libroMayor, setLibroMayor] = useState<LibroMayorResponse | null>(null);

  // Estado de Resultados
  const [desdeER, setDesdeER] = useState(inicioAnio);
  const [hastaER, setHastaER] = useState(hoy);
  const [estadoResultados, setEstadoResultados] = useState<EstadoResultadosResponse | null>(null);

  // Balance General
  const [fechaBG, setFechaBG] = useState(hoy);
  const [balance, setBalance] = useState<BalanceGeneralResponse | null>(null);

  // Cierre
  const [cierreDesde, setCierreDesde] = useState(inicioAnio);
  const [cierreHasta, setCierreHasta] = useState(hoy);

  useEffect(() => { contabilidadService.obtenerPlanCuentas().then(setCuentas).catch(() => {}); }, []);

  const cuentasActivas = cuentas.filter(c => c.activo);

  const cargarLibroMayor = async () => {
    if (!cuentaId) return;
    setLoading(true);
    try { setLibroMayor(await contabilidadService.libroMayor(cuentaId, desdeLM, hastaLM)); } catch {}
    finally { setLoading(false); }
  };

  const cargarEstadoResultados = async () => {
    setLoading(true);
    try { setEstadoResultados(await contabilidadService.estadoResultados(desdeER, hastaER)); } catch {}
    finally { setLoading(false); }
  };

  const cargarBalance = async () => {
    setLoading(true);
    try { setBalance(await contabilidadService.balanceGeneral(fechaBG)); } catch {}
    finally { setLoading(false); }
  };

  const cerrarPeriodo = async () => {
    if (!confirm(`¿Cerrar el período ${cierreDesde} a ${cierreHasta}? Una vez cerrado no se podrá modificar.`)) return;
    try {
      await contabilidadService.cerrarPeriodo(cierreDesde, cierreHasta);
      toast.success('Período cerrado exitosamente');
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-info/10 shrink-0">
          <Icon icon="solar:chart-2-bold" width={32} className="text-info" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Reportes Financieros</h1>
          <p className="text-muted-foreground">Libro mayor, estado de resultados y balance general</p>
        </div>
      </div>

      <Tabs defaultValue="mayor">
        <TabsList>
          <TabsTrigger value="mayor">
            <Icon icon="solar:book-bookmark-linear" width={18} className="mr-1" /> Libro Mayor
          </TabsTrigger>
          <TabsTrigger value="resultados">
            <Icon icon="solar:graph-up-linear" width={18} className="mr-1" /> Estado de Resultados
          </TabsTrigger>
          <TabsTrigger value="balance">
            <Icon icon="solar:scales-linear" width={18} className="mr-1" /> Balance General
          </TabsTrigger>
          <TabsTrigger value="cierre">
            <Icon icon="solar:lock-keyhole-linear" width={18} className="mr-1" /> Cierre de Período
          </TabsTrigger>
        </TabsList>

        {/* ─── LIBRO MAYOR ──────────────────────────────────── */}
        <TabsContent value="mayor" className="space-y-4 mt-4">
          <CardBox className="shadow-none border border-border">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Cuenta</Label>
                <Select value={cuentaId ? String(cuentaId) : ''} onValueChange={v => setCuentaId(Number(v))}>
                  <SelectTrigger className="w-64 h-9"><SelectValue placeholder="Seleccionar cuenta..." /></SelectTrigger>
                  <SelectContent>
                    {cuentasActivas.map(c => (
                      <SelectItem key={c.cuentaId} value={String(c.cuentaId)}>
                        {c.codigo} — {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5"><Label className="text-xs">Desde</Label><Input type="date" value={desdeLM} onChange={e => setDesdeLM(e.target.value)} className="h-9 w-40" /></div>
              <div className="flex flex-col gap-1.5"><Label className="text-xs">Hasta</Label><Input type="date" value={hastaLM} onChange={e => setHastaLM(e.target.value)} className="h-9 w-40" /></div>
              <Button onClick={cargarLibroMayor} disabled={!cuentaId || loading} className="h-9">
                {loading ? <Icon icon="svg-spinners:180-ring" width={16} className="mr-1 animate-spin" /> : <Icon icon="solar:filter-linear" width={16} className="mr-1" />}
                Consultar
              </Button>
            </div>
          </CardBox>

          {libroMayor && (
            <CardBox className="shadow-none border border-border p-0! overflow-hidden">
              {/* Encabezado */}
              <div className="p-4 bg-muted/20 border-b grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><span className="text-muted-foreground">Cuenta:</span> <strong>{libroMayor.cuentaCodigo} — {libroMayor.cuentaNombre}</strong></div>
                <div><span className="text-muted-foreground">Tipo:</span> <strong>{libroMayor.tipoCuenta}</strong></div>
                <div className="text-right"><span className="text-muted-foreground">Saldo Inicial:</span> <span className="font-mono font-bold">$ {libroMayor.saldoInicial.toFixed(2)}</span></div>
                <div className="text-right"><span className="text-muted-foreground">Saldo Final:</span> <span className={`font-mono font-bold text-lg ${libroMayor.saldoFinal >= 0 ? 'text-success' : 'text-destructive'}`}>$ {libroMayor.saldoFinal.toFixed(2)}</span></div>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-semibold">Cuenta</th>
                    <th className="text-right px-4 py-2.5 font-semibold w-28">Débito</th>
                    <th className="text-right px-4 py-2.5 font-semibold w-28">Crédito</th>
                  </tr>
                </thead>
                <tbody>
                  {libroMayor.movimientos.map((m, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-2">
                        <span className="font-mono text-xs text-muted-foreground">{m.cuentaCodigo}</span>
                        <span className="ml-2">{m.cuentaNombre}</span>
                      </td>
                      <td className="px-4 py-2 text-right font-mono">{m.esDebito ? `$ ${m.monto.toFixed(2)}` : ''}</td>
                      <td className="px-4 py-2 text-right font-mono">{!m.esDebito ? `$ ${m.monto.toFixed(2)}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/20 font-semibold border-t-2">
                  <tr>
                    <td className="px-4 py-2">Totales</td>
                    <td className="px-4 py-2 text-right font-mono">$ {libroMayor.totalDebitos.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right font-mono">$ {libroMayor.totalCreditos.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </CardBox>
          )}
        </TabsContent>

        {/* ─── ESTADO DE RESULTADOS ─────────────────────────── */}
        <TabsContent value="resultados" className="space-y-4 mt-4">
          <CardBox className="shadow-none border border-border">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5"><Label className="text-xs">Desde</Label><Input type="date" value={desdeER} onChange={e => setDesdeER(e.target.value)} className="h-9 w-40" /></div>
              <div className="flex flex-col gap-1.5"><Label className="text-xs">Hasta</Label><Input type="date" value={hastaER} onChange={e => setHastaER(e.target.value)} className="h-9 w-40" /></div>
              <Button onClick={cargarEstadoResultados} disabled={loading} className="h-9">
                {loading ? <Icon icon="svg-spinners:180-ring" width={16} className="mr-1 animate-spin" /> : <Icon icon="solar:filter-linear" width={16} className="mr-1" />}
                Generar
              </Button>
            </div>
          </CardBox>

          {estadoResultados && (
            <CardBox className="shadow-none border-2 border-info/20 bg-gradient-to-b from-info/[0.03] to-transparent max-w-md mx-auto">
              <h3 className="text-lg font-bold mb-4 text-center">Estado de Resultados</h3>
              <p className="text-xs text-muted-foreground text-center mb-4">{estadoResultados.fechaInicio} → {estadoResultados.fechaFin}</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Total Ingresos</span>
                  <span className="font-mono font-bold text-success">$ {estadoResultados.totalIngresos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t">
                  <span className="text-muted-foreground">Total Gastos</span>
                  <span className="font-mono font-bold text-destructive">$ {estadoResultados.totalGastos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 text-base">
                  <span className="font-bold">Utilidad Neta</span>
                  <span className={`font-mono font-bold ${estadoResultados.utilidadNeta >= 0 ? 'text-success' : 'text-destructive'}`}>
                    $ {estadoResultados.utilidadNeta.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardBox>
          )}
        </TabsContent>

        {/* ─── BALANCE GENERAL ──────────────────────────────── */}
        <TabsContent value="balance" className="space-y-4 mt-4">
          <CardBox className="shadow-none border border-border">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5"><Label className="text-xs">Fecha</Label><Input type="date" value={fechaBG} onChange={e => setFechaBG(e.target.value)} className="h-9 w-40" /></div>
              <Button onClick={cargarBalance} disabled={loading} className="h-9">
                {loading ? <Icon icon="svg-spinners:180-ring" width={16} className="mr-1 animate-spin" /> : <Icon icon="solar:filter-linear" width={16} className="mr-1" />}
                Generar
              </Button>
            </div>
          </CardBox>

          {balance && (
            <CardBox className="shadow-none border-2 border-purple-500/20 bg-gradient-to-b from-purple-500/[0.03] to-transparent max-w-md mx-auto">
              <h3 className="text-lg font-bold mb-4 text-center">Balance General</h3>
              <p className="text-xs text-muted-foreground text-center mb-4">Al {balance.fecha}</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-3 bg-emerald-50 rounded-lg px-3">
                  <span className="font-semibold">Total Activos</span>
                  <span className="font-mono font-bold text-emerald-700">$ {balance.totalActivos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 bg-red-50 rounded-lg px-3">
                  <span className="font-semibold">Total Pasivos</span>
                  <span className="font-mono font-bold text-red-700">$ {balance.totalPasivos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 bg-purple-50 rounded-lg px-3">
                  <span className="font-semibold">Total Patrimonio</span>
                  <span className="font-mono font-bold text-purple-700">$ {balance.totalPatrimonio.toFixed(2)}</span>
                </div>
                <div className="border-t-2 pt-3 flex justify-between">
                  <span className="font-bold">Pasivo + Patrimonio</span>
                  <span className="font-mono font-bold">$ {(balance.totalPasivos + balance.totalPatrimonio).toFixed(2)}</span>
                </div>
                <div className={`text-center text-sm font-bold py-2 rounded-lg ${balance.cuadrado ? 'bg-success/10 text-success' : 'bg-red-100 text-red-700'}`}>
                  {balance.cuadrado
                    ? '✅ Activos = Pasivos + Patrimonio'
                    : '⚠️ Balance descuadrado'}
                </div>
              </div>
            </CardBox>
          )}
        </TabsContent>

        {/* ─── CIERRE DE PERÍODO ────────────────────────────── */}
        <TabsContent value="cierre" className="space-y-4 mt-4">
          <CardBox className="shadow-none border-2 border-warning/20 max-w-lg mx-auto">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Icon icon="solar:danger-triangle-bold" width={20} className="text-warning" />
              Cierre de Período Contable
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Al cerrar un período, los asientos de ese rango de fechas no podrán modificarse.
              Esta acción es irreversible. Asegúrate de que toda la contabilidad del período esté correcta.
            </p>
            <div className="flex flex-wrap items-end gap-3 mb-4">
              <div className="flex flex-col gap-1.5"><Label className="text-xs">Desde</Label><Input type="date" value={cierreDesde} onChange={e => setCierreDesde(e.target.value)} className="h-9 w-40" /></div>
              <div className="flex flex-col gap-1.5"><Label className="text-xs">Hasta</Label><Input type="date" value={cierreHasta} onChange={e => setCierreHasta(e.target.value)} className="h-9 w-40" /></div>
            </div>
            <Button onClick={cerrarPeriodo} variant="destructive" className="w-full">
              <Icon icon="solar:lock-keyhole-bold" width={18} className="mr-1" /> Cerrar Período
            </Button>
          </CardBox>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportesFinancierosPage;
