import { useState } from 'react';
import { toast } from 'sonner';
import { contabilidadService } from 'src/api/services/contabilidadService';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';

const hoy = new Date().toISOString().slice(0, 10);
const inicioAnio = () => `${new Date().getFullYear()}-01-01`;

const CierrePeriodoPage = () => {
  const [desde, setDesde] = useState(inicioAnio);
  const [hasta, setHasta] = useState(hoy);

  const cerrar = async () => {
    if (!confirm(`¿Cerrar el período ${desde} a ${hasta}? Una vez cerrado, los asientos de este período no podrán modificarse.`)) return;
    try {
      await contabilidadService.cerrarPeriodo(desde, hasta);
      toast.success('Período cerrado exitosamente');
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-warning/10 shrink-0">
          <Icon icon="solar:lock-keyhole-bold" width={32} className="text-warning" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Cierre de Período</h1>
          <p className="text-muted-foreground">Bloquea asientos del período seleccionado</p>
        </div>
      </div>

      <CardBox className="shadow-none border-2 border-warning/20 max-w-lg mx-auto">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Icon icon="solar:danger-triangle-bold" width={20} className="text-warning" />
          Cierre de Período Contable
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Al cerrar un período, los asientos contables de ese rango de fechas no podrán modificarse.
          Esta acción es irreversible. Asegúrate de que toda la contabilidad esté correcta antes de continuar.
        </p>
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div className="flex flex-col gap-1.5"><Label className="text-xs">Desde</Label><Input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="h-9 w-40" /></div>
          <div className="flex flex-col gap-1.5"><Label className="text-xs">Hasta</Label><Input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="h-9 w-40" /></div>
        </div>
        <Button onClick={cerrar} variant="destructive" className="w-full">
          <Icon icon="solar:lock-keyhole-bold" width={18} className="mr-1" /> Cerrar Período
        </Button>
      </CardBox>
    </div>
  );
};

export default CierrePeriodoPage;
