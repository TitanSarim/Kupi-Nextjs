"use client";
import Image from "next/image";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { AddOperator } from "@/actions/operators.action";
import toast from "react-hot-toast";

interface DialogProps {
  open: boolean;
  onClose: () => void;
}

const InviteOperator: React.FC<DialogProps> = ({ open, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorState, setErrorState] = useState<{
    field: string;
    message: string;
  } | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value.toLowerCase();
    setEmail(newEmail);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setErrorState({
        field: "validEmail",
        message: `Please enter a valid email`,
      });
    } else {
      setErrorState(null);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newName = e.target.value;

    if (newName.length > 20) {
      newName = newName.slice(0, 20);
    }

    setName(newName.toUpperCase());

    if (newName.length < 3) {
      setErrorState({
        field: "nameLength",
        message: "Name must be at least 3 to 20 characters.",
      });
    } else {
      setErrorState(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setErrorState({
        field: "nameLength",
        message: "Name is required",
      });
      return;
    }
    if (!email) {
      setErrorState({
        field: "validEmail",
        message: "Email is required",
      });
      return;
    }

    setLoading(true);
    const formData = {
      name,
      email,
      description,
    };
    for (const [key, value] of Object.entries(formData)) {
      if (key !== "description" && !value) {
        setErrorState({ field: key, message: `${key} is required` });
        setLoading(false);
        return;
      }
    }
    try {
      const result = await AddOperator(formData);
      if (typeof result === "string") {
        setError(result);
      }
      if (result === true) {
        toast.success("Invitation has been sent successfully");
        setName("");
        setEmail("");
        setDescription("");
        setErrorState(null);
        setError("");
        onClose();
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setDescription("");
    setLoading(false);
    setErrorState(null);
    setError("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 duration-700 ease-out">
      <div className="lightGray py-6 px-8 rounded-lg shadow-lg invite-dialguebox flex flex-wrap justify-between gap-2 duration-700 ease-out">
        <div className="w-full flex flex-row justify-between">
          <p className="text-lg text-black font-semibold">Invite Operator</p>
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <Image
              src="/img/icons/Close-Icon.svg"
              alt="Close"
              width={20}
              height={20}
            />
          </button>
        </div>

        {/* form */}
        <form className="mt-5 w-full flex flex-col" onSubmit={handleSubmit}>
          <div className="w-full mb-3">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Company Name *
            </p>
            <Input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter name"
              className="h-12 rounded-lg text-gray-500 border-gray-300 bg-white"
            />
            {errorState?.field === "nameLength" && (
              <p className="text-red-500">{errorState.message}</p>
            )}
          </div>
          <div className="w-full mb-3">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Operator Email *
            </p>
            <Input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter email address"
              className="h-12 rounded-lg text-gray-500 border-gray-300 bg-white"
            />
            {errorState?.field === "validEmail" && (
              <p className="text-red-500">Please enter a valid email</p>
            )}
          </div>
          <div className="w-full mb-3">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Invitation Message (Optional)
            </p>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Type..."
              className="h-12 rounded-lg text-gray-500 border-gray-300 bg-white invite-textarea"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="w-full mt-5 flex flex-row items-center justify-end gap-4">
            <button
              onClick={handleClose}
              type="reset"
              className="border-gray-600 py-2 px-8 bg-transparent border-2 rounded-lg text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email || !name || errorState !== null}
              className={`${
                loading || !email || !name || errorState !== null
                  ? "opacity-50"
                  : ""
              } py-3 px-10 bg-kupi-yellow rounded-lg font-semibold`}
            >
              {loading ? "Loading" : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteOperator;
