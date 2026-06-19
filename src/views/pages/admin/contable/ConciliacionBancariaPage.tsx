import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { conciliacionService, type ConciliacionResponse, type MovimientoBancoResponse, type TxConciliar } from 'src/api/services/conciliacionService';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Badge } from 'src/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { Plus, Upload, Link2, Unlink2, CheckCircle2, AlertTriangle, Banknote, Trash2, Check, Zap } from 'lucide-react';

const hoy = new Date().toISOString().slice(0, 10);

const ConciliacionBancariaPage = () => {
  const [data, setData] = useState<ConciliacionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [linking, setLinking] = useState<{ movBancoId: number } | null>(null);
  const [fechaFiltro, setFechaFiltro] = useState(hoy);
  const fileRef = useRef<HTMLInputElement>(null);

  // Form
  const [fecha, setFecha] = useState(hoy);
  const [desc, setDesc] = useState('');
  const [monto, setMonto] = useState('');
  const [tipo, setTipo] = useState('INGRESO');

  const cargar = async () => {
    setLoading(true);
    try { setData(await conciliacionService.obtener(fechaFiltro, fechaFiltro)); } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const handleAdd = async () => {
    if (!desc || !monto) { toast.error('Completa todos los campos'); return; }
    try {
      await conciliacionService.agregarMovimiento({ fecha, descripcion: desc, monto: Number(monto), tipo });
      toast.success('Movimiento agregado');
      setDesc(''); setMonto(''); cargar();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleVincular = async (movBancoId: number, transaccionId: number) => {
    try {
      await conciliacionService.vincular(movBancoId, transaccionId);
      toast.success('Conciliado');
      setLinking(null); cargar();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDesvincular = async (movBancoId: number) => {
    try {
      await conciliacionService.desvincular(movBancoId);
      toast.success('Desvinculado');
      cargar();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleConciliarManual = async (movBancoId: number) => {
    try {
      await conciliacionService.conciliarManual(movBancoId);
      toast.success('Conciliado');
      cargar();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleEliminar = async (movBancoId: number) => {
    if (!confirm('¿Eliminar este movimiento bancario?')) return;
    try {
      await conciliacionService.eliminarMovimiento(movBancoId);
      toast.success('Eliminado');
      cargar();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        await conciliacionService.importarCSV(ev.target?.result as string);
        toast.success('CSV importado');
        cargar();
      } catch (err: any) { toast.error(err.message); }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" /></div>;

  const c = data?.conciliados || [];
  const sb = data?.sinConciliarBanco || [];
  const sg = data?.sinConciliarGesCom || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-emerald-500/10 shrink-0">
          <Banknote className="size-8 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Conciliación Bancaria</h1>
          <p className="text-muted-foreground">Cuadra tus movimientos bancarios con las transacciones registradas</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input type="date" value={fechaFiltro} onChange={e => setFechaFiltro(e.target.value)} className="h-9 w-36 text-sm" />
          <Button variant="outline" size="sm" onClick={cargar}>Filtrar</Button>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4 mr-1" /> Importar CSV
          </Button>
          <Button variant="outline" size="sm" onClick={async () => {
            const n = await conciliacionService.autoConciliar();
            toast.success(`${n} conciliado(s)`);
            cargar();
          }}>
            <Zap className="size-4 mr-1" /> Conciliar todo
          </Button>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="size-4 mr-1" /> Agregar movimiento
          </Button>
        </div>
      </div>

      {/* Form para agregar */}
      {showAdd && (
        <CardBox className="shadow-none border border-border">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5"><Label className="text-xs">Fecha</Label><Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="h-9 w-36" /></div>
            <div className="flex flex-col gap-1.5"><Label className="text-xs">Descripción</Label><Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ej: Pago proveedor" className="h-9 w-48" /></div>
            <div className="flex flex-col gap-1.5"><Label className="text-xs">Monto</Label><Input type="number" step="0.01" value={monto} onChange={e => setMonto(e.target.value)} className="h-9 w-28" /></div>
            <div className="flex flex-col gap-1.5"><Label className="text-xs">Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="h-9 w-28"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="INGRESO">Ingreso</SelectItem><SelectItem value="EGRESO">Egreso</SelectItem></SelectContent>
              </Select>
            </div>
            <Button onClick={handleAdd} className="h-9"><Plus className="size-4 mr-1" /> Agregar</Button>
          </div>
        </CardBox>
      )}

      {/* Tres columnas */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conciliados */}
        <CardBox className="shadow-none border border-border p-0! overflow-hidden">
          <div className="bg-emerald-500/10 px-4 py-3 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-600" />
            <h3 className="font-semibold text-emerald-700">Conciliados ({c.length})</h3>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {c.length === 0 ? <p className="text-center py-8 text-sm text-muted-foreground">Sin conciliaciones.</p> :
              c.map(m => (
                <div key={m.movimientoBancoId} className="border-t px-4 py-3 hover:bg-muted/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{m.descripcion}</span>
                    <Badge className={m.tipo === 'INGRESO' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}>{m.tipo === 'INGRESO' ? '+' : '−'}${m.monto.toFixed(2)}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{m.fecha}</span>
                    <span>·</span>
                    <span>{m.transaccionId ? `↔ ${m.numeroFactura || `#${m.transaccionId}`}` : 'Conciliado manualmente'}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-red-400 hover:text-red-600 mt-1" onClick={() => handleDesvincular(m.movimientoBancoId)}>
                    <Unlink2 className="size-3 mr-1" /> Desvincular
                  </Button>
                </div>
              ))}
          </div>
        </CardBox>

        {/* Sin conciliar - Banco */}
        <CardBox className="shadow-none border border-border p-0! overflow-hidden">
          <div className="bg-yellow-500/10 px-4 py-3 flex items-center gap-2">
            <AlertTriangle className="size-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-700">Sin conciliar — Banco ({sb.length})</h3>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {sb.length === 0 ? <p className="text-center py-8 text-sm text-muted-foreground">Todo conciliado.</p> :
              sb.map(m => (
                <div key={m.movimientoBancoId} className="border-t px-4 py-3 hover:bg-muted/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{m.descripcion}</span>
                    <Badge className={m.tipo === 'INGRESO' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}>{m.tipo === 'INGRESO' ? '+' : '−'}${m.monto.toFixed(2)}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{m.fecha}</span>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {linking?.movBancoId === m.movimientoBancoId ? (
                      <Select onValueChange={v => handleVincular(m.movimientoBancoId, Number(v))}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Seleccionar transacción..." /></SelectTrigger>
                        <SelectContent>
                          {sg.map(tx => (
                            <SelectItem key={tx.transaccionId} value={String(tx.transaccionId)}>
                              {tx.numeroFactura || `#${tx.transaccionId}`} — {tx.clienteProveedor || '—'} (${tx.total.toFixed(2)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setLinking({ movBancoId: m.movimientoBancoId })}>
                          <Link2 className="size-3 mr-1" /> Vincular
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-600" onClick={() => handleConciliarManual(m.movimientoBancoId)} title="Conciliar sin vincular a transacción">
                          <Check className="size-3 mr-1" /> Sin transacción
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-red-400 hover:text-red-600" onClick={() => handleEliminar(m.movimientoBancoId)} title="Eliminar movimiento">
                          <Trash2 className="size-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardBox>

        {/* Sin conciliar - GesCom */}
        <CardBox className="shadow-none border border-border p-0! overflow-hidden">
          <div className="bg-blue-500/10 px-4 py-3 flex items-center gap-2">
            <AlertTriangle className="size-5 text-blue-600" />
            <h3 className="font-semibold text-blue-700">Sin conciliar — GesCom ({sg.length})</h3>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {sg.length === 0 ? <p className="text-center py-8 text-sm text-muted-foreground">Todo conciliado.</p> :
              sg.map(tx => (
                <div key={tx.transaccionId} className="border-t px-4 py-3 hover:bg-muted/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{tx.clienteProveedor || '—'}</span>
                    <Badge className={tx.tipo === 'INGRESO' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}>{tx.tipo === 'INGRESO' ? '+' : '−'}${tx.total.toFixed(2)}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{tx.fecha}</span>
                    <span>·</span>
                    <span>{tx.numeroFactura ? tx.numeroFactura : `#${tx.transaccionId}`}</span>
                    <span>·</span>
                    <span>{tx.metodoPago}</span>
                  </div>
                </div>
              ))}
          </div>
        </CardBox>
      </div>
    </div>
  );
};

export default ConciliacionBancariaPage;
