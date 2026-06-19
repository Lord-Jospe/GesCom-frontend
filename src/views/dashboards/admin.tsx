import { useCallback, useEffect, useState } from 'react';
import ProfileWelcome from 'src/components/dashboards/modern/ProfileWelcome';
import { ResumenCards, type ResumenCardData } from 'src/components/dashboards/gescom/ResumenCards';
import CardBox from 'src/components/shared/CardBox';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { Icon } from '@iconify/react';
import { Link } from 'react-router';
import { transaccionService } from 'src/api/services/transaccionService';
import { inventarioService } from 'src/api/services/inventarioService';
import { dashboardService } from 'src/api/services/empresaService';
import type { TransaccionResponse } from 'src/types/transaccion';
import type { ProductoResponse } from 'src/types/inventario';
import type { DashboardResumenResponse, DashboardChartsResponse } from 'src/types/empresa';
import { CalendarDays } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const estadoColor: Record<string, string> = {
  PAGADA: 'bg-green-100 text-green-700', PENDIENTE: 'bg-yellow-100 text-yellow-700',
  PARCIAL: 'bg-blue-100 text-blue-700', ANULADA: 'bg-red-100 text-red-700',
};
const fmt = (n: number) => n.toLocaleString('es-VE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const Admindash = () => {
  const [resumenDia, setResumenDia] = useState<DashboardResumenResponse | null>(null);
  const [resumenMes, setResumenMes] = useState<DashboardResumenResponse | null>(null);
  const [charts, setCharts] = useState<DashboardChartsResponse | null>(null);
  const [ultimas, setUltimas] = useState<TransaccionResponse[]>([]);
  const [criticos, setCriticos] = useState<ProductoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [verMes, setVerMes] = useState(false);

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

  const resumen = verMes ? resumenMes : resumenDia;
  const m = resumen?.moneda || 'USD';
  const s = m === 'USD' ? '$' : 'Bs.';

  const cards: ResumenCardData[] = [
    { key: 'v', titulo: verMes ? 'Ventas del mes' : 'Ventas del día', valor: resumen ? `${s} ${fmt(resumen.ventas)}` : '--', moneda: m, icono: 'solar:cart-check-linear', color: 'text-primary', bgColor: 'bg-primary/10' },
    { key: 'g', titulo: verMes ? 'Gastos del mes' : 'Gastos del día', valor: resumen ? `${s} ${fmt(resumen.gastos)}` : '--', moneda: m, icono: 'solar:arrow-down-linear', color: 'text-destructive', bgColor: 'bg-destructive/10' },
    { key: 'n', titulo: 'Ganancia neta', valor: resumen ? `${s} ${fmt(resumen.ganancia)}` : '--', moneda: m, icono: 'solar:chart-square-linear', color: 'text-success', bgColor: 'bg-success/10' },
    { key: 't', titulo: 'Registros', valor: resumen ? String(resumen.transacciones) : '--', icono: 'solar:list-check-linear', color: 'text-secondary', bgColor: 'bg-secondary/10' },
  ];

  const lineData = (charts?.ventas30Dias || []).slice(-10).map(d => ({ ...d, monto: Number(d.monto) }));
  const mesesFull: Record<string, string> = { Ene: 'Enero', Feb: 'Febrero', Mar: 'Marzo', Abr: 'Abril', May: 'Mayo', Jun: 'Junio', Jul: 'Julio', Ago: 'Agosto', Sep: 'Septiembre', Oct: 'Octubre', Nov: 'Noviembre', Dic: 'Diciembre' };
  const barData = (charts?.ingresosVsGastos6Meses || []).map(d => ({ mes: mesesFull[d.mes] || d.mes, Ingresos: Number(d.ingresos), Gastos: Number(d.gastos) }));

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:180-ring" width={36} className="text-primary animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <ProfileWelcome />

      {/* ─── Resumen unificado ──────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{verMes ? 'Resumen del mes' : 'Resumen del día'}</h2>
        <Button variant="outline" size="sm" onClick={() => setVerMes(!verMes)}>
          <CalendarDays className="size-4 mr-1" />{verMes ? 'Ver día' : 'Ver mes'}
        </Button>
      </div>
      <ResumenCards data={cards} />

      {/* ─── Gráficas ───────────────────────────── */}
      {charts && (
        <div className="grid grid-cols-12 gap-6">
          {/* Línea ventas 10d */}
          <div className="lg:col-span-8 col-span-12">
            <CardBox className="shadow-none border border-border">
              <h3 className="text-base font-semibold mb-0.5">Ventas diarias</h3>
              <p className="text-xs text-muted-foreground mb-3">Últimos 10 días · En {m === 'USD' ? 'dólares' : 'bolívares'}</p>
              {lineData.length === 0 ? (
                <div className="flex items-center justify-center h-56 text-muted-foreground text-sm">Sin ventas</div>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                      <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => v?.substring(5)} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} width={40} />
                      <Tooltip
                        formatter={(val: any) => [`${s} ${fmt(Number(val))}`, 'Monto']}
                        labelFormatter={(lbl: any) => `${lbl}`}
                        contentStyle={{ borderRadius: 8, background: '#1e293b', border: '1px solid #334155', fontSize: 13, color: '#e2e8f0', padding: '8px 12px' }}
                      />
                      <Line type="monotone" dataKey="monto" stroke="#5d87ff" strokeWidth={2.5}
                        dot={{ r: 4, strokeWidth: 2, fill: '#1e293b' }} activeDot={{ r: 6 }}
                        animationDuration={800} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardBox>
          </div>

          {/* Top categorías — barras horizontales */}
          <div className="lg:col-span-4 col-span-12">
            <CardBox className="shadow-none border border-border h-full">
              <h3 className="text-base font-semibold mb-1">Top categorías</h3>
              <p className="text-xs text-muted-foreground mb-4">Por monto de ventas</p>
              {charts.categorias.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Sin datos</div>
              ) : (
                <div className="space-y-2">
                  {(() => {
                    const top = charts.categorias.slice(0, 5);
                    const maxCat = Math.max(...top.map(c => c.monto), 1);
                    const colors = ['#5d87ff','#8754ec','#f6b51e','#13deb9','#49beff'];
                    return top.map((c, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="truncate max-w-[60%]">{c.categoria}</span>
                          <span className="text-muted-foreground">{c.porcentaje}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted">
                          <div className="h-2 rounded-full transition-all" style={{ width: `${Math.max((c.monto / maxCat) * 100, 3)}%`, backgroundColor: colors[i] }} />
                        </div>
                      </div>
                    ));
                  })()}
                  {charts.categorias.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center pt-1">+{charts.categorias.length - 5} más</p>
                  )}
                </div>
              )}
            </CardBox>
          </div>
        </div>
      )}

      {/* ─── Ingresos vs Gastos ─────────────────── */}
      {charts && barData.length > 0 && (
        <CardBox className="shadow-none border border-border">
          <h3 className="text-base font-semibold mb-0.5">Ingresos vs Gastos mensuales</h3>
          <p className="text-xs text-muted-foreground mb-3">Últimos 6 meses · En {m === 'USD' ? 'dólares' : 'bolívares'}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barGap={4}>
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} width={45} />
                <Tooltip
                  cursor={{ fill: 'rgba(148,163,184,0.08)' }}
                  formatter={(val: any, name: any) => [`${s} ${fmt(Number(val))}`, String(name)]}
                  labelFormatter={(lbl: any) => `${lbl}`}
                  contentStyle={{ borderRadius: 8, background: '#1e293b', border: '1px solid #334155', fontSize: 13, color: '#e2e8f0', padding: '8px 12px' }}
                  separator=": "
                />
                <Legend wrapperStyle={{ fontSize: 13, color: '#94a3b8' }} />
                <Bar dataKey="Ingresos" fill="#5d87ff" radius={[4,4,0,0]} isAnimationActive={false} />
                <Bar dataKey="Gastos" fill="rgba(239,68,68,0.6)" radius={[4,4,0,0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {(() => {
            const totIn = barData.reduce((a, b) => a + b.Ingresos, 0);
            const totGa = barData.reduce((a, b) => a + b.Gastos, 0);
            const bal = totIn - totGa;
            return (
              <div className="flex justify-center items-center gap-8 mt-3 text-sm">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#5d87ff]" /> Ingresos: <strong>{s} {fmt(totIn)}</strong></span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[rgba(239,68,68,0.6)]" /> Gastos: <strong>{s} {fmt(totGa)}</strong></span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#13deb9]" /> Balance: <strong className={bal >= 0 ? 'text-success' : 'text-destructive'}>{s} {fmt(bal)}</strong></span>
              </div>
            );
          })()}
        </CardBox>
      )}

      {/* ─── Cuentas + Stock + Accesos ─────────── */}
      <div className="grid grid-cols-12 gap-6">
        <div className="lg:col-span-4 col-span-12">
          <CardBox className="shadow-none border border-border">
            <h3 className="text-base font-semibold mb-4">Cuentas pendientes</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <Link to="/admin/por-cobrar" className="p-4 rounded-lg bg-warning/5 border border-warning/20 hover:bg-warning/10 transition-colors">
                <Icon icon="solar:hand-money-linear" width={28} className="text-warning mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Por cobrar</p>
                <p className="text-lg font-bold text-warning">{charts ? `${s} ${fmt(charts.porCobrar)}` : '--'}</p>
              </Link>
              <Link to="/admin/por-pagar" className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 hover:bg-destructive/10 transition-colors">
                <Icon icon="solar:wallet-money-linear" width={28} className="text-destructive mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Por pagar</p>
                <p className="text-lg font-bold text-destructive">{charts ? `${s} ${fmt(charts.porPagar)}` : '--'}</p>
              </Link>
            </div>
          </CardBox>
        </div>
        <div className="lg:col-span-4 col-span-12">
          <CardBox className="shadow-none border border-border">
            <h3 className="text-base font-semibold mb-4">Stock crítico</h3>
            {criticos.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Icon icon="solar:check-circle-bold" width={36} className="text-green-500 mx-auto mb-2" /><p className="text-sm">Todo al día</p>
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
              </div>
            )}
          </CardBox>
        </div>
        <div className="lg:col-span-4 col-span-12">
          <CardBox className="shadow-none border border-border">
            <h3 className="text-base font-semibold mb-4">Accesos rápidos</h3>
            <div className="flex flex-col gap-2">
              <Link to="/admin/caja-facturacion/venta" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <Icon icon="solar:cart-plus-linear" width={20} className="text-success" /><span className="text-sm">Registrar venta</span>
              </Link>
              <Link to="/admin/caja-facturacion/gasto" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <Icon icon="solar:arrow-down-linear" width={20} className="text-destructive" /><span className="text-sm">Registrar gasto</span>
              </Link>
              <Link to="/admin/inventario" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <Icon icon="solar:box-linear" width={20} className="text-primary" /><span className="text-sm">Ver inventario</span>
              </Link>
            </div>
          </CardBox>
        </div>
      </div>

      {/* ─── Últimas transacciones ─────────────── */}
      <CardBox className="shadow-none border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Últimas transacciones</h3>
          <Link to="/admin/caja-facturacion" className="text-sm text-primary hover:underline">Ver historial</Link>
        </div>
        {ultimas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Sin transacciones.</div>
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
