import { toast } from 'sonner';
import { Button } from 'src/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from 'src/components/ui/dialog';
import { usuariosServices } from 'src/api/services/usuarioService';
import type { UsuarioResponse } from 'src/types/usuario';
import { useState } from 'react';

interface ConfirmarToggleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleado: () => void;
  usuario: UsuarioResponse | null;
}

const ConfirmarToggleDialog = ({ open, onOpenChange, onToggleado, usuario }: ConfirmarToggleDialogProps) => {
  const [procesando, setProcesando] = useState(false);

  if (!usuario) return null;

  const esActivar = !usuario.activo;
  const accion = esActivar ? 'activar' : 'desactivar';

  const handleConfirmar = async () => {
    if (!usuario) return;

    try {
      setProcesando(true);
      if (esActivar) {
        await usuariosServices.activarUsuario(usuario.usuarioId);
      } else {
        await usuariosServices.desactivarUsuario(usuario.usuarioId);
      }
      toast.success(
        `Usuario ${usuario.primerNombre} ${usuario.primerApellido} ${esActivar ? 'activado' : 'desactivado'} correctamente`
      );
      onOpenChange(false);
      onToggleado();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err || `Error al ${accion} usuario`);
      console.error('[ConfirmarToggleDialog]', err);
      toast.error(msg);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {esActivar ? 'Activar usuario' : 'Desactivar usuario'}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          {esActivar
            ? `¿Estás seguro de que deseas activar a ${usuario.primerNombre} ${usuario.primerApellido}? Podrá acceder nuevamente al sistema.`
            : `¿Estás seguro de que deseas desactivar a ${usuario.primerNombre} ${usuario.primerApellido}? No podrá acceder al sistema hasta que sea reactivado. Sus registros históricos se conservan.`
          }
        </p>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={procesando}>
            Cancelar
          </Button>
          <Button
            variant={esActivar ? 'default' : 'destructive'}
            onClick={handleConfirmar}
            disabled={procesando}
          >
            {procesando ? 'Procesando...' : esActivar ? 'Activar' : 'Desactivar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmarToggleDialog;
