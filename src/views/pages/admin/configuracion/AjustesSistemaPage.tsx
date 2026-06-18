import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { empresaService } from 'src/api/services/empresaService';
import { transaccionService } from 'src/api/services/transaccionService';
import { inventarioService } from 'src/api/services/inventarioService';
import type { EmpresaResponse } from 'src/types/empresa';
import CardBox from 'src/components/shared/CardBox';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Switch } from 'src/components/ui/switch';
import { Icon } from '@iconify/react';
import { Save, FileDown } from 'lucide-react';

const AjustesSistemaPage = () => {
  const [empresa, setEmpresa] = useState<EmpresaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // IVA / IGTF / Facturación
  const [form, setForm] = useState({
    ivaActivo: true, ivaPorcentaje: '16', igtfActivo: false,
    facturaPrefijo: '', facturaSiguienteNumero: '1',
  });

  // Stock
  const [stockMinimoDefault, setStockMinimoDefault] = useState('5');
  const [exportando, setExportando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const emp = await empresaService.obtenerPerfil();
      setEmpresa(emp);
      setForm({
        ivaActivo: emp.ivaActivo, ivaPorcentaje: String(emp.ivaPorcentaje || 16), igtfActivo: emp.igtfActivo,
        facturaPrefijo: emp.facturaPrefijo || '', facturaSiguienteNumero: String(emp.facturaSiguienteNumero || 1),
      });
      setStockMinimoDefault('5');
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async () => {
    if (!empresa) return;
    try {
      setSaving(true);
      const delta: any = {};
      if (form.ivaActivo !== empresa.ivaActivo) delta.ivaActivo = form.ivaActivo;
      if (form.ivaPorcentaje !== String(empresa.ivaPorcentaje || 16)) delta.ivaPorcentaje = Number(form.ivaPorcentaje);
      if (form.igtfActivo !== empresa.igtfActivo) delta.igtfActivo = form.igtfActivo;
      if (form.facturaPrefijo !== (empresa.facturaPrefijo || '')) delta.facturaPrefijo = form.facturaPrefijo;
      if (form.facturaSiguienteNumero !== String(empresa.facturaSiguienteNumero || 1)) delta.facturaSiguienteNumero = Number(form.facturaSiguienteNumero);
      if (Object.keys(delta).length === 0) { toast.info('Sin cambios que guardar'); return; }
      await empresaService.editarPerfil(delta);
      toast.success('Ajustes actualizados');
      cargar();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const exportarDatos = async () => {
    setExportando(true);
    try {
      const [txns, productos] = await Promise.all([
        transaccionService.listar(),
        inventarioService.obtenerTodos(),
      ]);

      const csvRows: string[] = [];
      // Cabecera transacciones
      csvRows.push('Tipo,ID,Fecha,Cliente/Proveedor,Número Factura,Moneda,Subtotal,IVA,IGTF,Total,Estado');
      txns.forEach(t => {
        csvRows.push(`${t.tipo},${t.transaccionId},${t.fecha},"${t.clienteNombre || t.proveedorNombre || ''}",${t.numeroFactura || ''},${t.moneda},${t.subtotal},${t.ivaMonto},${t.igtfMonto},${t.total},${t.estado}`);
      });
      csvRows.push('');
      csvRows.push('Producto,Código,Categoría,Stock,Precio Venta,Costo Unitario,Valor Total');
      productos.forEach(p => {
        csvRows.push(`"${p.nombre}","${p.codigo || ''}","${p.categoria || ''}",${p.stockActual},${p.precioVenta || 0},${p.costoUnitario || 0},${(p.stockActual * (p.costoUnitario || 0)).toFixed(2)}`);
      });

      const blob = new Blob(['﻿' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `gescom-backup-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Datos exportados (CSV)');
    } catch (e: any) { toast.error('Error al exportar: ' + e.message); }
    finally { setExportando(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ajustes del Sistema</h1>
        <p className="text-muted-foreground">Impuestos, facturación, alertas y exportación de datos</p>
      </div>

      {/* IVA / IGTF */}
      <CardBox className="shadow-none border border-border">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Icon icon="solar:document-text-linear" width={20} className="text-primary" /> Impuestos
        </h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">IVA</p>
                <p className="text-xs text-muted-foreground">Impuesto al Valor Agregado</p>
              </div>
              <Switch checked={form.ivaActivo} onCheckedChange={v => setForm({...form, ivaActivo: v})} />
            </div>
            {form.ivaActivo && (
              <div className="flex items-center gap-3 pl-2 border-l-2 border-primary/20">
                <Label className="text-xs">Porcentaje</Label>
                <Input type="number" step="0.01" min="0" max="100" value={form.ivaPorcentaje} onChange={e => setForm({...form, ivaPorcentaje: e.target.value})} className="h-8 w-20 text-sm" />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">IGTF (3%)</p>
                <p className="text-xs text-muted-foreground">Solo transacciones en divisas (USD)</p>
              </div>
              <Switch checked={form.igtfActivo} onCheckedChange={v => setForm({...form, igtfActivo: v})} />
            </div>
          </div>
        </div>
      </CardBox>

      {/* Facturación */}
      <CardBox className="shadow-none border border-border">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Icon icon="solar:bill-list-linear" width={20} className="text-primary" /> Numeración de facturas
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Prefijo</Label>
            <Input value={form.facturaPrefijo} onChange={e => setForm({...form, facturaPrefijo: e.target.value})} placeholder="Ej: F-" className="h-9" />
            <p className="text-xs text-muted-foreground">Aparece antes del número: ej. F-00001</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Próximo número</Label>
            <Input type="number" min={1} value={form.facturaSiguienteNumero} onChange={e => setForm({...form, facturaSiguienteNumero: e.target.value})} className="h-9" />
            <p className="text-xs text-muted-foreground">La siguiente factura usará este número</p>
          </div>
        </div>
      </CardBox>

      {/* Alertas de inventario */}
      <CardBox className="shadow-none border border-border">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Icon icon="solar:bell-bing-linear" width={20} className="text-primary" /> Alertas de inventario
        </h3>
        <div className="flex flex-col gap-1.5 max-w-xs">
          <Label>Stock mínimo por defecto</Label>
          <Input type="number" min={1} value={stockMinimoDefault} onChange={e => setStockMinimoDefault(e.target.value)} className="h-9" />
          <p className="text-xs text-muted-foreground">Los productos nuevos usarán este umbral. Puedes cambiarlo por producto.</p>
        </div>
      </CardBox>

      {/* Exportar datos */}
      <CardBox className="shadow-none border border-border">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Icon icon="solar:export-linear" width={20} className="text-primary" /> Respaldo de datos
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Descarga un archivo CSV con todas tus transacciones y productos. Útil para llevar un respaldo offline o importar a Excel.
        </p>
        <Button variant="outline" onClick={exportarDatos} disabled={exportando}>
          {exportando ? <Icon icon="svg-spinners:180-ring" width={16} className="mr-1 animate-spin" /> : <FileDown className="size-4 mr-1" />}
          {exportando ? 'Exportando...' : 'Exportar datos (CSV)'}
        </Button>
      </CardBox>

      {/* Guardar */}
      <div className="flex justify-end">
        <Button onClick={guardar} disabled={saving} size="lg">
          <Save className="size-4 mr-1" />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  );
};

export default AjustesSistemaPage;
