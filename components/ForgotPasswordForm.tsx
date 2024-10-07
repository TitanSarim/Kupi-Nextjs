"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { validateFields } from "@/libs/ClientSideHelpers";
import { sendVerificationCode } from "../actions/sendVerificationCode";
import Link from "next/link";
import ErrorMessage from "@/components/ErrorMessage";
import InputField from "@/components/InputField";

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

    // Validate email using validateFields function
    const emailError = validateFields("email", email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true); // Set loading to true

    // Call the server action to send the verification code
    const response = await sendVerificationCode(email, "reset-password");

    // If the response is successful, redirect to the verification code page
    if (response?.message) {
      setMessage(response.message);
      setError(null); 
      router.push(`/verification-code?email=${email}&type=reset-password`);
      
    } else {
      setError("An unexpected error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <>
      <form className="mt-5" onSubmit={handleSubmit} noValidate>
        {/* Email Input Field */}
        <InputField
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="demo@email.com"
          label="Email"
          iconSrc="/img/auth-screens/email.svg"
          error={error || undefined}
          disabled={loading}
        />

        {/* Submit Button */}
        <button
          type="submit"
          className={`${
            loading ? "opacity-50" : ""
          } bg-kupi-yellow px-8 py-3 rounded-lg w-full text-dark-grey text-md font-semibold mt-10`}
          disabled={loading}
        >
          {loading ? "Please Wait..." : "Forgot password"}
        </button>
      </form>

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
