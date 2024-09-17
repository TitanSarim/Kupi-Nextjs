"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authenticateUser } from "../actions/authenticateUser";

const LoginForm: React.FC = () => {
  // States for email, password, showPassword, error and loading
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
    <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="text-dark-grey text-md font-semibold">Email</label>
        <div className="relative w-full mt-2">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <img
              className="w-5"
              src="/img/auth-screens/email.svg"
              alt="Email Icon"
            />
          </div>
          <input
            type="email"
            className="block w-full pl-10 pr-4 py-2 bg-transparent border-b border-gray-900 text-dark-grey text-sm focus:ring-blue-500 focus:border-yellow-500 outline-none"
            placeholder="demo@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>
      <div>
        <label className="text-dark-grey text-md font-semibold">Password</label>
        <div className="relative w-full mt-2">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <img
              className="w-5"
              src="/img/auth-screens/password.svg"
              alt="Password Icon"
            />
          </div>
          <div
            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            <img
              className="w-5"
              src={`/img/auth-screens/${
                showPassword ? "view-on.svg" : "view-off.svg"
              }`}
              alt={showPassword ? "Hide Password" : "Show Password"}
            />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            className="block w-full pl-10 pr-10 py-2 bg-transparent border-b border-gray-900 text-dark-grey text-sm focus:ring-blue-500 focus:border-yellow-500 outline-none"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>
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
      {error && (
        <p className="text-red-500 mt-4">Email or password is incorrect</p>
      )}
    </form>
  );
};

export default LoginForm;
