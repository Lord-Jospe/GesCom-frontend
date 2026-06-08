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

const estadoColor: Record<string, string> = {
  PAGADA: 'bg-green-100 text-green-700', PENDIENTE: 'bg-yellow-100 text-yellow-700',
  PARCIAL: 'bg-blue-100 text-blue-700', ANULADA: 'bg-red-100 text-red-700',
};
const colorIndicador = (d: number) => d <= 7 ? 'bg-green-500' : d <= 15 ? 'bg-yellow-500' : 'bg-red-500';
const fmt = (n: number, moneda: string) => {
  if (n <= 0) return '--';
  const simbolo = moneda === 'USD' ? '$' : 'Bs.';
  return `${simbolo} ${n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const Admindash = () => {
  const [resumenDia, setResumenDia] = useState<DashboardResumenResponse | null>(null);
  const [resumenMes, setResumenMes] = useState<DashboardResumenResponse | null>(null);
  const [charts, setCharts] = useState<DashboardChartsResponse | null>(null);
  const [ultimas, setUltimas] = useState<TransaccionResponse[]>([]);
  const [criticos, setCriticos] = useState<ProductoResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const [dia, mes, ch, tx, crit] = await Promise.all([
        dashboardService.resumenHoy(),
        dashboardService.resumenMes(),
        dashboardService.charts(),
        transaccionService.listar(),
        inventarioService.stockCritico(),
      ]);
      setResumenDia(dia); setResumenMes(mes); setCharts(ch); setUltimas(tx.slice(0, 5)); setCriticos(crit);
    } catch { /* */ }
    finally { setLoading(false); }
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

  const maxVenta = charts ? Math.max(...charts.ventas30Dias.map(v => v.monto), 1) : 1;
  const maxIvG = charts ? Math.max(...charts.ingresosVsGastos6Meses.flatMap(i => [i.ingresos, i.gastos]), 1) : 1;

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:180-ring" width={36} className="text-primary animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <ProfileWelcome />

      <div>
        <h2 className="text-lg font-semibold mb-3">Resumen del día</h2>
        <ResumenCards data={cardsDia} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Resumen del mes</h2>
        <ResumenCards data={cardsMes} />
      </div>

      {/* Gráficas */}
      {charts && (
        <div className="grid grid-cols-12 gap-6">
          {/* Ingresos vs Gastos */}
          <div className="lg:col-span-7 col-span-12">
            <CardBox className="shadow-none border border-border h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold">Ingresos vs Gastos</h3>
                <span className="text-xs text-muted-foreground">Últimos 6 meses · {m}</span>
              </div>
              <div className="flex items-end justify-around gap-2 h-48 px-2 pb-2">
                {charts.ingresosVsGastos6Meses.map(b => (
                  <div key={b.mes} className="flex flex-col items-center gap-1 flex-1 h-full">
                    <div className="flex items-end gap-1 w-full justify-center h-full">
                      <div style={{ height: `${(b.ingresos / maxIvG) * 100}%` }} className="w-6 bg-primary rounded-t-md transition-all min-h-[2px]" />
                      <div style={{ height: `${(b.gastos / maxIvG) * 100}%` }} className="w-6 bg-destructive/60 rounded-t-md transition-all min-h-[2px]" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{b.mes}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-3 text-xs text-muted-foreground pb-2">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary" /> Ingresos</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-destructive/60" /> Gastos</span>
              </div>
            </CardBox>
          </div>

          {/* Categorías */}
          <div className="lg:col-span-5 col-span-12">
            <CardBox className="shadow-none border border-border h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold">Ventas por categoría</h3>
                <span className="text-xs text-muted-foreground">Este mes</span>
              </div>
              <div className="space-y-3">
                {charts.categorias.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Sin datos</p> :
                  charts.categorias.slice(0, 5).map((c, i) => {
                    const colors = ['bg-primary', 'bg-info', 'bg-warning', 'bg-success', 'bg-secondary'];
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-foreground truncate max-w-[60%]">{c.categoria}</span>
                          <span className="text-muted-foreground text-xs">{c.porcentaje}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-muted">
                          <div className={`h-2.5 rounded-full ${colors[i % colors.length]}`} style={{ width: `${Math.max(c.porcentaje, 3)}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardBox>
          </div>
        </div>
      )}

      {/* Cuentas + Stock */}
      {charts && (
        <div className="grid grid-cols-12 gap-6">
          <div className="lg:col-span-6 col-span-12">
            <CardBox className="shadow-none border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold">Cuentas pendientes</h3>
                <Link to="/admin/por-cobrar" className="text-sm text-primary hover:underline">Ver todas</Link>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Por cobrar</p>
                  <p className="text-lg font-bold text-warning truncate">{fmt(charts.porCobrar, m)}</p>
                </div>
                <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Por pagar</p>
                  <p className="text-lg font-bold text-destructive truncate">{fmt(charts.porPagar, m)}</p>
                </div>
              </div>
            </CardBox>
          </div>

          <div className="lg:col-span-6 col-span-12">
            <CardBox className="shadow-none border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold">Stock crítico</h3>
                <Link to="/admin/inventario/alertas" className="text-sm text-primary hover:underline">Ver inventario</Link>
              </div>
              {criticos.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Icon icon="solar:check-circle-bold" width={32} className="text-green-500 mx-auto mb-2" />
                  <p className="text-sm">Sin productos críticos</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {criticos.slice(0, 4).map(p => (
                    <div key={p.productoId} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${p.alertaStock === 'ROJO' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{p.nombre}</p>
                          <p className="text-xs text-muted-foreground">{p.categoria || 'General'} · {p.unidadMedida}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className={`text-sm font-bold ${p.alertaStock === 'ROJO' ? 'text-red-600' : 'text-yellow-600'}`}>
                          {p.stockActual} <span className="text-xs text-muted-foreground font-normal">/ {p.stockMinimo}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                  {criticos.length > 4 && (
                    <p className="text-xs text-muted-foreground text-center pt-1">+{criticos.length - 4} más</p>
                  )}
                </div>
              )}
            </CardBox>
          </div>
        </div>
      )}

      {/* Últimas transacciones */}
      <CardBox className="shadow-none border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Últimas transacciones</h3>
          <Link to="/admin/caja-facturacion" className="text-sm text-primary hover:underline">Ver historial</Link>
        </div>
        {ultimas.length === 0 ? (
          <div className="flex items-center justify-center py-6 bg-muted/30 rounded-lg border border-dashed border-border">
            <p className="text-xs text-muted-foreground">Sin transacciones registradas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ultimas.map(t => (
              <div key={t.transaccionId} className="flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-1.5 rounded-full ${t.tipo === 'INGRESO' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    <Icon icon={t.tipo === 'INGRESO' ? 'solar:arrow-up-linear' : 'solar:arrow-down-linear'} width={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.clienteNombre || t.proveedorNombre || '—'}</p>
                    <p className="text-xs text-muted-foreground">{t.fecha} · {t.numeroFactura || `#${t.transaccionId}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <Badge className={estadoColor[t.estado] || ''}>{t.estado}</Badge>
                  <span className="text-sm font-semibold font-mono w-24 text-right">
                    {t.moneda === 'USD' ? '$' : 'Bs.'} {t.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBox>
    </div>
  );
};

export default Admindash;
