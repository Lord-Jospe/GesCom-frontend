import { useEffect } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import CardBox from 'src/components/shared/CardBox';
import AuthLogin from '../authforms/AuthLogin';
import FullLogo from 'src/layouts/full/shared/logo/FullLogo';
import { recuperarErrores401 } from 'src/api/axios';

const Login = () => {
  useEffect(() => {
    const errores = recuperarErrores401();
    if (errores.length > 0) {
      errores.forEach((e: { url: string; status: number; data: unknown }) => {
        console.error(
          `%c[Session expirada] ${e.url} → ${e.status}`,
          'color: red; font-weight: bold',
          e.data,
        );
      });
      toast.error('Tu sesión expiró. Por favor inicia sesión de nuevo.', {
        description: 'Revisa la consola (F12) para ver el detalle del error.',
        duration: 8000,
      });
    }
  }, []);

  return (
    <>
      <div className="relative overflow-auto min-h-screen bg-lightprimary dark:bg-darkprimary">
        <div className="flex min-h-screen justify-center items-center px-4 py-8">
          <CardBox className="w-full max-w-md md:max-w-lg border-none">
            <div className="mx-auto mb-4 flex justify-center ">
              <Link to={"/"}><FullLogo /></Link>
            </div>
            <AuthLogin />
            <div className="flex gap-2 text-base text-sm font-medium mt-6 items-center justify-center">
              <p>¿Aún no tienes cuenta?</p>
              <Link
                to={"/register"}
                className="text-primary text-sm font-medium"
                > 
                 Regístrate
                </Link>
            
            </div>
          </CardBox>
        </div>
      </div>
    </>
  );
};

export default Login;
