import { Link } from "react-router";
import CardBox from "src/components/shared/CardBox";

import AuthRegister from "../authforms/AuthRegister";
//import SocialButtons from "../authforms/SocialButtons";

import FullLogo from "src/layouts/full/shared/logo/FullLogo";
import { RegisterProvider } from "src/context/RegisterContext";



const Register = () => {
  return (
    <>
      <div className="relative overflow-auto min-h-screeen bg-lightprimary dark:bg-darkprimary">
        <div className="flex min-h-screen justify-center items-center px-4 py-8">
          <CardBox className="w-full max-w-md md:max-w-lg border-nonee">
            <div className="mx-auto mb-4 flex justify-center">
              <Link to={"/"}><FullLogo /></Link>
            </div>

            <RegisterProvider>
                <AuthRegister />
            </RegisterProvider>

            <div className="flex gap-2 text-base text-sm font-medium mt-6 items-center justify-center">
              <p>Ya tienes cuenta?</p>
              <Link
                to={"/login"}
                className="text-primary text-sm font-medium"
              >
                Iniciar Sesión
              </Link>
            </div>
          </CardBox>
        </div>
      </div>
    </>
  );
};

export default Register;
