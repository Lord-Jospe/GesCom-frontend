import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from 'src/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Icon } from '@iconify/react';
import authService from 'src/api/services/auth/authService';

const AuthResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [completado, setCompletado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Enlace inválido o expirado. Solicita uno nuevo.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setCargando(true);
      await authService.resetPassword(token, newPassword);
      setCompletado(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err || 'Error al restablecer la contraseña');
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  if (completado) {
    return (
      <div className="text-center py-6">
        <div className="p-4 rounded-full bg-success/10 w-fit mx-auto mb-4">
          <Icon icon="solar:check-circle-bold" width={32} className="text-success" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">¡Contraseña actualizada!</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión.
        </p>
        <Button className="w-full" onClick={() => navigate('/login')}>
          Ir al inicio de sesión
        </Button>
      </div>
    );
  }

  return (
    <form className="mt-6" onSubmit={handleSubmit}>
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="new-password">Nueva contraseña</Label>
        </div>
        <div className="relative">
          <Input
            id="new-password"
            type={mostrarPassword ? 'text' : 'password'}
            placeholder="Mínimo 6 caracteres"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
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

      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="confirm-password">Confirmar contraseña</Label>
        </div>
        <Input
          id="confirm-password"
          type={mostrarPassword ? 'text' : 'password'}
          placeholder="Repite tu nueva contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={cargando}>
        {cargando ? 'Restableciendo...' : 'Restablecer contraseña'}
      </Button>
    </form>
  );
};

export default AuthResetPassword;
