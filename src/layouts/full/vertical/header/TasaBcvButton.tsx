import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { tasaBcvService, formatearTasa, formatearFechaHora } from 'src/api/services/empresaService';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';

const ahoraISO = () => new Date().toISOString().slice(0, 16);

const TasaBcvButton = () => {
  const [tasa, setTasa] = useState<number | null>(null);
  const [fechaHora, setFechaHora] = useState('');
  const [open, setOpen] = useState(false);
  const [valor, setValor] = useState('');
  const [fecha, setFecha] = useState(ahoraISO());
  const [error, setError] = useState('');
  const [g, setG] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const ultima = await tasaBcvService.ultima();
      if (ultima) {
        setTasa(ultima.tasa);
        setFechaHora(ultima.fechaHora);
      }
    } catch { /* */ }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // Escuchar actualizaciones desde otros componentes
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setTasa(detail.tasa);
        setFechaHora(detail.fechaHora);
      }
    };
    window.addEventListener('tasa-bcv-actualizada', handler);
    return () => window.removeEventListener('tasa-bcv-actualizada', handler);
  }, []);

  const guardar = async () => {
    const n = parseFloat(valor);
    if (!n || n <= 0) { setError('Ingresa una tasa válida (ej: 54.30).'); return; }
    try {
      setG(true); setError('');
      await tasaBcvService.registrar({ tasa: n, fechaHora: fecha });
      setOpen(false);
    } catch (e: any) { setError(e.message); }
    finally { setG(false); }
  };

  return (
    <>
      <button
        onClick={() => { setOpen(true); setFecha(ahoraISO()); setValor(tasa ? String(tasa) : ''); setError(''); }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm hover:bg-lightprimary dark:hover:bg-lightprimary transition-colors text-foreground dark:text-muted-foreground shrink-0"
        title={fechaHora ? `Tasa BCV: Bs. ${tasa?.toFixed(2)} (${formatearFechaHora(fechaHora)})` : 'Sin tasa registrada'}
      >
        <Icon icon="solar:dollar-minimalistic-linear" width={18} className="text-primary shrink-0" />
        <span className="font-mono font-medium text-xs whitespace-nowrap">{formatearTasa(tasa)}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Tasa BCV</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground mb-2">Registra la tasa actual. Puedes registrar varias al día.</p>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md mb-2">{error}</div>}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5"><Label>Fecha y hora</Label><Input type="datetime-local" value={fecha} onChange={e => setFecha(e.target.value)} /></div>
            <div className="flex flex-col gap-1.5"><Label>Bs. por USD</Label><Input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} placeholder="Ej: 54.30" /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={g}>Cancelar</Button>
            <Button onClick={guardar} disabled={g}>{g ? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TasaBcvButton;
