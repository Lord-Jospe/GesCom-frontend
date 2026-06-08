import { useEffect, useState } from 'react';
import { empresaService } from 'src/api/services/empresaService';
import type { SuscripcionResponse } from 'src/types/empresa';
import CardBox from 'src/components/shared/CardBox';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { Icon } from '@iconify/react';

const planesDisponibles = [
  {
    nombre: 'Semilla',
    precio: 0,
    color: 'border-border',
    badge: 'Actual',
    badgeColor: 'bg-muted text-muted-foreground',
    desc: 'Para estudiantes y emprendedores que facturan menos de $100/mes.',
    features: ['Hasta 15 transacciones / mes', 'Solo texto (sin fotos)', 'Reportes en pantalla', 'Sin multimoneda'],
  },
  {
    nombre: 'Emprendedor',
    precio: 8,
    color: 'border-primary',
    badge: 'Más popular',
    badgeColor: 'bg-primary text-white',
    desc: 'Vendedores de Instagram, puestos de comida, freelancers.',
    features: ['Transacciones ilimitadas', 'Bóveda: 50 fotos / mes', 'Reporte PDF mensual', 'Multimoneda BCV', 'Soporte por WhatsApp'],
  },
  {
    nombre: 'Empresa',
    precio: 20,
    color: 'border-border',
    badge: 'Premium',
    badgeColor: 'bg-secondary text-white',
    desc: 'Bodegones, farmacias, talleres, ferreterías.',
    features: ['Transacciones ilimitadas', 'Bóveda ilimitada', 'Todos los reportes PDF', 'Multimoneda BCV', 'Control de inventario', 'Cuentas por cobrar', 'Soporte por WhatsApp'],
  },
];

const PlanesPage = () => {
  const [suscripcion, setSuscripcion] = useState<SuscripcionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [planSeleccionado, setPlanSeleccionado] = useState<string | null>(null);

  useEffect(() => {
    empresaService.obtenerSuscripcion().then(setSuscripcion).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" /></div>;

  const planActual = suscripcion?.planNombre || 'Semilla';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Planes y suscripción</h1>
        <p className="text-muted-foreground">Elige el plan que mejor se adapte a tu negocio</p>
      </div>

      {/* Plan actual */}
      {suscripcion && (
        <CardBox className="shadow-none border border-border bg-gradient-to-r from-secondary/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-secondary/10"><Icon icon="solar:star-bold" width={28} className="text-secondary" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Plan actual</p>
              <p className="text-xl font-bold">{suscripcion.planNombre} <span className="text-base font-normal text-muted-foreground">${suscripcion.precioUsd}/mes</span></p>
              <p className="text-xs text-muted-foreground">Vence: {new Date(suscripcion.fechaVence).toLocaleDateString('es-VE')}</p>
            </div>
            <Badge className="bg-green-100 text-green-700 ml-auto">{suscripcion.estado}</Badge>
          </div>
        </CardBox>
      )}

      {/* Planes */}
      <div className="grid md:grid-cols-3 gap-6">
        {planesDisponibles.map(plan => {
          const esActual = plan.nombre === planActual;
          return (
            <div key={plan.nombre} className={`relative rounded-2xl border-2 ${esActual ? 'border-primary' : plan.color} bg-white dark:bg-dark p-6 flex flex-col`}>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold w-fit mb-4 ${esActual ? 'bg-primary text-white' : plan.badgeColor}`}>
                {esActual ? 'Plan actual' : plan.badge}
              </span>
              <h3 className="text-xl font-bold text-foreground">{plan.nombre}</h3>
              <div className="mt-3 mb-1">
                <span className="text-3xl font-extrabold">${plan.precio}</span>
                <span className="text-muted-foreground text-sm"> / mes</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 mb-6">{plan.desc}</p>
              <ul className="space-y-3 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Icon icon="solar:check-circle-bold" width={16} className="text-success shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>

              {esActual ? (
                <Button disabled className="mt-6 w-full">Plan actual</Button>
              ) : (
                <Button
                  className="mt-6 w-full"
                  variant={plan.nombre === 'Emprendedor' ? 'default' : 'outline'}
                  onClick={() => setPlanSeleccionado(plan.nombre)}
                >
                  {planSeleccionado === plan.nombre ? 'Seleccionado' : `Migrar a ${plan.nombre}`}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Pago con Binance Pay */}
      {planSeleccionado && (
        <CardBox className="shadow-none border-2 border-primary">
          <h3 className="text-lg font-semibold mb-4">Completar pago — Plan {planSeleccionado}</h3>
          <p className="text-sm text-muted-foreground mb-6">Escanea el código QR con tu app de Binance para completar la migración.</p>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center p-4 rounded-lg bg-muted/20 border border-dashed border-border min-w-[200px]">
              <Icon icon="solar:qr-code-linear" width={48} className="text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Binance Pay</p>
              <div className="w-44 h-44 bg-white rounded-lg mt-3 flex items-center justify-center border">
                <Icon icon="solar:qr-code-linear" width={80} className="text-muted-foreground/40" />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">QR se generará al integrar la API de Binance</p>
            </div>

            <div className="flex-1 space-y-2 text-sm">
              <p className="text-muted-foreground">Una vez realizado el pago, tu plan se actualizará automáticamente.</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>· Recibirás un comprobante por correo</li>
                <li>· La factura estará disponible en tu bóveda digital</li>
                <li>· El cambio de plan aplica de inmediato</li>
              </ul>
            </div>
          </div>
        </CardBox>
      )}
    </div>
  );
};

export default PlanesPage;
