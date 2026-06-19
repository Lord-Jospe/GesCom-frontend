import { useCallback, useEffect, useState } from 'react';
import ProfileWelcome from 'src/components/dashboards/modern/ProfileWelcome';
import { ResumenCards, type ResumenCardData } from 'src/components/dashboards/gescom/ResumenCards';
import CardBox from 'src/components/shared/CardBox';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { Icon } from '@iconify/react';
import { Link } from 'react-router';
import { contabilidadService } from 'src/api/services/contabilidadService';
import { dashboardService } from 'src/api/services/empresaService';
import type { AsientoResponse } from 'src/types/contabilidad';
import type { DashboardResumenResponse, DashboardChartsResponse } from 'src/types/empresa';
import { CalendarDays } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const fmt = (n: number) => n.toLocaleString('es-VE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const mesesFull: Record<string, string> = { Ene: 'Enero', Feb: 'Febrero', Mar: 'Marzo', Abr: 'Abril', May: 'Mayo', Jun: 'Junio', Jul: 'Julio', Ago: 'Agosto', Sep: 'Septiembre', Oct: 'Octubre', Nov: 'Noviembre', Dic: 'Diciembre' };

const Contadordash = () => {
  const [resumenDia, setResumenDia] = useState<DashboardResumenResponse | null>(null);
  const [resumenMes, setResumenMes] = useState<DashboardResumenResponse | null>(null);
  const [charts, setCharts] = useState<DashboardChartsResponse | null>(null);
  const [asientos, setAsientos] = useState<AsientoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [verMes, setVerMes] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const hoy = new Date().toISOString().slice(0, 10);
      const hace30 = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const [dia, mes, ch, as] = await Promise.all([
        dashboardService.resumenHoy(), dashboardService.resumenMes(), dashboardService.charts(),
        contabilidadService.libroDiario(hace30, hoy),
      ]);
      setResumenDia(dia); setResumenMes(mes); setCharts(ch); setAsientos(as.slice(0, 8));
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const resumen = verMes ? resumenMes : resumenDia;
  const m = resumen?.moneda || 'USD';
  const s = m === 'USD' ? '$' : 'Bs.';

  const cards: ResumenCardData[] = [
    { key: 'v', titulo: verMes ? 'Ingresos del mes' : 'Ingresos del día', valor: resumen ? `${s} ${fmt(resumen.ventas)}` : '--', moneda: m, icono: 'solar:graph-up-linear', color: 'text-primary', bgColor: 'bg-primary/10' },
    { key: 'g', titulo: verMes ? 'Gastos del mes' : 'Gastos del día', valor: resumen ? `${s} ${fmt(resumen.gastos)}` : '--', moneda: m, icono: 'solar:graph-down-linear', color: 'text-destructive', bgColor: 'bg-destructive/10' },
    { key: 'n', titulo: 'Utilidad neta', valor: resumen ? `${s} ${fmt(resumen.ganancia)}` : '--', moneda: m, icono: 'solar:dollar-linear', color: 'text-success', bgColor: 'bg-success/10' },
    { key: 't', titulo: 'Transacciones', valor: resumen ? String(resumen.transacciones) : '--', icono: 'solar:list-check-linear', color: 'text-secondary', bgColor: 'bg-secondary/10' },
  ];

  const barData = (charts?.ingresosVsGastos6Meses || []).map(d => ({ mes: mesesFull[d.mes] || d.mes, Ingresos: Number(d.ingresos), Gastos: Number(d.gastos) }));

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <ProfileWelcome />
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{verMes ? 'Resumen del mes' : 'Resumen del día'}</h2>
        <Button variant="outline" size="sm" onClick={() => setVerMes(!verMes)}>
          <CalendarDays className="size-4 mr-1" />{verMes ? 'Ver día' : 'Ver mes'}
        </Button>
      </div>
      <ResumenCards data={cards} />

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

      <div className="grid grid-cols-12 gap-6">
        <div className="lg:col-span-8 col-span-12">
          <CardBox className="shadow-none border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Asientos recientes (30 días)</h3>
              <Link to="/contador/libro-diario" className="text-sm text-primary hover:underline">Ver libro diario</Link>
            </div>
            {asientos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Sin asientos.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30"><tr>
                    <th className="text-left px-3 py-2 font-semibold">#</th><th className="text-left px-3 py-2 font-semibold">Fecha</th>
                    <th className="text-left px-3 py-2 font-semibold">Descripción</th><th className="text-right px-3 py-2 font-semibold">Débito</th>
                    <th className="text-right px-3 py-2 font-semibold">Crédito</th><th className="text-center px-3 py-2 font-semibold">Tipo</th>
                  </tr></thead>
                  <tbody>
                    {asientos.map(a => (
                      <tr key={a.asientoId} className="border-t hover:bg-muted/20">
                        <td className="px-3 py-2 font-mono text-xs">{a.numeroAsiento}</td><td className="px-3 py-2">{a.fecha}</td>
                        <td className="px-3 py-2 max-w-40 truncate">{a.descripcion}</td>
                        <td className="px-3 py-2 text-right font-mono text-xs">{a.totalDebito > 0 ? '$ ' + a.totalDebito.toFixed(2) : ''}</td>
                        <td className="px-3 py-2 text-right font-mono text-xs">{a.totalCredito > 0 ? '$ ' + a.totalCredito.toFixed(2) : ''}</td>
                        <td className="px-3 py-2 text-center"><Badge className={a.esAutomatico ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'}>{a.esAutomatico ? 'Auto' : 'Manual'}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBox>
        </div>
        <div className="lg:col-span-4 col-span-12">
          <CardBox className="shadow-none border border-border h-full">
            <h3 className="text-base font-semibold mb-4">Accesos rápidos</h3>
            <div className="flex flex-col gap-2">
              <Link to="/contador/libro-diario" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"><Icon icon="solar:book-2-broken" height={20} width={20} className="text-primary" /><span className="text-sm">Libro Diario</span></Link>
              <Link to="/contador/estado-resultados" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"><Icon icon="solar:chart-2-bold" height={20} width={20} className="text-primary" /><span className="text-sm">Estado de Resultados</span></Link>
              <Link to="/contador/balance-general" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"><Icon icon="solar:scales-linear" height={20} width={20} className="text-primary" /><span className="text-sm">Balance General</span></Link>
              <Link to="/contador/conciliacion-bancaria" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"><Icon icon="solar:card-transfer-linear" height={20} width={20} className="text-primary" /><span className="text-sm">Conciliación Bancaria</span></Link>
            </div>
          </CardBox>
        </div>
      </div>
    </div>
  );
};

export default Contadordash;
