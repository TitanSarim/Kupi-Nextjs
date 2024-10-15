"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { validateFields } from "@/libs/ClientSideHelpers";
import { sendVerificationCode } from "../actions/sendVerificationCode";
import Link from "next/link";
import ErrorMessage from "@/components/ErrorMessage";
import InputField from "@/components/InputField";
import toast from "react-hot-toast";

const ForgotPasswordForm = () => {
  // States for email, message, loading and error
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const value = e.target.value;
    setEmail(value);

    if (!emailRegex.test(value)) {
      setError("Please enter a valid email");
    } else {
      setError(null);
    }
  };

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
    if (response === false) {
      toast.error("Failed to send verification code");
      setError("Email not found");
    } else if (response === true) {
      toast.success("Verification code sent");
      setError(null);
      router.push(`/verification-code?email=${email}&type=reset-password`);
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
          onChange={handleChange}
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
            loading || error !== null ? "opacity-50" : ""
          } bg-kupi-yellow px-8 py-3 rounded-lg w-full text-dark-grey text-md font-semibold mt-10`}
          disabled={loading || error !== null}
        >
          {loading ? "Please Wait..." : "Forgot password"}
        </button>
      </form>

      <div className="flex justify-center mt-5">
        <label className="text-dark-grey text-md font-semibold text-center">
          Go back to{" "}
          <Link href="/">
            <span className="text-kupi-yellow cursor-pointer">Login</span>
          </Link>
        </label>
      </div>
    </>
  );
};

export default ForgotPasswordForm;
