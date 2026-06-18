import { useCallback, useEffect, useState } from 'react';
import ProfileWelcome from 'src/components/dashboards/modern/ProfileWelcome';
import { ResumenCards, type ResumenCardData } from 'src/components/dashboards/gescom/ResumenCards';
import CardBox from 'src/components/shared/CardBox';
import { Badge } from 'src/components/ui/badge';
import { Icon } from '@iconify/react';
import { Link } from 'react-router';
import { transaccionService } from 'src/api/services/transaccionService';
import { contabilidadService } from 'src/api/services/contabilidadService';
import { dashboardService } from 'src/api/services/empresaService';
import type { TransaccionResponse } from 'src/types/transaccion';
import type { AsientoResponse } from 'src/types/contabilidad';
import type { DashboardResumenResponse, DashboardChartsResponse } from 'src/types/empresa';

const estadoColor: Record<string, string> = {
  PAGADA: 'bg-green-100 text-green-700', PENDIENTE: 'bg-yellow-100 text-yellow-700',
  PARCIAL: 'bg-blue-100 text-blue-700', ANULADA: 'bg-red-100 text-red-700',
};
const fmt = (n: number, moneda: string) => {
  if (n <= 0 && n >= 0) return '--';
  const s = moneda === 'USD' ? '$' : 'Bs.';
  return `${s} ${n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const Contadordash = () => {
  const [resumenMes, setResumenMes] = useState<DashboardResumenResponse | null>(null);
  const [charts, setCharts] = useState<DashboardChartsResponse | null>(null);
  const [asientos, setAsientos] = useState<AsientoResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const hoy = new Date().toISOString().slice(0, 10);
      const hace30 = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const [mes, ch, as] = await Promise.all([
        dashboardService.resumenMes(),
        dashboardService.charts(),
        contabilidadService.libroDiario(hace30, hoy),
      ]);
      setResumenMes(mes); setCharts(ch); setAsientos(as.slice(0, 8));
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const m = resumenMes?.moneda || 'USD';
  const cardsMes: ResumenCardData[] = [
    { key: 'v-mes', titulo: 'Ingresos del mes', valor: resumenMes ? fmt(resumenMes.ventas, m) : '--', moneda: m, icono: 'solar:graph-up-linear', color: 'text-primary', bgColor: 'bg-primary/10' },
    { key: 'g-mes', titulo: 'Gastos del mes', valor: resumenMes ? fmt(resumenMes.gastos, m) : '--', moneda: m, icono: 'solar:graph-down-linear', color: 'text-destructive', bgColor: 'bg-destructive/10' },
    { key: 'n-mes', titulo: 'Utilidad neta', valor: resumenMes ? fmt(resumenMes.ganancia, m) : '--', moneda: m, icono: 'solar:dollar-linear', color: 'text-success', bgColor: 'bg-success/10' },
    { key: 't-mes', titulo: 'Transacciones', valor: resumenMes ? String(resumenMes.transacciones) : '--', icono: 'solar:list-check-linear', color: 'text-secondary', bgColor: 'bg-secondary/10' },
  ];

  const ingresos6m = charts?.ingresosVsGastos6Meses || [];
  const maxVal = Math.max(...ingresos6m.map(d => Math.max(d.ingresos || 0, d.gastos || 0)), 1);

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <ProfileWelcome />

      <div>
        <h2 className="text-lg font-semibold mb-3">Resumen del mes</h2>
        <ResumenCards data={cardsMes} />
      </div>

      {/* Ingresos vs Gastos */}
      <div className="grid grid-cols-12 gap-6">
        <div className="lg:col-span-8 col-span-12">
          <CardBox className="shadow-none border border-border h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Ingresos vs Gastos</h3>
              <span className="text-xs text-muted-foreground">Últimos 6 meses</span>
            </div>
            {ingresos6m.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Sin datos</div>
            ) : (
              <div className="flex items-end gap-2 h-64 px-2">
                {ingresos6m.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div className="w-full flex flex-col items-center gap-0.5" style={{ height: `${(d.ingresos / maxVal) * 80}%` }}>
                      <div className="w-full bg-primary/60 rounded-t flex-1" style={{ minHeight: 4 }} />
                    </div>
                    <div className="w-full flex flex-col items-center gap-0.5" style={{ height: `${(d.gastos / maxVal) * 80}%` }}>
                      <div className="w-full bg-destructive/60 rounded-t flex-1" style={{ minHeight: 4 }} />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">{d.mes?.substring(5)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1"><div className="size-3 rounded-sm bg-primary/60" /> Ingresos</div>
              <div className="flex items-center gap-1"><div className="size-3 rounded-sm bg-destructive/60" /> Gastos</div>
            </div>
          </CardBox>
        </div>

        <div className="lg:col-span-4 col-span-12">
          <CardBox className="shadow-none border border-border h-full">
            <h3 className="text-base font-semibold mb-4">Accesos rápidos</h3>
            <div className="flex flex-col gap-2">
              <Link to="/contador/libro-diario" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <Icon icon="solar:book-2-broken" height={20} width={20} className="text-primary" /> <span className="text-sm">Libro Diario</span>
              </Link>
              <Link to="/contador/estado-resultados" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <Icon icon="solar:chart-2-bold" height={20} width={20} className="text-primary" /> <span className="text-sm">Estado de Resultados</span>
              </Link>
              <Link to="/contador/balance-general" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <Icon icon="solar:scales-linear" height={20} width={20} className="text-primary" /> <span className="text-sm">Balance General</span>
              </Link>
              <Link to="/contador/gestion-documental" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <Icon icon="solar:folder-with-files-linear" height={20} width={20} className="text-primary" /> <span className="text-sm">Gestión Documental</span>
              </Link>
            </div>
          </CardBox>
        </div>
      </div>

      {/* Asientos recientes */}
      <CardBox className="shadow-none border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Asientos recientes</h3>
          <Link to="/contador/libro-diario" className="text-sm text-primary hover:underline">Ver libro diario</Link>
        </div>
        {asientos.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">Sin asientos en los últimos 30 días.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30"><tr>
                <th className="text-left px-3 py-2 font-semibold">#</th>
                <th className="text-left px-3 py-2 font-semibold">Fecha</th>
                <th className="text-left px-3 py-2 font-semibold">Descripción</th>
                <th className="text-right px-3 py-2 font-semibold">Débito</th>
                <th className="text-right px-3 py-2 font-semibold">Crédito</th>
                <th className="text-center px-3 py-2 font-semibold">Tipo</th>
              </tr></thead>
              <tbody>
                {asientos.map(a => (
                  <tr key={a.asientoId} className="border-t hover:bg-muted/20">
                    <td className="px-3 py-2 font-mono text-xs">{a.numeroAsiento}</td>
                    <td className="px-3 py-2">{a.fecha}</td>
                    <td className="px-3 py-2 max-w-48 truncate">{a.descripcion}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs">{a.totalDebito > 0 ? '$ ' + a.totalDebito.toFixed(2) : ''}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs">{a.totalCredito > 0 ? '$ ' + a.totalCredito.toFixed(2) : ''}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge className={a.esAutomatico ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'}>{a.esAutomatico ? 'Auto' : 'Manual'}</Badge>
                    </td>
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

export default Contadordash;
