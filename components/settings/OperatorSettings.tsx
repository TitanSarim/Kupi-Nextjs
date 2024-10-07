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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  validateEmail,
  validateWhatsAppNumber,
} from "@/libs/ClientSideHelpers";
import { createOperatorSettings } from "@/actions/settings.action";
import { operatorSettingsReturn } from "@/types/settings";
import toast from "react-hot-toast";

interface OperatorSettingsProps {
  operatorSettings?: operatorSettingsReturn | null | undefined;
}

const OperatorSettings: React.FC<OperatorSettingsProps> = ({
  operatorSettings,
}) => {
  const { currency, amount, equivalent, unit } = Rates.globalExchangeRate;
  const [busOperator, setBusOperator] = useState("");
  const [numbers, setNumbers] = useState<string[]>([]);
  const [numberInput, setNumberInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [tickets, setTickets] = useState<number>(0);
  const [bookingAt, setBookingAt] = useState("00:00");
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountTitle, setAccountTitle] = useState("");
  const [ibanNumber, setIbanNumber] = useState("");
  const [swiftNumber, setSwiftNumber] = useState("");
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
        setBookingAt(
          formatTime(parseInt(operatorSettings?.operatorSettings?.closeBooking))
        );
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
    }
  };

  useEffect(() => {
    handleData();
  }, [operatorSettings]);

  const handleReset = () => {
    handleData();
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

  const handleAddEmail = () => {
    if (
      emailInput.trim() &&
      validateEmail(emailInput) &&
      !emails.includes(emailInput)
    ) {
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

  const handleAddNumber = () => {
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

  const handleAccountTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 50) {
      setAccountTitle(value);
      setErrorState(null);
      setAccountTitleError(validateFieldLength(value, 3, 50));
      setFormChanged(true);
    }
  };

  const handleIbanNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "");
    if (value.length <= 34) {
      setIbanNumber(value);
      setErrorState(null);
      setIbanNumberError(validateFieldLength(value, 15, 34));
      setFormChanged(true);
    }
  };

  const handleSwiftCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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

  const handleBankChange = (value: string) => {
    if (value === "Clear") {
      setBankName("");
      setErrorState({
        field: "bankName",
        message: "Bank name cannot be empty",
      });
    } else {
      setBankName(value);
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
      const response = await createOperatorSettings(formData);
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
    <div className="w-full h-fit">
      <div className="w-full">
        <p className="mb-1 darkGray-text font-normal text-sm">Bus Operator</p>
        <Input
          type="text"
          value={busOperator}
          onChange={(e) => setBusOperator(e.target.value)}
          placeholder="Search bus operator"
          className="h-12 rounded-lg text-gray-500 border-gray-700"
        />
      </div>
      {/* notification settings */}

      <form className="w-full" onSubmit={handleSubmit}>
        <div className="h-80 w-full bg-white mt-5 shadow-sm rounded-md flex flex-col px-8 py-8">
          <p className="text-lg text-black font-semibold">
            Notification Settings
          </p>
          <div className="w-full mt-3">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Select Email
            </p>
            <div className="h-12 flex flex-row rounded-lg text-gray-500 emailselecter border-gray-700">
              <div className="relative flex w-auto flex-row items-center gap-2">
                {emails.map((email, index) => (
                  <span
                    key={index}
                    className="ml-2 buttonmap-selectemail bg-kupi-yellow text-black rounded-lg px-3 py-2 text-sm"
                  >
                    {email}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveEmail(email);
                      }}
                      className="relative outline-none border-none"
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
              </div>

              <Input
                type="email"
                placeholder="Add emails"
                className="outline-none border-none w-full"
                value={emailInput}
                onChange={(e) =>
                  setEmailInput(e.target.value.replace(/\s/g, ""))
                }
                onKeyDown={handleKeyPress}
              />
              {emailInput.length > 0 && (
                <button
                  className="showrittenemail"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddEmail();
                  }}
                >
                  {emailInput}
                </button>
              )}
            </div>
            {errorState?.field === "emails" && (
              <p className="text-red-500 ">{errorState.message}</p>
            )}
          </div>

          <div className="mt-5">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Whatsapp Number
            </p>
            <div className="h-12 flex flex-row rounded-lg text-gray-500 emailselecter border-gray-700">
              <div className="relative flex w-auto flex-row items-center gap-2">
                {numbers.map((number, index) => (
                  <span
                    key={index}
                    className="ml-2 buttonmap-selectemail bg-kupi-yellow text-black rounded-lg px-3 py-2 text-sm"
                  >
                    {number}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveNumber(number);
                      }}
                      className="relative outline-none border-none"
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
              </div>

              <Input
                type="text"
                placeholder="Add Whatsapp Numbers"
                className="outline-none border-none w-full"
                value={numberInput}
                onChange={(e) => setNumberInput(e.target.value)}
                onKeyDown={handleNumberKeyPress}
              />
              {numberInput.length > 0 && (
                <button
                  className="showrittenemail"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddNumber();
                  }}
                >
                  {numberInput}
                </button>
              )}
            </div>
            {errorState?.field === "numbers" && (
              <p className="text-red-500 ">{errorState.message}</p>
            )}
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
              <p className="text-sm text-gray-400">{description.length}/299</p>{" "}
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
                Close Booking at 30 minutes before Departure
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
                        Ensure all bookings are closed 30 minutes prior to the
                        departure time to avoid last-minute issues.
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
              <Select value={bankName} onValueChange={handleBankChange}>
                <SelectTrigger className="w-full h-12 rounded-lg text-gray-500 border-gray-700 ">
                  <SelectValue placeholder="Select Bank" />
                </SelectTrigger>
                <SelectContent className="select-dropdown z-50">
                  <SelectItem value="Clear">Clear</SelectItem>
                  <SelectItem value="Carma">Carma</SelectItem>
                  <SelectItem value="Kupi">Kupi</SelectItem>
                </SelectContent>
              </Select>
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
              loading || errorState !== null || formChanged === false
                ? "opacity-50"
                : ""
            } py-2 px-10 bg-kupi-yellow rounded-lg font-semibold`}
            disabled={loading || errorState !== null || formChanged === false}
          >
            {loading ? "Please Wait" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OperatorSettings;
