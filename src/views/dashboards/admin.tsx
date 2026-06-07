import { useCallback, useEffect, useState } from 'react';
import ProfileWelcome from 'src/components/dashboards/modern/ProfileWelcome';
import { ResumenCards, type ResumenCardData } from 'src/components/dashboards/gescom/ResumenCards';
import CardBox from 'src/components/shared/CardBox';
import { Badge } from 'src/components/ui/badge';
import { Icon } from '@iconify/react';
import { Link } from 'react-router';
import { transaccionService } from 'src/api/services/transaccionService';
import type { TransaccionResponse } from 'src/types/transaccion';

/* ── Helpers ─────────────────────────────────────────────────────────── */

const colorIndicador = (dias: number) =>
  dias <= 7 ? 'bg-green-500' : dias <= 15 ? 'bg-yellow-500' : 'bg-red-500';

const estadoColor: Record<string, string> = {
  PAGADA: 'bg-green-100 text-green-700',
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  PARCIAL: 'bg-blue-100 text-blue-700',
  ANULADA: 'bg-red-100 text-red-700',
};

const Admindash = () => {
  const [transacciones, setTransacciones] = useState<TransaccionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await transaccionService.listar();
      setTransacciones(data);
    } catch { /* sin datos aún */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // Calcular métricas desde los datos reales
  const hoy = new Date().toISOString().slice(0, 10);
  const mes = hoy.slice(0, 7);

  const ventasDia = transacciones
    .filter(t => t.tipo === 'INGRESO' && t.fecha === hoy)
    .reduce((s, t) => s + t.total, 0);

  const gastosDia = transacciones
    .filter(t => t.tipo === 'EGRESO' && t.fecha === hoy)
    .reduce((s, t) => s + t.total, 0);

  const transaccionesDia = transacciones.filter(t => t.fecha === hoy).length;

  const ventasMes = transacciones
    .filter(t => t.tipo === 'INGRESO' && t.fecha.startsWith(mes))
    .reduce((s, t) => s + t.total, 0);

  const gastosMes = transacciones
    .filter(t => t.tipo === 'EGRESO' && t.fecha.startsWith(mes))
    .reduce((s, t) => s + t.total, 0);

  const porCobrar = transacciones
    .filter(t => t.estado === 'PENDIENTE' || t.estado === 'PARCIAL')
    .reduce((s, t) => s + (t.saldoPendiente || 0), 0);

  const fmt = (n: number) => n > 0 ? n.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '--';

  const resumenDia: ResumenCardData[] = [
    { key: 'ventas-dia', titulo: 'Ventas del día', valor: fmt(ventasDia), moneda: 'USD', icono: 'solar:cart-check-linear', color: 'text-primary', bgColor: 'bg-primary/10' },
    { key: 'gastos-dia', titulo: 'Gastos del día', valor: fmt(gastosDia), moneda: 'USD', icono: 'solar:arrow-down-linear', color: 'text-destructive', bgColor: 'bg-destructive/10' },
    { key: 'ganancia-dia', titulo: 'Ganancia neta', valor: fmt(ventasDia - gastosDia), moneda: 'USD', icono: 'solar:chart-square-linear', color: 'text-success', bgColor: 'bg-success/10' },
    { key: 'transacciones-dia', titulo: 'Transacciones hoy', valor: String(transaccionesDia), icono: 'solar:list-check-linear', color: 'text-secondary', bgColor: 'bg-secondary/10' },
  ];

  const resumenMes: ResumenCardData[] = [
    { key: 'ventas-mes', titulo: 'Ventas del mes', valor: fmt(ventasMes), moneda: 'USD', icono: 'solar:graph-up-linear', color: 'text-primary', bgColor: 'bg-primary/10' },
    { key: 'gastos-mes', titulo: 'Gastos del mes', valor: fmt(gastosMes), moneda: 'USD', icono: 'solar:graph-down-linear', color: 'text-destructive', bgColor: 'bg-destructive/10' },
    { key: 'ganancia-mes', titulo: 'Ganancia del mes', valor: fmt(ventasMes - gastosMes), moneda: 'USD', icono: 'solar:dollar-linear', color: 'text-success', bgColor: 'bg-success/10' },
    { key: 'cobrar-mes', titulo: 'Por cobrar pendiente', valor: fmt(porCobrar), moneda: 'USD', icono: 'solar:hand-money-linear', color: 'text-warning', bgColor: 'bg-warning/10' },
  ];

  const ultimas = transacciones.slice(0, 5);
  const pendientes = transacciones.filter(t => t.estado === 'PENDIENTE' || t.estado === 'PARCIAL').slice(0, 4);

  return (
    <div className="space-y-6">
      <ProfileWelcome />

      <div>
        <h2 className="text-lg font-semibold mb-3">Resumen del día</h2>
        <ResumenCards data={resumenDia} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Resumen del mes</h2>
        <ResumenCards data={resumenMes} />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="lg:col-span-7 col-span-12">
          <CardBox className="shadow-none border border-border h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Ingresos vs Gastos</h3>
              <span className="text-xs text-muted-foreground">Últimos 6 meses</span>
            </div>
            <div className="flex items-center justify-center h-48 bg-muted/30 rounded-lg border border-dashed border-border">
              <div className="text-center">
                <Icon icon="solar:chart-square-bar-linear" height={36} width={36} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Conecta la API de reportes para ver la gráfica</p>
              </div>
            </div>
          </CardBox>
        </div>

        <div className="lg:col-span-5 col-span-12">
          <CardBox className="shadow-none border border-border h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Ventas por categoría</h3>
              <span className="text-xs text-muted-foreground">Este mes</span>
            </div>
            <div className="flex items-center justify-center h-48 bg-muted/30 rounded-lg border border-dashed border-border">
              <div className="text-center">
                <Icon icon="solar:pie-chart-2-linear" height={36} width={36} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Conecta la API de reportes para ver la gráfica</p>
              </div>
            </div>
          </CardBox>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="lg:col-span-6 col-span-12">
          <CardBox className="shadow-none border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Cuentas por cobrar pendientes</h3>
              <Link to="/admin/por-cobrar" className="text-sm text-primary hover:underline">Ver todas</Link>
            </div>
            {pendientes.length === 0 ? (
              <div className="flex items-center justify-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
                <div className="text-center">
                  <Icon icon="solar:hand-money-linear" height={28} width={28} className="text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Sin cuentas pendientes</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {pendientes.map(c => (
                  <div key={c.transaccionId} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${colorIndicador(c.diasTranscurridos || 0)}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{c.clienteNombre || c.proveedorNombre || '—'}</p>
                        <p className="text-xs text-muted-foreground">{c.fecha} · {c.diasTranscurridos}d</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold shrink-0 ml-3">${c.saldoPendiente.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardBox>
        </div>

        <div className="lg:col-span-6 col-span-12">
          <CardBox className="shadow-none border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Stock crítico</h3>
              <Link to="/admin/inventario" className="text-sm text-primary hover:underline">Ver inventario</Link>
            </div>
            <div className="flex items-center justify-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
              <div className="text-center">
                <Icon icon="solar:danger-triangle-linear" height={28} width={28} className="text-muted-foreground mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Conecta la API de inventario para ver el stock</p>
              </div>
            </div>
          </CardBox>
        </div>
      </div>

      <CardBox className="shadow-none border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Últimas transacciones</h3>
          <Link to="/admin/caja-facturacion" className="text-sm text-primary hover:underline">Ver historial</Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Icon icon="svg-spinners:180-ring" width={24} className="text-primary animate-spin" />
          </div>
        ) : ultimas.length === 0 ? (
          <div className="flex items-center justify-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
            <div className="text-center">
              <Icon icon="solar:list-check-linear" height={28} width={28} className="text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Sin transacciones registradas</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {ultimas.map(t => (
              <div key={t.transaccionId} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
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
