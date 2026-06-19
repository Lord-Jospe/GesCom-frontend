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
import type { DashboardResumenResponse } from 'src/types/empresa';

const estadoColor: Record<string, string> = {
  PAGADA: 'bg-green-100 text-green-700', PENDIENTE: 'bg-yellow-100 text-yellow-700',
  PARCIAL: 'bg-blue-100 text-blue-700', ANULADA: 'bg-red-100 text-red-700',
};
const fmt = (n: number) => n.toLocaleString('es-VE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const Operadordash = () => {
  const [resumenDia, setResumenDia] = useState<DashboardResumenResponse | null>(null);
  const [ultimas, setUltimas] = useState<TransaccionResponse[]>([]);
  const [criticos, setCriticos] = useState<ProductoResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const [dia, tx, crit] = await Promise.all([
        dashboardService.resumenHoy(), transaccionService.listar(), inventarioService.stockCritico(),
      ]);
      setResumenDia(dia); setUltimas(tx.slice(0, 8)); setCriticos(crit);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const m = resumenDia?.moneda || 'USD';
  const s = m === 'USD' ? '$' : 'Bs.';

  const cards: ResumenCardData[] = [
    { key: 'v', titulo: 'Ventas del día', valor: resumenDia ? `${s} ${fmt(resumenDia.ventas)}` : '--', moneda: m, icono: 'solar:cart-check-linear', color: 'text-primary', bgColor: 'bg-primary/10' },
    { key: 'g', titulo: 'Gastos del día', valor: resumenDia ? `${s} ${fmt(resumenDia.gastos)}` : '--', moneda: m, icono: 'solar:arrow-down-linear', color: 'text-destructive', bgColor: 'bg-destructive/10' },
    { key: 't', titulo: 'Registros hoy', valor: resumenDia ? String(resumenDia.transacciones) : '--', icono: 'solar:list-check-linear', color: 'text-secondary', bgColor: 'bg-secondary/10' },
  ];

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <ProfileWelcome />

      <div className="grid grid-cols-2 gap-4">
        <Link to="/operador/caja-facturacion/venta">
          <CardBox className="shadow-none border border-border hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-success/10"><Icon icon="solar:cart-plus-linear" height={28} width={28} className="text-success" /></div>
              <div><h4 className="text-base font-semibold">Registrar venta</h4><p className="text-sm text-muted-foreground">Nueva transacción de ingreso</p></div></div>
          </CardBox>
        </Link>
        <Link to="/operador/caja-facturacion/gasto">
          <CardBox className="shadow-none border border-border hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-destructive/10"><Icon icon="solar:arrow-down-linear" height={28} width={28} className="text-destructive" /></div>
              <div><h4 className="text-base font-semibold">Registrar gasto</h4><p className="text-sm text-muted-foreground">Nueva transacción de egreso</p></div></div>
          </CardBox>
        </Link>
      </div>

      <h2 className="text-lg font-semibold">Resumen del día</h2>
      <ResumenCards data={cards} columns={3} />

      <CardBox className="shadow-none border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Últimas transacciones</h3>
          <Link to="/operador/caja-facturacion" className="text-sm text-primary hover:underline">Ver todas</Link>
        </div>
        {ultimas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Sin transacciones.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30"><tr>
                <th className="text-left px-3 py-2 font-semibold">#</th><th className="text-left px-3 py-2 font-semibold">Fecha</th>
                <th className="text-left px-3 py-2 font-semibold">Cliente / Proveedor</th><th className="text-right px-3 py-2 font-semibold">Total</th>
                <th className="text-left px-3 py-2 font-semibold">Estado</th>
              </tr></thead>
              <tbody>
                {ultimas.map(t => (
                  <tr key={t.transaccionId} className="border-t hover:bg-muted/20">
                    <td className="px-3 py-2 font-mono text-xs">{t.numeroFactura || '#' + t.transaccionId}</td><td className="px-3 py-2">{t.fecha}</td>
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

      <CardBox className="shadow-none border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Alertas de inventario</h3>
          <Link to="/operador/inventario/alertas" className="text-sm text-primary hover:underline">Ver inventario</Link>
        </div>
        {criticos.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground"><Icon icon="solar:check-circle-bold" width={36} className="text-green-500 mx-auto mb-2" /><p className="text-sm">Todo al día</p></div>
        ) : (
          <div className="space-y-2">
            {criticos.map(p => (
              <div key={p.productoId} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                <div className="flex items-center gap-3"><Icon icon="solar:danger-triangle-bold" width={20} className="text-red-500" />
                  <div><p className="text-sm font-medium">{p.nombre}</p><p className="text-xs text-muted-foreground">Stock: {p.stockActual} / {p.stockMinimo}</p></div>
                </div>
                <Badge className={p.stockActual === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>{p.stockActual === 0 ? 'Agotado' : 'Bajo'}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardBox>
    </div>
  );
};

export default Operadordash;
