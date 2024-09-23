"use client";
import React from "react";
import Image from "next/image";
import { TicketsDataType, TicketStatus } from "@/types/ticket";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  TicketData: TicketsDataType | null;
}

const TicketDetailDialgue: React.FC<DialogProps> = ({
  open,
  onClose,
  TicketData,
}) => {
  if (!open) return null;

  const busCompanyAmount =
    TicketData?.tickets &&
    TicketData?.tickets.priceDetails.kupiMarkup -
      TicketData?.tickets.priceDetails.kupiProfit -
      (TicketData?.tickets.priceDetails.carmaProfit -
        TicketData?.tickets.priceDetails.totalPrice);
  const kupiCommissionPercent =
    TicketData?.tickets &&
    TicketData?.tickets.priceDetails.kupiCommissionPercentage +
      TicketData?.tickets.priceDetails.kupiMarkupPercentage;
  const KupiAmount =
    TicketData?.tickets &&
    TicketData?.tickets.priceDetails.kupiMarkup +
      TicketData?.tickets.priceDetails.kupiProfit;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex dialguebox-container items-center justify-center z-50 duration-700 ease-out">
      <div className="lightGray py-6 px-8 rounded-lg shadow-lg dialguebox flex flex-wrap justify-between gap-2 duration-700 ease-out">
        <div className="w-full flex flex-row justify-between">
          <p className="text-lg text-black font-semibold">Ticket Detail</p>
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

        <div className="w-full flex flex-row justify-between items-start">
          <div className="flex w-full flex-col items-start">
            <div className="relative w-full bg-white rounded-lg px-8 py-4 flex flex-col items-start justify-center gap-4 border-2">
              {TicketData?.tickets.status === TicketStatus.CONFIRMED && (
                <p className="transaction-paid">Confirm</p>
              )}
              <p className="text-black font-semibold text-md">
                Customer Information
              </p>
              <div className="flex flex-row w-full items-start justify-start gap-10">
                <div className="w-6/12">
                  <p className="text-gray-600 font-light">Name</p>
                  <span>{TicketData?.customer?.name}</span>
                </div>
                <div className="w-6/12">
                  <p className="text-gray-600 font-light">Phone</p>
                  <span>+{TicketData?.customer?.number}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg px-8 py-4 flex flex-col items-start justify-center gap-4 border-2">
              <p className="text-black font-semibold text-md">
                Route Information
              </p>
              <div className="w-full flex flex-wrap justify-between gap-2">
                <div className="w-5/12">
                  <p className="text-gray-600 font-light">Ticket ID</p>
                  <span>{TicketData?.tickets.ticketId}</span>
                </div>
                <div className="w-5/12">
                  <p className="text-gray-600 font-light">Bus Number</p>
                  <span>{TicketData?.tickets.busIdentifier}</span>
                </div>
                <div className="w-5/12">
                  <p className="text-gray-600 font-light">Departure Location</p>
                  <span className="break-words">
                    {TicketData?.sourceCity.name}
                  </span>
                </div>
                <div className="w-5/12">
                  <p className="text-gray-600 font-light">Arrival Location</p>
                  <span>{TicketData?.arrivalCity.name}</span>
                </div>
                <div className="w-5/12">
                  <p className="text-gray-600 font-light">Departure Time</p>
                  <span>
                    {TicketData?.tickets.departureTime?.toLocaleTimeString(
                      "en-US",
                      {
                        timeZone: "UTC",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
                <div className="w-5/12">
                  <p className="text-gray-600 font-light">Arrival Time</p>
                  <span>
                    {TicketData?.tickets.arrivalTime?.toLocaleTimeString(
                      "en-US",
                      {
                        timeZone: "UTC",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg px-8 py-4 flex flex-col items-start justify-center gap-4 border-2">
              <p className="text-black font-semibold text-md">
                Ticket Price Detail
              </p>
              <div className="w-full flex flex-wrap justify-between gap-2">
                <div className="w-5/12">
                  <p className="text-gray-600 font-light">Payment Method</p>
                  <span>{TicketData?.tickets.paymentMethod}</span>
                </div>
                <div className="w-5/12">
                  <p className="text-gray-600 font-light">Bus Company Amount</p>
                  <span>${busCompanyAmount}</span>
                </div>
                <div className="w-5/12">
                  <p className="text-gray-600 font-light">Carma Commission</p>
                  <span>
                    {TicketData?.tickets.priceDetails.carmaCommissionPercentage}
                    %
                  </span>
                </div>
                <div className="w-5/12">
                  <p className="text-gray-600 font-light">Carma Amount</p>
                  <span>
                    ${TicketData?.tickets.priceDetails.carmaProfit.toFixed(1)}
                  </span>
                </div>
                <div className="w-5/12">
                  <p className="text-gray-600 font-light">Kupi Commission</p>
                  {TicketData &&
                  TicketData?.tickets.priceDetails.kupiMarkupPercentage > 0 ? (
                    <span>
                      (
                      {
                        TicketData?.tickets.priceDetails
                          .kupiCommissionPercentage
                      }
                      % +{" "}
                      {TicketData?.tickets.priceDetails.kupiMarkupPercentage}%)
                      = {kupiCommissionPercent}%
                    </span>
                  ) : (
                    <span>
                      {
                        TicketData?.tickets.priceDetails
                          .kupiCommissionPercentage
                      }
                      %
                    </span>
                  )}
                </div>
                <div className="w-5/12">
                  <p className="text-gray-600 font-light">Kupi Amount</p>
                  {TicketData &&
                  TicketData?.tickets.priceDetails.kupiMarkup > 0 ? (
                    <span>
                      (${TicketData?.tickets.priceDetails.kupiMarkup.toFixed(1)}{" "}
                      + $
                      {TicketData?.tickets.priceDetails.kupiProfit.toFixed(1)})
                      = ${KupiAmount && KupiAmount.toFixed(1)}
                    </span>
                  ) : (
                    <span>
                      ${TicketData?.tickets.priceDetails.kupiProfit.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full hrGap bg-gray-500"></div>
              <div className="flex w-full flex-row justify-between">
                <p className="text-gray-600 font-light">Total Price</p>
                <p className="text-black font-semibold text-md">
                  ${TicketData?.tickets.priceDetails.totalPrice.toFixed(1)}{" "}
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-full passenger_info_dialgue bg-white rounded-lg px-8 py-4 flex flex-col items-start justify-start gap-4 border-2">
            <p className="text-black font-semibold text-md">
              Passengers Information
            </p>
            <div className="w-full flex flex-col gap-3">
              {TicketData?.passengerDetails?.map((passenger, i) => (
                <div
                  className="flex w-full flex-col justify-between border-b-2 pb-2"
                  key={i}
                >
                  <div className="w-5/12">
                    <p className="text-gray-600 font-light">Name</p>
                    <span className="whitespace-nowrap">{passenger.name}</span>
                  </div>
                  <div className="w-5/12">
                    <p className="text-gray-600 font-light">Passport</p>
                    <span>{passenger.passportNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full flex justify-end">
          <button
            onClick={onClose}
            className="border-gray-600 py-1 px-8 bg-transparent border-2 rounded-lg text-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailDialgue;
