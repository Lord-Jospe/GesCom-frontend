import { useCallback, useEffect, useState } from 'react';
import ProfileWelcome from 'src/components/dashboards/modern/ProfileWelcome';
import { ResumenCards, type ResumenCardData } from 'src/components/dashboards/gescom/ResumenCards';
import CardBox from 'src/components/shared/CardBox';
import { Badge } from 'src/components/ui/badge';
import { Icon } from '@iconify/react';
import { Link } from 'react-router';
import { transaccionService } from 'src/api/services/transaccionService';
import { inventarioService } from 'src/api/services/inventarioService';
import { dashboardService } from 'src/api/services/empresaService';
import type { TransaccionResponse } from 'src/types/transaccion';
import type { ProductoResponse } from 'src/types/inventario';
import type { DashboardResumenResponse, DashboardChartsResponse } from 'src/types/empresa';
import { ChevronDown, ChevronUp } from 'lucide-react';

const estadoColor: Record<string, string> = {
  PAGADA: 'bg-green-100 text-green-700', PENDIENTE: 'bg-yellow-100 text-yellow-700',
  PARCIAL: 'bg-blue-100 text-blue-700', ANULADA: 'bg-red-100 text-red-700',
};
const fmt = (n: number, moneda: string) => {
  if (n <= 0 && n >= 0) return '--';
  const s = moneda === 'USD' ? '$' : 'Bs.';
  return `${s} ${n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const Admindash = () => {
  const [resumenDia, setResumenDia] = useState<DashboardResumenResponse | null>(null);
  const [resumenMes, setResumenMes] = useState<DashboardResumenResponse | null>(null);
  const [charts, setCharts] = useState<DashboardChartsResponse | null>(null);
  const [ultimas, setUltimas] = useState<TransaccionResponse[]>([]);
  const [criticos, setCriticos] = useState<ProductoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDia, setShowDia] = useState(true);
  const [showMes, setShowMes] = useState(true);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const [dia, mes, ch, tx, crit] = await Promise.all([
        dashboardService.resumenHoy(), dashboardService.resumenMes(), dashboardService.charts(),
        transaccionService.listar(), inventarioService.stockCritico(),
      ]);
      setResumenDia(dia); setResumenMes(mes); setCharts(ch); setUltimas(tx.slice(0, 5)); setCriticos(crit);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const m = resumenDia?.moneda || 'USD';

  const cardsDia: ResumenCardData[] = [
    { key: 'v-dia', titulo: 'Ventas del día', valor: resumenDia ? fmt(resumenDia.ventas, m) : '--', moneda: m, icono: 'solar:cart-check-linear', color: 'text-primary', bgColor: 'bg-primary/10' },
    { key: 'g-dia', titulo: 'Gastos del día', valor: resumenDia ? fmt(resumenDia.gastos, m) : '--', moneda: m, icono: 'solar:arrow-down-linear', color: 'text-destructive', bgColor: 'bg-destructive/10' },
    { key: 'n-dia', titulo: 'Ganancia neta', valor: resumenDia ? fmt(resumenDia.ganancia, m) : '--', moneda: m, icono: 'solar:chart-square-linear', color: 'text-success', bgColor: 'bg-success/10' },
    { key: 't-dia', titulo: 'Transacciones hoy', valor: resumenDia ? String(resumenDia.transacciones) : '--', icono: 'solar:list-check-linear', color: 'text-secondary', bgColor: 'bg-secondary/10' },
  ];
  const cardsMes: ResumenCardData[] = [
    { key: 'v-mes', titulo: 'Ventas del mes', valor: resumenMes ? fmt(resumenMes.ventas, m) : '--', moneda: m, icono: 'solar:graph-up-linear', color: 'text-primary', bgColor: 'bg-primary/10' },
    { key: 'g-mes', titulo: 'Gastos del mes', valor: resumenMes ? fmt(resumenMes.gastos, m) : '--', moneda: m, icono: 'solar:graph-down-linear', color: 'text-destructive', bgColor: 'bg-destructive/10' },
    { key: 'n-mes', titulo: 'Ganancia del mes', valor: resumenMes ? fmt(resumenMes.ganancia, m) : '--', moneda: m, icono: 'solar:dollar-linear', color: 'text-success', bgColor: 'bg-success/10' },
    { key: 'c-mes', titulo: 'Por cobrar pendiente', valor: charts ? fmt(charts.porCobrar, m) : '--', moneda: m, icono: 'solar:hand-money-linear', color: 'text-warning', bgColor: 'bg-warning/10' },
  ];

  const ventas30d = charts?.ventas30Dias || [];
  const maxV30 = Math.max(...ventas30d.map(v => v.monto), 1);
  const ingresos6m = charts?.ingresosVsGastos6Meses || [];
  const maxIvG = Math.max(...ingresos6m.flatMap(d => [d.ingresos, d.gastos]), 1);

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:180-ring" width={36} className="text-primary animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <ProfileWelcome />

      {/* ─── Resumen del día ─────────────────────── */}
      <CardBox className="shadow-none border border-border">
        <button className="flex items-center justify-between w-full" onClick={() => setShowDia(!showDia)}>
          <h2 className="text-lg font-semibold">Resumen del día</h2>
          {showDia ? <ChevronUp className="size-5 text-muted-foreground" /> : <ChevronDown className="size-5 text-muted-foreground" />}
        </button>
        {showDia && <div className="mt-4"><ResumenCards data={cardsDia} /></div>}
      </CardBox>

      {/* ─── Resumen del mes ────────────────────── */}
      <CardBox className="shadow-none border border-border">
        <button className="flex items-center justify-between w-full" onClick={() => setShowMes(!showMes)}>
          <h2 className="text-lg font-semibold">Resumen del mes</h2>
          {showMes ? <ChevronUp className="size-5 text-muted-foreground" /> : <ChevronDown className="size-5 text-muted-foreground" />}
        </button>
        {showMes && <div className="mt-4"><ResumenCards data={cardsMes} /></div>}
      </CardBox>

      {/* ─── Gráficas ──────────────────────────── */}
      {charts && (
        <div className="grid grid-cols-12 gap-6">
          {/* Ventas 30 días (línea) */}
          <div className="lg:col-span-4 col-span-12">
            <CardBox className="shadow-none border border-border h-full">
              <h3 className="text-base font-semibold mb-1">Ventas — 30 días</h3>
              <p className="text-xs text-muted-foreground mb-4">Tendencia diaria · {m}</p>
              {ventas30d.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Sin datos</div>
              ) : (
                <div className="flex items-end gap-0.5 h-36 px-1">
                  {ventas30d.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end items-center group relative">
                      <div className="bg-primary/70 hover:bg-primary rounded-t-sm w-full transition-all cursor-pointer"
                        style={{ height: `${Math.max((d.monto / maxV30) * 100, 2)}%` }} />
                      <span className="text-[9px] text-muted-foreground mt-1 rotate-45 origin-left whitespace-nowrap">{d.fecha?.substring(5)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardBox>
          </div>

          {/* Ingresos vs Gastos 6 meses */}
          <div className="lg:col-span-4 col-span-12">
            <CardBox className="shadow-none border border-border h-full">
              <h3 className="text-base font-semibold mb-1">Ingresos vs Gastos</h3>
              <p className="text-xs text-muted-foreground mb-4">Últimos 6 meses · {m}</p>
              {ingresos6m.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Sin datos</div>
              ) : (
                <div className="flex items-end gap-3 h-36 px-2 justify-around">
                  {ingresos6m.map((b) => (
                    <div key={b.mes} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                      <div className="flex items-end gap-1 w-full justify-center h-full">
                        <div style={{ height: `${(b.ingresos / maxIvG) * 100}%` }} className="w-5 bg-primary rounded-t transition-all min-h-[2px]" />
                        <div style={{ height: `${(b.gastos / maxIvG) * 100}%` }} className="w-5 bg-destructive/60 rounded-t transition-all min-h-[2px]" />
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1">{b.mes?.substring(5)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary" /> Ingresos</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-destructive/60" /> Gastos</span>
              </div>
            </CardBox>
          </div>

          {/* Categorías */}
          <div className="lg:col-span-4 col-span-12">
            <CardBox className="shadow-none border border-border h-full">
              <h3 className="text-base font-semibold mb-1">Por categoría</h3>
              <p className="text-xs text-muted-foreground mb-4">Distribución de ventas</p>
              <div className="space-y-3">
                {charts.categorias.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Sin datos</div>
                ) : charts.categorias.slice(0, 6).map((c, i) => {
                  const colors = ['bg-primary', 'bg-info', 'bg-warning', 'bg-success', 'bg-secondary', 'bg-destructive/60'];
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground truncate max-w-[60%]">{c.categoria}</span>
                        <span className="text-muted-foreground text-xs">{c.porcentaje}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted">
                        <div className={`h-2 rounded-full transition-all ${colors[i]}`} style={{ width: `${Math.max(c.porcentaje, 3)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBox>
          </div>
        </div>
      )}

      {/* ─── Cuentas + Stock ──────────────────── */}
      <div className="grid grid-cols-12 gap-6">
        <div className="lg:col-span-4 col-span-12">
          <CardBox className="shadow-none border border-border">
            <h3 className="text-base font-semibold mb-4">Cuentas pendientes</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <Link to="/admin/por-cobrar" className="p-4 rounded-lg bg-warning/5 border border-warning/20 hover:bg-warning/10 transition-colors">
                <Icon icon="solar:hand-money-linear" width={28} className="text-warning mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Por cobrar</p>
                <p className="text-lg font-bold text-warning">{charts ? fmt(charts.porCobrar, m) : '--'}</p>
              </Link>
              <Link to="/admin/por-pagar" className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 hover:bg-destructive/10 transition-colors">
                <Icon icon="solar:wallet-money-linear" width={28} className="text-destructive mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Por pagar</p>
                <p className="text-lg font-bold text-destructive">{charts ? fmt(charts.porPagar, m) : '--'}</p>
              </Link>
            </div>
          </CardBox>
        </div>

        <div className="lg:col-span-4 col-span-12">
          <CardBox className="shadow-none border border-border">
            <h3 className="text-base font-semibold mb-4">Stock crítico</h3>
            {criticos.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Icon icon="solar:check-circle-bold" width={36} className="text-green-500 mx-auto mb-2" />
                <p className="text-sm">Todo al día</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {criticos.slice(0, 5).map(p => (
                  <div key={p.productoId} className="flex items-center justify-between p-2 rounded-lg bg-muted/10">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`size-2 rounded-full shrink-0 ${p.alertaStock === 'ROJO' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                      <span className="text-sm truncate">{p.nombre}</span>
                    </div>
                    <span className={`text-sm font-bold ml-2 ${p.alertaStock === 'ROJO' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {p.stockActual}<span className="text-xs text-muted-foreground font-normal">/{p.stockMinimo}</span>
                    </span>
                  </div>
                ))}
                {criticos.length > 5 && <p className="text-xs text-muted-foreground text-center">+{criticos.length - 5} más</p>}
              </div>
            )}
          </CardBox>
        </div>

        <div className="lg:col-span-4 col-span-12">
          <CardBox className="shadow-none border border-border">
            <h3 className="text-base font-semibold mb-4">Accesos rápidos</h3>
            <div className="flex flex-col gap-2">
              <Link to="/admin/caja-facturacion/venta" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <Icon icon="solar:cart-plus-linear" width={20} className="text-success" /> <span className="text-sm">Registrar venta</span>
              </Link>
              <Link to="/admin/caja-facturacion/gasto" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <Icon icon="solar:arrow-down-linear" width={20} className="text-destructive" /> <span className="text-sm">Registrar gasto</span>
              </Link>
              <Link to="/admin/inventario" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <Icon icon="solar:box-linear" width={20} className="text-primary" /> <span className="text-sm">Ver inventario</span>
              </Link>
            </div>
          </CardBox>
        </div>
      </div>

      {/* Últimas transacciones */}
      <CardBox className="shadow-none border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Últimas transacciones</h3>
          <Link to="/admin/caja-facturacion" className="text-sm text-primary hover:underline">Ver historial</Link>
        </div>
        {ultimas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Sin transacciones registradas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30"><tr>
                <th className="text-left px-3 py-2 font-semibold">#</th>
                <th className="text-left px-3 py-2 font-semibold">Fecha</th>
                <th className="text-left px-3 py-2 font-semibold">Cliente / Proveedor</th>
                <th className="text-right px-3 py-2 font-semibold">Total</th>
                <th className="text-left px-3 py-2 font-semibold">Estado</th>
              </tr></thead>
              <tbody>
                {ultimas.map(t => (
                  <tr key={t.transaccionId} className="border-t hover:bg-muted/20">
                    <td className="px-3 py-2 font-mono text-xs">{t.numeroFactura || '#' + t.transaccionId}</td>
                    <td className="px-3 py-2">{t.fecha}</td>
                    <td className="px-3 py-2">{t.clienteNombre || t.proveedorNombre || '—'}</td>
                    <td className={`px-3 py-2 text-right font-mono font-medium ${t.tipo === 'INGRESO' ? 'text-success' : 'text-destructive'}`}>
                      {t.tipo === 'INGRESO' ? '+' : '−'}{t.moneda === 'USD' ? '$' : 'Bs.'} {t.total.toFixed(2)}
                    </td>
                    <td className="px-3 py-2"><Badge className={estadoColor[t.estado] || ''}>{t.estado}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBox>
    </div>
  );
};

export default Admindash;
