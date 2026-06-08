import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from 'src/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from 'src/components/ui/dialog';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from 'src/components/ui/select';
import { usuariosServices } from 'src/api/services/usuarioService';
import type { UsuarioResponse, NombreRol } from 'src/types/usuario';

interface EditarUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditado: () => void;
  usuario: UsuarioResponse | null;
}

const roles: NombreRol[] = ['ADMIN', 'CONTADOR', 'OPERADOR'];

const EditarUsuarioDialog = ({ open, onOpenChange, onEditado, usuario }: EditarUsuarioDialogProps) => {
  const [form, setForm] = useState({
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    email: '',
    password: '',
    rol: '' as string,
    sueldo: '' as string,
    monedaSueldo: 'USD',
  });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  useEffect(() => {
    if (usuario) {
      setForm({
        primerNombre: usuario.primerNombre,
        segundoNombre: usuario.segundoNombre || '',
        primerApellido: usuario.primerApellido,
        segundoApellido: usuario.segundoApellido || '',
        email: usuario.email,
        password: '',
        rol: usuario.rol,
        sueldo: usuario.sueldo != null ? String(usuario.sueldo) : '',
        monedaSueldo: usuario.monedaSueldo || 'USD',
      });
    }
    setError('');
  }, [usuario, open]);

  const handleSubmit = async () => {
    setError('');

    if (!form.primerNombre.trim() || !form.primerApellido.trim()) {
      setError('Primer nombre y primer apellido son obligatorios.');
      return;
    }
    if (!form.email.trim()) {
      setError('El email es obligatorio.');
      return;
    }

    if (!usuario) return;

    const payload: Record<string, string> = {};
    if (form.email !== usuario.email) payload.email = form.email;
    if (form.primerNombre !== usuario.primerNombre) payload.primerNombre = form.primerNombre;
    if ((form.segundoNombre || '') !== (usuario.segundoNombre || '')) payload.segundoNombre = form.segundoNombre;
    if (form.primerApellido !== usuario.primerApellido) payload.primerApellido = form.primerApellido;
    if ((form.segundoApellido || '') !== (usuario.segundoApellido || '')) payload.segundoApellido = form.segundoApellido;
    if (form.password.trim()) payload.password = form.password;
    const sueldoNum = form.sueldo ? parseFloat(form.sueldo) : null;
    if (sueldoNum !== (usuario.sueldo ?? null)) payload.sueldo = sueldoNum ?? undefined;
    if (form.monedaSueldo !== (usuario.monedaSueldo || 'USD')) payload.monedaSueldo = form.monedaSueldo;

    if (form.rol !== usuario.rol) payload.rol = form.rol;

    if (Object.keys(payload).length === 0) {
      toast.info('No hay cambios que guardar');
      onOpenChange(false);
      return;
    }

    try {
      setGuardando(true);
      await usuariosServices.editarUsuario(usuario.usuarioId, payload);
      toast.success(`Usuario ${form.primerNombre} ${form.primerApellido} actualizado correctamente`);
      onOpenChange(false);
      onEditado();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err || 'Error al editar usuario');
      console.error('[EditarUsuarioDialog]', err);
      toast.error(msg);
      setError(msg);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-primerNombre">Primer nombre *</Label>
            <Input
              id="edit-primerNombre"
              value={form.primerNombre}
              onChange={(e) => setForm({ ...form, primerNombre: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-segundoNombre">Segundo nombre</Label>
            <Input
              id="edit-segundoNombre"
              value={form.segundoNombre}
              onChange={(e) => setForm({ ...form, segundoNombre: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-primerApellido">Primer apellido *</Label>
            <Input
              id="edit-primerApellido"
              value={form.primerApellido}
              onChange={(e) => setForm({ ...form, primerApellido: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-segundoApellido">Segundo apellido</Label>
            <Input
              id="edit-segundoApellido"
              value={form.segundoApellido}
              onChange={(e) => setForm({ ...form, segundoApellido: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-email">Correo electrónico *</Label>
          <Input
            id="edit-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="usuario@empresa.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-password">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="edit-password"
                type={mostrarPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Dejar vacío para no cambiar"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                tabIndex={-1}
              >
                {mostrarPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-rol">Rol</Label>
            <Select
              value={form.rol}
              onValueChange={(val) => setForm({ ...form, rol: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((rol) => (
                  <SelectItem key={rol} value={rol}>{rol}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-sueldo">Sueldo</Label>
            <Input
              id="edit-sueldo"
              type="number"
              step="0.01"
              value={form.sueldo}
              onChange={(e) => setForm({ ...form, sueldo: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-monedaSueldo">Moneda</Label>
            <Select
              value={form.monedaSueldo || 'USD'}
              onValueChange={(val) => setForm({ ...form, monedaSueldo: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="VES">VES (Bs.)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={guardando}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditarUsuarioDialog;
