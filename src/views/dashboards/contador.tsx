import ProfileWelcome from 'src/components/dashboards/modern/ProfileWelcome';
import { ResumenCards, type ResumenCardData } from 'src/components/dashboards/gescom/ResumenCards';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { Link } from 'react-router';

const Contadordash = () => {
  const resumenMes: ResumenCardData[] = [
    { key: 'ingresos-mes', titulo: 'Ingresos del mes', valor: '--', moneda: 'USD', icono: 'solar:graph-up-linear', color: 'text-primary', bgColor: 'bg-primary/10' },
    { key: 'gastos-mes', titulo: 'Gastos del mes', valor: '--', moneda: 'USD', icono: 'solar:graph-down-linear', color: 'text-destructive', bgColor: 'bg-destructive/10' },
    { key: 'utilidad-mes', titulo: 'Utilidad neta', valor: '--', moneda: 'USD', icono: 'solar:dollar-linear', color: 'text-success', bgColor: 'bg-success/10' },
    { key: 'transacciones-mes', titulo: 'Transacciones', valor: '--', icono: 'solar:list-check-linear', color: 'text-secondary', bgColor: 'bg-secondary/10' },
  ];

  const pendientes: ResumenCardData[] = [
    { key: 'por-cobrar', titulo: 'Cuentas por cobrar', valor: '--', moneda: 'USD', icono: 'solar:hand-money-linear', color: 'text-warning', bgColor: 'bg-warning/10' },
    { key: 'por-pagar', titulo: 'Cuentas por pagar', valor: '--', moneda: 'USD', icono: 'solar:wallet-money-linear', color: 'text-destructive', bgColor: 'bg-destructive/10' },
  ];

  return (
    <div className="space-y-6">
      <ProfileWelcome />

      {/* Resumen del mes — RF-74 */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Resumen del mes</h2>
        <ResumenCards data={resumenMes} />
      </div>

      {/* Cuentas pendientes */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Cuentas pendientes</h2>
        <ResumenCards data={pendientes} columns={2} />
      </div>

      {/* Ingresos vs Gastos — RF-76 */}
      <div className="grid grid-cols-12 gap-6">
        <div className="lg:col-span-8 col-span-12">
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

        {/* Accesos rápidos contables */}
        <div className="lg:col-span-4 col-span-12">
          <CardBox className="shadow-none border border-border h-full">
            <h3 className="text-base font-semibold mb-4">Accesos rápidos</h3>
            <div className="flex flex-col gap-2">
              <Link to="/contador/asientos-contables" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <Icon icon="solar:book-2-broken" height={20} width={20} className="text-primary" />
                <span className="text-sm">Asientos Contables</span>
              </Link>
              <Link to="/contador/reportes-financieros" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <Icon icon="solar:chart-2-bold" height={20} width={20} className="text-primary" />
                <span className="text-sm">Reportes Financieros</span>
              </Link>
              <Link to="/contador/gestion-documental" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <Icon icon="solar:folder-with-files-linear" height={20} width={20} className="text-primary" />
                <span className="text-sm">Gestión Documental</span>
              </Link>
            </div>
          </CardBox>
        </div>
      </div>

      {/* Asientos recientes — RF-49 */}
      <CardBox className="shadow-none border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Asientos recientes</h3>
          <Link to="/contador/asientos-contables" className="text-sm text-primary hover:underline">Ver libro diario</Link>
        </div>
        <div className="flex items-center justify-center py-10 bg-muted/30 rounded-lg border border-dashed border-border">
          <div className="text-center">
            <Icon icon="solar:book-open-linear" height={36} width={36} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Sin asientos registrados</p>
            <p className="text-xs text-muted-foreground">Conecta la API para ver el libro diario</p>
          </div>
        </div>
      </CardBox>
    </div>
  );
};

export default Contadordash;
