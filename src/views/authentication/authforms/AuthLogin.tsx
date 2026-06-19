import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from 'src/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { useAuth } from 'src/context/AuthContext';

const AuthLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }

    try {
      setCargando(true);
      const user = await login(email, password);

      // Redirigir según rol
      if (user.rol === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else if (user.rol === 'ADMIN') {
        navigate('/admin');
      } else if (user.rol === 'CONTADOR') {
        navigate('/contador');
      } else if (user.rol === 'OPERADOR') {
        navigate('/operador');
      } else {
        navigate('/admin');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err || 'Error al iniciar sesión');
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form className="mt-6" onSubmit={handleLogin}>
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="email">Correo electrónico</Label>
        </div>
        <Input
          id="email"
          type="email"
          placeholder="Ingresa tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="password">Contraseña</Label>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={mostrarPassword ? 'text' : 'password'}
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
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

      <div className="flex justify-end my-4">
        <Link to="/forgot-password" className="text-primary text-sm font-medium hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={cargando}>
        {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>
    </form>
  );
};

export default AuthLogin;
