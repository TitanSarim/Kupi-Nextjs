import Image from "next/image";
import React from "react";
import { signOut } from "@/auth";

const Suspended = () => {
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
        <div className="w-full flex flex-col items-center gap-5 mt-10 justify-center">
          <p className="font-extrabold text-4xl text-black">
            Account Suspended
          </p>
          <span>Your account has been suspended / blocked</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="bg-kupi-yellow px-8  py-4 rounded-lg flex flex-row gap-5 items-center justify-centerce text-xl"
            >
              <Image
                src="/img/icons/Arrow-28.svg"
                alt="arrow"
                width={30}
                height={30}
              />
              Back to Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Suspended;
