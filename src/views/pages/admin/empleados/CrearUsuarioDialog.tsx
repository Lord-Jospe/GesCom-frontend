import { useState } from 'react';
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
import type { CrearUsuarioRequest, NombreRol } from 'src/types/usuario';

interface CrearUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreado: () => void;
}

const roles: NombreRol[] = ['ADMIN', 'CONTADOR', 'OPERADOR'];

const CrearUsuarioDialog = ({ open, onOpenChange, onCreado }: CrearUsuarioDialogProps) => {
  const [form, setForm] = useState<CrearUsuarioRequest>({
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    email: '',
    password: '',
    rol: 'OPERADOR',
    sueldo: undefined,
    monedaSueldo: 'USD',
  } as CrearUsuarioRequest);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const resetForm = () => {
    setForm({
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      email: '',
      password: '',
      rol: 'OPERADOR',
      sueldo: undefined,
      monedaSueldo: 'USD',
    } as CrearUsuarioRequest);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');

    if (!form.primerNombre.trim() || !form.primerApellido.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Campos obligatorios: primer nombre, primer apellido, email y contraseña.');
      return;
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setGuardando(true);
      console.log('[CrearUsuarioDialog] Enviando datos:', form);
      await usuariosServices.crearUsuario(form);
      toast.success(`Usuario ${form.primerNombre} ${form.primerApellido} creado correctamente`);
      resetForm();
      onOpenChange(false);
      onCreado();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err || 'Error al crear usuario');
      console.error('[CrearUsuarioDialog]', err);
      toast.error(msg);
      setError(msg);
    } finally {
      setGuardando(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear nuevo usuario</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="primerNombre">Primer nombre *</Label>
            <Input
              id="primerNombre"
              value={form.primerNombre}
              onChange={(e) => setForm({ ...form, primerNombre: e.target.value })}
              placeholder="Juan"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="segundoNombre">Segundo nombre</Label>
            <Input
              id="segundoNombre"
              value={form.segundoNombre}
              onChange={(e) => setForm({ ...form, segundoNombre: e.target.value })}
              placeholder="Carlos"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="primerApellido">Primer apellido *</Label>
            <Input
              id="primerApellido"
              value={form.primerApellido}
              onChange={(e) => setForm({ ...form, primerApellido: e.target.value })}
              placeholder="Pérez"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="segundoApellido">Segundo apellido</Label>
            <Input
              id="segundoApellido"
              value={form.segundoApellido}
              onChange={(e) => setForm({ ...form, segundoApellido: e.target.value })}
              placeholder="González"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Correo electrónico *</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="juan@empresa.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Contraseña *</Label>
            <div className="relative">
              <Input
                id="password"
                type={mostrarPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
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
            <Label htmlFor="rol">Rol *</Label>
            <Select
              value={form.rol}
              onValueChange={(val) => setForm({ ...form, rol: val as NombreRol })}
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
            <Label htmlFor="sueldo">Sueldo</Label>
            <Input
              id="sueldo"
              type="number"
              step="0.01"
              value={form.sueldo ?? ''}
              onChange={(e) => setForm({ ...form, sueldo: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="0.00"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="monedaSueldo">Moneda del sueldo</Label>
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
          <Button variant="outline" onClick={() => handleClose(false)} disabled={guardando}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={guardando}>
            {guardando ? 'Creando...' : 'Crear usuario'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CrearUsuarioDialog;
