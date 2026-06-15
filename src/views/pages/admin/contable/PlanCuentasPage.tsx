import { useEffect, useState } from 'react';
import { contabilidadService } from 'src/api/services/contabilidadService';
import type { PlanCuentaResponse } from 'src/types/contabilidad';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';

const PlanCuentasPage = () => {
  const [cuentas, setCuentas] = useState<PlanCuentaResponse[]>([]);

  useEffect(() => { contabilidadService.obtenerPlanCuentas().then(setCuentas).catch(() => {}); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-primary/10 shrink-0">
          <Icon icon="solar:structure-bold" width={32} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Plan de Cuentas</h1>
          <p className="text-muted-foreground">Catálogo contable VEN-NIF para PYMES</p>
        </div>
      </div>

      <CardBox className="shadow-none border border-border p-0! overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Código</th>
                <th className="text-left px-4 py-3 font-semibold">Nombre</th>
                <th className="text-center px-4 py-3 font-semibold">Tipo</th>
                <th className="text-center px-4 py-3 font-semibold w-28">Estado</th>
              </tr>
            </thead>
            <tbody>
              {cuentas.map(c => (
                <tr key={c.cuentaId} className={`border-t hover:bg-muted/10 transition-colors ${!c.activo ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-2.5 font-mono text-xs">{c.codigo}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {c.cuentaPadreId ? <span className="text-muted-foreground">└</span> : null}
                      {c.nombre}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      c.tipoCuenta === 'ACTIVO' ? 'bg-emerald-100 text-emerald-700' :
                      c.tipoCuenta === 'PASIVO' ? 'bg-red-100 text-red-700' :
                      c.tipoCuenta === 'PATRIMONIO' ? 'bg-purple-100 text-purple-700' :
                      c.tipoCuenta === 'INGRESO' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>{c.tipoCuenta}</span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {c.activo
                      ? <span className="text-xs text-success font-medium">Activo</span>
                      : <span className="text-xs text-muted-foreground">Inactivo</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBox>
    </div>
  );
};

export default PlanCuentasPage;
