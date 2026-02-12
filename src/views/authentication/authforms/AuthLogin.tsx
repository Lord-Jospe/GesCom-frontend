import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from 'src/components/ui/button';
import { Checkbox } from 'src/components/ui/checkbox';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { useAuth } from 'src/context/AuthContext';


const AuthLogin = () => {
  const navigate = useNavigate();
  const {login, user} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
        await login(email, password);

      if (user?.rol === 'ADMIN') {
        navigate('/admin');
      } else if (user?.rol === 'STUDENT') {
        navigate('/student');
      }

    } catch (err: any) {
      setError(err);
    }
  };
  
  return (
    <>
      <form className="mt-6" onSubmit={handleLogin}>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="Username">Correo electrónico</Label>
          </div>
          <Input 
            id="username"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required />
        </div>
        
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="userpwd">Contraseña</Label>
          </div>
          <Input 
              id="userpwd"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required />
        </div>
        <div className="flex justify-between my-5">
          <div className="flex items-center gap-2">
            <Checkbox id="accept" className="checkbox" />
            <Label htmlFor="accept" className="opacity-90 font-normal cursor-pointer">
              Mantener mi sesión abierta
            </Label>
          </div>

          <Link to={'/'} className="text-primary text-sm font-medium">
            ¿Has olvidado tu Contraseña?
          </Link>
        </div>
        
        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        <Button type='submit' className='w-full'>
            Iniciar Sesión
        </Button>
      </form>
    </>
  );
};

export default AuthLogin;
