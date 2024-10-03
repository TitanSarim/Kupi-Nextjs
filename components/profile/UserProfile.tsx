"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/actions/user.actions";
import { Users } from "@prisma/client";
import toast from "react-hot-toast";
import { passwordValidation } from "@/libs/ClientSideHelpers";

type ProfileProps = {
  userData: Users;
};

const filterAlpha = (value: string, maxLength: number) => {
  return value.replace(/[^a-zA-Z\s]/g, "").slice(0, maxLength);
};

const UserProfile: React.FC<ProfileProps> = ({ userData }) => {
  const [formData, setFormData] = useState({
    name: userData.name || "",
    surname: userData.surname || "",
    number: userData.number || "",
  });
  const [initialFormData, setInitialFormData] = useState(formData);
  const [email, setEmail] = useState(userData.email || "");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [passMatchError, setPassMatchError] = useState<string | null>(null);
  const [isModified, setIsModified] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<{
    field: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    setInitialFormData(formData);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
    maxLength: number
  ) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    if (value.trim() === "") {
      setErrorState({
        field,
        message: `${field} cannot be empty`,
      });
    } else if (value.length > maxLength) {
      setErrorState({
        field,
        message: `${field} exceeds maximum length of ${maxLength}`,
      });
    } else {
      setErrorState(null);
    }
  };

  useEffect(() => {
    const isDataModified =
      JSON.stringify(formData) !== JSON.stringify(initialFormData) ||
      password !== "" ||
      confirmPassword !== "";
    setIsModified(isDataModified);
  }, [formData, password, confirmPassword]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const validationError = passwordValidation(newPassword);
    setPassError(validationError);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const confirmPassword = e.target.value;
    setConfirmPassword(confirmPassword);
    if (password !== confirmPassword) {
      setPassMatchError("Passwords do not match");
    } else {
      setPassMatchError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passError || passMatchError) {
      return;
    }

    setError(null);
    setLoading(true);

    const formValues = {
      id: userData.id,
      password: password,
      name: formData.name,
      surname: formData.surname,
      number: formData.number,
    };

    try {
      const res = await updateProfile(formValues);
      if (res) {
        toast.success("Profile updated successfully");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsModified(false);
      setLoading(false);
    }
  };

  return (
    <form className="w-11/12 mt-4" onSubmit={handleSubmit}>
      <div className="bg-white w-full shadow-sm rounded-md px-8 py-8">
        {/* Update Profile */}
        <p className="text-lg text-black font-semibold">Personal Information</p>

        <div className="relative mt-5 w-full flex flex-wrap items-start justify-between gap-3">
          <div className="w-5/12 mb-2">
            <p className="mb-1 darkGray-text font-normal">
              Name<span className="text-yellow-400">*</span>
            </p>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange(e, "name", 15)}
              className="h-12 border-gray-400 rounded-lg"
            />
            {errorState?.field === "name" && (
              <p className="text-red-500">{errorState.message}</p>
            )}
          </div>

          <div className="w-5/12 mb-2">
            <p className="mb-1 darkGray-text font-normal">
              Surname<span className="text-yellow-400">*</span>
            </p>
            <Input
              type="text"
              value={formData.surname}
              onChange={(e) => handleInputChange(e, "surname", 15)}
              className="h-12 border-gray-400 rounded-lg"
            />
            {errorState?.field === "surname" && (
              <p className="text-red-500">{errorState.message}</p>
            )}
          </div>

          <div className="w-5/12 mb-2">
            <p className="mb-1 darkGray-text font-normal">
              Email Address<span className="text-yellow-400">*</span>
            </p>
            <Input
              type="email"
              value={email}
              disabled
              className="h-12 rounded-lg text-gray-500"
            />
          </div>

          <div className="w-5/12 mb-2">
            <p className="mb-1 darkGray-text font-normal">
              Phone Number<span className="text-yellow-400">*</span>
            </p>
            <Input
              type="text"
              value={formData.number}
              disabled
              className="h-12 rounded-lg text-gray-500"
            />
          </div>

          <div className="w-5/12 mb-2">
            <p className="mb-1 darkGray-text font-normal">
              Password<span className="text-yellow-400">*</span>
            </p>
            <Input
              type="password"
              placeholder="********"
              value={password}
              onChange={handlePasswordChange}
              className="h-12 border-gray-400 rounded-lg"
            />
            {passError && (
              <p className="text-red-500 text-sm mt-1">{passError}</p>
            )}
          </div>

          <div className="w-5/12 mb-2">
            <p className="mb-1 darkGray-text font-normal">
              Re-enter New Password<span className="text-yellow-400">*</span>
            </p>
            <Input
              type="password"
              placeholder="********"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="h-12 border-gray-400 rounded-lg"
            />
            {passMatchError && (
              <p className="text-red-500 text-sm mt-1">{passMatchError}</p>
            )}
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      <div className="w-full mt-5 mb-8 flex flex-row items-center justify-end gap-4">
        <button
          type="reset"
          onClick={() => setFormData(initialFormData)}
          className={`${
            !isModified ? "opacity-50" : ""
          }border-gray-600 py-2 px-8 bg-transparent border-2 rounded-lg text-gray-600`}
          disabled={!isModified}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`${
            !isModified || loading || errorState !== null ? "opacity-50" : ""
          } py-3 px-10 bg-kupi-yellow rounded-lg font-semibold`}
          disabled={!isModified || loading || errorState !== null}
        >
          {loading ? "Please Wait" : "Save"}
        </button>
      </div>
    </form>
  );
};

export default UserProfile;
