import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { empresaService } from 'src/api/services/empresaService';
import { paymentService } from 'src/api/services/paymentService';
import type { SuscripcionResponse } from 'src/types/empresa';
import CardBox from 'src/components/shared/CardBox';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { Icon } from '@iconify/react';
import { Upload } from 'lucide-react';

const planesDisponibles = [
  {
    nombre: 'Emprendedor',
    precio: 8,
    color: 'border-primary',
    badge: 'Más popular',
    badgeColor: 'bg-primary text-white',
    desc: 'Vendedores de Instagram, puestos de comida, freelancers.',
    features: ['Transacciones limitadas', 'Bóveda: 50 fotos / mes', 'Usuario: 3', 'Reporte PDF mensual', 'Multimoneda BCV', 'Inventario', 'Soporte por WhatsApp'],
  },
  {
    nombre: 'Empresa',
    precio: 20,
    color: 'border-border',
    badge: 'Premium',
    badgeColor: 'bg-secondary text-white',
    desc: 'Bodegones, farmacias, talleres, ferreterías.',
    features: ['Transacciones ilimitadas', 'Bóveda ilimitada','Usuario: ilimitados', 'Gestión de nómina', 'Todos los reportes PDF', 'Multimoneda BCV', 'Control de inventario', 'Cuentas por cobrar y pagar', 'Conciliación bancaria', 'Módulo contable', 'Soporte por WhatsApp'],
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
        <h1 className="text-3xl font-bold">Planes y suscripción</h1>
        <p className="text-lg text-muted-foreground">Elige el plan que mejor se adapte a tu negocio</p>
      </div>

      {/* Plan actual */}
      {suscripcion && (
        <CardBox className="shadow-none border border-border bg-gradient-to-r from-secondary/5 to-transparent">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-full bg-secondary/10"><Icon icon="solar:star-bold" width={36} className="text-secondary" /></div>
            <div>
              <p className="text-base text-muted-foreground">Plan actual</p>
              <p className="text-2xl font-bold">{suscripcion.planNombre} <span className="text-lg font-normal text-muted-foreground">${suscripcion.precioUsd}/mes</span></p>
              <p className="text-sm text-muted-foreground">Vence: {new Date(suscripcion.fechaVence).toLocaleDateString('es-VE')}</p>
            </div>
            <Badge className="bg-green-100 text-green-700 ml-auto text-base px-4 py-2">{suscripcion.estado}</Badge>
          </div>
        </CardBox>
      )}

      {/* Planes disponibles */}
      <div className="grid md:grid-cols-2 gap-8">
          {planesDisponibles.map(plan => {
            const esActual = plan.nombre.toUpperCase() === planActual.toUpperCase();
            return (
              <div key={plan.nombre} className={`relative rounded-2xl border-2 ${esActual ? 'border-primary' : plan.color} bg-background p-8 flex flex-col`}>
                <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold w-fit mb-5 ${esActual ? 'bg-primary text-white' : plan.badgeColor}`}>
                  {esActual ? 'Plan actual' : plan.badge}
                </span>
                <h3 className="text-2xl font-bold">{plan.nombre}</h3>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-extrabold">${plan.precio}</span>
                  <span className="text-muted-foreground text-lg"> / mes</span>
                </div>
                <p className="text-base text-muted-foreground mt-3 mb-6">{plan.desc}</p>
                <ul className="space-y-3 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-3 text-base">
                      <Icon icon="solar:check-circle-bold" width={18} className="text-success shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>

                {esActual ? (
                  <Button disabled className="mt-8 w-full text-base py-6">Plan actual</Button>
                ) : (
                  <Button
                    className="mt-8 w-full text-base py-6"
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
            <h3 className="text-xl font-bold mb-4">Completar pago — Plan {planSeleccionado}</h3>

            <div className="flex flex-col md:flex-row items-start gap-10">
              {/* QR */}
              <div className="flex flex-col items-center p-6 rounded-lg bg-muted/10 border border-border min-w-[300px]">
                <p className="text-lg font-bold mb-4">Binance Pay</p>
                {qrUrl ? (
                  <img src={qrUrl} alt="QR Binance" className="w-80 h-80 object-contain rounded-xl" />
                ) : (
                  <div className="w-80 h-80 bg-background rounded-xl flex items-center justify-center border border-dashed border-border">
                    <Icon icon="solar:qr-code-linear" width={80} className="text-muted-foreground/20" />
                  </div>
                )}
                <p className="text-base text-muted-foreground mt-4 text-center">Escanea con tu app de Binance</p>
              </div>

              {/* Instrucciones + upload */}
              <div className="flex-1 space-y-5">
                <div className="text-base space-y-2 bg-muted/10 rounded-lg p-5">
                  <p className="font-bold mb-2 text-lg">Instrucciones:</p>
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
                    await paymentService.subirComprobante(f, planSeleccionado);
                    toast.success('Comprobante subido. Será revisado.');
                    paymentService.misComprobantes().then(setComprobantes).catch(() => {});
                  } catch (err: any) { toast.error(err.message); }
                  finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
                }} className="hidden" />
                <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full text-base py-6">
                  {uploading ? <Icon icon="svg-spinners:180-ring" width={18} className="mr-2 animate-spin" /> : <Upload className="size-5 mr-2" />}
                  {uploading ? 'Subiendo...' : 'Subir comprobante de pago'}
                </Button>

                {/* Historial */}
                {comprobantes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Tus comprobantes:</p>
                    {comprobantes.slice(0, 3).map(c => (
                      <div key={c.comprobanteId} className="flex items-center justify-between text-sm p-3 rounded bg-muted/10">
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
