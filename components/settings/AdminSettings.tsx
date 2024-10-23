"use client";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { adminSetting, underMaintainance } from "@/actions/settings.action";
import { SettingsFormData } from "@/types/settings";
import Rates from "@/libs/Rates";
import { Settings } from "@prisma/client";
import { SyncBusOperators } from "@/actions/operators.action";
import toast from "react-hot-toast";
import MaintainanceDialogue from "./MaintainanceDialogue";
import GlobalResetDialogue from "./GlobalResetDialogue";

interface AdminSettingsProps {
  settings: Settings[];
}

// ! sales commission will always be less then kupi comission (comission)

const AdminSettings: React.FC<AdminSettingsProps> = (settings) => {
  const { currency, amount, equivalent, unit } = Rates.globalExchangeRate;
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [commission, setCommission] = useState<number>(0);
  const [salesCommission, setSalesCommission] = useState<number>(0);
  const [salesCommissionError, setSalesCommissionError] =
    useState<boolean>(false);
  const [carmaCommission, setCarmaCommission] = useState<number>(0);
  const [kupiMarkup, setKupiMarkup] = useState<number>(0);
  const [tickets, setTickets] = useState<number>(0);
  const [bookingAt, setBookingAt] = useState("00:00");
  const [reminder, setReminder] = useState<number>(0);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);
  const [maintainanace, setMaintainanace] = useState<boolean>(false);
  const [maintanaceMessage, setMaintanaceMessage] = useState<string>(
    "Thanks for your message! We’re currently working hard to bring you an even better ticket booking experience! We’re sorry for the inconvenience but we’ll be back shortly!"
  );
  const [formChanged, setFormChanged] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSecondOpen, setDialogSecondOpen] = useState(false);

  const handleExchangeRateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.value;

    let numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue.length > 5) {
      numericValue = numericValue.substring(0, 5);
    }
    const exchangeRate = Math.min(Number(numericValue), 99999);
    setExchangeRate(exchangeRate);
    setFormChanged(true);
  };

  const handleKupiMarkUpChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    let numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue.length > 3) {
      numericValue = numericValue.substring(0, 3);
    }
    const exchangeRate = Math.min(Number(numericValue), 999);
    setKupiMarkup(exchangeRate);
    setFormChanged(true);
  };

  const handleCommissionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.value;
    let numericValue = value.replace(/[^0-9]/g, "");
    let commission = Number(numericValue);
    if (commission < 0) {
      commission = 0;
    } else if (commission > 100) {
      commission = 100;
    }

    setCommission(commission);
    setFormChanged(true);
  };

  const handleSalesCommissionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.value;
    let numericValue = value.replace(/[^0-9]/g, "");
    let salesCommissionValue = Number(numericValue);

    if (salesCommissionValue < 0) {
      salesCommissionValue = 0;
    }

    if (salesCommissionValue >= commission) {
      setSalesCommissionError(true);
      setSalesCommission(0);
    } else {
      setSalesCommissionError(false);
      setSalesCommission(salesCommissionValue);
    }

    setFormChanged(true);
  };

  const handleCarmaCommissionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.value;
    let numericValue = value.replace(/[^0-9]/g, "");
    let commission = Number(numericValue);
    if (commission < 0) {
      commission = 0;
    } else if (commission > 100) {
      commission = 100;
    }
    setCarmaCommission(commission);
    setFormChanged(true);
  };

  const handleTicketsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const numericValue = Math.max(0, parseFloat(value));
    setTickets(numericValue);
    setFormChanged(true);
  };

  const handleReminderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    let numericValue = value.replace(/[^0-9]/g, "");
    let reminder = Number(numericValue);
    if (reminder < 0) {
      reminder = 0;
    } else if (reminder > 100) {
      reminder = 100;
    }

    setReminder(reminder);
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
    setFormChanged(true);
  };

  const handleShowSecondDetail = () => {
    setDialogSecondOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const convertTimeToSeconds = (formattedTime: string): number => {
      const [minutes, seconds] = formattedTime.split(":").map(Number);
      return minutes * 60 + seconds;
    };

    const formData: SettingsFormData[] = [
      {
        key: "EXCHANGE_RATE",
        value: exchangeRate,
      },
      {
        key: "KUPI_COMMISSION_PERCENTAGE",
        value: commission,
      },
      {
        key: "SALES_COMMISSION_PERCENTAGE",
        value: salesCommission,
      },
      {
        key: "CARMA_COMMISSION_PERCENTAGE",
        value: carmaCommission,
      },
      {
        key: "KUPI_MARKUP_PERCENTAGE",
        value: kupiMarkup,
      },
      {
        key: "NUM_OF_TICKETS",
        value: tickets,
      },
      {
        key: "TIMEOUT_BOOKING",
        value: convertTimeToSeconds(bookingAt),
      },
      {
        key: "EMAIL_REMINDER",
        value: reminder,
      },
    ];

    try {
      const response = await adminSetting(formData);
      if (response === true) {
        toast.success("Settings updated successfully");
        handleShowSecondDetail();
      }
    } catch (error) {
      setError(true);
    } finally {
      setFormChanged(false);
      setLoading(false);
    }
  };

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const dataHandler = () => {
    async function fetchData() {
      if (settings.settings && Array.isArray(settings.settings)) {
        try {
          let exchangeRate = "";
          let commission = "";
          let salesCommission = "";
          let tickets = "";
          let bookingAt = "";
          let reminder = "";
          let carmaCommissionPercentage = "";
          let kupiMarkup = "";
          let maintenance = false;
          let message = "";

          settings.settings.forEach((setting: any) => {
            switch (setting.key) {
              case "EXCHANGE_RATE":
                exchangeRate = setting.value;
                break;
              case "KUPI_COMMISSION_PERCENTAGE":
                commission = setting.value;
                break;
              case "CARMA_COMMISSION_PERCENTAGE":
                carmaCommissionPercentage = setting.value;
                break;
              case "SALES_COMMISSION_PERCENTAGE":
                salesCommission = setting.value;
              case "KUPI_MARKUP_PERCENTAGE":
                kupiMarkup = setting.value;
                break;
              case "NUM_OF_TICKETS":
                tickets = setting.value;
                break;
              case "TIMEOUT_BOOKING":
                bookingAt = setting.value;
                break;
              case "EMAIL_REMINDER":
                reminder = setting.value;
                break;
              case "underMaintainance":
                maintenance = setting.value;
              case "MAINTAINACE_MESSAGE":
                message = setting.value;

              default:
                break;
            }
          });

          const parsedBookingAt = parseInt(bookingAt);
          const formattedBookingAt = isNaN(parsedBookingAt)
            ? "00:00"
            : formatTime(parsedBookingAt);
          setExchangeRate(parseInt(exchangeRate));
          setCommission(parseInt(commission));
          setTickets(parseInt(tickets));
          setBookingAt(formattedBookingAt);
          setReminder(parseInt(reminder));
          setKupiMarkup(parseInt(kupiMarkup));
          setCarmaCommission(parseInt(carmaCommissionPercentage));
          setSalesCommission(parseInt(salesCommission));
          setMaintainanace(maintenance);
          if (message.length <= 0 || message === "" || !message) {
            setMaintanaceMessage(
              "Thanks for your message! We’re currently working hard to bring you an even better ticket booking experience! We’re sorry for the inconvenience but we’ll be back shortly!"
            );
          } else {
            setMaintanaceMessage(message);
          }
        } catch (error) {
          setError(true);
        }
      }
    }
    fetchData();
  };

  const handleShowDetail = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleCloseDialogSecond = () => {
    setDialogSecondOpen(false);
  };

  const loadMaintainanceFromStorage = () => {
    const storedValue = localStorage.getItem("maintainance");
    if (storedValue === "true") {
      setMaintainanace(true);
    } else {
      setMaintainanace(false);
    }
  };

  const handleFetchOperators = async () => {
    setLoading(true);
    setFetchLoading(true);
    try {
      await SyncBusOperators();
      toast.success("Operators fetched successfully");
    } catch (error) {
      console.error("Error fetching operators");
    } finally {
      setFetchLoading(false);
      setLoading(false);
    }
  };

  const handleReset = () => {
    dataHandler();
    setFormChanged(false);
  };

  useEffect(() => {
    loadMaintainanceFromStorage();
    dataHandler();
  }, [settings]);

  return (
    <div className="w-full h-screen">
      <div className="h-80 w-full bg-white mt-5 shadow-sm rounded-md px-8 py-6">
        <div className="w-full flex flex-row items-center justify-between">
          <p className="text-lg text-black font-semibold">Admin Settings</p>
          <div className="flex flex-row gap-6">
            <button
              onClick={handleFetchOperators}
              type="button"
              className={`${
                loading || fetchLoading ? "opacity-50" : ""
              } py-2 px-10 bg-kupi-yellow rounded-lg font-semibold`}
              disabled={loading}
            >
              {fetchLoading === true ? "Loading..." : "Fetch Operators"}
            </button>
            <div className="flex flex-row gap-10 border-2 border-gray-400 px-4 py-3 rounded-lg box-bg">
              <p className="darkGray-text font-normal text-sm">Maintenance</p>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={maintainanace}
                  onChange={handleShowDetail}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="relative mt-6 w-full flex flex-wrap items-start justify-between gap-3">
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
                className="h-12 border-gray-400 rounded-lg"
                placeholder="ZiG20"
                value={
                  exchangeRate >= 0 ? `ZiG${" "}${exchangeRate.toFixed(0)}` : ""
                }
                onChange={handleExchangeRateChange}
                required
              />
            </div>

            <div className="w-5/12 mb-2">
              <p className="mb-1 darkGray-text font-normal pb-1">
                Kupi Commission
              </p>
              <Input
                type="text"
                className="h-12 border-gray-400 rounded-lg"
                placeholder="10%"
                value={commission >= 0 ? `${commission.toFixed(0)}%` : ""}
                onChange={handleCommissionChange}
                required
              />
            </div>
            <div className="w-5/12 mb-2">
              <p className="mb-1 darkGray-text font-normal pb-1">
                Sales Commission
              </p>
              <Input
                type="text"
                className="h-12 border-gray-400 rounded-lg"
                placeholder="10%"
                value={
                  salesCommission >= 0 ? `${salesCommission.toFixed(0)}%` : ""
                }
                onChange={handleSalesCommissionChange}
                required
              />
              {salesCommissionError === true && (
                <p className="text-red-500">
                  Sales Commission should be less then Kupi Commission
                </p>
              )}
            </div>
            <div className="w-5/12 mb-2">
              <p className="mb-1 darkGray-text font-normal pb-1">Kupi Markup</p>
              <Input
                type="text"
                className="h-12 border-gray-400 rounded-lg"
                placeholder="$10"
                value={kupiMarkup >= 0 ? `${kupiMarkup.toFixed(0)}%` : ""}
                onChange={handleKupiMarkUpChange}
                required
              />
            </div>
            <div className="w-5/12 mb-2">
              <p className="mb-1 darkGray-text font-normal pb-1">
                Carma Comission
              </p>
              <Input
                type="text"
                className="h-12 border-gray-400 rounded-lg"
                placeholder="1.3%"
                value={
                  carmaCommission >= 0 ? `${carmaCommission.toFixed(0)}%` : ""
                }
                onChange={handleCarmaCommissionChange}
                required
              />
            </div>

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
                className="h-12 border-gray-400 rounded-lg"
                placeholder="01"
                min={0}
                max={100}
                value={tickets}
                onChange={handleTicketsChange}
                required
              />
            </div>

            <div className="w-5/12 mb-2">
              <p className="mb-1 darkGray-text font-normal flex flex-row gap-3">
                Close Booking at x minutes Before Departure?
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
                className="h-12 border-gray-400 rounded-lg"
                placeholder="00:00"
                value={bookingAt}
                onChange={handleBookingAtRateChange}
                required
              />
            </div>

            <div className="w-5/12 mb-2">
              <p className="mb-1 darkGray-text font-normal pb-1">
                Email Reminder<span className="text-gray-500"> [days]</span>
              </p>
              <Input
                type="text"
                className="h-12 border-gray-400 rounded-lg"
                placeholder="Duration days"
                value={reminder >= 0 ? `${reminder.toFixed(0)}` : ""}
                onChange={handleReminderChange}
                required
              />
            </div>
          </div>
          {error && (
            <p className="text-red-500 mt-4">Un Expected Error Occured</p>
          )}
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
              type="submit"
              className={`${
                loading || !formChanged ? "opacity-50" : ""
              } py-2 px-10 bg-kupi-yellow rounded-lg font-semibold`}
              disabled={loading || !formChanged}
            >
              {loading ? "Please Wait" : "Save"}
            </button>
          </div>
        </form>

        <MaintainanceDialogue
          open={dialogOpen}
          onClose={handleCloseDialog}
          setMaintainanace={setMaintainanace}
          maintainanace={maintainanace}
          setMaintanaceMessage={setMaintanaceMessage}
          maintanaceMessage={maintanaceMessage}
        />

        <GlobalResetDialogue
          open={dialogSecondOpen}
          onClose={handleCloseDialogSecond}
          exchangeRate={exchangeRate}
        />
      </div>
    </div>
  );
};

export default AdminSettings;
