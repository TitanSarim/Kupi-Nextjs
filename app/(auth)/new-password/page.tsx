import NewPasswordForm from "@/components/NewPasswordForm";
import Image from "next/image";

function NewPasswordPage() {
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
          <a href="/">
            <Image
              src="/img/auth-screens/logo.svg"
              alt="Logo"
              width={210}
              height={210}
            />
          </a>
        </div>
        <div className="flex flex-row  md:flex-col items-center">
          <div className="w-11/12 px-8 sm:px-5 sm:mt-16 lg:mt-10 lg:w-full">
            <h2 className="font-semibold text-3xl text-dark-grey">
              Set New Password
            </h2>
            <NewPasswordForm />
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

export default NewPasswordPage;
