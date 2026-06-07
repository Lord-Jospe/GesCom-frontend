import ProfileWelcome from 'src/components/dashboards/modern/ProfileWelcome';
import { ResumenCards, type ResumenCardData } from 'src/components/dashboards/gescom/ResumenCards';
import CardBox from 'src/components/shared/CardBox';
import { Badge } from 'src/components/ui/badge';
import { Icon } from '@iconify/react';
import { Link } from 'react-router';

/* ── Datos mock (temporales para screenshot) ─────────────────────────── */

const resumenDia: ResumenCardData[] = [
  { key: 'ventas-dia', titulo: 'Ventas del día', valor: '1,250.00', moneda: 'USD', icono: 'solar:cart-check-linear', color: 'text-primary', bgColor: 'bg-primary/10' },
  { key: 'gastos-dia', titulo: 'Gastos del día', valor: '340.50', moneda: 'USD', icono: 'solar:arrow-down-linear', color: 'text-destructive', bgColor: 'bg-destructive/10' },
  { key: 'ganancia-dia', titulo: 'Ganancia neta', valor: '909.50', moneda: 'USD', icono: 'solar:chart-square-linear', color: 'text-success', bgColor: 'bg-success/10' },
  { key: 'transacciones-dia', titulo: 'Transacciones hoy', valor: '23', icono: 'solar:list-check-linear', color: 'text-secondary', bgColor: 'bg-secondary/10' },
];

const resumenMes: ResumenCardData[] = [
  { key: 'ventas-mes', titulo: 'Ventas del mes', valor: '18,430.00', moneda: 'USD', icono: 'solar:graph-up-linear', color: 'text-primary', bgColor: 'bg-primary/10' },
  { key: 'gastos-mes', titulo: 'Gastos del mes', valor: '7,215.80', moneda: 'USD', icono: 'solar:graph-down-linear', color: 'text-destructive', bgColor: 'bg-destructive/10' },
  { key: 'ganancia-mes', titulo: 'Ganancia del mes', valor: '11,214.20', moneda: 'USD', icono: 'solar:dollar-linear', color: 'text-success', bgColor: 'bg-success/10' },
  { key: 'cobrar-mes', titulo: 'Por cobrar pendiente', valor: '2,850.00', moneda: 'USD', icono: 'solar:hand-money-linear', color: 'text-warning', bgColor: 'bg-warning/10' },
];

const ultimasTransacciones = [
  { id: 1, cliente: 'Distribuidora La Unión', monto: 450.00, moneda: 'USD', tipo: 'venta', hora: '3:45 PM', estado: 'Pagado' },
  { id: 2, cliente: 'Comercial El Puente CA', monto: 120.50, moneda: 'USD', tipo: 'venta', hora: '2:30 PM', estado: 'Pendiente' },
  { id: 3, cliente: 'Pago a proveedor Mercantil', monto: 200.00, moneda: 'USD', tipo: 'gasto', hora: '1:15 PM', estado: 'Pagado' },
  { id: 4, cliente: 'Ferretería Los Pinos', monto: 850.00, moneda: 'Bs.', tipo: 'venta', hora: '11:00 AM', estado: 'Pagado' },
  { id: 5, cliente: 'Gasto de transporte', monto: 35.00, moneda: 'USD', tipo: 'gasto', hora: '9:20 AM', estado: 'Pagado' },
];

const cuentasPorCobrar = [
  { id: 1, cliente: 'Distribuidora La Unión', monto: 450.00, dias: 2, emision: '05/06/2026' },
  { id: 2, cliente: 'Comercial El Puente CA', monto: 120.50, dias: 12, emision: '25/05/2026' },
  { id: 3, cliente: 'Ferretería Los Pinos', monto: 850.00, dias: 25, emision: '12/05/2026' },
  { id: 4, cliente: 'Abastos El Carmen', monto: 320.75, dias: 3, emision: '04/06/2026' },
];

const stockCritico = [
  { id: 1, producto: 'Aceite de motor 20W-50', stock: 2, umbral: 5, unidad: 'galón' },
  { id: 2, producto: 'Filtros de aceite', stock: 0, umbral: 10, unidad: 'unidad' },
  { id: 3, producto: 'Baterías 12V', stock: 1, umbral: 3, unidad: 'unidad' },
];

/* ── Helpers ─────────────────────────────────────────────────────────── */

const colorIndicador = (dias: number) =>
  dias <= 7 ? 'bg-green-500' : dias <= 15 ? 'bg-yellow-500' : 'bg-red-500';

const Admindash = () => {
  return (
    <div className="space-y-6">
      <ProfileWelcome />

      {/* Resumen del día — RF-73 */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Resumen del día</h2>
        <ResumenCards data={resumenDia} />
      </div>

      {/* Resumen del mes — RF-74 */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Resumen del mes</h2>
        <ResumenCards data={resumenMes} />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-12 gap-6">
        <div className="lg:col-span-7 col-span-12">
          <CardBox className="shadow-none border border-border h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Ingresos vs Gastos</h3>
              <span className="text-xs text-muted-foreground">Últimos 6 meses</span>
            </div>
            {/* Barras mock simples */}
            <div className="flex items-end justify-around gap-2 h-48 px-2 pb-2">
              {[
                { mes: 'Ene', ingreso: 125, gasto: 58 },
                { mes: 'Feb', ingreso: 150, gasto: 67 },
                { mes: 'Mar', ingreso: 100, gasto: 77 },
                { mes: 'Abr', ingreso: 173, gasto: 86 },
                { mes: 'May', ingreso: 163, gasto: 73 },
                { mes: 'Jun', ingreso: 135, gasto: 62 },
              ].map((b) => (
                <div key={b.mes} className="flex flex-col items-center gap-1 flex-1 h-full">
                  <div className="flex items-end gap-1 w-full justify-center h-full">
                    <div style={{ height: `${b.ingreso}px` }} className="w-6 bg-primary rounded-t-md transition-all" />
                    <div style={{ height: `${b.gasto}px` }} className="w-6 bg-destructive/60 rounded-t-md transition-all" />
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

        <div className="lg:col-span-5 col-span-12">
          <CardBox className="shadow-none border border-border h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Ventas por categoría</h3>
              <span className="text-xs text-muted-foreground">Este mes</span>
            </div>
            <div className="space-y-3">
              {[
                { cat: 'Mercancía', pct: 45, monto: '8,293.50', color: 'bg-primary' },
                { cat: 'Servicios', pct: 30, monto: '5,529.00', color: 'bg-info' },
                { cat: 'Otros', pct: 25, monto: '4,607.50', color: 'bg-warning' },
              ].map((c) => (
                <div key={c.cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-foreground">{c.cat}</span>
                    <span className="text-muted-foreground">${c.monto}</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-muted">
                    <div className={`h-2.5 rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardBox>
        </div>
      </div>

      {/* Cuentas pendientes + Stock crítico */}
      <div className="grid grid-cols-12 gap-6">
        {/* Cuentas por cobrar pendientes */}
        <div className="lg:col-span-6 col-span-12">
          <CardBox className="shadow-none border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Cuentas por cobrar pendientes</h3>
              <Link to="/admin/por-cobrar" className="text-sm text-primary hover:underline">Ver todas</Link>
            </div>
            <div className="space-y-2">
              {cuentasPorCobrar.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${colorIndicador(c.dias)}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.cliente}</p>
                      <p className="text-xs text-muted-foreground">Emitido {c.emision}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-semibold text-foreground">${c.monto.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{c.dias} día(s)</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBox>
        </div>

        {/* Productos con stock crítico */}
        <div className="lg:col-span-6 col-span-12">
          <CardBox className="shadow-none border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Stock crítico</h3>
              <Link to="/admin/inventario" className="text-sm text-primary hover:underline">Ver inventario</Link>
            </div>
            <div className="space-y-2">
              {stockCritico.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${p.stock === 0 ? 'bg-red-500' : 'bg-yellow-500'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.producto}</p>
                      <p className="text-xs text-muted-foreground">Umbral: {p.umbral} {p.unidad}(es)</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <Badge className={p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                      {p.stock} {p.unidad}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardBox>
        </div>
      </div>

      {/* Últimas transacciones — RF-73 */}
      <CardBox className="shadow-none border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Últimas transacciones</h3>
          <Link to="/admin/caja-facturacion" className="text-sm text-primary hover:underline">Ver historial</Link>
        </div>
        <div className="space-y-2">
          {ultimasTransacciones.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-1.5 rounded-full ${t.tipo === 'venta' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  <Icon icon={t.tipo === 'venta' ? 'solar:arrow-up-linear' : 'solar:arrow-down-linear'} width={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{t.cliente}</p>
                  <p className="text-xs text-muted-foreground">{t.hora}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <Badge className={t.estado === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                  {t.estado}
                </Badge>
                <span className="text-sm font-semibold text-foreground w-24 text-right">
                  {t.moneda === 'USD' ? '$' : 'Bs.'} {t.monto.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBox>
    </div>
  );
};

export default Admindash;
