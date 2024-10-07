"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authenticateUser } from "../actions/authenticateUser";
import ErrorMessage from "@/components/ErrorMessage";
import InputField from "@/components/InputField";

const LoginForm: React.FC = () => {
  // States for email, password, showPassword, error, and loading
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Call the server action to authenticate the user
    try {
      const response = await authenticateUser(email, password);

      setLoading(false);

      if (response?.error) {
        setError(response.error);
      } else {
        router.push("/app/dashboard");
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <form className="mt-5 space-y-5" onSubmit={handleSubmit} noValidate>
      {/* Email Input Field */}
      <InputField
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="demo@email.com"
        label="Email"
        iconSrc="/img/auth-screens/email.svg"
        disabled={loading}
      />

      {/* Password Input Field with Toggle Visibility */}
      <InputField
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="********"
        label="Password"
        iconSrc="/img/auth-screens/password.svg"
        showPasswordToggle={true}
        togglePasswordVisibility={togglePasswordVisibility}
        disabled={loading}
      />

      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            className="w-4 h-4 text-blue-600 bg-light-grey border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 text-sm font-medium text-gray-900"
          >
            Remember Me
          </label>
        </div>
        <a
          href="/forgot-password"
          className="text-kupi-yellow font-semibold cursor-pointer"
        >
          Forgot Password?
        </a>
      </div>

      <button
        type="submit"
        className={`${
          loading ? "opacity-50" : ""
        } bg-kupi-yellow px-8 py-3 rounded-lg w-full text-dark-grey text-md font-semibold mt-5`}
        disabled={loading}
      >
        {loading ? "Please Wait..." : "Login"}
      </button>

      {error && <ErrorMessage message="Incorrect email or password, please try again." />}
    </form>
  );
};

export default LoginForm;
