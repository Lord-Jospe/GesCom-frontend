import { useCallback, useEffect, useState } from 'react';
import { inventarioService } from 'src/api/services/inventarioService';
import type { MovimientoInventarioResponse } from 'src/types/inventario';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { Icon } from '@iconify/react';
import { ArrowDown, ArrowUp, AlertTriangle } from 'lucide-react';

const movConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  ENTRADA: { icon: ArrowDown, color: 'text-green-600', bg: 'bg-green-50', label: 'Entrada' },
  SALIDA:  { icon: ArrowUp,   color: 'text-red-600',   bg: 'bg-red-50',   label: 'Salida' },
  MERMA:   { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Merma' },
};

const MovimientosInventarioPage = () => {
  const [movs, setMovs] = useState<MovimientoInventarioResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [tipoFiltro, setTipoFiltro] = useState<string>('TODOS');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const cargar = useCallback(async () => {
    try { setLoading(true);
      const p = await inventarioService.todosMovimientos(
        pagina, 20,
        tipoFiltro !== 'TODOS' ? tipoFiltro : undefined,
        desde || undefined,
        hasta || undefined,
      );
      setMovs(p.contenido);
      setTotalPaginas(p.totalPaginas);
    } catch { /* */ } finally { setLoading(false); }
  }, [pagina, tipoFiltro, desde, hasta]);

  useEffect(() => { cargar(); }, [cargar]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Movimientos de inventario</h1>
        <p className="text-muted-foreground">Entradas, salidas y mermas registradas</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={tipoFiltro} onValueChange={v => { setTipoFiltro(v); setPagina(0); }}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            <SelectItem value="ENTRADA">Entradas</SelectItem>
            <SelectItem value="SALIDA">Salidas</SelectItem>
            <SelectItem value="MERMA">Mermas</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={desde} onChange={e => { setDesde(e.target.value); setPagina(0); }} className="w-36" />
        <span className="text-muted-foreground text-sm">a</span>
        <Input type="date" value={hasta} onChange={e => { setHasta(e.target.value); setPagina(0); }} className="w-36" />
        <Button variant="outline" size="sm" onClick={() => { setTipoFiltro('TODOS'); setDesde(''); setHasta(''); setPagina(0); }}>Limpiar</Button>
      </div>

      {loading ? <div className="flex justify-center py-16"><Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" /></div>
      : movs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Icon icon="solar:transfer-horizontal-linear" width={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Sin movimientos</p>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="relative w-full max-w-2xl">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-1">
              {movs.map(m => {
                const cfg = movConfig[m.tipo] || movConfig.ENTRADA;
                const IconMov = cfg.icon;
                return (
                  <div key={m.movimientoId} className="flex items-start gap-4 pl-4 relative">
                    <div className={`p-2 rounded-full ${cfg.bg} shrink-0 z-10 ring-2 ring-background`}>
                      <IconMov className={`size-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 pb-5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {m.productoNombre}
                          <span className={`ml-2 text-xs font-semibold ${cfg.color}`}>
                            {m.tipo === 'ENTRADA' ? '+' : '−'}{m.cantidad} und.
                          </span>
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(m.createdAt).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })}
                          {' · '}
                          {new Date(m.createdAt).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {m.motivo && <p className="text-xs text-muted-foreground">{m.motivo}</p>}
                        {m.registradoPor && <p className="text-xs text-muted-foreground">por {m.registradoPor}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="flex justify-center gap-3 pt-4">
          <Button variant="outline" size="sm" disabled={pagina === 0} onClick={() => setPagina(p => p - 1)}>Anterior</Button>
          <span className="text-sm text-muted-foreground">Pág. {pagina + 1} de {totalPaginas}</span>
          <Button variant="outline" size="sm" disabled={pagina + 1 >= totalPaginas} onClick={() => setPagina(p => p + 1)}>Siguiente</Button>
        </div>
      )}
    </div>
  );
};

export default MovimientosInventarioPage;
