"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "../actions/registerUser";
import Link from "next/link";

const SignupForm = () => {
  // States for form data, error, loading, and password visibility
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    company: "",
    description: "",
    number: "",
  });
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // Function to handle form data changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await registerUser(formData);

      if (response?.error) {
        setError(response.error);
      } else {
        router.push(`/verification-code?email=${formData.email}`);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mt-5">
          <label className="text-dark-grey text-md font-semibold">
            Name<span className="text-kupi-yellow">*</span>
          </label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none border-r border-gray-500 pr-2 h-5 mt-2">
              <img
                className="w-5"
                src="/img/auth-screens/user.svg"
                alt="User Icon"
              />
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="px-10 py-2 bg-transparent border-b border-gray-900 text-dark-grey text-sm focus:ring-blue-500 focus:border-yellow-500 block w-full ps-10 p-2.5 outline-none"
              placeholder="Enter name"
              required
            />
          </div>
        </div>
        <div className="mt-5">
          <label className="text-dark-grey text-md font-semibold">
            Surname<span className="text-kupi-yellow">*</span>
          </label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none border-r border-gray-500 pr-2 h-5 mt-2">
              <img
                className="w-5"
                src="/img/auth-screens/user.svg"
                alt="User Icon"
              />
            </div>
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              className="px-10 py-2 bg-transparent border-b border-gray-900 text-dark-grey text-sm focus:ring-blue-500 focus:border-yellow-500 block w-full ps-10 p-2.5 outline-none"
              placeholder="Enter surname"
              required
            />
          </div>
        </div>
        <div className="mt-5">
          <label className="text-dark-grey text-md font-semibold">
            Whatsapp Number<span className="text-kupi-yellow">*</span>
          </label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none border-r border-gray-500 pr-2 h-5 mt-2">
              <img
                className="w-5"
                src="/img/auth-screens/whatsapp.svg"
                alt="Whatsapp Icon"
              />
            </div>
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleChange}
              className="px-10 py-2 bg-transparent border-b border-gray-900 text-dark-grey text-sm focus:ring-blue-500 focus:border-yellow-500 block w-full ps-10 p-2.5 outline-none"
              placeholder="Enter phone"
              required
            />
          </div>
        </div>
        <div className="mt-5">
          <label className="text-dark-grey text-md font-semibold">
            Email<span className="text-kupi-yellow">*</span>
          </label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none border-r border-gray-500 pr-2 h-5 mt-2">
              <img
                className="w-5"
                src="/img/auth-screens/email.svg"
                alt="Email Icon"
              />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="px-10 py-2 bg-transparent border-b border-gray-900 text-dark-grey text-sm focus:ring-blue-500 focus:border-yellow-500 block w-full ps-10 p-2.5 outline-none"
              placeholder="demo@email.com"
              required
            />
          </div>
        </div>
        <div className="mt-5">
          <h5 className="text-dark-grey text-md font-semibold">
            Password<span className="text-kupi-yellow">*</span>
          </h5>
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none border-r border-gray-500 pr-2 h-5 mt-2">
              <img
                className="w-5"
                src="/img/auth-screens/password.svg"
                alt="Password Icon"
              />
            </div>
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer"
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="px-10 py-2 bg-transparent border-b border-gray-900 text-dark-grey text-sm focus:ring-blue-500 focus:border-yellow-500 block w-full ps-10 p-2.5 outline-none"
              placeholder="********"
              required
            />
          </div>
        </div>
        <div className="mt-5">
          <label className="text-dark-grey text-md font-semibold">
            Company<span className="text-kupi-yellow">*</span>
          </label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none border-r border-gray-500 pr-2 h-5 mt-2">
              <img
                className="w-5"
                src="/img/auth-screens/company.svg"
                alt="Company Icon"
              />
            </div>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="px-10 py-2 bg-transparent border-b border-gray-900 text-dark-grey text-sm focus:ring-blue-500 focus:border-yellow-500 block w-full ps-10 p-2.5 outline-none"
              placeholder="Company name"
              required
            />
          </div>
        </div>
        <div className="mt-5">
          <label className="text-dark-grey text-md font-semibold">
            Company Description<span className="text-kupi-yellow">*</span>
          </label>
          <div className="relative w-full">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="px-4 py-2 bg-transparent border-b border-gray-900 text-dark-grey text-sm focus:ring-blue-500 focus:border-yellow-500 block w-full outline-none"
              placeholder="Type something about your company for customers to see"
              required
            ></textarea>
          </div>
        </div>
        <button
          type="submit"
          className={`${
            loading ? "opacity-50" : ""
          } bg-kupi-yellow px-8 py-3 rounded-lg w-full text-dark-grey text-md font-semibold mt-10`}
          disabled={loading}
        >
          {loading ? "Please Wait..." : "Create Account"}
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
      <div className="flex justify-center mt-5">
        <label className="text-dark-grey text-md font-semibold text-center">
          Already have an account?{" "}
          <Link href="/login">
            <span className="text-kupi-yellow cursor-pointer">Login</span>
          </Link>
        </label>
      </div>
    </>
  );
};

export default SignupForm;
