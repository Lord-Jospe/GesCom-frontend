import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { superAdminService } from 'src/api/services/superAdminService';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Badge } from 'src/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { Building2 } from 'lucide-react';

interface EmpresaRow {
  empresaId: number; nombre: string; rif: string; correo: string;
  planNombre: string; planPrecio: number; fechaVence: string; estadoSuscripcion: string;
}

const EmpresasPage = () => {
  const [empresas, setEmpresas] = useState<EmpresaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editEmp, setEditEmp] = useState<EmpresaRow | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevoPlan, setNuevoPlan] = useState('');
  const [saving, setSaving] = useState(false);

  const planes = ['SEMILLA', 'EMPRENDEDOR', 'EMPRESA'];
  const planId: Record<string, number> = { SEMILLA: 1, EMPRENDEDOR: 2, EMPRESA: 3 };

  const cargar = async () => {
    setLoading(true);
    try { setEmpresas(await superAdminService.listarEmpresas()); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const handleGuardar = async () => {
    if (!editEmp || (!nuevaFecha && !nuevoPlan)) return;
    setSaving(true);
    try {
      const body: any = {};
      if (nuevaFecha) body.fechaVence = nuevaFecha;
      if (nuevoPlan) body.planId = planId[nuevoPlan];
      await superAdminService.actualizarSuscripcion(editEmp.empresaId, body);
      toast.success('Suscripción actualizada');
      setEditEmp(null); setNuevaFecha(''); setNuevoPlan(''); cargar();
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-primary/10 shrink-0"><Building2 className="size-8 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Empresas</h1>
          <p className="text-muted-foreground">{empresas.length} empresas registradas</p>
        </div>
      </div>

      <CardBox className="shadow-none border border-border p-0! overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30"><tr>
              <th className="text-left px-4 py-3 font-semibold">Empresa</th>
              <th className="text-left px-4 py-3 font-semibold">RIF</th>
              <th className="text-left px-4 py-3 font-semibold">Plan</th>
              <th className="text-left px-4 py-3 font-semibold">Vence</th>
              <th className="text-left px-4 py-3 font-semibold">Estado</th>
              <th className="w-10"></th>
            </tr></thead>
            <tbody>
              {empresas.map(e => {
                const vencida = e.fechaVence && new Date(e.fechaVence) < new Date();
                return (
                  <tr key={e.empresaId} className="border-t hover:bg-muted/20">
                    <td className="px-4 py-3"><p className="font-medium">{e.nombre}</p><p className="text-xs text-muted-foreground">{e.correo}</p></td>
                    <td className="px-4 py-3 text-xs font-mono">{e.rif}</td>
                    <td className="px-4 py-3">{e.planNombre} {e.planPrecio > 0 ? `($${e.planPrecio}/mes)` : '(Gratis)'}</td>
                    <td className="px-4 py-3 text-xs">{e.fechaVence || '—'}</td>
                    <td className="px-4 py-3"><Badge className={vencida ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>{vencida ? 'Vencida' : 'Activa'}</Badge></td>
                    <td className="px-2 py-3">
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setEditEmp(e); setNuevaFecha(e.fechaVence || ''); setNuevoPlan(''); }}>Gestionar</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardBox>

      <Dialog open={!!editEmp} onOpenChange={() => setEditEmp(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Gestionar suscripción</DialogTitle></DialogHeader>
          {editEmp && (
            <div className="space-y-4 mt-2">
              <p className="text-sm"><strong>{editEmp.nombre}</strong> — Plan actual: {editEmp.planNombre}</p>
              <div className="flex flex-col gap-1.5"><Label>Cambiar plan</Label>
                <Select value={nuevoPlan} onValueChange={setNuevoPlan}>
                  <SelectTrigger><SelectValue placeholder="Mantener plan actual" /></SelectTrigger>
                  <SelectContent>{planes.map(p => <SelectItem key={p} value={p}>{p} {p === editEmp.planNombre ? '(actual)' : ''}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5"><Label>Nueva fecha de vencimiento</Label><Input type="date" value={nuevaFecha} onChange={e => setNuevaFecha(e.target.value)} /></div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditEmp(null)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleGuardar} disabled={saving || (!nuevaFecha && !nuevoPlan)}>{saving ? '...' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmpresasPage;
