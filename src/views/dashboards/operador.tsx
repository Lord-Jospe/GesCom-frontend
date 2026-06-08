import ProfileWelcome from 'src/components/dashboards/modern/ProfileWelcome';
import { ResumenCards, type ResumenCardData } from 'src/components/dashboards/gescom/ResumenCards';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { Link } from 'react-router';

const Operadordash = () => {
  const resumenDia: ResumenCardData[] = [
    { key: 'ventas-dia', titulo: 'Ventas del día', valor: '--', moneda: 'USD', icono: 'solar:cart-check-linear', color: 'text-primary', bgColor: 'bg-primary/10' },
    { key: 'gastos-dia', titulo: 'Gastos del día', valor: '--', moneda: 'USD', icono: 'solar:arrow-down-linear', color: 'text-destructive', bgColor: 'bg-destructive/10' },
    { key: 'transacciones-dia', titulo: 'Registros hoy', valor: '--', icono: 'solar:list-check-linear', color: 'text-secondary', bgColor: 'bg-secondary/10' },
  ];

  return (
    <div className="space-y-6">
      <ProfileWelcome />

      {/* Acciones rápidas */}
      <div className="grid grid-cols-12 gap-4">
        <div className="lg:col-span-6 col-span-12">
          <Link to="/operador/caja-facturacion">
            <CardBox className="shadow-none border border-border hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-success/10">
                  <Icon icon="solar:cart-plus-linear" height={28} width={28} className="text-success" />
                </div>
                <div>
                  <h4 className="text-base font-semibold">Registrar venta</h4>
                  <p className="text-sm text-muted-foreground">Nueva transacción de ingreso</p>
                </div>
              </div>
            </CardBox>
          </Link>
        </div>
        <div className="lg:col-span-6 col-span-12">
          <Link to="/operador/caja-facturacion">
            <CardBox className="shadow-none border border-border hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-destructive/10">
                  <Icon icon="solar:arrow-down-linear" height={28} width={28} className="text-destructive" />
                </div>
                <div>
                  <h4 className="text-base font-semibold">Registrar gasto</h4>
                  <p className="text-sm text-muted-foreground">Nueva transacción de egreso</p>
                </div>
              </div>
            </CardBox>
          </Link>
        </div>
      </div>

      {/* Resumen del día — RF-73 */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Resumen del día</h2>
        <ResumenCards data={resumenDia} columns={3} />
      </div>

      {/* Últimas transacciones del día */}
      <CardBox className="shadow-none border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Últimas transacciones hoy</h3>
          <Link to="/operador/caja-facturacion" className="text-sm text-primary hover:underline">Ver todas</Link>
        </div>
        <div className="flex items-center justify-center py-10 bg-muted/30 rounded-lg border border-dashed border-border">
          <div className="text-center">
            <Icon icon="solar:list-check-linear" height={36} width={36} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Sin transacciones hoy</p>
            <p className="text-xs text-muted-foreground">Registra una venta o gasto para empezar</p>
          </div>
        </div>
      </CardBox>

      {/* Alertas de stock bajo — RF-42/43 */}
      <CardBox className="shadow-none border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Alertas de inventario</h3>
          <Link to="/operador/inventario" className="text-sm text-primary hover:underline">Ver inventario</Link>
        </div>
        <div className="flex items-center justify-center py-10 bg-muted/30 rounded-lg border border-dashed border-border">
          <div className="text-center">
            <Icon icon="solar:box-linear" height={36} width={36} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Sin alertas de stock</p>
            <p className="text-xs text-muted-foreground">Conecta la API para ver las alertas</p>
          </div>
        </div>
      </CardBox>
    </div>
  );
};

export default Operadordash;
