import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { transaccionService } from 'src/api/services/transaccionService';
import type { TransaccionResponse, FiltroTransaccionRequest, TipoTransaccion, EstadoTransaccion } from 'src/types/transaccion';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Badge } from 'src/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { Icon } from '@iconify/react';
import { ArrowDown, ArrowUp, LayoutList, GitCommitHorizontal } from 'lucide-react';

const estadoColor: Record<string, string> = {
  PAGADA: 'bg-green-100 text-green-700', PENDIENTE: 'bg-yellow-100 text-yellow-700',
  PARCIAL: 'bg-blue-100 text-blue-700', ANULADA: 'bg-red-100 text-red-700',
};

const HistorialTransaccionesPage = () => {
  const [data, setData] = useState<TransaccionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState<'tabla' | 'timeline'>('tabla');
  const [filtro, setFiltro] = useState<FiltroTransaccionRequest>({});

  const cargar = useCallback(async () => {
    try { setLoading(true); setData(await transaccionService.listar(filtro)); }
    catch { /* */ } finally { setLoading(false); }
  }, [filtro]);

  useEffect(() => { cargar(); }, [cargar]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Historial de transacciones</h1>
          <p className="text-muted-foreground">Consulta todas las ventas y gastos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={vista === 'tabla' ? 'default' : 'outline'} onClick={() => setVista('tabla')}>
            <LayoutList className="size-4 mr-1" /> Tabla
          </Button>
          <Button size="sm" variant={vista === 'timeline' ? 'default' : 'outline'} onClick={() => setVista('timeline')}>
            <GitCommitHorizontal className="size-4 mr-1" /> Timeline
          </Button>
          <Link to="/admin/caja-facturacion/venta"><Button size="sm" variant="outline" className="ml-2"><ArrowUp className="size-4 mr-1 text-green-600" /> Venta</Button></Link>
          <Link to="/admin/caja-facturacion/gasto"><Button size="sm" variant="outline"><ArrowDown className="size-4 mr-1 text-red-600" /> Gasto</Button></Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filtro.tipo || 'TODOS'} onValueChange={v => setFiltro({ ...filtro, tipo: v === 'TODOS' ? undefined : v as TipoTransaccion })}>
          <SelectTrigger className="w-28"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent><SelectItem value="TODOS">Todos</SelectItem><SelectItem value="INGRESO">Ingresos</SelectItem><SelectItem value="EGRESO">Egresos</SelectItem></SelectContent>
        </Select>
        <Select value={filtro.estado || 'TODOS'} onValueChange={v => setFiltro({ ...filtro, estado: v === 'TODOS' ? undefined : v as EstadoTransaccion })}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent><SelectItem value="TODOS">Todos</SelectItem><SelectItem value="PAGADA">Pagada</SelectItem><SelectItem value="PENDIENTE">Pendiente</SelectItem><SelectItem value="ANULADA">Anulada</SelectItem></SelectContent>
        </Select>
        <Input type="date" className="w-36" value={filtro.fechaDesde || ''} onChange={e => setFiltro({ ...filtro, fechaDesde: e.target.value || undefined })} />
        <span className="text-sm text-muted-foreground">a</span>
        <Input type="date" className="w-36" value={filtro.fechaHasta || ''} onChange={e => setFiltro({ ...filtro, fechaHasta: e.target.value || undefined })} />
        <Button variant="outline" size="sm" onClick={() => { setFiltro({}); }}>Limpiar</Button>
      </div>

      {loading ? <div className="flex justify-center py-16"><Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" /></div>
      : data.length === 0 ? <p className="text-center py-16 text-muted-foreground">Sin transacciones.</p>
      : vista === 'tabla' ? <TablaView data={data} /> : <TimelineView data={data} />}
    </div>
  );
};

function TablaView({ data }: { data: TransaccionResponse[] }) {
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gradient-to-r from-primary/5 to-transparent"><tr>
          <th className="text-left px-3 py-3 font-semibold">#</th>
          <th className="text-left px-3 py-3 font-semibold">Fecha</th>
          <th className="text-left px-3 py-3 font-semibold">Tipo</th>
          <th className="text-left px-3 py-3 font-semibold">Cliente / Proveedor</th>
          <th className="text-right px-3 py-3 font-semibold">Total</th>
          <th className="text-left px-3 py-3 font-semibold">Estado</th>
          <th className="text-left px-3 py-3 font-semibold">Método</th>
        </tr></thead>
        <tbody>
          {data.map(t => (
            <tr key={t.transaccionId} className="border-t hover:bg-muted/20">
              <td className="px-3 py-2 font-mono text-xs">{t.numeroFactura || `#${t.transaccionId}`}</td>
              <td className="px-3 py-2">{t.fecha}</td>
              <td className="px-3 py-2">
                <Badge className={t.tipo === 'INGRESO' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}>
                  {t.tipo === 'INGRESO' ? 'Ingreso' : t.tipo === 'NOTA_CREDITO' ? 'Nota Créd.' : 'Egreso'}
                </Badge>
              </td>
              <td className="px-3 py-2">{t.clienteNombre || t.proveedorNombre || '—'}</td>
              <td className="px-3 py-2 text-right font-mono font-medium">{t.moneda === 'USD' ? '$' : 'Bs.'} {t.total.toFixed(2)}</td>
              <td className="px-3 py-2"><Badge className={estadoColor[t.estado] || ''}>{t.estado}</Badge></td>
              <td className="px-3 py-2 text-muted-foreground text-xs">{t.metodoPago}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TimelineView({ data }: { data: TransaccionResponse[] }) {
  return (
    <div className="flex justify-center">
      <div className="relative w-full">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
        <div className="space-y-1">
          {data.map(t => {
            const ingreso = t.tipo === 'INGRESO';
            const Icono = ingreso ? ArrowUp : ArrowDown;
            const color = ingreso ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
            return (
              <div key={t.transaccionId} className="flex items-start gap-4 pl-4 relative">
                <div className={`p-2 rounded-full ${color} shrink-0`}>
                  <Icono className="size-4" />
                </div>
                <div className="flex-1 pb-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {t.clienteNombre || t.proveedorNombre || '—'}
                      <span className="ml-2 text-xs text-muted-foreground">{t.numeroFactura || `#${t.transaccionId}`}</span>
                    </p>
                    <span className="text-xs text-muted-foreground">{t.fecha}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={`text-sm font-semibold ${ingreso ? 'text-green-600' : 'text-red-600'}`}>
                      {ingreso ? '+' : '−'}{t.moneda === 'USD' ? '$' : 'Bs.'} {t.total.toFixed(2)}
                    </span>
                    <Badge className={estadoColor[t.estado] || ''}>{t.estado}</Badge>
                    <span className="text-xs text-muted-foreground">{t.metodoPago}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HistorialTransaccionesPage;
