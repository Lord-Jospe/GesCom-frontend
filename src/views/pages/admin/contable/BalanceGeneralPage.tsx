import { useState } from 'react';
import { contabilidadService } from 'src/api/services/contabilidadService';
import type { BalanceGeneralResponse } from 'src/types/contabilidad';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { FileDown } from 'lucide-react';
import { exportarExcel } from 'src/lib/exportUtils';

const hoy = new Date().toISOString().slice(0, 10);

const BalanceGeneralPage = () => {
  const [fecha, setFecha] = useState(hoy);
  const [data, setData] = useState<BalanceGeneralResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const generar = async () => {
    setLoading(true);
    try { setData(await contabilidadService.balanceGeneral(fecha)); } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-purple-500/10 shrink-0">
          <Icon icon="solar:scales-linear" width={32} className="text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Balance General</h1>
          <p className="text-muted-foreground">Activos = Pasivos + Patrimonio</p>
        </div>
      </div>

      <CardBox className="shadow-none border border-border">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5"><Label className="text-xs">Fecha</Label><Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="h-9 w-40" /></div>
          <Button onClick={generar} disabled={loading} className="h-9">
            {loading ? <Icon icon="svg-spinners:180-ring" width={16} className="mr-1 animate-spin" /> : <Icon icon="solar:filter-linear" width={16} className="mr-1" />}
            Generar
          </Button>
          {data && (
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={() => exportarExcel([{ Concepto: 'Activos', Monto: data.totalActivos }, { Concepto: 'Pasivos', Monto: data.totalPasivos }, { Concepto: 'Patrimonio', Monto: data.totalPatrimonio }], 'balance-general')}>
                <FileDown className="size-3.5 mr-1" /> Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => contabilidadService.descargarPDF(`/reports/balance-sheet?fecha=${fecha}`)}>
                <FileDown className="size-3.5 mr-1" /> PDF
              </Button>
            </div>
          )}
        </div>
      </CardBox>

      {data && (
        <CardBox className="shadow-none border-2 border-purple-500/20 bg-gradient-to-b from-purple-500/[0.03] to-transparent max-w-md mx-auto">
          <h3 className="text-lg font-bold mb-4 text-center">Balance General</h3>
          <p className="text-xs text-muted-foreground text-center mb-4">Al {data.fecha}</p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-3 bg-emerald-500/10 rounded-lg px-3"><span className="font-semibold">Total Activos</span><span className="font-mono font-bold text-emerald-400">$ {data.totalActivos.toFixed(2)}</span></div>
            <div className="flex justify-between py-3 bg-red-500/10 rounded-lg px-3"><span className="font-semibold">Total Pasivos</span><span className="font-mono font-bold text-red-400">$ {data.totalPasivos.toFixed(2)}</span></div>
            <div className="flex justify-between py-3 bg-purple-500/10 rounded-lg px-3"><span className="font-semibold">Total Patrimonio</span><span className="font-mono font-bold text-purple-400">$ {data.totalPatrimonio.toFixed(2)}</span></div>
            <div className="border-t-2 pt-3 flex justify-between"><span className="font-bold">Pasivo + Patrimonio</span><span className="font-mono font-bold">$ {(data.totalPasivos + data.totalPatrimonio).toFixed(2)}</span></div>
            <div className={`text-center text-sm font-bold py-2 rounded-lg ${data.cuadrado ? 'bg-success/10 text-success' : 'bg-red-500/10 text-red-400'}`}>
              {data.cuadrado ? '✅ Activos = Pasivos + Patrimonio' : '⚠️ Balance descuadrado'}
            </div>
          </div>
        </CardBox>
      )}
    </div>
  );
};

export default BalanceGeneralPage;
