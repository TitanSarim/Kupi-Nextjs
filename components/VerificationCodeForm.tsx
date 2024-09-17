// app/components/VerificationCodeForm.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { handleVerification } from "../actions/handleVerification";
import { sendVerificationCode } from "../actions/sendVerificationCode";
import { VerificationType } from "../types/auth";

const VerificationCodeForm = ({
  email,
  type,
}: {
  email: string;
  type: string;
}) => {
  // States for verification code, message, timer, canResend, loading, and resendLoading
  const [code, setCode] = useState<string[]>(["", "", "", ""]);
  const [message, setMessage] = useState<string>("");
  const [timer, setTimer] = useState<number>(40);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  // Timer logic
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Function to handle input change
  const handleChange = (value: string, idx: number) => {
    const newCode = [...code];
    newCode[idx] = value;
    setCode(newCode);

    // Focus on the next input
    if (value && idx < 3) {
      inputRefs.current[idx + 1]?.focus();
    }

    // Focus on the previous input
    if (!value && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  // Function to verify the code
  const verifyCode = async () => {
    setLoading(true);
    const verificationCode = code.join("");
    // Call the server action to handle the verification
    const response = await handleVerification(
      email,
      verificationCode,
      type as "signup" | "reset-password"
    );

    setLoading(false);

    // If the response is successful, redirect to the appropriate page
    if (response?.status === 200) {
      if (response.type === "signup") {
        router.push("/login");
      } else if (response.type === "reset-password") {
        router.push(`/new-password?email=${email}`);
      }
    } else if (response) {
      setMessage(response.message);
    } else {
      setMessage("An unknown error occurred. Please try again.");
    }
  };

  // Function to resend the verification code
  const resendCode = async () => {
    if (!canResend) return;

    setResendLoading(true);
    setCanResend(false);
    setTimer(40);

    const response = await sendVerificationCode(
      email,
      type as VerificationType
    );
    setMessage(response.message);
    setResendLoading(false);
  };

  return (
    <>
      <div className="mt-5">
        <form className="flex items-center">
          {Array(4)
            .fill("")
            .map((_, idx) => (
              <div key={idx} className="relative w-full px-4">
                <input
                  type="text"
                  value={code[idx] || ""}
                  onChange={(e) => handleChange(e.target.value, idx)}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  maxLength={1}
                  className="px-4 py-2 bg-transparent font-semibold border-b text-center border-gray-900 text-dark-grey text-3xl focus:ring-blue-500 focus:border-yellow-500 block w-full outline-none placeholder-gray-900"
                  required
                  disabled={loading}
                />
              </div>
            ))}
        </form>
        {message && <p className="text-red-500 mt-4">{message}</p>}
      </div>
      <button
        type="button"
        className={`${
          loading ? "opacity-50" : ""
        } bg-kupi-yellow px-8 py-3 rounded-lg w-full text-dark-grey text-md font-semibold mt-5`}
        onClick={verifyCode}
        disabled={loading}
      >
        {loading ? "Verifying..." : "Verify Code"}
      </button>
      <p className="text-dark-grey text-md mt-4">
        Remaining time: <span className="font-semibold">{timer}s</span>
      </p>
      <p className="text-dark-grey text-md mt-4">
        Didn’t get the code?{" "}
        <button
          onClick={resendCode}
          disabled={!canResend || resendLoading}
          className={`font-semibold ${
            canResend ? "cursor-pointer text-kupi-yellow" : "text-gray-500"
          }`}
        >
          {resendLoading ? "Resending..." : canResend ? "Resend Code" : "Wait"}
        </button>
      </p>
    </>
  );
};

export default VerificationCodeForm;
