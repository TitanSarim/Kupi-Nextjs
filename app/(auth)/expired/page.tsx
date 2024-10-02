import Link from "next/link";
import React from "react";

const Expired = () => {
  return (
    <div className="flex items-center align-middle justify-center gap-5 flex-col h-full">
      <div className="w-full text-center mt-4">
        Url expired or you are already registered
      </div>
      <Link href="/login" className="bg-kupi-yellow px-6 py-2 rounded-md">
        Login
      </Link>
    </div>
  );
};

export default Expired;
