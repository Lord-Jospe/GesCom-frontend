import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { transaccionService } from 'src/api/services/transaccionService';
import type { AdjuntoResponse } from 'src/types/transaccion';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { Upload, Download, Trash2, Eye, FileText, Image, Search } from 'lucide-react';

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const esImagen = (tipo: string) => tipo && (tipo.startsWith('image/jpeg') || tipo.startsWith('image/png') || tipo.startsWith('image/webp'));
const esPdf = (tipo: string) => tipo && tipo.startsWith('application/pdf');

const GestionDocumentalPage = () => {
  const [adjuntos, setAdjuntos] = useState<AdjuntoResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [uploadTransaccionId, setUploadTransaccionId] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTipo, setPreviewTipo] = useState('');

  const cargar = async () => {
    setLoading(true);
    try { setAdjuntos(await transaccionService.listarTodosAdjuntos()); } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const handleUpload = async () => {
    if (!uploadTransaccionId || !archivo) { toast.error('Selecciona una transacción y un archivo'); return; }
    setUploading(true);
    try {
      await transaccionService.subirAdjunto(Number(uploadTransaccionId), archivo);
      toast.success('Documento subido');
      setUploadTransaccionId(''); setArchivo(null);
      cargar();
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  const handlePreview = async (adjuntoId: number, tipo: string) => {
    try {
      const blob = await transaccionService.descargarAdjunto(adjuntoId);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewTipo(tipo);
    } catch (e: any) { toast.error('No se pudo cargar la vista previa'); }
  };

  const handleDownload = async (adjuntoId: number, nombre: string) => {
    try {
      const blob = await transaccionService.descargarAdjunto(adjuntoId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = nombre;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) { toast.error('No se pudo descargar'); }
  };

  const handleEliminar = async (adjuntoId: number) => {
    if (!confirm('¿Eliminar este documento?')) return;
    try {
      await transaccionService.eliminarAdjunto(adjuntoId);
      toast.success('Documento eliminado');
      cargar();
    } catch (e: any) { toast.error(e.message); }
  };

  const filtrados = busqueda
    ? adjuntos.filter(a => a.nombreOriginal.toLowerCase().includes(busqueda.toLowerCase()) || String(a.adjuntoId).includes(busqueda))
    : adjuntos;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-warning/10 shrink-0">
          <Icon icon="solar:folder-with-files-bold" width={32} className="text-warning" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Gestión Documental</h1>
          <p className="text-muted-foreground">Bóveda digital de facturas, recibos y documentos</p>
        </div>
      </div>

      {/* Subir documento */}
      <CardBox className="shadow-none border border-border">
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Upload className="size-4 text-primary" /> Subir documento
        </h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Transacción #</Label>
            <Input type="number" min={1} value={uploadTransaccionId} onChange={e => setUploadTransaccionId(e.target.value)} placeholder="ID de la transacción" className="h-9 w-40" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Archivo (JPG, PNG, PDF)</Label>
            <Input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setArchivo(e.target.files?.[0] || null)} className="h-9 text-sm" />
          </div>
          <Button onClick={handleUpload} disabled={uploading || !archivo || !uploadTransaccionId} className="h-9">
            {uploading ? <Icon icon="svg-spinners:180-ring" width={16} className="mr-1 animate-spin" /> : <Upload className="size-4 mr-1" />}
            Subir
          </Button>
        </div>
      </CardBox>

      {/* Búsqueda y lista */}
      <CardBox className="shadow-none border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            {adjuntos.length} documento{adjuntos.length !== 1 ? 's' : ''}
          </h3>
          <div className="relative w-64">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre..." className="h-9 pl-9 text-sm" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon icon="svg-spinners:180-ring" width={24} className="mx-auto mb-2 animate-spin" /> Cargando...
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon icon="solar:folder-open-linear" width={48} className="mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-lg font-medium">Bóveda vacía</p>
            <p className="text-sm">Sube documentos vinculándolos a una transacción</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtrados.map(a => (
              <div key={a.adjuntoId} className="border rounded-lg p-3 hover:border-primary/40 hover:bg-muted/5 transition-all group">
                <div className="flex items-start gap-3">
                  {/* Icono según tipo */}
                  <div className={`p-2 rounded-lg shrink-0 ${esImagen(a.tipoArchivo) ? 'bg-blue-50 text-blue-600' : esPdf(a.tipoArchivo) ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                    {esImagen(a.tipoArchivo) ? <Image className="size-6" /> : <FileText className="size-6" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" title={a.nombreOriginal}>{a.nombreOriginal}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatSize(a.tamanio)} · {new Date(a.createdAt).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                {/* Acciones */}
                <div className="flex gap-1 mt-2 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handlePreview(a.adjuntoId, a.tipoArchivo)}>
                    <Eye className="size-3 mr-1" /> Ver
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleDownload(a.adjuntoId, a.nombreOriginal)}>
                    <Download className="size-3 mr-1" /> Descargar
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500 hover:bg-red-50 ml-auto" onClick={() => handleEliminar(a.adjuntoId)}>
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBox>

      {/* Preview dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => { setPreviewUrl(null); setPreviewTipo(''); }}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader><DialogTitle>Vista previa</DialogTitle></DialogHeader>
          {previewUrl && (
            <div className="flex items-center justify-center min-h-[300px] bg-muted/10 rounded-lg overflow-auto">
              {esImagen(previewTipo) ? (
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-[70vh] object-contain" />
              ) : (
                <iframe src={previewUrl} className="w-full h-[70vh]" title="PDF Preview" />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GestionDocumentalPage;
