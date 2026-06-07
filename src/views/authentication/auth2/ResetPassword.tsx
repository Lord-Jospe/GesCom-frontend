import { Link } from 'react-router';
import CardBox from 'src/components/shared/CardBox';
import AuthResetPassword from '../authforms/AuthResetPassword';
import FullLogo from 'src/layouts/full/shared/logo/FullLogo';
import { Button } from 'src/components/ui/button';

const ResetPassword = () => {
  return (
    <div className="relative overflow-hidden min-h-screen bg-lightprimary dark:bg-darkprimary">
      <div className="flex min-h-screen justify-center items-center px-4 py-2">
        <CardBox className="w-full max-w-md border-none">
          <div className="mx-auto mb-4 flex justify-center">
            <Link to="/"><FullLogo /></Link>
          </div>
          <h2 className="text-xl font-bold text-center text-foreground">Restablecer contraseña</h2>
          <p className="text-muted-foreground text-sm text-center mt-2">
            Crea una nueva contraseña para tu cuenta.
          </p>
          <AuthResetPassword />
          <Button variant="lightprimary" className="w-full mt-3" asChild>
            <Link to="/login">Volver al inicio de sesión</Link>
          </Button>
        </CardBox>
      </div>
    </div>
  );
};

export default ResetPassword;
