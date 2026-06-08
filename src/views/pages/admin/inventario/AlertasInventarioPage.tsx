import { useCallback, useEffect, useState } from 'react';
import { inventarioService } from 'src/api/services/inventarioService';
import type { ProductoResponse } from 'src/types/inventario';
import CardBox from 'src/components/shared/CardBox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { Icon } from '@iconify/react';

const alertaConfig: Record<string, { icon: string; color: string; bar: string }> = {
  ROJO:    { icon: 'solar:danger-circle-bold',      color: 'text-red-500 bg-red-50',      bar: 'bg-red-500' },
  AMARILLO:{ icon: 'solar:danger-triangle-bold',     color: 'text-yellow-600 bg-yellow-50', bar: 'bg-yellow-500' },
};

const AlertasInventarioPage = () => {
  const [criticos, setCriticos] = useState<ProductoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<string>('TODOS');

  const cargar = useCallback(async () => {
    try { setLoading(true); setCriticos(await inventarioService.stockCritico()); }
    catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const filtrados = filtro === 'ROJO' ? criticos.filter(p => p.alertaStock === 'ROJO')
    : filtro === 'AMARILLO' ? criticos.filter(p => p.alertaStock === 'AMARILLO')
    : criticos;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alertas de stock</h1>
        <p className="text-muted-foreground">Productos con stock bajo o agotado</p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todas las alertas</SelectItem>
            <SelectItem value="ROJO">Agotados</SelectItem>
            <SelectItem value="AMARILLO">Stock bajo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? <div className="flex justify-center py-16"><Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" /></div>
      : filtrados.length === 0 ? (
        <div className="text-center py-16">
          <Icon icon="solar:check-circle-bold" width={56} className="text-green-500 mx-auto mb-4" />
          <p className="text-xl font-semibold text-foreground">Todo en orden</p>
          <p className="text-muted-foreground mt-1">No hay productos con stock crítico en este momento</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(p => {
            const alerta = alertaConfig[p.alertaStock] || alertaConfig.ROJO;
            const pct = p.stockMinimo > 0 ? Math.min(100, Math.max(0, (p.stockActual / p.stockMinimo) * 100)) : 0;
            return (
              <CardBox key={p.productoId} className="shadow-none border-2 border-red-200 hover:border-red-400 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${alerta.color} shrink-0`}>
                    <Icon icon={alerta.icon} width={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{p.nombre}</h3>
                    <p className="text-xs text-muted-foreground">{p.categoria || 'General'} · {p.unidadMedida}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-3xl font-bold ${p.stockActual === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                        {p.stockActual}
                      </span>
                      <span className="text-xs text-muted-foreground">/ {p.stockMinimo} mín.</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted mt-2">
                      <div className={`h-1.5 rounded-full ${p.stockActual === 0 ? 'bg-red-500' : 'bg-yellow-500'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                    {p.stockActual === 0 && (
                      <p className="text-xs text-red-600 font-medium mt-2">Stock agotado — Reabastece cuanto antes</p>
                    )}
                  </div>
                </div>
              </CardBox>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertasInventarioPage;
