import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { contabilidadService } from 'src/api/services/contabilidadService';
import type { PlanCuentaResponse } from 'src/types/contabilidad';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { Plus } from 'lucide-react';

const tiposCuenta = ['ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'GASTO'];

const PlanCuentasPage = () => {
  const [cuentas, setCuentas] = useState<PlanCuentaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCrear, setOpenCrear] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try { setCuentas(await contabilidadService.obtenerPlanCuentas()); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-primary/10 shrink-0">
          <Icon icon="solar:structure-bold" width={32} className="text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Plan de Cuentas</h1>
          <p className="text-muted-foreground">Catálogo contable VEN-NIF para PYMES</p>
        </div>
        <Button onClick={() => setOpenCrear(true)}><Plus className="size-4 mr-1" /> Nueva cuenta</Button>
      </div>

      <CardBox className="shadow-none border border-border p-0! overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Icon icon="svg-spinners:180-ring" width={24} className="text-primary animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40"><tr>
                <th className="text-left px-4 py-3 font-semibold">Código</th>
                <th className="text-left px-4 py-3 font-semibold">Nombre</th>
                <th className="text-center px-4 py-3 font-semibold">Tipo</th>
                <th className="text-center px-4 py-3 font-semibold w-28">Estado</th>
                <th className="w-10"></th>
              </tr></thead>
              <tbody>
                {cuentas.map(c => (
                  <tr key={c.cuentaId} className={`border-t hover:bg-muted/10 ${!c.activo ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-2.5 font-mono text-xs">{c.codigo}</td>
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2">{c.cuentaPadreId ? <span className="text-muted-foreground">└</span> : null}{c.nombre}</div></td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        c.tipoCuenta === 'ACTIVO' ? 'bg-emerald-100 text-emerald-700' : c.tipoCuenta === 'PASIVO' ? 'bg-red-100 text-red-700' :
                        c.tipoCuenta === 'PATRIMONIO' ? 'bg-purple-100 text-purple-700' : c.tipoCuenta === 'INGRESO' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      }`}>{c.tipoCuenta}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center">{c.activo ? <span className="text-xs text-success font-medium">Activo</span> : <span className="text-xs text-muted-foreground">Inactivo</span>}</td>
                    <td className="px-2 py-2.5">
                      {c.activo && !c.esPredeterminada && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500" onClick={async () => {
                          if (!confirm(`¿Desactivar ${c.codigo} - ${c.nombre}?`)) return;
                          try { await contabilidadService.desactivarCuenta(c.cuentaId); toast.success('Cuenta desactivada'); cargar(); }
                          catch (e: any) { toast.error(e.message); }
                        }}>Desactivar</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBox>

      <Dialog open={openCrear} onOpenChange={setOpenCrear}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nueva cuenta</DialogTitle></DialogHeader>
          <FormCuenta cuentas={cuentas} onCreada={() => { setOpenCrear(false); cargar(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

function FormCuenta({ cuentas, onCreada }: { cuentas: PlanCuentaResponse[]; onCreada: () => void }) {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('ACTIVO');
  const [padreId, setPadreId] = useState('');
  const [error, setError] = useState('');
  const [g, setG] = useState(false);

  const activas = cuentas.filter(c => c.activo);

  const handle = async () => {
    if (!codigo.trim() || !nombre.trim()) { setError('Código y nombre son obligatorios'); return; }
    setG(true);
    try {
      await contabilidadService.crearCuenta({
        tipoCuenta: tipo, codigo: codigo.trim(), nombre: nombre.trim(),
        cuentaPadreId: padreId ? Number(padreId) : undefined,
      });
      toast.success('Cuenta creada');
      onCreada();
    } catch (e: any) { setError(e.message); } finally { setG(false); }
  };

  return (
    <div className="space-y-4 mt-2">
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md">{error}</div>}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5"><Label>Código *</Label><Input value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Ej: 1.1.4" /></div>
        <div className="flex flex-col gap-1.5"><Label>Nombre *</Label><Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Caja Chica" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5"><Label>Tipo de cuenta</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{tiposCuenta.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5"><Label>Cuenta padre</Label>
          <Select value={padreId} onValueChange={setPadreId}>
            <SelectTrigger><SelectValue placeholder="Ninguna (raíz)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Ninguna</SelectItem>
              {activas.map(c => <SelectItem key={c.cuentaId} value={String(c.cuentaId)}>{c.codigo} - {c.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter><Button variant="outline" onClick={onCreada}>Cancelar</Button><Button onClick={handle} disabled={g}>{g ? '...' : 'Crear cuenta'}</Button></DialogFooter>
    </div>
  );
}

export default PlanCuentasPage;
