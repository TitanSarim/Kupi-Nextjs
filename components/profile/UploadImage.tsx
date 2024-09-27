"use client";
import React, { useCallback, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import Cropper, { Area } from "react-easy-crop";
import { updateProfileImage } from "@/actions/user.actions";
import { Users } from "@prisma/client";
import toast from "react-hot-toast";
import { getCroppedImg } from "@/libs/ClientSideHelpers";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  userData: Users;
}

const UploadImage: React.FC<DialogProps> = ({ open, onClose, userData }) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const CROP_AREA_ASPECT = 4 / 4;
  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive,
  } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 1) {
        setError("You can only upload one file.");
        return;
      }

      const file = acceptedFiles?.[0];
      if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
        setError("Only PNG, JPEG, and JPG files are allowed.");
        return;
      }

      setError(null);
      setImageFiles(acceptedFiles);

      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/jpg": [],
    },
    maxFiles: 1,
  });

  const clearImageFiles = () => {
    setImageFiles([]);
    setImageSrc(undefined);
  };

  const onCropComplete = useCallback(
    async (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedArea(croppedAreaPixels);

      if (!imageSrc || !croppedAreaPixels) {
        return;
      }

      try {
        const croppedImg = await getCroppedImg(imageSrc, croppedAreaPixels);
        if (croppedImg) {
          setFinalImage(URL.createObjectURL(croppedImg));
        }
      } catch (error) {
        console.error("Error cropping the image:", error);
      }
    },
    [imageSrc]
  );

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!imageSrc || !croppedArea) {
        return;
      }
      const croppedImg = await getCroppedImg(imageSrc, croppedArea);
      if (croppedImg) {
        const formData = new FormData();
        formData.append("imageFiles", croppedImg);
        const res = await updateProfileImage(formData, userData.id);
        if (res) {
          toast.success("Image updated successfully");
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      onClose();
      setLoading(false);
      setImageFiles([]);
      setCroppedArea(null);
      setImageSrc(undefined);
      setFinalImage(null);
      window.location.reload();
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 transaction_dialguebox-container flex items-center justify-center z-50 duration-700 ease-out">
      <div className="lightGray py-6 px-8 rounded-lg shadow-lg transaction_dialguebox flex flex-col gap-1 duration-700 ease-out">
        <div className="w-full flex flex-row justify-between">
          <p className="text-lg text-black font-semibold">Upload Image</p>
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

        <div>
          <div className="w-full relative mt-8 mb-2">
            {imageFiles.length > 0 ? (
              <div className="relative flex flex-col items-center justify-evenly cropper-height border-2 bg-white border-gray-400 rounded-lg p-6">
                <button
                  onClick={clearImageFiles}
                  className="absolute z-50 bg-kupi-yellow remove-file"
                >
                  <Image
                    src="/img/icons/Close-Icon.svg"
                    alt="Close"
                    width={20}
                    height={20}
                  />
                </button>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={CROP_AREA_ASPECT}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
            ) : (
              <div
                {...getImageRootProps()}
                className={`cropper-height w-auto flex justify-center items-center cursor-pointer border-2 border-dashed border-gray-400 rounded-lg p-6 ${
                  isImageDragActive ? "bg-gray-200" : "bg-white"
                }`}
              >
                <input {...getImageInputProps()} />
                <div className="w-full flex flex-col items-center justify-center">
                  <Image
                    src="/img/icons/Upload icon.svg"
                    alt="Upload"
                    width={50}
                    height={50}
                  />
                  <p className="text-xs mt-2">
                    Drag & drop file or{" "}
                    <span className="text-yellow-500 underline">Browse</span>
                  </p>
                  <span className="text-gray-400 text-xs mt-2">
                    Supported Formats:
                  </span>
                  <span className="text-gray-400 text-xs">PNG JPEG JPG</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-row justify-between items-center">
          {finalImage && (
            <Image src={finalImage} alt="img" width={40} height={40} />
          )}
          <div className="w-full flex flex-row items-center justify-end gap-4">
            <button
              type="reset"
              onClick={onClose}
              className="border-gray-600 py-2 px-8 bg-transparent border-2 rounded-lg text-gray-600"
            >
              Close
            </button>
            <button
              onClick={handleSubmit}
              className={`${
                !imageSrc || loading ? "opacity-50" : ""
              } py-3 px-10 bg-kupi-yellow rounded-lg font-semibold`}
              disabled={!imageSrc || loading}
            >
              {loading ? "Please Wait" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadImage;
