import React from "react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  imageSrc?: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  imageSrc,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 bg-gray-400 bg-opacity-50 flex justify-center items-center">
      <div className="bg-dim-grey rounded-popup shadow-xl max-w-lg w-full p-6">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-200 p-1.5 rounded-lg"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="text-center">
          <img src={imageSrc} alt="Delete Icon" className="mx-auto" />
          <h2 className="text-dark-grey font-semibold text-2xl mt-4">
            Are you sure?
          </h2>
          <p className="text-dark-grey font-semibold text-lg mt-3">{message}</p>
          <div className="flex justify-center mt-8">
            <button
              onClick={onClose}
              className="bg-dim-grey px-10 py-2 text-dark-grey font-medium rounded-lg mr-2"
            >
              No
            </button>
            <button
              onClick={onConfirm}
              className="bg-kupi-yellow px-10 py-2 text-dark-grey font-medium rounded-lg"
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
