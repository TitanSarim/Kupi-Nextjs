"use client";
import React from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  const handleSignup = () => {
    router.push("/signup");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome to the Page</h1>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-md mr-2"
        onClick={handleLogin}
      >
        Login
      </button>
      <button
        className="px-4 py-2 bg-green-500 text-white rounded-md"
        onClick={handleSignup}
      >
        Sign Up
      </button>
    </div>
  );
};

export default Page;