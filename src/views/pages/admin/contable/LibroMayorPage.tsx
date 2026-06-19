import { useEffect, useState } from 'react';
import { contabilidadService } from 'src/api/services/contabilidadService';
import type { PlanCuentaResponse, LibroMayorResponse } from 'src/types/contabilidad';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { FileDown } from 'lucide-react';
import { exportarExcel } from 'src/lib/exportUtils';

const hoy = new Date().toISOString().slice(0, 10);
const inicioMes = () => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); };

const LibroMayorPage = () => {
  const [cuentas, setCuentas] = useState<PlanCuentaResponse[]>([]);
  const [cuentaId, setCuentaId] = useState<number>(0);
  const [desde, setDesde] = useState(inicioMes);
  const [hasta, setHasta] = useState(hoy);
  const [libroMayor, setLibroMayor] = useState<LibroMayorResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { contabilidadService.obtenerPlanCuentas().then(setCuentas).catch(() => {}); }, []);

  const consultar = async () => {
    if (!cuentaId) return;
    setLoading(true);
    try { setLibroMayor(await contabilidadService.libroMayor(cuentaId, desde, hasta)); } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-info/10 shrink-0">
          <Icon icon="solar:book-bookmark-bold" width={32} className="text-info" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Libro Mayor</h1>
          <p className="text-muted-foreground">Movimientos por cuenta contable</p>
        </div>
      </div>

      <CardBox className="shadow-none border border-border">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Cuenta</Label>
            <Select value={cuentaId ? String(cuentaId) : ''} onValueChange={v => setCuentaId(Number(v))}>
              <SelectTrigger className="w-64 h-9"><SelectValue placeholder="Seleccionar cuenta..." /></SelectTrigger>
              <SelectContent>
                {cuentas.filter(c => c.activo).map(c => (
                  <SelectItem key={c.cuentaId} value={String(c.cuentaId)}>{c.codigo} — {c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5"><Label className="text-xs">Desde</Label><Input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="h-9 w-40" /></div>
          <div className="flex flex-col gap-1.5"><Label className="text-xs">Hasta</Label><Input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="h-9 w-40" /></div>
          <Button onClick={consultar} disabled={!cuentaId || loading} className="h-9">
            {loading ? <Icon icon="svg-spinners:180-ring" width={16} className="mr-1 animate-spin" /> : <Icon icon="solar:filter-linear" width={16} className="mr-1" />}
            Consultar
          </Button>
          {libroMayor && (
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={() => exportarExcel(libroMayor.movimientos.map(m => ({ Cuenta: m.cuentaCodigo, Nombre: m.cuentaNombre, Débito: m.esDebito ? m.monto.toFixed(2) : '', Crédito: !m.esDebito ? m.monto.toFixed(2) : '' })), 'libro-mayor')}>
                <FileDown className="size-3.5 mr-1" /> Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => contabilidadService.descargarPDF(`/reports/ledger/${cuentaId}?desde=${desde}&hasta=${hasta}`)}>
                <FileDown className="size-3.5 mr-1" /> PDF
              </Button>
            </div>
          )}
        </div>
      </CardBox>

      {libroMayor && (
        <CardBox className="shadow-none border border-border p-0! overflow-hidden">
          <div className="p-4 bg-muted/20 border-b grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><span className="text-muted-foreground">Cuenta:</span> <strong>{libroMayor.cuentaCodigo} — {libroMayor.cuentaNombre}</strong></div>
            <div><span className="text-muted-foreground">Tipo:</span> <strong>{libroMayor.tipoCuenta}</strong></div>
            <div className="text-right"><span className="text-muted-foreground">Saldo Inicial:</span> <span className="font-mono font-bold">$ {libroMayor.saldoInicial.toFixed(2)}</span></div>
            <div className="text-right"><span className="text-muted-foreground">Saldo Final:</span> <span className={`font-mono font-bold text-lg ${libroMayor.saldoFinal >= 0 ? 'text-success' : 'text-destructive'}`}>$ {libroMayor.saldoFinal.toFixed(2)}</span></div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/30"><tr><th className="text-left px-4 py-2.5 font-semibold">Cuenta</th><th className="text-right px-4 py-2.5 font-semibold w-28">Débito</th><th className="text-right px-4 py-2.5 font-semibold w-28">Crédito</th></tr></thead>
            <tbody>
              {libroMayor.movimientos.map((m, i) => (
                <tr key={i} className="border-t"><td className="px-4 py-2"><span className="font-mono text-xs text-muted-foreground">{m.cuentaCodigo}</span><span className="ml-2">{m.cuentaNombre}</span></td><td className="px-4 py-2 text-right font-mono">{m.esDebito ? `$ ${m.monto.toFixed(2)}` : ''}</td><td className="px-4 py-2 text-right font-mono">{!m.esDebito ? `$ ${m.monto.toFixed(2)}` : ''}</td></tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/20 font-semibold border-t-2"><tr><td className="px-4 py-2">Totales</td><td className="px-4 py-2 text-right font-mono">$ {libroMayor.totalDebitos.toFixed(2)}</td><td className="px-4 py-2 text-right font-mono">$ {libroMayor.totalCreditos.toFixed(2)}</td></tr></tfoot>
          </table>
        </CardBox>
      )}
    </div>
  );
};

export default LibroMayorPage;
