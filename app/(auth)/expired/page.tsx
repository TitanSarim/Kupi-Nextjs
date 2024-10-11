import Image from "next/image";
import Link from "next/link";
import React from "react";

const Expired = () => {
  return (
    <div className="h-screen flex flex-row overflow-hidden flex-wrap bg-light-grey auth-login">
      <Image
        className="absolute w-1/6 right-0 kupi-login-globe"
        src="/img/auth-screens/globe.svg"
        alt="Globe"
        width={100}
        height={100}
      />
      <div className="py-2 px-6 relative z-10 w-full sm:py-6">
        <div className="grid grid-cols-1">
          <Image
            className="w-1/6"
            src="/img/auth-screens/logo.svg"
            alt="Logo"
            width={100}
            height={100}
          />
        </div>
        <div className="w-full flex flex-col items-center gap-5 mt-10 justify-center">
          <p className="font-extrabold text-4xl text-black">
            Invitation Expired
          </p>
          <span>The link you are trying to access is expired</span>
          <Link
            href="/"
            className="bg-kupi-yellow px-8  py-4 rounded-lg flex flex-row gap-5 items-center justify-centerce text-xl"
          >
            <Image
              src="/img/icons/Arrow-28.svg"
              alt="arrow"
              width={30}
              height={30}
            />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Expired;
