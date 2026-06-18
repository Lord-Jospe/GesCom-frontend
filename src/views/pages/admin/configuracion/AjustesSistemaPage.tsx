import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { empresaService } from 'src/api/services/empresaService';
import { transaccionService } from 'src/api/services/transaccionService';
import { inventarioService } from 'src/api/services/inventarioService';
import type { EmpresaResponse } from 'src/types/empresa';
import CardBox from 'src/components/shared/CardBox';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Switch } from 'src/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import { Icon } from '@iconify/react';
import { Save, FileDown, FileUp, AlertTriangle } from 'lucide-react';

const AjustesSistemaPage = () => {
  const [empresa, setEmpresa] = useState<EmpresaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    ivaActivo: true, ivaPorcentaje: '16', igtfActivo: false,
    facturaPrefijo: '', facturaSiguienteNumero: '1',
  });
  const original = useRef({ ...form });

  const [stockMinimoDefault, setStockMinimoDefault] = useState('5');
  const [exportando, setExportando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [previewImport, setPreviewImport] = useState<string[][] | null>(null);
  const [showImport, setShowImport] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const emp = await empresaService.obtenerPerfil();
      setEmpresa(emp);
      const f = {
        ivaActivo: emp.ivaActivo, ivaPorcentaje: String(emp.ivaPorcentaje || 16), igtfActivo: emp.igtfActivo,
        facturaPrefijo: emp.facturaPrefijo || '', facturaSiguienteNumero: String(emp.facturaSiguienteNumero || 1),
      };
      setForm(f);
      original.current = { ...f };
      setStockMinimoDefault('5');
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const dirty = form.ivaActivo !== original.current.ivaActivo
    || form.ivaPorcentaje !== original.current.ivaPorcentaje
    || form.igtfActivo !== original.current.igtfActivo
    || form.facturaPrefijo !== original.current.facturaPrefijo
    || form.facturaSiguienteNumero !== original.current.facturaSiguienteNumero;

  const guardar = async () => {
    if (!empresa) return;
    try {
      setSaving(true);
      const delta: any = {};
      if (form.ivaActivo !== original.current.ivaActivo) delta.ivaActivo = form.ivaActivo;
      if (form.ivaPorcentaje !== original.current.ivaPorcentaje) delta.ivaPorcentaje = Number(form.ivaPorcentaje);
      if (form.igtfActivo !== original.current.igtfActivo) delta.igtfActivo = form.igtfActivo;
      if (form.facturaPrefijo !== original.current.facturaPrefijo) delta.facturaPrefijo = form.facturaPrefijo;
      if (form.facturaSiguienteNumero !== original.current.facturaSiguienteNumero) delta.facturaSiguienteNumero = Number(form.facturaSiguienteNumero);
      if (Object.keys(delta).length === 0) { toast.info('Sin cambios que guardar'); return; }
      await empresaService.editarPerfil(delta);
      toast.success('Ajustes actualizados');
      cargar();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const exportar = async (fmt: 'xlsx' | 'csv') => {
    setExportando(true);
    try {
      const [txns, productos] = await Promise.all([
        transaccionService.listar(),
        inventarioService.obtenerTodos(),
      ]);
      const fecha = new Date().toISOString().slice(0, 10);

      if (fmt === 'xlsx') {
        const wb = XLSX.utils.book_new();
        const txData = txns.map(t => ({
          Tipo: t.tipo, ID: t.transaccionId, Fecha: t.fecha,
          'Cliente/Proveedor': t.clienteNombre || t.proveedorNombre || '',
          'Nro Factura': t.numeroFactura || '', Moneda: t.moneda,
          Subtotal: t.subtotal, IVA: t.ivaMonto, IGTF: t.igtfMonto,
          Total: t.total, Estado: t.estado,
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(txData), 'Transacciones');
        const prodData = productos.map(p => ({
          Nombre: p.nombre, Código: p.codigo || '', Categoría: p.categoria || '',
          Stock: p.stockActual, 'Precio Venta': p.precioVenta || 0, 'Costo Unitario': p.costoUnitario || 0,
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(prodData), 'Productos');
        XLSX.writeFile(wb, `gescom-backup-${fecha}.xlsx`);
      } else {
        const csvRows: string[] = ['Tipo,ID,Fecha,Cliente/Proveedor,Nro Factura,Moneda,Subtotal,IVA,IGTF,Total,Estado'];
        txns.forEach(t => csvRows.push(`${t.tipo},${t.transaccionId},${t.fecha},"${t.clienteNombre || t.proveedorNombre || ''}",${t.numeroFactura || ''},${t.moneda},${t.subtotal},${t.ivaMonto},${t.igtfMonto},${t.total},${t.estado}`));
        csvRows.push('---PRODUCTOS---');
        csvRows.push('Nombre,Codigo,Categoria,Stock,Precio Venta,Costo Unitario');
        productos.forEach(p => csvRows.push(`"${p.nombre}","${p.codigo || ''}","${p.categoria || ''}",${p.stockActual},${p.precioVenta || 0},${p.costoUnitario || 0}`));
        const blob = new Blob(['﻿' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `gescom-backup-${fecha}.csv`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      toast.success(`Backup exportado (${fmt.toUpperCase()})`);
    } catch (e: any) { toast.error('Error al exportar: ' + e.message); }
    finally { setExportando(false); }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        // Buscar hoja de Productos
        const sheetName = wb.SheetNames.find(s => s.toLowerCase().includes('producto')) || wb.SheetNames[wb.SheetNames.length - 1];
        const sheet = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
        // Saltar cabecera
        const prodRows = rows.slice(1).filter(r => r.length > 0 && r[0]);
        if (prodRows.length === 0) { toast.error('No se encontraron productos en el archivo'); return; }
        setPreviewImport(prodRows as string[][]);
        setShowImport(true);
      } catch { toast.error('No se pudo leer el archivo. Asegúrate de que sea un Excel válido.'); }
    };
    reader.readAsArrayBuffer(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const ejecutarImport = async () => {
    if (!previewImport) return;
    setImportando(true);
    let ok = 0, fail = 0;
    for (const row of previewImport) {
      const [nombre, codigo, categoria, stock, precioVenta, costoUnitario] = row;
      if (!nombre) continue;
      try {
        await inventarioService.crear({
          nombre,
          codigo: codigo || undefined,
          categoria: categoria || undefined,
          unidadMedida: 'UNIDAD',
          costoUnitario: Number(costoUnitario) || 0,
          precioVenta: Number(precioVenta) || 0,
          stockInicial: Number(stock) || 0,
        });
        ok++;
      } catch { fail++; }
    }
    toast.success(`${ok} productos importados` + (fail > 0 ? `, ${fail} errores` : ''));
    setShowImport(false);
    setPreviewImport(null);
    setImportando(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Icon icon="svg-spinners:180-ring" width={32} className="text-primary animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ajustes del Sistema</h1>
        <p className="text-muted-foreground">Impuestos, facturación, alertas y respaldo de datos</p>
      </div>

      {/* IVA / IGTF */}
      <CardBox className="shadow-none border border-border">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Icon icon="solar:document-text-linear" width={20} className="text-primary" /> Impuestos
        </h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-sm">IVA</p><p className="text-xs text-muted-foreground">Impuesto al Valor Agregado</p></div>
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
              <div><p className="font-medium text-sm">IGTF (3%)</p><p className="text-xs text-muted-foreground">Solo transacciones en divisas (USD)</p></div>
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

      {/* Alertas inventario */}
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

      {/* Respaldo */}
      <CardBox className="shadow-none border border-border">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Icon icon="solar:database-linear" width={20} className="text-primary" /> Respaldo de datos
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Exporta todas tus transacciones y productos a Excel o CSV. Puedes importar el archivo para restaurar productos.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => exportar('xlsx')} disabled={exportando}>
            {exportando ? <Icon icon="svg-spinners:180-ring" width={16} className="mr-1 animate-spin" /> : <FileDown className="size-4 mr-1" />}
            Exportar Excel
          </Button>
          <Button variant="outline" onClick={() => exportar('csv')} disabled={exportando}>
            {exportando ? <Icon icon="svg-spinners:180-ring" width={16} className="mr-1 animate-spin" /> : <FileDown className="size-4 mr-1" />}
            Exportar CSV
          </Button>
          <input ref={fileRef} type="file" accept=".xlsx,.csv" onChange={handleFilePick} className="hidden" />
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <FileUp className="size-4 mr-1" /> Importar backup
          </Button>
        </div>
      </CardBox>

      {/* Guardar (solo si hay cambios) */}
      {dirty && (
        <div className="flex justify-end">
          <Button onClick={guardar} disabled={saving} size="lg">
            <Save className="size-4 mr-1" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      )}

      {/* Diálogo confirmación import */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-warning" /> Importar productos
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Se importarán <strong>{previewImport?.length || 0} productos</strong> desde el Excel. Los productos existentes no se modificarán.
          </p>
          {previewImport && previewImport.length > 0 && (
            <div className="max-h-48 overflow-y-auto border rounded-lg mt-2">
              <table className="w-full text-sm">
                <thead className="bg-muted/30"><tr>
                  <th className="text-left px-3 py-1.5 text-xs">Nombre</th>
                  <th className="text-right px-3 py-1.5 text-xs">Stock</th>
                  <th className="text-right px-3 py-1.5 text-xs">Precio</th>
                </tr></thead>
                <tbody>
                  {previewImport.slice(0, 20).map((r, i) => (
                    <tr key={i} className="border-t"><td className="px-3 py-1 text-xs truncate max-w-40">{r[0]}</td><td className="px-3 py-1 text-xs text-right">{r[3]}</td><td className="px-3 py-1 text-xs text-right">${r[4]}</td></tr>
                  ))}
                  {previewImport.length > 20 && <tr><td colSpan={3} className="text-center text-xs text-muted-foreground py-1">...y {previewImport.length - 20} más</td></tr>}
                </tbody>
              </table>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setShowImport(false); setPreviewImport(null); }}>Cancelar</Button>
            <Button onClick={ejecutarImport} disabled={importando}>
              {importando ? <Icon icon="svg-spinners:180-ring" width={16} className="mr-1 animate-spin" /> : null}
              Importar {previewImport?.length || 0} productos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AjustesSistemaPage;
