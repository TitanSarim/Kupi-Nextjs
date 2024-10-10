"use client";
import React, { useEffect, useState } from "react";
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

interface OperatorSettingsProps {
  operatorSettings?: operatorSettingsReturn | null | undefined;
  operators?: OperatorsType[] | null;
  role?: string;
}

const OperatorSettings: React.FC<OperatorSettingsProps> = ({
  operatorSettings,
  operators,
  role,
}) => {
  const { currency, amount, equivalent, unit } = Rates.globalExchangeRate;
  const [open, setOpen] = React.useState(false);
  const [busOperator, setBusOperator] = useState<string | null>(null);
  const [operatorsData, setoperatorsData] =
    useState<operatorSettingsReturn | null>(null);
  const [numbers, setNumbers] = useState<string[]>([]);
  const [numberInput, setNumberInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [tickets, setTickets] = useState<number>(0);
  const [bookingAt, setBookingAt] = useState("00:00");
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [bankName, setBankName] = useState(
    operatorSettings?.operatorSettings?.bankName || ""
  );
  const [accountTitle, setAccountTitle] = useState("");
  const [ibanNumber, setIbanNumber] = useState("");
  const [swiftNumber, setSwiftNumber] = useState("");
  const [bankNameError, setBankNameError] = useState<string | null>(null);
  const [accountTitleError, setAccountTitleError] = useState<string | null>(
    null
  );
  const [ibanNumberError, setIbanNumberError] = useState<string | null>(null);
  const [swiftCodeError, setSwiftCodeError] = useState<string | null>(null);
  const [formChanged, setFormChanged] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<{
    field: string;
    message: string;
  } | null>(null);

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
        setBankName(operatorSettings?.operatorSettings?.bankName || "");
        setAccountTitle(operatorSettings?.operatorSettings?.accountTitle || "");
        setIbanNumber(operatorSettings?.operatorSettings?.IBAN || "");
        setSwiftNumber(operatorSettings?.operatorSettings?.swiftCode || "");
      }
      if (operatorSettings?.operator) {
        setCompany(operatorSettings?.operator.name || "");
        setDescription(operatorSettings?.operator.description || "");
      }
      setFormChanged(false);
    }
  };

  useEffect(() => {
    handleData();
  }, [operatorSettings]);

  const handleReset = () => {
    handleData();
    setFormChanged(false);
  };

  const handleExchangeRateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.value;

    let numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue.length > 3) {
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
    hours = Math.max(0, Math.min(23, hours));
    minutes = Math.max(0, Math.min(59, minutes));

    const formattedTime = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;

    setBookingAt(formattedTime);
    setErrorState(null);
    setFormChanged(true);
  };

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
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

    if (
      emailInput.trim() &&
      validateEmail(emailInput) &&
      !emails.includes(emailInput)
    ) {
      setEmails([...emails, emailInput]);
      setErrorState(null); // Clear any existing error
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

  const validateFieldLength = (value: string, min: number, max: number) => {
    if (value.length < min) {
      return `Minimum ${min} characters required.`;
    }
    if (value.length > max) {
      return `Maximum ${max} characters allowed.`;
    }
    return null;
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^a-zA-Z0-9 ]/g, "");
    value = value.replace(/^\s+|\s+(?=\s)/g, "");

    if (value.length <= 40) {
      setBankName(value);
      setBankNameError(validateFieldLength(value, 2, 40));
      setErrorState(null);
    } else {
      setBankNameError("Name cannot exceed 50 characters.");
    }
    setFormChanged(true);
  };

  const handleAccountTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^a-zA-Z0-9 ]/g, "");
    value = value.replace(/^\s+|\s+(?=\s)/g, "");

    if (value.length <= 50) {
      setAccountTitle(value);
      setAccountTitleError(validateFieldLength(value, 3, 50));
      setErrorState(null);
    } else {
      setAccountTitleError("Title cannot exceed 50 characters.");
    }

    setFormChanged(true);
  };

  const handleIbanNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^a-zA-Z0-9]/g, "");
    if (value.length <= 34) {
      setIbanNumber(value);
      setErrorState(null);
      setIbanNumberError(validateFieldLength(value, 15, 34));
      setFormChanged(true);
    }
  };

  const handleSwiftCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^a-zA-Z0-9]/g, "");
    if (value.length <= 11) {
      setSwiftNumber(value);
      setErrorState(null);
      setSwiftCodeError(validateFieldLength(value, 8, 11));
      setFormChanged(true);
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
      bankName,
      accountTitle,
      ibanNumber,
      swiftNumber,
    };
    try {
      for (const [key, value] of Object.entries(formData)) {
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

  const handleOperatorChange = async (value: string) => {
    if (value === "") {
      setBusOperator("");
    } else {
      setBusOperator(value);
      try {
        const operator = await getSelectedOperatorSettings(value);
        if (operator) {
          setoperatorsData(operator);
          if (operator.operatorSettings) {
            setNumbers(operator?.operatorSettings?.numbers || []);
            setEmails(operator?.operatorSettings?.emails || []);
            setTickets(operator?.operatorSettings.tickets);
            const parsedBookingAt =
              operator?.operatorSettings?.closeBooking.replace(":", "");
            if (parsedBookingAt) {
              const formattedBookingAt = isNaN(parseInt(parsedBookingAt))
                ? "00:00"
                : formatTime(parseInt(parsedBookingAt));
              setBookingAt(formattedBookingAt);
            }
            setExchangeRate(operator?.operatorSettings?.exchangeRate);
            setBankName(operator?.operatorSettings?.bankName || "");
            setAccountTitle(operator?.operatorSettings?.accountTitle || "");
            setIbanNumber(operator?.operatorSettings?.IBAN || "");
            setSwiftNumber(operator?.operatorSettings?.swiftCode || "");
          }
          if (operator?.operator) {
            setCompany(operator?.operator.name || "");
            setDescription(operator?.operator.description || "");
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
    setOpen(false);
  };

  return (
    <div className="w-full h-fit min-h-screen">
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
                        handleOperatorChange("");
                        setoperatorsData(null);
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
                          handleOperatorChange(currentValue)
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
                placeholder="Cape Town is a port city on South Africa’s southwest coast, on a peninsula beneath the imposing Table Mountain. Slowly rotating cable cars climb to the mountain’s flat top, from which there are sweeping views of the city,"
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
                  value={tickets}
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
                  placeholder="$20"
                  value={exchangeRate > 0 ? `$${exchangeRate.toFixed(0)}` : ""}
                  onChange={handleExchangeRateChange}
                  required
                />
                {errorState?.field === "exchangeRate" && (
                  <p className="text-red-500 ">Exchange rate required</p>
                )}
              </div>
            </div>
          </div>

          {/* Bank account detail */}
          <div className="h-80 w-full bg-white mt-5 shadow-sm rounded-md flex flex-col px-8 py-8">
            <p className="text-lg text-black font-semibold">
              Bank Account Detail
            </p>
            <div className="w-full flex flex-wrap items-start justify-between gap-3 mt-5">
              <div className="w-5/12 mb-2">
                <p className="mb-1 darkGray-text font-normal text-sm">
                  Bank Name
                </p>
                <Input
                  type="text"
                  value={bankName}
                  onChange={handleBankChange}
                  placeholder="Enter bank name"
                  className="h-12 rounded-lg text-gray-500 border-gray-700"
                />
                {bankNameError && (
                  <p className="text-red-500 text-sm">{bankNameError}</p>
                )}
                {errorState?.field === "bankName" && (
                  <p className="text-red-500 ">Bank name is required</p>
                )}
              </div>
              <div className="w-5/12 mb-2">
                <p className="mb-1 darkGray-text font-normal text-sm">
                  Account Title
                </p>
                <Input
                  type="text"
                  value={accountTitle}
                  onChange={handleAccountTitleChange}
                  placeholder="Enter account title"
                  className="h-12 rounded-lg text-gray-500 border-gray-700"
                />
                {accountTitleError && (
                  <p className="text-red-500 text-sm">{accountTitleError}</p>
                )}
                {errorState?.field === "accountTitle" && (
                  <p className="text-red-500 ">Account title is required</p>
                )}
              </div>
              <div className="w-5/12 mb-2">
                <p className="mb-1 darkGray-text font-normal">IBAN Number</p>
                <Input
                  type="text"
                  value={ibanNumber}
                  onChange={handleIbanNumberChange}
                  placeholder="Enter IBAN Number"
                  className="h-12 rounded-lg text-gray-500 border-gray-700"
                />
                {ibanNumberError && (
                  <p className="text-red-500">{ibanNumberError}</p>
                )}
                {errorState?.field === "ibanNumber" && (
                  <p className="text-red-500 ">IBAN is required</p>
                )}
              </div>
              <div className="w-5/12 mb-2">
                <p className="mb-1 darkGray-text font-normal text-sm">
                  Swift Code
                </p>
                <Input
                  type="text"
                  value={swiftNumber}
                  onChange={handleSwiftCodeChange}
                  placeholder="Enter code"
                  className="h-12 rounded-lg text-gray-500 border-gray-700"
                />
                {swiftCodeError && (
                  <p className="text-red-500">{swiftCodeError}</p>
                )}
                {errorState?.field === "swiftNumber" && (
                  <p className="text-red-500 ">Swift is required</p>
                )}
              </div>
            </div>
          </div>

          <div className='className="w-full mt-5 flex flex-row items-center justify-end gap-5'>
            <button
              type="reset"
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
                accountTitleError !== null ||
                swiftCodeError !== null ||
                ibanNumberError !== null ||
                errorState !== null ||
                formChanged === false
                  ? "opacity-50"
                  : ""
              } py-2 px-10 bg-kupi-yellow rounded-lg font-semibold`}
              disabled={
                loading ||
                accountTitleError !== null ||
                ibanNumberError !== null ||
                swiftCodeError !== null ||
                errorState !== null ||
                formChanged === false
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
                placeholder="Cape Town is a port city on South Africa’s southwest coast, on a peninsula beneath the imposing Table Mountain. Slowly rotating cable cars climb to the mountain’s flat top, from which there are sweeping views of the city,"
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
                  value={tickets}
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
                  placeholder="$20"
                  value={exchangeRate > 0 ? `$${exchangeRate.toFixed(0)}` : ""}
                  onChange={handleExchangeRateChange}
                  required
                />
                {errorState?.field === "exchangeRate" && (
                  <p className="text-red-500 ">Exchange rate required</p>
                )}
              </div>
            </div>
          </div>

          {/* Bank account detail */}
          <div className="h-80 w-full bg-white mt-5 shadow-sm rounded-md flex flex-col px-8 py-8">
            <p className="text-lg text-black font-semibold">
              Bank Account Detail
            </p>
            <div className="w-full flex flex-wrap items-start justify-between gap-3 mt-5">
              <div className="w-5/12 mb-2">
                <p className="mb-1 darkGray-text font-normal text-sm">
                  Bank Name
                </p>
                <Input
                  type="text"
                  value={bankName}
                  onChange={handleBankChange}
                  placeholder="Enter bank name"
                  className="h-12 rounded-lg text-gray-500 border-gray-700"
                />
                {bankNameError && (
                  <p className="text-red-500 text-sm">{bankNameError}</p>
                )}
                {errorState?.field === "bankName" && (
                  <p className="text-red-500 ">Bank name is required</p>
                )}
              </div>
              <div className="w-5/12 mb-2">
                <p className="mb-1 darkGray-text font-normal text-sm">
                  Account Title
                </p>
                <Input
                  type="text"
                  value={accountTitle}
                  onChange={handleAccountTitleChange}
                  placeholder="Enter account title"
                  className="h-12 rounded-lg text-gray-500 border-gray-700"
                />
                {accountTitleError && (
                  <p className="text-red-500 text-sm">{accountTitleError}</p>
                )}
                {errorState?.field === "accountTitle" && (
                  <p className="text-red-500 ">Account title is required</p>
                )}
              </div>
              <div className="w-5/12 mb-2">
                <p className="mb-1 darkGray-text font-normal">IBAN Number</p>
                <Input
                  type="text"
                  value={ibanNumber}
                  onChange={handleIbanNumberChange}
                  placeholder="Enter IBAN Number"
                  className="h-12 rounded-lg text-gray-500 border-gray-700"
                />
                {ibanNumberError && (
                  <p className="text-red-500">{ibanNumberError}</p>
                )}
                {errorState?.field === "ibanNumber" && (
                  <p className="text-red-500 ">IBAN is required</p>
                )}
              </div>
              <div className="w-5/12 mb-2">
                <p className="mb-1 darkGray-text font-normal text-sm">
                  Swift Code
                </p>
                <Input
                  type="text"
                  value={swiftNumber}
                  onChange={handleSwiftCodeChange}
                  placeholder="Enter code"
                  className="h-12 rounded-lg text-gray-500 border-gray-700"
                />
                {swiftCodeError && (
                  <p className="text-red-500">{swiftCodeError}</p>
                )}
                {errorState?.field === "swiftNumber" && (
                  <p className="text-red-500 ">Swift is required</p>
                )}
              </div>
            </div>
          </div>

          <div className='className="w-full mt-5 flex flex-row items-center justify-end gap-5'>
            <button
              type="reset"
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
                accountTitleError !== null ||
                swiftCodeError !== null ||
                ibanNumberError !== null ||
                errorState !== null ||
                formChanged === false
                  ? "opacity-50"
                  : ""
              } py-2 px-10 bg-kupi-yellow rounded-lg font-semibold`}
              disabled={
                loading ||
                accountTitleError !== null ||
                ibanNumberError !== null ||
                swiftCodeError !== null ||
                errorState !== null ||
                formChanged === false
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
