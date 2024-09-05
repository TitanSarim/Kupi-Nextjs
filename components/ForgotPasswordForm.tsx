"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { isValidEmail } from "@/libs/ClientSideHelpers";
import { sendVerificationCode } from "../actions/sendVerificationCode";
import Link from "next/link";

const ForgotPasswordForm = () => {
  // States for email, message, loading and error
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Function to handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check if the email is valid
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true); // Set loading to true

    // Call the server action to send the verification code
    const response = await sendVerificationCode(email, "reset-password");

    // If the response is successful, redirect to the verification code page
    if (response?.message) {
      setMessage(response.message);
      router.push(`/verification-code?email=${email}&type=reset-password`);
    }

    setLoading(false);
  };

  return (
    <>
      <div className="mt-5">
        <label className="text-dark-grey text-md font-semibold">Email</label>
        <form className="flex items-center" onSubmit={handleSubmit}>
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center border-r border-gray-500 pr-2 h-5 mt-2">
              <img
                className="w-5"
                src="/img/auth-screens/email.svg"
                alt="Email"
              />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-10 py-2 bg-transparent border-b border-gray-900 text-dark-grey text-sm focus:ring-blue-500 focus:border-yellow-500 block w-full ps-10 p-2.5 outline-none"
              placeholder="demo@email.com"
              required
            />
          </div>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
      <button
        type="submit"
        className={`${
          loading ? "opacity-50" : ""
        } bg-kupi-yellow px-8 py-3 rounded-lg w-full text-dark-grey text-md font-semibold mt-10`}
        onClick={handleSubmit}
        disabled={loading || !isValidEmail(email)}
      >
        {loading ? "Please Wait..." : "Forgot password"}
      </button>

      <div className="flex justify-center mt-5">
        <label className="text-dark-grey text-md font-semibold text-center">
          Go back to{" "}
          <Link href="/login">
            <span className="text-kupi-yellow cursor-pointer">Login</span>
          </Link>
        </label>
      </div>
    </>
  );
};

export default ForgotPasswordForm;
