"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "../ui/textarea";
import { updateBus } from "@/actions/fleet.actions";
import toast from "react-hot-toast";
import { Busses } from "@prisma/client";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  busData?: Busses | null;
}

const UpdateBus: React.FC<DialogProps> = ({ open, onClose, busData }) => {
  const [id, setId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [Number, setNumber] = useState<string>("");
  const [regNumber, setRegNumber] = useState<string>("");
  const [capacity, setCapacity] = useState<number>();
  const [busClass, setBusClass] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [driver, setDriver] = useState<string>("");
  const [comments, setComments] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState<{
    field: string;
    message: string;
  } | null>(null);

  const handleClose = () => {
    handleData();
    setErrorState(null);
    onClose();
  };

  const handleData = () => {
    if (busData) {
      if (busData.busClass) {
        setBusClass(busData.busClass || "");
      }
      setId(busData.id);
      setName(busData.name);
      setNumber(busData.busID);
      setRegNumber(busData.registration);
      setCapacity(busData.capacity);
      setLocation(busData.homeBase);
      setDriver(busData.driverName);
      setComments(busData.comments);
    }
  };

  useEffect(() => {
    handleData();
  }, [busData]);

  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value.toUpperCase());
  };
  const handleIDTNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNumber(value.toUpperCase());

    if (value.length >= 5 && value.length <= 20) {
      setErrorState(null);
    } else {
      setErrorState({
        field: "Number",
        message: "IDT Number must be between 5 and 10 characters long",
      });
    }
  };

  const handleRegNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegNumber(value.toUpperCase());

    if (value.length >= 5 && value.length <= 20) {
      setErrorState(null);
    } else {
      setErrorState({
        field: "regNumber",
        message: "Registration number must be between 5 and 20 characters long",
      });
    }
  };

  const handleCapacity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0 && value <= 100) {
      setCapacity(value);
      setErrorState(null);
    } else {
      setErrorState({
        field: "capacity",
        message: "Capacity must be a number between 1 and 100",
      });
    }
  };

  const handleBusClass = (value: string) => {
    setBusClass(value);
    if (value === "Clear") {
      setErrorState({
        field: "busClass",
        message: "Please select a class",
      });
    } else {
      setErrorState(null);
    }
  };

  const handleLocation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);

    if (value.length >= 2 && value.length <= 50) {
      setErrorState(null);
    } else {
      setErrorState({
        field: "location",
        message: "Location must be between 2 and 50 characters long",
      });
    }
  };

  const handleDriver = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDriver(value);

    if (value.length >= 2 && value.length <= 50) {
      setErrorState(null);
    } else {
      setErrorState({
        field: "driver",
        message: "Driver name must be between 2 and 50 characters long",
      });
    }
  };

  const handleComments = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setComments(value);

    if (value.length <= 299) {
      setErrorState(null);
    } else {
      setErrorState({
        field: "comments",
        message: "Comments should be less than 299 characters",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorState(null);
    const formData = {
      name,
      iden: Number,
      regNumber,
      capacity,
      busClass,
      location,
      driver,
      comments,
    };
    if (!id) {
      toast.error("Something  went wrong");
      return;
    }

    for (const [field, value] of Object.entries(formData)) {
      if (field === "name") continue;
      if (value === "" || value === undefined || value === null) {
        const uppercase =
          field.charAt(0).toUpperCase() + field.slice(1).toLowerCase();
        setErrorState({
          field,
          message: `${uppercase} is required`,
        });
        return false;
      }
    }

    setLoading(true);
    setErrorState(null);
    try {
      const response = await updateBus(formData, id);
      console.log("response", response);
      if (response === true) {
        toast.success("Bus updated successfully");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setErrorState(null);
      handleClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center discount-dialguebox-container justify-center z-50 duration-700 ease-out">
      <div className="lightGray py-6 px-8 rounded-lg shadow-lg discount-dialguebox flex flex-wrap justify-between gap-2 duration-700 ease-out">
        <div className="w-full flex flex-row justify-between">
          <p className="text-lg text-black font-semibold">Update Bus</p>
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
          <div className="bus-dialoguebox-inner">
            <div className="w-full mb-3">
              <p className="mb-1 darkGray-text font-normal text-sm">
                Bus Name [Optional]
              </p>
              <Input
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={handleName}
                className="h-12 rounded-lg text-gray-500 border-gray-300 bg-white"
              />
            </div>
            <div className="w-full mb-3">
              <p className="mb-1 darkGray-text font-normal text-sm">
                Bus Identity Number
              </p>
              <Input
                type="text"
                placeholder="BS11523"
                value={Number}
                onChange={handleIDTNumber}
                className="h-12 rounded-lg text-gray-500 border-gray-300 bg-white"
              />
              {errorState && errorState.field === "Number" && (
                <p className="text-red-500">{errorState.message}</p>
              )}
            </div>

            <div className="w-full mb-3">
              <p className="mb-1 darkGray-text font-normal text-sm">
                Bus Registration
              </p>
              <Input
                type="text"
                value={regNumber}
                onChange={handleRegNumber}
                placeholder="Enter registration"
                className="h-12 rounded-lg text-gray-500 border-gray-300 bg-white"
              />
              {errorState && errorState.field === "regNumber" && (
                <p className="text-red-500">{errorState.message}</p>
              )}
            </div>
            <div className="w-full mb-3">
              <p className="mb-1 darkGray-text font-normal text-sm">
                Bus Capacity
              </p>
              <Input
                type="number"
                value={capacity}
                onChange={handleCapacity}
                min={0}
                placeholder="00"
                className="h-12 rounded-lg text-gray-500 border-gray-300 bg-white"
              />
              {errorState && errorState.field === "capacity" && (
                <p className="text-red-500">{errorState.message}</p>
              )}
            </div>
            <div className="w-full mb-3">
              <p className="mb-1 darkGray-text font-normal text-sm">
                Bus Class
              </p>
              <Select value={busClass} onValueChange={handleBusClass}>
                <SelectTrigger className="w-full h-12 rounded-lg text-gray-500 border-gray-300 ">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="select-dropdown z-50">
                  <SelectItem value="Clear">Clear</SelectItem>
                  <SelectItem value="STANDARD">Standard </SelectItem>
                  <SelectItem value="LUXURY">Luxry</SelectItem>
                </SelectContent>
              </Select>
              {errorState && errorState.field === "busClass" && (
                <p className="text-red-500">{errorState.message}</p>
              )}
            </div>
            <div className="w-full mb-3">
              <p className="mb-1 darkGray-text font-normal text-sm">
                Bus Home Base
              </p>
              <Input
                type="text"
                value={location}
                onChange={handleLocation}
                max={99}
                placeholder="Enter location"
                className="h-12 rounded-lg text-gray-500 border-gray-300 bg-white"
              />
              {errorState && errorState.field === "location" && (
                <p className="text-red-500">{errorState.message}</p>
              )}
            </div>
            <div className="w-full mb-3">
              <p className="mb-1 darkGray-text font-normal text-sm">
                Driver Name
              </p>
              <Input
                type="text"
                value={driver}
                onChange={handleDriver}
                min={0}
                max={99}
                placeholder="Enter name"
                className="h-12 rounded-lg text-gray-500 border-gray-300 bg-white"
              />
              {errorState && errorState.field === "driver" && (
                <p className="text-red-500">{errorState.message}</p>
              )}
            </div>
            <div className="w-full mb-3">
              <p className="mb-1 darkGray-text font-normal text-sm">Comments</p>
              <Textarea
                value={comments}
                onChange={handleComments}
                placeholder="Type.."
                className="min-h-32 h-32 max-h-32 rounded-lg text-gray-500 border-gray-300 bg-white"
              />
              <div className="flex w-full items-end justify-end">
                <p className="text-sm text-gray-400">{comments.length}/299</p>{" "}
              </div>
              {errorState && errorState.field === "comments" && (
                <p className="text-red-500">{errorState.message}</p>
              )}
            </div>
          </div>

          {/* buttons */}

          <div className="w-full mt-5 flex flex-row items-center justify-end gap-4">
            <button
              type="reset"
              onClick={handleClose}
              className="border-gray-600 py-2 px-8 bg-transparent border-2 rounded-lg text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${
                loading || errorState !== null ? "opacity-50" : ""
              } py-3 px-10 bg-kupi-yellow rounded-lg font-semibold`}
              disabled={loading || errorState !== null}
            >
              {loading ? "Loading" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateBus;
