import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { empresaService } from 'src/api/services/empresaService';
import { paymentService } from 'src/api/services/paymentService';
import type { SuscripcionResponse } from 'src/types/empresa';
import CardBox from 'src/components/shared/CardBox';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { Icon } from '@iconify/react';
import { Upload, CheckCircle, Clock } from 'lucide-react';

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
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [comprobantes, setComprobantes] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const pagoRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    empresaService.obtenerSuscripcion().then(setSuscripcion).finally(() => setLoading(false));
    paymentService.obtenerQR().then(blob => { if (blob) setQrUrl(URL.createObjectURL(blob)); });
    paymentService.misComprobantes().then(setComprobantes).catch(() => {});
  }, []);

  const seleccionarPlan = (nombre: string) => {
    setPlanSeleccionado(nombre);
    setTimeout(() => pagoRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

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
                  onClick={() => seleccionarPlan(plan.nombre)}
                >
                  {planSeleccionado === plan.nombre ? 'Seleccionado' : `Migrar a ${plan.nombre}`}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Pago con Binance */}
      {planSeleccionado && (
        <div ref={pagoRef}>
          <CardBox className="shadow-none border-2 border-primary">
            <h3 className="text-lg font-semibold mb-4">Completar pago — Plan {planSeleccionado}</h3>

            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* QR */}
              <div className="flex flex-col items-center p-4 rounded-lg bg-white border min-w-[220px]">
                <p className="text-sm font-semibold mb-3">Binance Pay</p>
                {qrUrl ? (
                  <img src={qrUrl} alt="QR Binance" className="w-48 h-48 object-contain rounded-lg border" />
                ) : (
                  <div className="w-48 h-48 bg-muted/10 rounded-lg flex items-center justify-center border border-dashed">
                    <Icon icon="solar:qr-code-linear" width={64} className="text-muted-foreground/30" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2 text-center">Escanea con tu app de Binance</p>
              </div>

              {/* Instrucciones + upload */}
              <div className="flex-1 space-y-4">
                <div className="text-sm space-y-1 bg-muted/10 rounded-lg p-4">
                  <p className="font-semibold mb-2">Instrucciones:</p>
                  <p>1. Abre tu app de Binance</p>
                  <p>2. Escanea el código QR</p>
                  <p>3. Envía <strong>${planesDisponibles.find(p => p.nombre === planSeleccionado)?.precio}</strong> USD</p>
                  <p>4. Toma una captura del comprobante</p>
                  <p>5. Súbela aquí abajo</p>
                </div>

                <input ref={fileRef} type="file" accept="image/*" onChange={async (e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  setUploading(true);
                  try {
                    await paymentService.subirComprobante(f);
                    toast.success('Comprobante subido. Será revisado.');
                    paymentService.misComprobantes().then(setComprobantes).catch(() => {});
                  } catch (err: any) { toast.error(err.message); }
                  finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
                }} className="hidden" />
                <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full">
                  {uploading ? <Icon icon="svg-spinners:180-ring" width={16} className="mr-1 animate-spin" /> : <Upload className="size-4 mr-1" />}
                  {uploading ? 'Subiendo...' : 'Subir comprobante de pago'}
                </Button>

                {/* Historial */}
                {comprobantes.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground">Tus comprobantes:</p>
                    {comprobantes.slice(0, 3).map(c => (
                      <div key={c.comprobanteId} className="flex items-center justify-between text-xs p-2 rounded bg-muted/10">
                        <span className="truncate flex-1">{c.nombreArchivo}</span>
                        <Badge className={c.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' : c.estado === 'APROBADO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {c.estado}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardBox>
        </div>
      )}
    </div>
  );
};

export default PlanesPage;
