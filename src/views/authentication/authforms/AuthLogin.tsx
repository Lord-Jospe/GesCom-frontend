import { Link } from 'react-router';
import { Button } from 'src/components/ui/button';
import { Checkbox } from 'src/components/ui/checkbox';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';

const AuthLogin = () => {
  return (
    <>
      <form className="mt-6">
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="Username">Correo electrónico</Label>
          </div>
          <Input id="username" type="text" />
        </div>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="userpwd">Contraseña</Label>
          </div>
          <Input id="userpwd" type="password" />
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
        <Button asChild className="w-full"
          onClick={() => {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('role', 'student'); // prueba con 'student'
            window.location.href = '/student'; // o /student
        }}>
          <Link to="/">Iniciar Sesión</Link>
        </Button>
      </form>
    </>
  );
};

export default AuthLogin;
