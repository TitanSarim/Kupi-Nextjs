// NewPasswordForm.tsx

"use client";
import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { updatePassword } from "../actions/updatePassword";
import { validatePassword } from "../libs/ClientSideHelpers";
import InputField from "../components/InputField"; 
import ErrorMessage from "../components/ErrorMessage"; 

function NewPasswordFormContent(): JSX.Element {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (!validatePassword(newPassword)) {
      setMessage(
        "Password must include a capital letter, a number, a symbol, and be at least 8 characters long."
      );
      return;
    }

    setLoading(true);
    const response = await updatePassword(email, newPassword);

    if (response?.message) {
      setMessage(response.message);
      if (response.status === 200) {
        router.push("/login");
      }
    }

    setLoading(false);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <InputField
          type={showNewPassword ? "text" : "password"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="********"
          label="Password"
          iconSrc="/img/auth-screens/password.svg"
          showPasswordToggle={true}
          togglePasswordVisibility={toggleNewPasswordVisibility}
          disabled={loading}
        />
        <InputField
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="********"
          label="Confirm Password"
          iconSrc="/img/auth-screens/password.svg"
          showPasswordToggle={true}
          togglePasswordVisibility={toggleConfirmPasswordVisibility}
          disabled={loading}
        />

        <ErrorMessage message={message} />

        <button
          onClick={handleSubmit}
          className={`${
            loading ? "opacity-50" : ""
          } bg-kupi-yellow px-8 py-3 rounded-lg w-full text-dark-grey text-md font-semibold mt-5`}
          disabled={loading}
        >
          {loading ? "Please Wait..." : "Update Password"}
        </button>
      </form>

      <div className="flex justify-center mt-5">
        <label className="text-dark-grey text-md font-semibold text-center">
          Go back to{" "}
          <span
            className="text-kupi-yellow cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Login
          </span>
        </label>
      </div>
    </>
  );
}

export default function NewPasswordForm(): JSX.Element {
  return (
    <React.Suspense fallback={<p>Loading...</p>}>
      <NewPasswordFormContent />
    </React.Suspense>
  );
}
