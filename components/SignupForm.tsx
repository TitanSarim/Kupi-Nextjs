"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { registerUser } from "../actions/registerUser";
import Link from "next/link";
import { validateFields } from "../libs/ClientSideHelpers";
import ErrorMessage from "@/components/ErrorMessage";
import InputField from "@/components/InputField";
import { CheckPrevRequest } from "@/actions/operators.action";

// types for form data and errors
interface FormData {
  name: string;
  surname: string;
  email: string;
  password: string;
  company: string;
  description: string;
  number: string;
}

interface FormErrors {
  name?: string;
  surname?: string;
  email?: string;
  password?: string;
  company?: string;
  description?: string;
  number?: string;
  form?: string;
}

const SignupForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    surname: "",
    email: "",
    password: "",
    company: "",
    description: "",
    number: "",
  });
  const [token, setToken] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Centralized validation function
  const validateFieldWrapper = (
    name: keyof FormData,
    value: string
  ): string => {
    return validateFields(name, value);
  };

  const validateAllFieldsSequentially = (): boolean => {
    const newErrors: FormErrors = {};

    for (const key in formData) {
      const error = validateFieldWrapper(
        key as keyof FormData,
        formData[key as keyof FormData]
      );
      if (error) {
        newErrors[key as keyof FormErrors] = error;
        setErrors(newErrors);
        return false;
      }
    }

    setErrors(newErrors);
    return true;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Limit the length of 'name', 'surname', and 'company' fields to 20 characters
    if (
      (name === "name" || name === "surname" || name === "company") &&
      value.length > 20
    ) {
      return;
    }

    // Convert email field to lowercase
    const newValue = name === "email" ? value.toLowerCase() : value;

    setFormData((prevData) => ({ ...prevData, [name]: newValue }));

    // Clear errors on change only if the form hasn't been submitted yet
    if (!submitted) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const handleCheckPrevRequest = async (email: string) => {
    try {
      const sessionCheck = await CheckPrevRequest(email);
      if (sessionCheck === true) {
        router.push("/expired");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const emailFromURL = searchParams.get("email");
    const nameFromURL = searchParams.get("name");
    const tokenFromUrl = searchParams.get("token");
    if (emailFromURL) {
      setFormData((prev) => ({
        ...prev,
        email: emailFromURL,
      }));
      handleCheckPrevRequest(emailFromURL);
    }
    if (nameFromURL) {
      setFormData((prev) => ({
        ...prev,
        company: nameFromURL,
      }));
    }
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // Validate all fields sequentially
    const isValid = validateAllFieldsSequentially();

    if (!isValid) {
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser(formData, token);
      if (response?.error) {
        setErrors({ form: response.error });
      } else {
        router.push(`/verification-code?email=${formData.email}`);
      }
    } catch (err) {
      setErrors({ form: "An unexpected error occurred. Please try again." });
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
      <form onSubmit={handleSubmit} noValidate>
        <InputField
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter name"
          label="Name"
          iconSrc="/img/auth-screens/user.svg"
          error={submitted ? errors.name : ""}
          disabled={loading}
        />

        <InputField
          type="text"
          name="surname"
          value={formData.surname}
          onChange={handleChange}
          placeholder="Enter surname"
          label="Surname"
          iconSrc="/img/auth-screens/user.svg"
          error={submitted ? errors.surname : ""}
          disabled={loading}
        />

        <InputField
          type="text"
          name="number"
          value={formData.number}
          onChange={handleChange}
          placeholder="Enter phone"
          label="Whatsapp Number"
          iconSrc="/img/auth-screens/whatsapp.svg"
          error={submitted ? errors.number : ""}
          disabled={loading}
        />

        <InputField
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="demo@email.com"
          label="Email"
          iconSrc="/img/auth-screens/email.svg"
          error={submitted ? errors.email : ""}
          disabled
        />

        <InputField
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="********"
          label="Password"
          iconSrc="/img/auth-screens/password.svg"
          showPasswordToggle={true}
          togglePasswordVisibility={togglePasswordVisibility}
          error={submitted ? errors.password : ""}
          disabled={loading}
        />

        <InputField
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Company name"
          label="Company"
          iconSrc="/img/auth-screens/company.svg"
          error={submitted ? errors.company : ""}
          disabled={loading}
        />

        <div className="mt-5">
          <label className="text-dark-grey text-md font-semibold">
            Company Description<span className="text-kupi-yellow">*</span>
          </label>
          <div className="relative w-full">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`px-4 py-2 bg-transparent border-b ${
                errors.description ? "border-red-500" : "border-gray-900"
              } text-dark-grey text-sm focus:ring-blue-500 focus:border-yellow-500 block w-full outline-none`}
              placeholder="Type something about your company for customers to see"
              required
              disabled={loading}
            ></textarea>
            <ErrorMessage message={submitted ? errors.description : ""} />
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
        <ErrorMessage message={submitted ? errors.form : ""} />
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
