import LoginForm from "../../../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="h-screen flex flex-row overflow-hidden flex-wrap bg-light-grey auth-login">
      <img
        className="absolute w-1/6 right-0 kupi-login-globe"
        src="/img/auth-screens/globe.svg"
        alt="Globe"
      />
      <div className="py-2 px-6 relative z-10 w-full sm:py-6">
        <div className="grid grid-cols-1">
          <img className="w-1/6" src="/img/auth-screens/logo.svg" alt="Logo" />
        </div>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-1 items-center">
          <div className="px-8 sm:px-3 sm:mt-16">
            <h2 className="font-semibold text-3xl text-dark-grey">
              Welcome back!
            </h2>
            <LoginForm />
          </div>
          <div className="flex justify-center sm:mt-16">
            <img
              className="w-3/4 mt-5"
              src="/img/auth-screens/human-vector.svg"
              alt="Human"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
