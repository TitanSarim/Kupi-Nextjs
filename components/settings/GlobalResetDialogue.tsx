import { updateStatus } from "@/actions/operators.action";
import Image from "next/image";
import React, { startTransition, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { underMaintainance } from "@/actions/settings.action";
import { SettingsFormData } from "@/types/settings";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  setMaintainanace: (value: boolean) => void;
  maintainanace: boolean;
  setMaintanaceMessage: (value: string) => void;
  maintanaceMessage: string;
}

const GlobalResetDialogue: React.FC<DialogProps> = ({
  open,
  onClose,
  setMaintainanace,
  maintainanace,
  setMaintanaceMessage,
  maintanaceMessage,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    onClose();
  };

  const handleMaintainace = async () => {
    let maintain = maintainanace;

    if (maintainanace === true) {
      maintain = false;
      setMaintainanace(false);
    } else if (maintainanace === false) {
      maintain = true;
      setMaintainanace(true);
    }

    localStorage.setItem("maintainance", maintain ? "true" : "false");
    try {
      const formData: SettingsFormData = {
        key: "MAINTAINACE_MESSAGE",
        value: maintanaceMessage,
      };
      const response = await underMaintainance(maintain, formData);
      if (response === true) {
        toast.success("Maintainance status updated successfully");
      }
    } catch (error) {
      console.error("Error");
    } finally {
      onClose();
      setMaintanaceMessage("");
    }
  };

  const handleMaintainanceMessage = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const message = event.target.value;
    setMaintanaceMessage(message);

    if (!message.trim()) {
      setError("Message cannot be empty.");
      return;
    }

    const wordCount = message.trim().split(/\s+/).length;
    if (wordCount > 200) {
      setError("Message cannot exceed 200 words.");
      return;
    }

    setError(null);
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
            src="/img/icons/isLive.svg"
            alt="delete"
            width={130}
            height={130}
            className="flex justify-center items-center"
          />

          <div className="flex flex-row gap-10 mt-4">
            <button
              onClick={handleClose}
              className="border-gray-600 py-1 px-8 bg-transparent border-2 rounded-lg text-gray-600"
            >
              Cancel
            </button>
            <button
              disabled={loading || error !== null}
              className={`${
                loading || error !== null ? "opacity-50" : ""
              } py-2 px-10 bg-kupi-yellow rounded-lg font-semibold`}
            >
              {loading ? "Please wait..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalResetDialogue;
