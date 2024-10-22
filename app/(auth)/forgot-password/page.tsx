import Image from "next/image";
import ForgotPasswordForm from "../../../components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="h-screen flex flex-row overflow-hidden flex-wrap bg-light-grey auth-login">
      <Image
        className="absolute w-1/6 right-0 kupi-login-globe"
        src="/img/auth-screens/globe.svg"
        alt="Globe"
        width={100}
        height={100}
      />
      <div className="py-2 px-6 relative z-10 w-full sm:py-6 sm:px-0">
        <div>
          <Image
            src="/img/auth-screens/logo.svg"
            alt="Logo"
            width={210}
            height={210}
          />
        </div>
        <div className="flex flex-row  md:flex-col items-center">
          <div className="w-11/12 px-8 sm:px-5 sm:mt-16 lg:mt-10 lg:w-full">
            <h2 className="font-semibold text-3xl text-dark-grey">
              Forgot Password
            </h2>
            <ForgotPasswordForm />
          </div>
          <div className="flex justify-center w-11/12 sm:mt-16">
            <Image
              className="w-3/4 mt-5 sm:hidden md:hidden lg:hidden"
              src="/img/auth-screens/human-vector.svg"
              alt="Human"
              width={50}
              height={50}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
