"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { updatePassword } from "../actions/updatePassword";

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
      <div className="mt-5">
        <label className="text-dark-grey text-md font-semibold">Password</label>
        <form className="flex items-center" onSubmit={handleSubmit}>
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center border-r border-gray-500 pr-2 h-5 mt-2">
              <img
                className="w-5"
                src="/img/auth-screens/password.svg"
                alt="Password"
              />
            </div>
            <div
              className="absolute inset-y-0 start-0 flex items-center right-0 mr-2 z-10 cursor-pointer"
              onClick={toggleNewPasswordVisibility}
            >
              <img
                className="w-5"
                src={`/img/auth-screens/${
                  showNewPassword ? "view-on.svg" : "view-off.svg"
                }`}
                alt={showNewPassword ? "Hide Password" : "Show Password"}
              />
            </div>
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="px-10 py-2 bg-transparent border-b border-gray-900 text-dark-grey text-sm focus:ring-blue-500 focus:border-yellow-500 block w-full outline-none"
              placeholder="********"
              required
              disabled={loading}
            />
          </div>
        </form>
      </div>
      <div className="mt-5">
        <label className="text-dark-grey text-md font-semibold">
          Confirm Password
        </label>
        <form className="flex items-center">
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center border-r border-gray-500 pr-2 h-5 mt-2">
              <img
                className="w-5"
                src="/img/auth-screens/password.svg"
                alt="Password"
              />
            </div>
            <div
              className="absolute inset-y-0 start-0 flex items-center right-0 mr-2 z-10 cursor-pointer"
              onClick={toggleConfirmPasswordVisibility}
            >
              <img
                className="w-5"
                src={`/img/auth-screens/${
                  showConfirmPassword ? "view-on.svg" : "view-off.svg"
                }`}
                alt={showConfirmPassword ? "Hide Password" : "Show Password"}
              />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="px-10 py-2 bg-transparent border-b border-gray-900 text-dark-grey text-sm focus:ring-blue-500 focus:border-yellow-500 block w-full outline-none"
              placeholder="********"
              required
              disabled={loading}
            />
          </div>
        </form>
      </div>
      <button
        onClick={handleSubmit}
        className={`${
          loading ? "opacity-50" : ""
        } bg-kupi-yellow px-8 py-3 rounded-lg w-full text-dark-grey text-md font-semibold mt-5`}
        disabled={loading}
      >
        {loading ? "Please Wait..." : "Update Password"}
      </button>

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
    <Suspense fallback={<p>Loading...</p>}>
      <NewPasswordFormContent />
    </Suspense>
  );
}
