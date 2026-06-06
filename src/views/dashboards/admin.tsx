import ProfileWelcome from 'src/components/dashboards/modern/ProfileWelcome';
import { ResumenCards, type ResumenCardData } from 'src/components/dashboards/gescom/ResumenCards';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { Link } from 'react-router';

const Admindash = () => {
  const resumenDia: ResumenCardData[] = [
    { key: 'ventas-dia', titulo: 'Ventas del día', valor: '--', moneda: 'USD', icono: 'solar:cart-check-linear', color: 'text-primary', bgColor: 'bg-primary/10' },
    { key: 'gastos-dia', titulo: 'Gastos del día', valor: '--', moneda: 'USD', icono: 'solar:arrow-down-linear', color: 'text-destructive', bgColor: 'bg-destructive/10' },
    { key: 'ganancia-dia', titulo: 'Ganancia neta', valor: '--', moneda: 'USD', icono: 'solar:chart-square-linear', color: 'text-success', bgColor: 'bg-success/10' },
    { key: 'transacciones-dia', titulo: 'Transacciones hoy', valor: '--', icono: 'solar:list-check-linear', color: 'text-secondary', bgColor: 'bg-secondary/10' },
  ];

  const resumenMes: ResumenCardData[] = [
    { key: 'ventas-mes', titulo: 'Ventas del mes', valor: '--', moneda: 'USD', icono: 'solar:graph-up-linear', color: 'text-primary', bgColor: 'bg-primary/10' },
    { key: 'gastos-mes', titulo: 'Gastos del mes', valor: '--', moneda: 'USD', icono: 'solar:graph-down-linear', color: 'text-destructive', bgColor: 'bg-destructive/10' },
    { key: 'ganancia-mes', titulo: 'Ganancia del mes', valor: '--', moneda: 'USD', icono: 'solar:dollar-linear', color: 'text-success', bgColor: 'bg-success/10' },
    { key: 'cobrar-mes', titulo: 'Por cobrar pendiente', valor: '--', moneda: 'USD', icono: 'solar:hand-money-linear', color: 'text-warning', bgColor: 'bg-warning/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
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
        {/* Ingresos vs Gastos — RF-76 */}
        <div className="lg:col-span-7 col-span-12">
          <CardBox className="shadow-none border border-border h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Ingresos vs Gastos</h3>
              <span className="text-xs text-muted-foreground">Últimos 6 meses</span>
            </div>
            <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg border border-dashed border-border">
              <div className="text-center">
                <Icon icon="solar:chart-square-bar-linear" height={48} width={48} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Gráfica de ingresos vs gastos</p>
                <p className="text-xs text-muted-foreground">Se cargará al conectar la API</p>
              </div>
            </div>
          </CardBox>
        </div>

        {/* Distribución por categoría — RF-78 */}
        <div className="lg:col-span-5 col-span-12">
          <CardBox className="shadow-none border border-border h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Ventas por categoría</h3>
              <span className="text-xs text-muted-foreground">Este mes</span>
            </div>
            <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg border border-dashed border-border">
              <div className="text-center">
                <Icon icon="solar:pie-chart-2-linear" height={48} width={48} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Gráfica de pastel</p>
                <p className="text-xs text-muted-foreground">Se cargará al conectar la API</p>
              </div>
            </div>
          </CardBox>
        </div>
      </div>

      {/* Cuentas pendientes + Stock crítico */}
      <div className="grid grid-cols-12 gap-6">
        {/* Cuentas por cobrar pendientes — RF-32/74 */}
        <div className="lg:col-span-6 col-span-12">
          <CardBox className="shadow-none border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Cuentas por cobrar pendientes</h3>
              <Link to="/admin/por-cobrar" className="text-sm text-primary hover:underline">Ver todas</Link>
            </div>
            <div className="flex items-center justify-center py-10 bg-muted/30 rounded-lg border border-dashed border-border">
              <div className="text-center">
                <Icon icon="solar:hand-money-linear" height={36} width={36} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Sin datos aún</p>
                <p className="text-xs text-muted-foreground">Conecta la API para ver las cuentas pendientes</p>
              </div>
            </div>
          </CardBox>
        </div>

        {/* Productos con stock crítico — RF-42/43/74 */}
        <div className="lg:col-span-6 col-span-12">
          <CardBox className="shadow-none border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Stock crítico</h3>
              <Link to="/admin/inventario" className="text-sm text-primary hover:underline">Ver inventario</Link>
            </div>
            <div className="flex items-center justify-center py-10 bg-muted/30 rounded-lg border border-dashed border-border">
              <div className="text-center">
                <Icon icon="solar:danger-triangle-linear" height={36} width={36} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Sin alertas</p>
                <p className="text-xs text-muted-foreground">Conecta la API para ver el stock crítico</p>
              </div>
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
        <div className="flex items-center justify-center py-10 bg-muted/30 rounded-lg border border-dashed border-border">
          <div className="text-center">
            <Icon icon="solar:list-check-linear" height={36} width={36} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Sin transacciones registradas</p>
            <p className="text-xs text-muted-foreground">Conecta la API para ver las últimas transacciones</p>
          </div>
        </div>
      </CardBox>
    </div>
  );
};

export default Admindash;
