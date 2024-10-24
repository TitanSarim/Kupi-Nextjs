"use client";
import Image from "next/image";
import React, { useState } from "react";
import { Input } from "../ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { createbus } from "@/actions/fleet.actions";
import toast from "react-hot-toast";
import { OperatorsType } from "@/types/transactions";
import { Button } from "../ui/button";
import { RolesEnum } from "@/types/auth";
import { useSession } from "next-auth/react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  operators: OperatorsType[];
  role?: string;
}

const AddBus: React.FC<DialogProps> = ({ open, onClose, operators, role }) => {
  const { data } = useSession();
  const [name, setName] = useState<string>("");
  const [Number, setNumber] = useState<string>("");
  const [regNumber, setRegNumber] = useState<string>("");
  const [busOperator, setBusOperator] = useState<string>("");
  const [capacity, setCapacity] = useState<number | null>(null);
  const [busClass, setBusClass] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [driver, setDriver] = useState<string>("");
  const [comments, setComments] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [openOperator, setOpenOperator] = useState(false);
  const [regError, setRegError] = useState(false);
  const [numberError, setNumberError] = useState(false);
  const [errorState, setErrorState] = useState<{
    field: string;
    message: string;
  } | null>(null);

  const handleClose = () => {
    setErrorState(null);
    setBusOperator("");
    setName("");
    setNumber("");
    setRegNumber("");
    setCapacity(0);
    setBusClass("");
    setLocation("");
    setDriver("");
    setComments("");
    setLoading(false);
    onClose();
  };

  const selectedOperator = operators.find(
    (operator) => operator.id === busOperator
  );

  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (value.length > 20) {
      value = value.slice(0, 20);
    }

    setName(value.toUpperCase());
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
    const inputValue = e.target.value;

    // Allow empty input for backspace
    if (inputValue === "") {
      setCapacity(null);
      setErrorState({
        field: "capacity",
        message: "Capacity must be a number between 1 and 100",
      });
      return;
    }

    const value = parseInt(inputValue, 10);

    if (isNaN(value) || value < 0) {
      setErrorState({
        field: "capacity",
        message: "Capacity must be a positive number",
      });
      return;
    }

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
    let value = e.target.value;

    if (value.length > 20) {
      value = value.slice(0, 20);
    }

    setDriver(value);

    if (value.length >= 2 && value.length <= 20) {
      setErrorState(null);
    } else {
      setErrorState({
        field: "driver",
        message: "Driver name must be between 2 and 20 characters long",
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
      busOperator,
      iden: Number,
      regNumber,
      capacity,
      busClass,
      location,
      driver,
      comments,
    };

    if (role === RolesEnum.SuperAdmin && busOperator === "") {
      setErrorState({
        field: "busOperator",
        message: "Please select a bus operator",
      });
      return false;
    }
    for (const [field, value] of Object.entries(formData)) {
      console.log("field", field);
      if (field === "name") continue;
      if (field === "comments") continue;
      if (field === "busOperator") continue;
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
      const response = await createbus(formData);
      if (typeof response === "object" && response?.name === "registration") {
        setRegError(true);
      } else if (
        typeof response === "object" &&
        response?.name === "busNumber"
      ) {
        setNumberError(true);
      } else if (response === "success") {
        toast.success("Bus created successfully");
        handleClose();
      } else {
        toast.error("Failed to create bus");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setErrorState(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center discount-dialguebox-container justify-center z-50 duration-700 ease-out">
      <div className="lightGray py-6 px-8 rounded-lg shadow-lg discount-dialguebox flex flex-wrap justify-between gap-2 duration-700 ease-out">
        <div className="w-full flex flex-row justify-between">
          <p className="text-lg text-black font-semibold">Add Bus</p>
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
            {role === RolesEnum.SuperAdmin && (
              <div className="w-full mb-3">
                <p className="mb-1 darkGray-text font-normal text-sm">
                  Bus Operator
                </p>
                <Popover open={openOperator} onOpenChange={setOpenOperator}>
                  <PopoverTrigger
                    asChild
                    className="w-full h-12 rounded-lg text-gray-500 border-gray-300"
                  >
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openOperator}
                      className="w-full justify-between outline-none"
                    >
                      {selectedOperator?.name || "Select operator..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 select-dropdown_add_trans">
                    <Command>
                      <CommandInput placeholder="Search operator..." />
                      <CommandList className="w-full">
                        <CommandEmpty>No operator found.</CommandEmpty>
                        <CommandItem
                          key="clear"
                          value=""
                          onSelect={() => {
                            setBusOperator(""); // Clear selection
                            setOpenOperator(false);
                          }}
                          className="ml-1 cursor-pointer w-full"
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              busOperator === "" ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          Clear
                        </CommandItem>
                        <CommandGroup>
                          {operators.map((operator) => (
                            <CommandItem
                              key={operator.id}
                              value={operator.name}
                              onSelect={() => {
                                setBusOperator(operator.id); // Save operator ID instead of name
                                setOpenOperator(false);
                                setErrorState(null);
                              }}
                              className="cursor-pointer w-full"
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  operator.id === busOperator
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              {operator.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errorState && errorState.field === "busOperator" && (
                  <p className="text-red-500">Please select bus operator</p>
                )}
              </div>
            )}

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
              {errorState && errorState.field === "iden" && (
                <p className="text-red-500">{errorState.message}</p>
              )}
              {numberError === true && (
                <p className="text-red-500">Identity number already exists</p>
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
              {regError === true && (
                <p className="text-red-500">
                  Registration number already exists
                </p>
              )}
            </div>
            <div className="w-full mb-3">
              <p className="mb-1 darkGray-text font-normal text-sm">
                Bus Capacity
              </p>
              <Input
                type="number"
                value={capacity === null ? "" : capacity}
                onChange={handleCapacity}
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
                <SelectTrigger className="w-full h-12 rounded-lg bg-white text-gray-500 border-gray-300 ">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="select-dropdown z-50">
                  <SelectItem value="Clear">Clear</SelectItem>
                  <SelectItem value="STANDARD">Standard </SelectItem>
                  <SelectItem value="LUXURY">Luxury</SelectItem>
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
                placeholder="Enter name"
                className="h-12 rounded-lg text-gray-500 border-gray-300 bg-white"
              />
              {errorState && errorState.field === "driver" && (
                <p className="text-red-500">{errorState.message}</p>
              )}
            </div>
            <div className="w-full mb-3">
              <p className="mb-1 darkGray-text font-normal text-sm">
                Comments [Optional]
              </p>
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
              {loading ? "Loading" : "Add Bus"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBus;
