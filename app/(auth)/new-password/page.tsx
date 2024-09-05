import NewPasswordForm from "@/components/NewPasswordForm";


function NewPasswordPage() {
  return (
    <div className="h-screen flex flex-row flex-wrap auth-login bg-light-grey">
      <img
        className="absolute w-1/6 right-0 kupi-login-globe"
        src="/img/auth-screens/globe.svg"
        alt="Globe"
      />
      <div className="py-2 px-6 relative z-10 w-full sm:py-6">
        <div className="grid grid-cols-1">
          <a href="/">
            <img
              className="w-1/6"
              src="/img/auth-screens/logo.svg"
              alt="Logo"
            />
          </a>
        </div>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-1 items-center">
          <div className="px-8 sm:px-3 sm:mt-16">
            <h2 className="font-semibold text-3xl text-dark-grey">
              Set New Password
            </h2>
            <NewPasswordForm />
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

export default NewPasswordPage