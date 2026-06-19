import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { superAdminService } from 'src/api/services/superAdminService';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Badge } from 'src/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import CardBox from 'src/components/shared/CardBox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { paymentService } from 'src/api/services/paymentService';
import { Icon } from '@iconify/react';
import { Building2, CreditCard, Image as ImageIcon, Crown, QrCode } from 'lucide-react';

interface EmpresaRow {
  empresaId: number; nombre: string; rif: string; correo: string;
  planNombre: string; planPrecio: number; fechaVence: string; estadoSuscripcion: string;
}

const SuperAdminPage = () => {
  const [empresas, setEmpresas] = useState<EmpresaRow[]>([]);
  const [comprobantes, setComprobantes] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'empresas' | 'comprobantes'>('empresas');
  const [editEmp, setEditEmp] = useState<EmpresaRow | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevoPlan, setNuevoPlan] = useState('');
  const [saving, setSaving] = useState(false);
  const qrRef = useRef<HTMLInputElement>(null);

  const planes = ['SEMILLA', 'EMPRENDEDOR', 'NEGOCIO'];
  const planId: Record<string, number> = { SEMILLA: 1, EMPRENDEDOR: 2, NEGOCIO: 3 };

  const cargar = async () => {
    setLoading(true);
    try {
      const [emp, comp, st] = await Promise.all([
        superAdminService.listarEmpresas(),
        superAdminService.listarComprobantes(),
        superAdminService.estadisticas(),
      ]);
      setEmpresas(emp); setComprobantes(comp); setStats(st);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const handleExtender = async () => {
    if (!editEmp || (!nuevaFecha && !nuevoPlan)) return;
    setSaving(true);
    try {
      const body: any = {};
      if (nuevaFecha) body.fechaVence = nuevaFecha;
      if (nuevoPlan) body.planId = planId[nuevoPlan];
      await superAdminService.actualizarSuscripcion(editEmp.empresaId, body);
      toast.success('Suscripción actualizada');
      setEditEmp(null); setNuevaFecha(''); setNuevoPlan('');
      cargar();
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-yellow-500/10 shrink-0"><Crown className="size-8 text-yellow-500" /></div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Super Admin</h1>
          <p className="text-muted-foreground">Gestión global de empresas y suscripciones</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <CardBox className="shadow-none border border-border text-center">
            <Building2 className="size-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.totalEmpresas}</p>
            <p className="text-xs text-muted-foreground">Empresas</p>
          </CardBox>
          <CardBox className="shadow-none border border-border text-center">
            <CreditCard className="size-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.suscripcionesActivas}</p>
            <p className="text-xs text-muted-foreground">Suscripciones activas</p>
          </CardBox>
          <CardBox className="shadow-none border border-border text-center">
            <Crown className="size-8 text-destructive mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.suscripcionesVencidas}</p>
            <p className="text-xs text-muted-foreground">Vencidas</p>
          </CardBox>
        </div>
      )}

      {/* QR */}
      <CardBox className="shadow-none border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <QrCode className="size-6 text-primary" />
            <div>
              <h3 className="text-base font-semibold">QR de pago (Binance)</h3>
              <p className="text-xs text-muted-foreground">Los clientes escanean este QR para pagar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input ref={qrRef} type="file" accept="image/*" onChange={async (e) => {
              const f = e.target.files?.[0]; if (!f) return;
              try { await paymentService.subirQR(f); toast.success('QR actualizado'); }
              catch (err: any) { toast.error(err.message); }
            }} className="hidden" />
            <Button variant="outline" size="sm" onClick={() => qrRef.current?.click()}>Subir QR</Button>
          </div>
        </div>
      </CardBox>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button variant={tab === 'empresas' ? 'default' : 'outline'} size="sm" onClick={() => setTab('empresas')}>
          <Building2 className="size-4 mr-1" /> Empresas ({empresas.length})
        </Button>
        <Button variant={tab === 'comprobantes' ? 'default' : 'outline'} size="sm" onClick={() => setTab('comprobantes')}>
          <ImageIcon className="size-4 mr-1" /> Comprobantes ({comprobantes.length})
        </Button>
      </div>

      {/* Tabla Empresas */}
      {tab === 'empresas' && (
        <CardBox className="shadow-none border border-border p-0! overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30"><tr>
                <th className="text-left px-4 py-2.5 font-semibold">Empresa</th>
                <th className="text-left px-4 py-2.5 font-semibold">RIF</th>
                <th className="text-left px-4 py-2.5 font-semibold">Plan</th>
                <th className="text-left px-4 py-2.5 font-semibold">Vence</th>
                <th className="text-left px-4 py-2.5 font-semibold">Estado</th>
                <th className="w-10"></th>
              </tr></thead>
              <tbody>
                {empresas.map(e => {
                  const vencida = e.estadoSuscripcion === 'VENCIDA' || (e.fechaVence && new Date(e.fechaVence) < new Date());
                  return (
                    <tr key={e.empresaId} className="border-t hover:bg-muted/20">
                      <td className="px-4 py-2.5">
                        <p className="font-medium">{e.nombre}</p>
                        <p className="text-xs text-muted-foreground">{e.correo}</p>
                      </td>
                      <td className="px-4 py-2.5 text-xs font-mono">{e.rif}</td>
                      <td className="px-4 py-2.5">{e.planNombre} {e.planPrecio > 0 ? `($${e.planPrecio}/mes)` : '(Gratis)'}</td>
                      <td className="px-4 py-2.5 text-xs">{e.fechaVence || '—'}</td>
                      <td className="px-4 py-2.5">
                        <Badge className={vencida ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                          {vencida ? 'Vencida' : 'Activa'}
                        </Badge>
                      </td>
                      <td className="px-2 py-2.5">
                        <Button variant="ghost" size="sm" className="h-7 text-xs"
                          onClick={() => { setEditEmp(e); setNuevaFecha(e.fechaVence || ''); setNuevoPlan(''); }}>
                          Gestionar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBox>
      )}

      {/* Tabla Comprobantes */}
      {tab === 'comprobantes' && (
        <CardBox className="shadow-none border border-border">
          {comprobantes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Sin comprobantes pendientes.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {comprobantes.map(c => (
                <div key={c.adjuntoId} className="border rounded-lg p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <ImageIcon className="size-5 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.nombreOriginal}</p>
                      <p className="text-xs text-muted-foreground">{c.empresaNombre || 'Sin empresa'}</p>
                      <p className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('es-VE')}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={() => {
                    window.open(`${import.meta.env.VITE_URL_BASE}/transactions/attachments/${c.adjuntoId}`, '_blank');
                  }}>Ver comprobante</Button>
                </div>
              ))}
            </div>
          )}
        </CardBox>
      )}

      {/* Diálogo extender */}
      <Dialog open={!!editEmp} onOpenChange={() => setEditEmp(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Gestionar suscripción</DialogTitle></DialogHeader>
          {editEmp && (
            <div className="space-y-4 mt-2">
              <p className="text-sm"><strong>{editEmp.nombre}</strong> — Plan actual: {editEmp.planNombre}</p>
              <div className="flex flex-col gap-1.5">
                <Label>Cambiar plan</Label>
                <Select value={nuevoPlan} onValueChange={setNuevoPlan}>
                  <SelectTrigger><SelectValue placeholder="Mantener plan actual" /></SelectTrigger>
                  <SelectContent>
                    {planes.map(p => <SelectItem key={p} value={p}>{p} {p === editEmp.planNombre ? '(actual)' : ''}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Nueva fecha de vencimiento</Label>
                <Input type="date" value={nuevaFecha} onChange={e => setNuevaFecha(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditEmp(null)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleExtender} disabled={saving || (!nuevaFecha && !nuevoPlan)}>{saving ? '...' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminPage;
