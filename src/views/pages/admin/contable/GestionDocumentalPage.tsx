import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { transaccionService } from 'src/api/services/transaccionService';
import type { AdjuntoResponse } from 'src/types/transaccion';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Badge } from 'src/components/ui/badge';
import { Icon } from '@iconify/react';
import { Download, Trash2, FileText, Image, Paperclip, Search, ArrowUpDown, X, MoreHorizontal, FileSpreadsheet } from 'lucide-react';

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const esImagen = (tipo: string) => tipo && /^image\//.test(tipo);
const esPdf = (tipo: string) => tipo && /pdf/.test(tipo);
const esWord = (tipo: string) => tipo && /word|document/.test(tipo);
const esExcel = (tipo: string) => tipo && /excel|spreadsheet/.test(tipo);

type SortKey = 'fecha' | 'nombre' | 'tamano' | 'tipo';
type FiltroTipo = 'TODOS' | 'IMAGENES' | 'ARCHIVOS';

interface TipoInfo { icon: any; label: string; color: string; bg: string; }
const fileConfig: Record<string, TipoInfo> = {
  imagen:   { icon: Image,           label: 'Imagen',  color: 'text-blue-500',   bg: 'bg-blue-500/10' },
  pdf:      { icon: FileText,        label: 'PDF',      color: 'text-red-500',    bg: 'bg-red-500/10' },
  word:     { icon: FileText,        label: 'Word',     color: 'text-blue-400',  bg: 'bg-blue-500/10' },
  excel:    { icon: FileSpreadsheet, label: 'Excel',    color: 'text-green-500',  bg: 'bg-green-500/10' },
  otro:     { icon: FileText,        label: 'Archivo',  color: 'text-gray-400',   bg: 'bg-muted' },
};

const getTipo = (t: string): TipoInfo => {
  if (esImagen(t)) return fileConfig.imagen;
  if (esPdf(t)) return fileConfig.pdf;
  if (esExcel(t)) return fileConfig.excel;
  if (esWord(t)) return fileConfig.word;
  return fileConfig.otro;
};

const GestionDocumentalPage = () => {
  const [adjuntos, setAdjuntos] = useState<AdjuntoResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<AdjuntoResponse | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('TODOS');
  const [sortKey, setSortKey] = useState<SortKey>('fecha');
  const [sortAsc, setSortAsc] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Pan de imagen
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  const cargar = async () => {
    setLoading(true);
    try { setAdjuntos(await transaccionService.listarTodosAdjuntos()); } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await transaccionService.subirDocumentoSuelto(file);
      toast.success('Documento subido');
      cargar();
    } catch (err: any) { toast.error(err.message); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const handleClick = async (a: AdjuntoResponse) => {
    setSelected(a);
    setShowMenu(false);
    setZoom(false);
    try {
      const blob = await transaccionService.descargarAdjunto(a.adjuntoId);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch { toast.error('No se pudo cargar'); }
  };

  const handleDownload = async (a: AdjuntoResponse) => {
    try {
      const blob = await transaccionService.descargarAdjunto(a.adjuntoId);
      const url = URL.createObjectURL(blob);
      const el = document.createElement('a'); el.href = url; el.download = a.nombreOriginal;
      document.body.appendChild(el); el.click(); document.body.removeChild(el);
      URL.revokeObjectURL(url);
    } catch { toast.error('No se pudo descargar'); }
  };

  const handleEliminar = async (a: AdjuntoResponse) => {
    if (!confirm(`¿Eliminar «${a.nombreOriginal}»?`)) return;
    try {
      await transaccionService.eliminarAdjunto(a.adjuntoId);
      if (selected?.adjuntoId === a.adjuntoId) { setSelected(null); setPreviewUrl(null); }
      toast.success('Eliminado');
      cargar();
    } catch (err: any) { toast.error(err.message); }
  };

  const filtrados = adjuntos.filter(a => {
    if (busqueda) {
      const q = busqueda.toLowerCase();
      if (!a.nombreOriginal.toLowerCase().includes(q)
        && !(a.numeroFactura && a.numeroFactura.toLowerCase().includes(q))) return false;
    }
    if (filtroTipo === 'IMAGENES' && !esImagen(a.tipoArchivo)) return false;
    if (filtroTipo === 'ARCHIVOS' && esImagen(a.tipoArchivo)) return false;
    return true;
  });

  const ordenados = [...filtrados].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'fecha': cmp = a.createdAt.localeCompare(b.createdAt); break;
      case 'nombre': cmp = a.nombreOriginal.localeCompare(b.nombreOriginal, 'es'); break;
      case 'tamano': cmp = a.tamanio - b.tamanio; break;
      case 'tipo': cmp = (a.tipoArchivo || '').localeCompare(b.tipoArchivo || ''); break;
    }
    return sortAsc ? cmp : -cmp;
  });

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'fecha', label: 'Más recientes' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'tamano', label: 'Tamaño' },
    { key: 'tipo', label: 'Tipo de archivo' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        {/* ─── Lista ──────────────────────────────────────── */}
        <div className="w-[40%] shrink-0 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-warning/10 shrink-0">
              <Icon icon="solar:folder-with-files-bold" width={28} className="text-warning" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gestión Documental</h1>
              <p className="text-sm text-muted-foreground">{adjuntos.length} documento{adjuntos.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-lg p-0.5">
              {(['TODOS','IMAGENES','ARCHIVOS'] as FiltroTipo[]).map(f => (
                <button key={f}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filtroTipo === f ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setFiltroTipo(f)}
                >{f === 'TODOS' ? 'Todos' : f === 'IMAGENES' ? 'Imágenes' : 'Archivos'}</button>
              ))}
            </div>
            <div className="flex items-center gap-0.5 ml-auto">
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileChange} className="hidden" />
              <button className="p-1.5 rounded-full hover:bg-muted transition-colors disabled:opacity-50" disabled={uploading} onClick={() => fileRef.current?.click()} title="Subir">
                {uploading ? <Icon icon="svg-spinners:180-ring" width={16} className="animate-spin" /> : <Paperclip className="size-4" />}
              </button>
              <div className="relative">
                <button className="p-1.5 rounded-full hover:bg-muted transition-colors" onClick={() => setShowSort(!showSort)} title="Ordenar">
                  <ArrowUpDown className="size-4" />
                </button>
                {showSort && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-popover border rounded-lg shadow-lg z-20 p-1" onClick={() => setShowSort(false)}>
                    {sortOptions.map(opt => (
                      <button key={opt.key} className={`flex items-center justify-between w-full text-left px-2 py-1.5 rounded text-sm hover:bg-muted ${sortKey === opt.key ? 'bg-primary/10 text-primary font-medium' : ''}`}
                        onClick={() => { if (sortKey === opt.key) setSortAsc(!sortAsc); else { setSortKey(opt.key); setSortAsc(false); } }}>
                        {opt.label}
                        {sortKey === opt.key && <Icon icon={sortAsc ? 'solar:sort-from-top-to-bottom-linear' : 'solar:sort-from-bottom-to-top-linear'} width={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar..." className="pl-9 h-9 text-sm" />
            {busqueda && (
              <button onClick={() => setBusqueda('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted">
                <X className="size-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="max-h-[calc(100vh-340px)] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-12"><Icon icon="svg-spinners:180-ring" width={24} className="text-primary animate-spin" /></div>
            ) : ordenados.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">{adjuntos.length === 0 ? 'Sin documentos.' : 'Sin resultados.'}</div>
            ) : (
              <div className="space-y-0.5">
                {ordenados.map(a => {
                  const t = getTipo(a.tipoArchivo);
                  const Icono = t.icon;
                  return (
                    <div key={a.adjuntoId}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/40 rounded-lg transition-colors ${selected?.adjuntoId === a.adjuntoId ? 'bg-muted/60' : ''}`}
                      onClick={() => handleClick(a)}
                    >
                      <div className={`p-1.5 rounded-md shrink-0 ${t.bg}`}>
                        <Icono className={`size-4 ${t.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">{a.nombreOriginal}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatSize(a.tamanio)}
                          <span className={`ml-2 text-xs font-medium ${t.color}`}>{t.label}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ─── Preview ────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col">
          {!selected ? (
            <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground border border-dashed rounded-xl bg-muted/5">
              <Icon icon="solar:document-text-linear" width={48} className="mb-3 text-muted-foreground/30" />
              <p className="text-sm">Selecciona un documento</p>
            </div>
          ) : (() => {
            const t = getTipo(selected.tipoArchivo);
            const Icono = t.icon;
            return (
              <div className="border border-border rounded-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 130px)' }}>
                {/* Header */}
                <div className={`flex items-center gap-3 px-4 py-2.5 shrink-0 ${t.bg} border-b border-border`}>
                  <Icono className={`size-4 ${t.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{selected.nombreOriginal}</p>
                    <p className="text-xs text-muted-foreground">{t.label} · {formatSize(selected.tamanio)}</p>
                  </div>
                  {esImagen(selected.tipoArchivo) && (
                    <button className="p-1 rounded hover:bg-black/10 transition-colors text-xs" onClick={() => { setZoom(!zoom); setPan({ x: 0, y: 0 }); }} title={zoom ? 'Alejar' : 'Acercar'}>
                      {zoom ? 'Alejar' : 'Zoom'}
                    </button>
                  )}
                  <div className="relative">
                    <button className="p-1 rounded hover:bg-black/10 transition-colors" onClick={() => setShowMenu(!showMenu)}>
                      <MoreHorizontal className="size-4" />
                    </button>
                    {showMenu && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-popover border rounded-lg shadow-lg z-20 p-1" onClick={() => setShowMenu(false)}>
                        <button className="flex items-center gap-2 w-full text-left px-3 py-2 rounded text-sm hover:bg-muted" onClick={() => handleDownload(selected)}>
                          <Download className="size-4" /> Descargar
                        </button>
                        <button className="flex items-center gap-2 w-full text-left px-3 py-2 rounded text-sm hover:bg-muted text-red-500" onClick={() => handleEliminar(selected)}>
                          <Trash2 className="size-4" /> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contenido — marco fijo, nunca se desborda */}
                <div className="flex-1 bg-muted/10 overflow-hidden relative">
                  {esImagen(selected.tipoArchivo) && previewUrl ? (
                    <div
                      className={`w-full h-full overflow-hidden ${zoom ? 'cursor-grab' : ''} ${dragging ? 'cursor-grabbing' : ''}`}
                      onMouseDown={e => {
                        if (!zoom || !esImagen(selected.tipoArchivo)) return;
                        setDragging(true);
                        dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
                      }}
                      onMouseMove={e => {
                        if (!dragging) return;
                        setPan({
                          x: dragStart.current.panX + (e.clientX - dragStart.current.x),
                          y: dragStart.current.panY + (e.clientY - dragStart.current.y),
                        });
                      }}
                      onMouseUp={() => setDragging(false)}
                      onMouseLeave={() => setDragging(false)}
                      onDoubleClick={() => { setZoom(!zoom); setPan({ x: 0, y: 0 }); }}
                    >
                      <img
                        src={previewUrl}
                        alt={selected.nombreOriginal}
                        className={zoom ? 'max-w-none' : 'max-w-full max-h-full object-contain mx-auto'}
                        style={zoom ? { transform: `translate(${pan.x}px, ${pan.y}px)` } : {}}
                        draggable={false}
                      />
                    </div>
                  ) : esPdf(selected.tipoArchivo) && previewUrl ? (
                    <iframe src={previewUrl} className="w-full h-full" title="PDF Preview" />
                  ) : previewUrl ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <div className={`p-4 rounded-2xl ${t.bg}`}><Icono className={`size-10 ${t.color}`} /></div>
                      <p className="text-sm font-medium">{selected.nombreOriginal}</p>
                      <p className="text-xs text-muted-foreground">{t.label} · {formatSize(selected.tamanio)}</p>
                      <Button size="sm" variant="outline" onClick={() => handleDownload(selected)}>
                        <Download className="size-3.5 mr-1" /> Descargar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-full"><Icon icon="svg-spinners:180-ring" width={24} className="text-primary animate-spin" /></div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default GestionDocumentalPage;
