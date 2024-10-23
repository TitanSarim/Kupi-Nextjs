import { updateStatus } from "@/actions/operators.action";
import Image from "next/image";
import React, { startTransition, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { GlobalReset, underMaintainance } from "@/actions/settings.action";
import { SettingsFormData } from "@/types/settings";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  exchangeRate: number;
}

const GlobalResetDialogue: React.FC<DialogProps> = ({
  open,
  onClose,
  exchangeRate,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    onClose();
  };

  const handleGlobalReset = async () => {
    try {
      setLoading(true);
      const response = await GlobalReset(exchangeRate);
      if (response === true) {
        toast.success("Exchange Rate updated globally");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      handleClose();
    }
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
            src="/img/icons/GlobalReset.svg"
            alt="delete"
            width={130}
            height={130}
            className="flex justify-center items-center"
          />
          <p className="text-black text-2xl font-semibold mb-2">
            Are you sure?
          </p>
          <span className="text-gray-700 text-lg font-medium mb-2 text-center">
            You want to apply global exchange rate for all operators
          </span>

          <div className="flex flex-row gap-10 mt-4">
            <button
              onClick={handleClose}
              className="border-gray-600 py-1 px-8 bg-transparent border-2 rounded-lg text-gray-600"
            >
              No
            </button>
            <button
              disabled={loading || error !== null}
              onClick={handleGlobalReset}
              className={`${
                loading || error !== null ? "opacity-50" : ""
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

export default GlobalResetDialogue;
