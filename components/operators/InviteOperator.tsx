"use client";
import Image from "next/image";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { AddOperator } from "@/actions/operators.action";

interface DialogProps {
  open: boolean;
  onClose: () => void;
}

const InviteOperator: React.FC<DialogProps> = ({ open, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = {
        name,
        email,
        description,
      };
      await AddOperator(formData);
    } catch (error) {
      setLoading(false);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 duration-700 ease-out">
      <div className="lightGray py-6 px-8 rounded-lg shadow-lg invite-dialguebox flex flex-wrap justify-between gap-2 duration-700 ease-out">
        <div className="w-full flex flex-row justify-between">
          <p className="text-lg text-black font-semibold">Invite Operator</p>
          <button
            onClick={onClose}
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
              Company Name
            </p>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              className="h-12 rounded-lg text-gray-500 border-gray-300 bg-white"
              required
            />
          </div>
          <div className="w-full mb-3">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Operator Email
            </p>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="h-12 rounded-lg text-gray-500 border-gray-300 bg-white"
              required
            />
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
              required
            />
          </div>
          <div className="w-full mt-5 flex flex-row items-center justify-end gap-4">
            <button
              onClick={onClose}
              type="reset"
              className="border-gray-600 py-2 px-8 bg-transparent border-2 rounded-lg text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-3 px-10 bg-kupi-yellow rounded-lg font-semibold"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteOperator;
