import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { paymentService } from 'src/api/services/paymentService';
import { empresaService } from 'src/api/services/empresaService';
import { Button } from 'src/components/ui/button';
import { Badge } from 'src/components/ui/badge';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { Upload, CheckCircle, Clock, QrCode } from 'lucide-react';

const PasarelaPagoPage = () => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [comprobantes, setComprobantes] = useState<any[]>([]);
  const [sub, setSub] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    paymentService.obtenerQR().then(blob => {
      if (blob) setQrUrl(URL.createObjectURL(blob));
    });
    empresaService.obtenerSuscripcion().then(setSub);
    paymentService.misComprobantes().then(setComprobantes);
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await paymentService.subirComprobante(file);
      toast.success('Comprobante subido');
      paymentService.misComprobantes().then(setComprobantes);
    } catch (err: any) { toast.error(err.message); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const estadoBadge = (e: string) => e === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' : e === 'APROBADO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-primary/10 shrink-0"><QrCode className="size-8 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Pasarela de Pago</h1>
          <p className="text-muted-foreground">Realiza tu pago mediante Binance y sube el comprobante</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* QR + Instrucciones */}
        <CardBox className="shadow-none border border-border text-center">
          <h3 className="text-base font-semibold mb-1">Escanear QR de Binance</h3>
          <p className="text-xs text-muted-foreground mb-4">Abre tu app de Binance, escanea y realiza el pago</p>
          {qrUrl ? (
            <img src={qrUrl} alt="QR Binance" className="mx-auto rounded-xl border max-w-[280px]" />
          ) : (
            <div className="flex items-center justify-center h-48 bg-muted/10 rounded-xl text-muted-foreground text-sm">
              QR no disponible
            </div>
          )}
          <div className="mt-4 text-sm text-left space-y-1 bg-muted/10 rounded-lg p-4">
            <p className="font-semibold mb-2">Instrucciones:</p>
            <p>1. Abre tu app de Binance</p>
            <p>2. Escanea el código QR</p>
            <p>3. Envía el monto correspondiente a tu plan</p>
            <p>4. Toma una captura de pantalla del comprobante</p>
            <p>5. Súbela aquí abajo</p>
          </div>
        </CardBox>

        {/* Subir comprobante + historial */}
        <div className="space-y-4">
          <CardBox className="shadow-none border border-border">
            <h3 className="text-base font-semibold mb-3">Subir comprobante</h3>
            {sub && (
              <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-muted/10">
                <div>
                  <p className="text-sm font-medium">Plan {sub.planNombre}</p>
                  <p className="text-xs text-muted-foreground">${sub.precioUsd}/mes · Vence: {sub.fechaVence}</p>
                </div>
                <Badge className={sub.estado === 'ACTIVA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{sub.estado}</Badge>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full">
              {uploading ? <Icon icon="svg-spinners:180-ring" width={16} className="mr-1 animate-spin" /> : <Upload className="size-4 mr-1" />}
              {uploading ? 'Subiendo...' : 'Subir comprobante de pago'}
            </Button>
          </CardBox>

          <CardBox className="shadow-none border border-border">
            <h3 className="text-base font-semibold mb-3">Historial de comprobantes</h3>
            {comprobantes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Sin comprobantes.</p>
            ) : (
              <div className="space-y-2">
                {comprobantes.map(c => (
                  <div key={c.comprobanteId} className="flex items-center justify-between p-3 rounded-lg bg-muted/10">
                    <div className="flex items-center gap-3">
                      {c.estado === 'PENDIENTE' ? <Clock className="size-5 text-yellow-500" /> : <CheckCircle className="size-5 text-green-500" />}
                      <div>
                        <p className="text-sm font-medium truncate">{c.nombreArchivo}</p>
                        <p className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('es-VE')}</p>
                      </div>
                    </div>
                    <Badge className={estadoBadge(c.estado)}>{c.estado}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardBox>
        </div>
      </div>
    </div>
  );
};

export default PasarelaPagoPage;
