import { deleteAccount } from "@/actions/operators.action";
import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  id?: string | null;
}

const DeleteOperator: React.FC<DialogProps> = ({ open, onClose, id }) => {
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      if (!id) {
        return null;
      }
      const response = await deleteAccount(id);
      if (response === true) {
        toast.success("Account deleted successfully");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 duration-700 ease-out">
      <div className="lightGray py-6 px-8 rounded-lg shadow-lg invite-dialguebox flex flex-col justify-between gap-2 duration-700 ease-out">
        <div className="w-full flex flex-row justify-end align-bottom">
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
        <div className="relative w-full flex flex-col items-center justify-center">
          <Image
            src="/img/icons/DeleteIcon.svg"
            alt="delete"
            width={130}
            height={130}
            className="flex justify-center items-center"
          />
          <p className="mb-3 font-semibold text-xl text-black">Are you sure?</p>
          <span className="mb-3 font-light">
            You want to delete this operator.
          </span>
          <div className="flex flex-row gap-10 mt-4">
            <button
              onClick={handleClose}
              className="border-gray-600 py-1 px-8 bg-transparent border-2 rounded-lg text-gray-600"
            >
              No
            </button>
            <button
              disabled={loading}
              onClick={handleDeleteAccount}
              className={`${
                loading ? "opacity-50" : ""
              } py-2 px-10 bg-kupi-yellow rounded-lg font-semibold`}
            >
              {loading ? "Please wait..." : "Yes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteOperator;
