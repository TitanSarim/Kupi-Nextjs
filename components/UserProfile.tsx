"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/actions/user.actions";
import { Users } from "@prisma/client";

type ProfileProps = {
  userData: Users;
};

const filterAlpha = (value: string) => value.replace(/[^a-zA-Z]/g, "");
const filterDigits = (value: string) => value.replace(/[^0-9+]/g, "");

const UserProfile: React.FC<ProfileProps> = ({ userData }) => {
  const [formData, setFormData] = useState({
    name: userData.name || "",
    surname: userData.surname || "",
    number: userData.number || "",
  });
  const [email, setEmail] = useState(userData.email || "");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
  };

  const handleResetForm = () => {
    setFormData({
      name: userData.name,
      surname: userData.surname,
      number: userData.number,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      password !== "" &&
      confirmPassword !== "" &&
      password !== confirmPassword
    ) {
      setPassError("Passwords do not match");
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
        window.location.reload();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="w-11/12 mt-12" onSubmit={handleSubmit}>
      <div className="bg-white w-full shadow-sm rounded-md px-8 py-8">
        {/* Update Profile */}
        <p className="text-lg text-black font-semibold">Personal Information</p>

        <div className="relative mt-10 w-full flex flex-wrap items-start justify-between gap-3">
          <div className="w-5/12 mb-5">
            <p className="mb-1 darkGray-text font-normal">
              Name<span className="text-yellow-400">*</span>
            </p>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prevData) => ({
                  ...prevData,
                  name: filterAlpha(e.target.value),
                }))
              }
              className="h-12 border-gray-400 rounded-lg"
            />
          </div>

          <div className="w-5/12 mb-5">
            <p className="mb-1 darkGray-text font-normal">
              Surname<span className="text-yellow-400">*</span>
            </p>
            <Input
              type="text"
              value={formData.surname}
              onChange={(e) =>
                setFormData((prevData) => ({
                  ...prevData,
                  surname: filterAlpha(e.target.value),
                }))
              }
              className="h-12 border-gray-400 rounded-lg"
            />
          </div>

          <div className="w-5/12 mb-5">
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

          <div className="w-5/12 mb-5">
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

          <div className="w-5/12 mb-5">
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
          </div>

          <div className="w-5/12 mb-5">
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
          </div>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {passError && <p className="text-red-500 mt-4">{passError}</p>}
      </div>

      <div className="w-full mt-5 flex flex-row items-center justify-end gap-4">
        <button
          type="reset"
          onClick={handleResetForm}
          className="border-gray-600 py-2 px-8 bg-transparent border-2 rounded-lg text-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`${
            loading ? "opacity-50" : ""
          } py-3 px-10 bg-kupi-yellow rounded-lg font-semibold`}
          disabled={loading}
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default UserProfile;
