import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { Link } from 'react-router';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import { Badge } from 'src/components/ui/badge';
import { useAuth } from 'src/context/AuthContext';
import { inventarioService } from 'src/api/services/inventarioService';
import { transaccionService } from 'src/api/services/transaccionService';
import { empresaService } from 'src/api/services/empresaService';
import { paymentService } from 'src/api/services/paymentService';
import type { ProductoResponse } from 'src/types/inventario';
import type { TransaccionResponse } from 'src/types/transaccion';
import type { SuscripcionResponse } from 'src/types/empresa';

interface Alerta {
  icon: string;
  bg: string;
  color: string;
  title: string;
  subtitle: string;
  url: string;
}

const Messages = () => {
  const { user } = useAuth();
  const base = `/${(user?.rol || 'ADMIN').toLowerCase()}`;
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  const cargar = async () => {
    const items: Alerta[] = [];

    // Cada llamada independiente — si una falla, las otras siguen
    const [criticos, porCobrar, porPagar, sub] = await Promise.allSettled([
      inventarioService.stockCritico(),
      transaccionService.cuentasPorCobrar(),
      transaccionService.cuentasPorPagar(),
      empresaService.obtenerSuscripcion(),
    ]);

    const c = criticos.status === 'fulfilled' ? criticos.value : [];
    const cob = porCobrar.status === 'fulfilled' ? porCobrar.value : [];
    const pag = porPagar.status === 'fulfilled' ? porPagar.value : [];
    const su = sub.status === 'fulfilled' ? sub.value : null;

    // Comprobantes de pago
    try {
      if (user?.rol === 'SUPER_ADMIN') {
        const stats = await paymentService.stats();
        if (stats.pendientes > 0) {
          items.push({ icon: 'solar:card-transfer-linear', bg: 'bg-blue-500/10', color: 'text-blue-500',
            title: 'Comprobantes pendientes', subtitle: `${stats.pendientes} comprobante(s) por revisar`, url: '/super-admin?tab=comprobantes' });
        }
      } else {
        const proofs = await paymentService.misComprobantes();
        proofs.filter((p: any) => p.estado === 'APROBADO' || p.estado === 'RECHAZADO').slice(0, 3).forEach((p: any) => {
          items.push({ icon: p.estado === 'APROBADO' ? 'solar:check-circle-bold' : 'solar:close-circle-bold',
            bg: p.estado === 'APROBADO' ? 'bg-green-500/10' : 'bg-red-500/10',
            color: p.estado === 'APROBADO' ? 'text-green-500' : 'text-red-500',
            title: `Pago ${p.estado === 'APROBADO' ? 'aprobado' : 'rechazado'}`,
            subtitle: `Tu comprobante fue ${p.estado === 'APROBADO' ? 'aprobado. ¡Plan actualizado!' : 'rechazado. Contacta soporte.'}`,
            url: '/admin/planes' });
        });
      }
    } catch { /* sin acceso */ }

    // Stock crítico
    c.forEach(p => {
          if (p.stockActual <= 0) {
            items.push({ icon: 'solar:danger-triangle-bold', bg: 'bg-red-500/10', color: 'text-red-500', title: 'Producto agotado', subtitle: `${p.nombre} — stock en cero`, url: `${base}/inventario/alertas` });
          } else {
            items.push({ icon: 'solar:danger-triangle-bold', bg: 'bg-yellow-500/10', color: 'text-yellow-600', title: 'Stock bajo', subtitle: `${p.nombre} — ${p.stockActual} unidad(es)`, url: `${base}/inventario/alertas` });
          }
        });
    cob.forEach(t => {
          const dias = Math.floor((Date.now() - new Date(t.fecha).getTime()) / 86400000);
          if (dias > 15) {
            items.push({ icon: 'solar:hand-money-linear', bg: 'bg-orange-500/10', color: 'text-orange-500', title: 'Cobranza vencida', subtitle: `${t.clienteNombre} — $${t.saldoPendiente.toFixed(2)} · ${dias} días`, url: `${base}/por-cobrar` });
          }
        });
    pag.forEach(t => {
          const dias = Math.floor((Date.now() - new Date(t.fecha).getTime()) / 86400000);
          if (dias > 15) {
            items.push({ icon: 'solar:wallet-money-linear', bg: 'bg-red-500/10', color: 'text-red-500', title: 'Pago vencido', subtitle: `${t.proveedorNombre} — $${t.saldoPendiente.toFixed(2)} · ${dias} días`, url: `${base}/por-pagar` });
          }
        });
    if (su) {
          const diasSub = Math.ceil((new Date(su.fechaVence).getTime() - Date.now()) / 86400000);
          if (diasSub <= 7 && diasSub > 0) {
            items.push({ icon: 'solar:star-bold', bg: 'bg-yellow-500/10', color: 'text-yellow-600', title: 'Suscripción por vencer', subtitle: `Plan ${su.planNombre} — ${diasSub} día(s) restante(s)`, url: `${base}/mi-empresa` });
          } else if (diasSub <= 0) {
            items.push({ icon: 'solar:danger-triangle-bold', bg: 'bg-red-500/10', color: 'text-red-500', title: 'Suscripción vencida', subtitle: `Plan ${su.planNombre} — renueva para continuar`, url: `${base}/mi-empresa` });
          }
        }
    setAlertas(items);
    };

    useEffect(() => { cargar(); }, []); // eslint-disable-line

  const count = alertas.length;

  return (
    <div className="relative group/menu px-4 sm:px-15">
      <DropdownMenu onOpenChange={(open) => { if (open) cargar(); }}>
        <DropdownMenuTrigger asChild>
          <div className="relative">
            <span className="relative after:absolute after:w-10 after:h-10 after:rounded-full hover:text-primary after:-top-1/2 hover:after:bg-lightprimary text-foreground dark:text-muted-foreground rounded-full flex justify-center items-center cursor-pointer group-hover/menu:after:bg-lightprimary group-hover/menu:!text-primary">
              <Icon icon="tabler:bell-ringing" height={20} />
            </span>
            {count > 0 && (
              <span className="rounded-full absolute -end-[6px] -top-[5px] text-[10px] h-4 w-4 bg-destructive text-white flex justify-center items-center font-bold">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-screen sm:w-[340px] py-4 rounded-lg border border-ld">
          <div className="flex items-center px-6 justify-between">
            <h3 className="mb-0 text-lg font-semibold text-ld">Notificaciones</h3>
            {count > 0 && <Badge className="bg-destructive/10 text-destructive text-xs">{count} alerta{count !== 1 ? 's' : ''}</Badge>}
          </div>

          {count === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-muted-foreground">
              <Icon icon="solar:bell-bing-linear" width={40} className="mb-2 text-muted-foreground/40" />
              <p className="text-sm">Todo está al día</p>
              <p className="text-xs">No hay alertas pendientes</p>
            </div>
          ) : (
            <SimpleBar className="max-h-80 mt-3">
              {alertas.map((a, i) => (
                <DropdownMenuItem className="px-6 py-3 flex justify-between items-center bg-hover group/link w-full cursor-pointer" key={i}>
                  <Link to={a.url} className="flex items-center w-full">
                    <span className={`shrink-0 p-2.5 rounded-lg ${a.bg}`}>
                      <Icon icon={a.icon} width={18} className={a.color} />
                    </span>
                    <div className="ps-3 min-w-0">
                      <h5 className="mb-0.5 text-sm group-hover/link:text-primary font-medium">{a.title}</h5>
                      <span className="text-xs block truncate text-muted-foreground">{a.subtitle}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </SimpleBar>
          )}

          {count > 0 && (
            <div className="pt-4 px-6">
              <Link to={`${base}/inventario/alertas`}>
                <Badge variant="outline" className="w-full justify-center py-2 cursor-pointer hover:bg-muted">
                  Ver todas las alertas
                </Badge>
              </Link>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Messages;
