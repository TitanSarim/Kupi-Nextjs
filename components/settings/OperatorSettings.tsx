"use client";
import React, { use, useEffect, useState } from "react";
import { Input } from "../ui/input";
import Image from "next/image";
import { Textarea } from "../ui/textarea";
import Rates from "@/libs/Rates";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  validateEmail,
  validateWhatsAppNumber,
} from "@/libs/ClientSideHelpers";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  createOperatorSettings,
  getSelectedOperatorSettings,
  updateOperatorSettings,
} from "@/actions/settings.action";
import { operatorSettingsReturn } from "@/types/settings";
import toast from "react-hot-toast";
import { OperatorsType } from "@/types/transactions";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RolesEnum } from "@/types/auth";
import { useRouter } from "next/navigation";

interface OperatorSettingsProps {
  operatorSettings?: operatorSettingsReturn | null | undefined;
  operator?: operatorSettingsReturn | null | undefined;
  operators?: OperatorsType[] | null;
  role?: string;
}

const OperatorSettings: React.FC<OperatorSettingsProps> = ({
  operatorSettings,
  operator,
  operators,
  role,
}) => {
  const router = useRouter();
  const params = new URLSearchParams();
  const { currency, amount, equivalent, unit } = Rates.globalExchangeRate;
  const [open, setOpen] = React.useState(false);
  const [busOperator, setBusOperator] = useState<string | null>(null);
  const [busOperatorId, setBusOperatorId] = useState("");
  const [operatorsData, setOperatorsData] =
    useState<operatorSettingsReturn | null>(null);
  const [numbers, setNumbers] = useState<string[]>([]);
  const [numberInput, setNumberInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [tickets, setTickets] = useState<number | null>();
  const [bookingAt, setBookingAt] = useState("00:00");
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [bankDetails, setBankDetails] = useState("");
  const [formChanged, setFormChanged] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<{
    field: string;
    message: string;
  } | null>(null);

  const updateSearchParams = () => {
    if (
      busOperator !== "Clear" &&
      busOperator !== null &&
      busOperator.length > 0
    ) {
      params.set("operatorId", busOperatorId);
    } else {
      setBusOperator("");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => updateSearchParams(), [busOperator, busOperatorId]);

  const handleData = () => {
    if (operatorSettings) {
      if (operatorSettings.operatorSettings) {
        setNumbers(operatorSettings?.operatorSettings?.numbers || []);
        setEmails(operatorSettings?.operatorSettings?.emails || []);
        setTickets(operatorSettings?.operatorSettings.tickets);
        const parsedBookingAt =
          operatorSettings?.operatorSettings?.closeBooking.replace(":", "");
        const formattedBookingAt = isNaN(parseInt(parsedBookingAt))
          ? "00:00"
          : formatTime(parseInt(parsedBookingAt));
        setBookingAt(formattedBookingAt);
        setExchangeRate(operatorSettings?.operatorSettings?.exchangeRate);
        setBankDetails(operatorSettings?.operatorSettings?.bankDetails || "");
      }
      if (operatorSettings?.operator) {
        setCompany(operatorSettings?.operator.name || "");
        setDescription(operatorSettings?.operator.description || "");
      }
      setFormChanged(false);
    }
  };

  const handleOperatorChange = async (value: string, id: string) => {
    if (value === "" || value.length <= 0) {
      setBusOperator("");
      setBusOperatorId("");
    } else {
      setBusOperator(value);
      setBusOperatorId(id);
    }
    setOpen(false);
  };

  useEffect(() => {
    handleData();
  }, [operatorSettings]);

  const handleReset = () => {
    handleData();
    setErrorState(null);
    setFormChanged(false);
  };

  useEffect(() => {
    if (operator) {
      setOperatorsData(operator);
      handleAdminData();
    }
    if (operator === null) {
      setOperatorsData(null);
    }
  }, [operatorsData, operator]);

  const handleAdminData = () => {
    if (operatorsData) {
      setNumbers(operatorsData?.operatorSettings?.numbers || []);
      setEmails(operatorsData?.operatorSettings?.emails || []);
      setTickets(
        operatorsData?.operatorSettings &&
          operatorsData?.operatorSettings.tickets
      );
      const parsedBookingAt =
        operatorsData?.operatorSettings?.closeBooking.replace(":", "");
      if (parsedBookingAt) {
        const formattedBookingAt = isNaN(parseInt(parsedBookingAt))
          ? "00:00"
          : formatTime(parseInt(parsedBookingAt));
        setBookingAt(formattedBookingAt);
      }
      setExchangeRate(operatorsData?.operatorSettings?.exchangeRate || 0);
      setContactEmail(operatorsData?.operatorSettings?.contactEmail || "");
      setContactNumber(operatorsData?.operatorSettings?.contactNumber || "");
      setBankDetails(operatorsData?.operatorSettings?.bankDetails || "");
    }
    if (operatorsData?.operator) {
      setCompany(operatorsData?.operator.name || "");
      setDescription(operatorsData?.operator.description || "");
    }
  };

  const handleAdminReset = async () => {
    setErrorState(null);
    setFormChanged(false);
    handleAdminData();
  };

  const handleExchangeRateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.value;

    let numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue.length > 5) {
      numericValue = numericValue.substring(0, 3);
    }
    const exchangeRate = Math.min(Number(numericValue), 999);
    setExchangeRate(exchangeRate);
    setErrorState(null);
    setFormChanged(true);
  };

  const handleTicketsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const numericValue = Math.max(0, parseFloat(value));
    setTickets(numericValue);
    setErrorState(null);
    setFormChanged(true);
  };

  const handleBookingAtRateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value.replace(/\D/g, "");

    if (value.length === 0) {
      setBookingAt("00:00");
      return;
    }
    let hours = 0;
    let minutes = 0;

    if (value.length <= 2) {
      hours = parseInt(value.slice(0, 2), 10);
    } else {
      hours = parseInt(value.slice(0, -2), 10);
      minutes = parseInt(value.slice(-2), 10);
    }
    hours = Math.max(0, Math.min(48, hours));
    minutes = Math.max(0, Math.min(90, minutes));

    const formattedTime = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;

    setBookingAt(formattedTime);
    setErrorState(null);
    setFormChanged(true);
  };

  const formatTime = (timeAsInt: number): string => {
    const hours = Math.floor(timeAsInt / 100);
    const minutes = timeAsInt % 100;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const email = event.target.value;
    setEmailInput(email);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email) && email.length > 0) {
      setErrorState({
        field: "emails",
        message: "Please enter a valid email address",
      });
    } else {
      setErrorState(null);
    }
  };

  const handleAddEmail = () => {
    if (emails.length >= 6) {
      setErrorState({
        field: "emails",
        message: "You cannot add more than 6 email addresses",
      });
      return;
    }

    if (emails.includes(emailInput)) {
      setErrorState({
        field: "emails",
        message: "This email address is already added",
      });
      return;
    }

    if (emailInput.trim() && validateEmail(emailInput)) {
      setEmails([...emails, emailInput]);
      setErrorState(null);
      setEmailInput("");
      setFormChanged(true);
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    const validNumberRegex = /^[+]?[0-9]*$/;

    if (!validNumberRegex.test(inputValue) && inputValue.length > 0) {
      setErrorState({
        field: "numbers",
        message: "Only digits and '+' are allowed.",
      });
      return;
    }

    if (inputValue.length < 9 || inputValue.length > 14) {
      setErrorState({
        field: "numbers",
        message: "Number length must be between 9 and 14 characters.",
      });
    } else {
      setErrorState(null);
    }

    setNumberInput(inputValue);
  };

  const handleAddNumber = () => {
    if (numbers.length >= 6) {
      setErrorState({
        field: "numbers",
        message: "You cannot add more than 6 numbers",
      });
      return;
    }
    if (numberInput.length < 9 || numberInput.length > 14) {
      return;
    }

    if (numbers.includes(numberInput)) {
      setErrorState({
        field: "numbers",
        message: "This number is already added",
      });
      return;
    }

    if (
      numberInput.trim() &&
      validateWhatsAppNumber(numberInput) &&
      !numbers.includes(numberInput)
    ) {
      setNumbers([...numbers, numberInput]);
      setErrorState(null);
      setNumberInput("");
      setFormChanged(true);
    }
  };

  const handleRemoveNumber = (numberToRemove: string) => {
    setNumbers(numbers.filter((number) => number !== numberToRemove));
  };

  const handleNumberKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddNumber();
    }
  };

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 20) {
      setCompany(value);
      setErrorState(null);
      setFormChanged(true);
    }
  };

  const handleCompanyDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (value.length <= 299) {
      setDescription(value);
      setErrorState(null);
      setFormChanged(true);
    }
  };

  const handleChnageContactNumber = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setContactNumber(value);
    setFormChanged(true);
  };

  const handleChnageContactEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setContactEmail(value);
    setFormChanged(true);
  };

  const handleBankDetails = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBankDetails(value);

    if (value.length >= 1) {
      setFormChanged(true);
      setErrorState(null);
    } else if (value.length <= 0) {
      setFormChanged(true);
      setErrorState({
        field: "BankDetails",
        message: "Bank details cannot be empty",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = {
      emails,
      numbers,
      company,
      description,
      exchangeRate,
      tickets,
      bookingAt,
      bankDetails,
      contactEmail,
      contactNumber,
    };
    try {
      for (const [key, value] of Object.entries(formData)) {
        if (key === "contactEmail") continue;
        if (key === "contactNumber") continue;
        if (!value || (Array.isArray(value) && value.length === 0)) {
          const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
          setErrorState({
            field: key,
            message: `${capitalizedKey} cannot be empty`,
          });
          return;
        }
      }
      let response;
      if (role === RolesEnum.BusCompanyAdmin) {
        response = await createOperatorSettings(formData);
      } else if (role === RolesEnum.SuperAdmin && busOperator !== null) {
        response = await updateOperatorSettings(formData, busOperator);
      }
      if (response === true) {
        toast.success("Settings updated successfully");
      }
      setErrorState(null);
    } catch (error) {
      console.error(error);
    } finally {
      setFormChanged(false);
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-fit operatorsSession-screen">
      {role === RolesEnum.SuperAdmin || role === RolesEnum.KupiUser ? (
        <div className="w-full">
          <p className="mb-1 darkGray-text font-normal text-sm">Bus Operator</p>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              asChild
              className="w-full  h-12 rounded-lg  text-gray-500 border-gray-700"
            >
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between outline-none"
              >
                {busOperator || "Select operator..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 select-dropdown_bus_operator text-left left-0">
              <Command>
                <CommandInput placeholder="Search operator..." />
                <CommandList className="w-full text-left">
                  <CommandEmpty>No operator found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      key="clear"
                      value=""
                      onSelect={() => {
                        handleOperatorChange("", "");
                        setOperatorsData(null);
                      }}
                      className="cursor-pointer w-full text-left"
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          busOperator === "" ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      Clear
                    </CommandItem>
                    {operators?.map((operator) => (
                      <CommandItem
                        key={operator.id}
                        value={operator.name}
                        onSelect={(currentValue) =>
                          handleOperatorChange(currentValue, operator.id)
                        }
                        className="cursor-pointer w-full  text-left"
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            operator.name === busOperator
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
        </div>
      ) : (
        ""
      )}
      {/* notification settings */}
      {operatorsData !== null && role === RolesEnum.SuperAdmin ? (
        // admin operator form
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="h-80 w-full bg-white mt-5 shadow-sm rounded-md flex flex-col px-8 py-8">
            <p className="text-lg text-black font-semibold">
              Notification Settings
            </p>
            <div className="w-full mt-3">
              <p className="mb-1 darkGray-text font-normal text-sm">
                Select Email
              </p>
              <div className="w-full rounded-lg text-gray-500 emailselecter border-gray-700">
                <div className="relative w-full flex flex-wrap items-center gap-2 mt-1">
                  {emails.map((email, index) => (
                    <span
                      key={index}
                      className="buttonmap-selectemail bg-kupi-yellow text-black rounded-lg px-3 py-2 text-sm flex items-center"
                      style={{
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {/* Truncate the email if it's too long */}
                      {email.length > 15
                        ? `${email.substring(0, 12)}...`
                        : email}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveEmail(email);
                        }}
                        className="relative outline-none border-none ml-2"
                      >
                        <Image
                          src="/img/icons/Close-Icon.svg"
                          alt="cross"
                          width={15}
                          height={15}
                        />
                      </button>
                    </span>
                  ))}

                  {/* Input Field */}
                  {emails.length < 6 && (
                    <div className="relative w-[200px]">
                      <Input
                        type="email"
                        placeholder="Add emails"
                        className="outline-none border-none w-full"
                        value={emailInput}
                        onChange={handleEmailChange}
                        onKeyDown={handleKeyPress}
                      />
                      {emailInput.length > 0 && (
                        <button
                          className="showrittenemail mt-2"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddEmail();
                          }}
                        >
                          {emailInput}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full flex  flex-row items-end justify-end gap-5">
                {errorState?.field === "emails" && (
                  <p className="text-red-500 ">{errorState.message}</p>
                )}
                <p>Max 6</p>
              </div>
            </div>

            <div className="mt-2">
              <p className="mb-1 darkGray-text font-normal text-sm">
                Whatsapp Number
              </p>
              <div className="w-full rounded-lg text-gray-500 emailselecter border-gray-700">
                <div className="relative w-full flex flex-wrap items-center gap-2 mt-1">
                  {numbers.map((number, index) => (
                    <span
                      key={index}
                      className="buttonmap-selectemail bg-kupi-yellow text-black rounded-lg px-3 py-2 text-sm flex items-center"
                      style={{
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {number}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveNumber(number);
                        }}
                        className="relative outline-none border-none ml-2"
                      >
                        <Image
                          src="/img/icons/Close-Icon.svg"
                          alt="cross"
                          width={15}
                          height={15}
                        />
                      </button>
                    </span>
                  ))}

                  {numbers.length < 6 && (
                    <div className="relative w-[200px]">
                      <Input
                        type="text"
                        placeholder="Add Whatsapp Numbers"
                        className="outline-none border-none w-full"
                        value={numberInput}
                        onChange={handleNumberChange}
                        onKeyDown={handleNumberKeyPress}
                      />
                      {numberInput.length > 0 && (
                        <button
                          className="showrittenemail mt-2"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddNumber();
                          }}
                        >
                          {numberInput}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full flex  flex-row items-end justify-end gap-5">
                {errorState?.field === "numbers" && (
                  <p className="text-red-500 ">{errorState.message}</p>
                )}
                <p>Max 6</p>
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="h-80 w-full bg-white mt-5 shadow-sm rounded-md flex flex-col px-8 py-8">
            <p className="text-lg text-black font-semibold">Company Details</p>
            <div className="mt-4">
              <p className="mb-1 darkGray-text font-normal text-sm">
                Company Name
              </p>
              <Input
                type="text"
                value={company}
                onChange={handleCompanyNameChange}
                placeholder="Travel Agency"
                className="h-12 rounded-lg text-gray-500 border-gray-700"
                disabled
              />
              {errorState?.field === "company" && (
                <p className="text-red-500 ">{errorState.message}</p>
              )}
            </div>
            <div className="mt-5">
              <p className="mb-1 darkGray-text font-normal text-sm">
                Company Description
              </p>
              <Textarea
                value={description}
                onChange={handleCompanyDescriptionChange}
                placeholder="At my bus company, we strive to provide reliable and comfortable transportation for all your travel needs. Our fleet of modern buses ensures safety and convenience for every passenger. Join us in exploring the scenic routes and discovering new destinations together. Experience exceptional service and affordability on every journey with us."
                className="textarea-setting rounded-lg py-1 text-gray-500 border-gray-700"
              />
              <div className="flex w-full items-end justify-end">
                <p className="text-sm text-gray-400">
                  {description.length}/299
                </p>{" "}
              </div>
              {errorState?.field === "description" && (
                <p className="text-red-500 ">{errorState.message}</p>
              )}
            </div>
          </div>

          {/* Booking Settings */}
          <div className="h-80 w-full bg-white mt-5 shadow-sm rounded-md flex flex-col px-8 py-8">
            <p className="text-lg text-black font-semibold">Booking Settings</p>
            <div className="w-full flex flex-wrap items-start justify-between gap-3 mt-5">
              <div className="w-5/12 mb-2">
                <p className="mb-1 darkGray-text font-normal flex flex-row gap-3">
                  Number of Ticket Per Route
                  <span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                        >
                          <Image
                            src="/img/settings/question-icon.svg"
                            alt="toot tip"
                            width={20}
                            height={20}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white border-2 px-2 py-2">
                          How many tickets per route you want to add
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                </p>
                <Input
                  type="number"
                  className="h-12 border-gray-700 rounded-lg"
                  placeholder="01"
                  max={10}
                  value={tickets !== null ? tickets : ""}
                  onChange={handleTicketsChange}
                  required
                />
                {errorState?.field === "tickets" && (
                  <p className="text-red-500 ">Tickets are required</p>
                )}
              </div>
              <div className="w-5/12 mb-2">
                <p className="mb-1 darkGray-text font-normal flex flex-row gap-3">
                  Stop Accepting Bookings
                  <span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                        >
                          <Image
                            src="/img/settings/question-icon.svg"
                            alt="toot tip"
                            width={20}
                            height={20}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white border-2 px-2 py-2 w-72">
                          Select how long before departure you want booking to
                          close. You will receive the confirmed tickets list 30
                          mins following booking close. Booking must close at
                          least 90 minutes before departure.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                </p>
                <Input
                  type="text"
                  className="h-12 border-gray-700 rounded-lg"
                  placeholder="00:00"
                  value={bookingAt}
                  onChange={handleBookingAtRateChange}
                  required
                />
                {errorState?.field === "bookingAt" && (
                  <p className="text-red-500 ">Booking time required</p>
                )}
              </div>
              <div className="w-5/12 mb-2">
                <p className="mb-1 darkGray-text font-normal pb-1">
                  Global Exchange Rate
                  <span className="text-gray-500">
                    {" "}
                    [{amount} {currency} = {equivalent}
                    {unit}]
                  </span>
                </p>
                <Input
                  type="text"
                  className="h-12 border-gray-700 rounded-lg"
                  placeholder="ZiG 20"
                  value={
                    exchangeRate > 0
                      ? `ZiG${" "}${exchangeRate.toFixed(0)}`
                      : ""
                  }
                  onChange={handleExchangeRateChange}
                  required
                />
                {errorState?.field === "exchangeRate" && (
                  <p className="text-red-500 ">Exchange rate required</p>
                )}
              </div>
            </div>
          </div>

          {/* Support Contact Details */}
          <div className="h-80 w-full bg-white mt-5 shadow-sm rounded-md flex flex-col px-8 py-8">
            <p className="text-lg text-black font-semibold">
              Support Contact Details
            </p>
            <div className="w-full flex flex-wrap items-start justify-between gap-3 mt-5">
              <div className="w-5/12 mb-2">
                <p className="mb-1 darkGray-text font-normal text-sm">
                  Contact Number
                </p>
                <Input
                  type="text"
                  value={contactNumber}
                  onChange={handleChnageContactNumber}
                  placeholder="Enter contact numbers"
                  className="h-12 rounded-lg text-gray-500 border-gray-700"
                />
              </div>
              <div className="w-5/12 mb-2">
                <p className="mb-1 darkGray-text font-normal text-sm">
                  Contact Email
                </p>
                <Input
                  type="text"
                  value={contactEmail}
                  onChange={handleChnageContactEmail}
                  placeholder="Enter contact emails"
                  className="h-12 rounded-lg text-gray-500 border-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Bank account detail */}
          <div className="h-80 w-full bg-white mt-5 shadow-sm rounded-md flex flex-col px-8 py-8">
            <p className="text-lg text-black font-semibold">
              Bank Account Detail
            </p>

            <Textarea
              value={bankDetails}
              onChange={handleBankDetails}
              placeholder="Please provide your bank details, including the Account Name, Branch Code, Account Number, and Bank Name."
              className="h-32 bank-details-textarea mt-4 rounded-lg text-gray-500 border-gray-700"
            />
            {errorState?.field === "BankDetails" && (
              <p className="text-red-500">Please enter bank details</p>
            )}
          </div>

          <div className='className="w-full mt-5 flex flex-row items-center justify-end gap-5'>
            <button
              type="reset"
              onClick={handleAdminReset}
              className={`${
                !formChanged ? "opacity-50" : ""
              } border-gray-600 py-2 px-8 bg-transparent border-2 rounded-lg text-gray-600`}
              disabled={!formChanged}
            >
              Cancel
            </button>
            <button
              className={`${
                loading ||
                errorState !== null ||
                formChanged === false ||
                description.length <= 0 ||
                !tickets ||
                bookingAt === "00:00" ||
                exchangeRate <= 0
                  ? "opacity-50"
                  : ""
              } py-2 px-10 bg-kupi-yellow rounded-lg font-semibold`}
              disabled={
                loading ||
                errorState !== null ||
                formChanged === false ||
                description.length <= 0 ||
                !tickets ||
                bookingAt === "00:00" ||
                exchangeRate <= 0
              }
            >
              {loading ? "Please Wait" : "Save"}
            </button>
          </div>
        </form>
      ) : operatorsData === null && role === RolesEnum.BusCompanyAdmin ? (
        // operators form
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="h-80 w-full bg-white mt-5 shadow-sm rounded-md flex flex-col px-8 py-8">
            <p className="text-lg text-black font-semibold">
              Notification Settings
            </p>
            <div className="w-full mt-3">
              <p className="mb-1 darkGray-text font-normal text-sm">
                Select Email
              </p>
              <div className="w-full rounded-lg text-gray-500 emailselecter border-gray-700">
                <div className="relative w-full flex flex-wrap items-center gap-2 mt-1">
                  {emails.map((email, index) => (
                    <span
                      key={index}
                      className="buttonmap-selectemail bg-kupi-yellow text-black rounded-lg px-3 py-2 text-sm flex items-center"
                      style={{
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {/* Truncate the email if it's too long */}
                      {email.length > 15
                        ? `${email.substring(0, 12)}...`
                        : email}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveEmail(email);
                        }}
                        className="relative outline-none border-none ml-2"
                      >
                        <Image
                          src="/img/icons/Close-Icon.svg"
                          alt="cross"
                          width={15}
                          height={15}
                        />
                      </button>
                    </span>
                  ))}

                  {/* Input Field */}
                  {emails.length <= 6 && (
                    <div className="relative w-[200px]">
                      <Input
                        type="email"
                        placeholder="Add emails"
                        className="outline-none border-none w-full"
                        value={emailInput}
                        onChange={handleEmailChange}
                        onKeyDown={handleKeyPress}
                      />
                      {emailInput.length > 0 && (
                        <button
                          className="showrittenemail mt-2"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddEmail();
                          }}
                        >
                          {emailInput}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full flex  flex-row items-end justify-end gap-5">
                {errorState?.field === "emails" && (
                  <p className="text-red-500 ">{errorState.message}</p>
                )}
                <p>Max 6</p>
              </div>
            </div>

            <div className="mt-2">
              <p className="mb-1 darkGray-text font-normal text-sm">
                Whatsapp Number
              </p>
              <div className="w-full rounded-lg text-gray-500 emailselecter border-gray-700">
                <div className="relative w-full flex flex-wrap items-center gap-2 mt-1">
                  {numbers.map((number, index) => (
                    <span
                      key={index}
                      className="buttonmap-selectemail bg-kupi-yellow text-black rounded-lg px-3 py-2 text-sm flex items-center"
                      style={{
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {number}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveNumber(number);
                        }}
                        className="relative outline-none border-none ml-2"
                      >
                        <Image
                          src="/img/icons/Close-Icon.svg"
                          alt="cross"
                          width={15}
                          height={15}
                        />
                      </button>
                    </span>
                  ))}
                  {numbers.length <= 6 && (
                    <div className="relative w-[200px]">
                      <Input
                        type="text"
                        placeholder="Add Whatsapp Numbers"
                        className="outline-none border-none w-full"
                        value={numberInput}
                        onChange={handleNumberChange}
                        onKeyDown={handleNumberKeyPress}
                      />
                      {numberInput.length > 0 && (
                        <button
                          className="showrittenemail mt-2"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddNumber();
                          }}
                        >
                          {numberInput}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full flex  flex-row items-end justify-end gap-5">
                {errorState?.field === "numbers" && (
                  <p className="text-red-500 ">{errorState.message}</p>
                )}
                <p>Max 6</p>
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="h-80 w-full bg-white mt-5 shadow-sm rounded-md flex flex-col px-8 py-8">
            <p className="text-lg text-black font-semibold">Company Details</p>
            <div className="mt-4">
              <p className="mb-1 darkGray-text font-normal text-sm">
                Company Name
              </p>
              <Input
                type="text"
                value={company}
                onChange={handleCompanyNameChange}
                placeholder="Travel Agency"
                className="h-12 rounded-lg text-gray-500 border-gray-700"
                disabled
              />
              {errorState?.field === "company" && (
                <p className="text-red-500 ">{errorState.message}</p>
              )}
            </div>
            <div className="mt-5">
              <p className="mb-1 darkGray-text font-normal text-sm">
                Company Description
              </p>
              <Textarea
                value={description}
                onChange={handleCompanyDescriptionChange}
                placeholder="At my bus company, we strive to provide reliable and comfortable transportation for all your travel needs. Our fleet of modern buses ensures safety and convenience for every passenger. Join us in exploring the scenic routes and discovering new destinations together. Experience exceptional service and affordability on every journey with us."
                className="textarea-setting rounded-lg py-1 text-gray-500 border-gray-700"
              />
              <div className="flex w-full items-end justify-end">
                <p className="text-sm text-gray-400">
                  {description.length}/299
                </p>{" "}
              </div>
              {errorState?.field === "description" && (
                <p className="text-red-500 ">{errorState.message}</p>
              )}
            </div>
          </div>

          {/* Booking Settings */}
          <div className="h-80 w-full bg-white mt-5 shadow-sm rounded-md flex flex-col px-8 py-8">
            <p className="text-lg text-black font-semibold">Booking Settings</p>
            <div className="w-full flex flex-wrap items-start justify-between gap-3 mt-5">
              <div className="w-5/12 mb-2">
                <p className="mb-1 darkGray-text font-normal flex flex-row gap-3">
                  Number of Ticket Per Route
                  <span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                        >
                          <Image
                            src="/img/settings/question-icon.svg"
                            alt="toot tip"
                            width={20}
                            height={20}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white border-2 px-2 py-2">
                          How many tickets per route you want to add
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                </p>
                <Input
                  type="number"
                  className="h-12 border-gray-700 rounded-lg"
                  placeholder="01"
                  min={1}
                  max={10}
                  value={tickets !== null ? tickets : ""}
                  onChange={handleTicketsChange}
                  required
                />
                {errorState?.field === "tickets" && (
                  <p className="text-red-500 ">Tickets are required</p>
                )}
              </div>
              <div className="w-5/12 mb-2">
                <p className="mb-1 darkGray-text font-normal flex flex-row gap-3">
                  Stop Accepting Bookings
                  <span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                        >
                          <Image
                            src="/img/settings/question-icon.svg"
                            alt="toot tip"
                            width={20}
                            height={20}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white border-2 px-2 py-2 w-72">
                          Select how long before departure you want booking to
                          close. You will receive the confirmed tickets list 30
                          mins following booking close. Booking must close at
                          least 90 minutes before departure.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                </p>
                <Input
                  type="text"
                  className="h-12 border-gray-700 rounded-lg"
                  placeholder="00:00"
                  value={bookingAt}
                  onChange={handleBookingAtRateChange}
                  required
                />
                {errorState?.field === "bookingAt" && (
                  <p className="text-red-500 ">Booking time required</p>
                )}
              </div>
              <div className="w-5/12 mb-2">
                <p className="mb-1 darkGray-text font-normal pb-1">
                  Global Exchange Rate
                  <span className="text-gray-500">
                    {" "}
                    [{amount} {currency} = {equivalent}
                    {unit}]
                  </span>
                </p>
                <Input
                  type="text"
                  className="h-12 border-gray-700 rounded-lg"
                  placeholder="ZiG 20"
                  value={
                    exchangeRate > 0
                      ? `ZiG${" "}${exchangeRate.toFixed(0)}`
                      : ""
                  }
                  onChange={handleExchangeRateChange}
                  required
                />
                {errorState?.field === "exchangeRate" && (
                  <p className="text-red-500 ">Exchange rate required</p>
                )}
              </div>
            </div>
          </div>

          {/* Support Contact Details */}
          <div className="h-80 w-full bg-white mt-5 shadow-sm rounded-md flex flex-col px-8 py-8">
            <p className="text-lg text-black font-semibold">
              Support Contact Details
            </p>
            <div className="w-full flex flex-wrap items-start justify-between gap-3 mt-5">
              <div className="w-5/12 mb-2">
                <p className="mb-1 darkGray-text font-normal text-sm">
                  Contact Number
                </p>
                <Input
                  type="text"
                  value={contactNumber}
                  onChange={handleChnageContactNumber}
                  placeholder="Enter contact numbers"
                  className="h-12 rounded-lg text-gray-500 border-gray-700"
                />
              </div>
              <div className="w-5/12 mb-2">
                <p className="mb-1 darkGray-text font-normal text-sm">
                  Contact Email
                </p>
                <Input
                  type="text"
                  value={contactEmail}
                  onChange={handleChnageContactEmail}
                  placeholder="Enter contact emails"
                  className="h-12 rounded-lg text-gray-500 border-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Bank account detail */}
          <div className="h-80 w-full bg-white mt-5 shadow-sm rounded-md flex flex-col px-8 py-8">
            <p className="text-lg text-black font-semibold">
              Bank Account Detail
            </p>
            <Textarea
              value={bankDetails}
              placeholder="Please provide your bank details, including the Account Name, Branch Code, Account Number, and Bank Name."
              onChange={handleBankDetails}
              className="h-32 bank-details-textarea mt-4 rounded-lg text-gray-500 border-gray-700"
            />
            {errorState?.field === "BankDetails" && (
              <p className="text-red-500">Please enter bank details</p>
            )}
          </div>

          <div className='className="w-full mt-5 flex flex-row items-center justify-end gap-5'>
            <button
              onClick={handleReset}
              className={`${
                !formChanged ? "opacity-50" : ""
              } border-gray-600 py-2 px-8 bg-transparent border-2 rounded-lg text-gray-600`}
              disabled={!formChanged}
            >
              Cancel
            </button>
            <button
              className={`${
                loading ||
                errorState !== null ||
                formChanged === false ||
                description.length <= 0 ||
                !tickets ||
                bookingAt === "00:00" ||
                exchangeRate <= 0
                  ? "opacity-50"
                  : ""
              } py-2 px-10 bg-kupi-yellow rounded-lg font-semibold`}
              disabled={
                loading ||
                errorState !== null ||
                formChanged === false ||
                description.length <= 0 ||
                !tickets ||
                bookingAt === "00:00" ||
                exchangeRate <= 0
              }
            >
              {loading ? "Please Wait" : "Save"}
            </button>
          </div>
        </form>
      ) : (
        ""
      )}
    </div>
  );
};

export default OperatorSettings;
