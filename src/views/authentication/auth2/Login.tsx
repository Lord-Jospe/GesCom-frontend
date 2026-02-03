import { Link } from "react-router";
import CardBox from "src/components/shared/CardBox";

import AuthLogin from "../authforms/AuthLogin";
import SocialButtons from "../authforms/SocialButtons";

import FullLogo from "src/layouts/full/shared/logo/FullLogo";


const Login = () => {
  return (
    <>
      <div className="relative overflow-hidden h-screen bg-lightprimary dark:bg-darkprimary">
        <div className="flex h-full justify-center items-center px-4">
          <CardBox className="md:w-[500px] w-full border-none">
            <div className="mx-auto ">
              <FullLogo />
            </div>
            <AuthLogin />
            <div className="flex gap-2 text-base text-sm font-medium mt-6 items-center justify-center">
              <p>Si presenta algún inconveniente con el inicio de sesión por favor envíe un correo a <Link
                to={"/auth/auth2/register"}
                className="text-primary text-sm font-medium"
                > 
                 matriculas@gescom.edu.ve
                </Link>
              </p>

            </div>
          </CardBox>
        </div>
      </div>
    </>
  );
};

export default Login;
