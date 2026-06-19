import { useState } from 'react';
import { contabilidadService } from 'src/api/services/contabilidadService';
import type { EstadoResultadosResponse } from 'src/types/contabilidad';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { FileDown } from 'lucide-react';
import { exportarExcel } from 'src/lib/exportUtils';

const hoy = new Date().toISOString().slice(0, 10);
const inicioAnio = () => `${new Date().getFullYear()}-01-01`;

const EstadoResultadosPage = () => {
  const [desde, setDesde] = useState(inicioAnio);
  const [hasta, setHasta] = useState(hoy);
  const [data, setData] = useState<EstadoResultadosResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const generar = async () => {
    setLoading(true);
    try { setData(await contabilidadService.estadoResultados(desde, hasta)); } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-success/10 shrink-0">
          <Icon icon="solar:graph-up-bold" width={32} className="text-success" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Estado de Resultados</h1>
          <p className="text-muted-foreground">Ingresos, gastos y utilidad neta</p>
        </div>
      </div>

      <CardBox className="shadow-none border border-border">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5"><Label className="text-xs">Desde</Label><Input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="h-9 w-40" /></div>
          <div className="flex flex-col gap-1.5"><Label className="text-xs">Hasta</Label><Input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="h-9 w-40" /></div>
          <Button onClick={generar} disabled={loading} className="h-9">
            {loading ? <Icon icon="svg-spinners:180-ring" width={16} className="mr-1 animate-spin" /> : <Icon icon="solar:filter-linear" width={16} className="mr-1" />}
            Generar
          </Button>
          {data && (
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={() => exportarExcel([{ Concepto: 'Ingresos', Monto: data.totalIngresos }, { Concepto: 'Gastos', Monto: data.totalGastos }, { Concepto: 'Utilidad Neta', Monto: data.utilidadNeta }], 'estado-resultados')}>
                <FileDown className="size-3.5 mr-1" /> Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => contabilidadService.descargarPDF(`/reports/income-statement?desde=${desde}&hasta=${hasta}`)}>
                <FileDown className="size-3.5 mr-1" /> PDF
              </Button>
            </div>
          )}
        </div>
      </CardBox>

      {data && (
        <div className="space-y-6">
          <CardBox className="shadow-none border-2 border-success/20 max-w-md mx-auto">
            <h3 className="text-lg font-bold mb-4 text-center">Estado de Resultados</h3>
            <p className="text-xs text-muted-foreground text-center mb-4">{data.fechaInicio} → {data.fechaFin}</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2"><span className="text-muted-foreground">Total Ingresos</span><span className="font-mono font-bold text-success">$ {data.totalIngresos.toFixed(2)}</span></div>
              <div className="flex justify-between py-2 border-t"><span className="text-muted-foreground">Total Gastos</span><span className="font-mono font-bold text-destructive">$ {data.totalGastos.toFixed(2)}</span></div>
              <div className="flex justify-between py-3 border-t-2 text-base"><span className="font-bold">Utilidad Neta</span><span className={`font-mono font-bold ${data.utilidadNeta >= 0 ? 'text-success' : 'text-destructive'}`}>$ {data.utilidadNeta.toFixed(2)}</span></div>
            </div>
          </CardBox>

          {data.detalle && data.detalle.length > 0 && (
            <CardBox className="shadow-none border border-border p-0! overflow-hidden max-w-lg mx-auto">
              <div className="px-4 py-3 bg-muted/20 border-b">
                <h3 className="font-semibold">Desglose por cuenta</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-muted/10"><tr>
                  <th className="text-left px-4 py-2 font-semibold">Cuenta</th>
                  <th className="text-center px-4 py-2 font-semibold w-20">Tipo</th>
                  <th className="text-right px-4 py-2 font-semibold w-32">Monto</th>
                </tr></thead>
                <tbody>
                  {data.detalle.map((d, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-2"><span className="font-mono text-xs text-muted-foreground">{d.cuentaCodigo}</span> <span>{d.cuentaNombre}</span></td>
                      <td className="px-4 py-2 text-center"><span className={`text-xs font-medium ${d.tipo === 'INGRESO' ? 'text-success' : 'text-destructive'}`}>{d.tipo === 'INGRESO' ? 'Ingreso' : 'Gasto'}</span></td>
                      <td className="px-4 py-2 text-right font-mono">$ {d.monto.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBox>
          )}
        </div>
      )}
    </div>
  );
};

export default EstadoResultadosPage;
