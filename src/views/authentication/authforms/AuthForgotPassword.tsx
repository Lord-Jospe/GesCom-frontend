import { useState } from 'react';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Icon } from '@iconify/react';
import authService from 'src/api/services/auth/authService';

const AuthForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.');
      return;
    }

    try {
      setCargando(true);
      const mensaje = await authService.forgotPassword(email);
      setEnviado(true);
      console.log(mensaje);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err || 'Error al enviar la solicitud');
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  if (enviado) {
    return (
      <div className="text-center py-6">
        <div className="p-4 rounded-full bg-success/10 w-fit mx-auto mb-4">
          <Icon icon="solar:letter-bold" width={32} className="text-success" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">¡Correo enviado!</h3>
        <p className="text-sm text-muted-foreground">
          Si el correo <span className="font-medium text-foreground">{email}</span> está registrado,
          recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada y spam.
        </p>
      </div>
    );
  }

  return (
    <form className="mt-6" onSubmit={handleSubmit}>
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="forgot-email">Correo electrónico</Label>
        </div>
        <Input
          id="forgot-email"
          type="email"
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={cargando}>
        {cargando ? 'Enviando...' : 'Enviar enlace de recuperación'}
      </Button>
    </form>
  );
};

export default AuthForgotPassword;
