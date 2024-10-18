"use client";
import React from "react";
import Image from "next/image";
import { TransactionStatus } from "@/types/transactions";
import { TransactionsType } from "@/types/transactions";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  TransactionData: TransactionsType | null;
}

const TransactionDetailDialgue: React.FC<DialogProps> = ({
  open,
  onClose,
  TransactionData,
}) => {
  if (!open) return null;

  const TransactionTicket = TransactionData?.tickets;
  const carmaProfitOne =
    (TransactionTicket && TransactionTicket?.[0]?.priceDetails.carmaProfit) ||
    0;

  const kupiProfitOne =
    (TransactionTicket && TransactionTicket?.[0]?.priceDetails.kupiProfit) || 0;

  const kupiMarkupiOne =
    (TransactionTicket && TransactionTicket?.[0]?.priceDetails.kupiMarkup) || 0;

  const busCompanyAmountOne =
    TransactionTicket &&
    TransactionTicket?.[0]?.priceDetails.totalPrice -
      carmaProfitOne -
      kupiProfitOne -
      kupiMarkupiOne;

  const carmaProfitTwo = TransactionTicket?.[1]?.priceDetails?.carmaProfit || 0;

  const kupiProfitTwo = TransactionTicket?.[1]?.priceDetails?.kupiProfit || 0;

  const kupiMarkupiTwo = TransactionTicket?.[1]?.priceDetails?.kupiMarkup || 0;

  const busCompanyAmountTwo = TransactionTicket?.[1]?.priceDetails?.totalPrice
    ? TransactionTicket?.[1].priceDetails.totalPrice -
      carmaProfitTwo -
      kupiProfitTwo -
      kupiMarkupiTwo
    : 0;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 transaction_dialguebox-container flex items-center justify-center z-50 duration-700 ease-out">
      <div
        className="lightGray py-6 px-8 rounded-lg shadow-lg transaction_dialguebox flex flex-col gap-1 duration-700 ease-out"
        style={{
          width:
            TransactionData?.tickets && TransactionData?.tickets?.length > 1
              ? "1100px"
              : "600px",
        }}
      >
        <div className="w-full flex flex-row justify-between">
          <p className="text-lg text-black font-semibold">Transaction Detail</p>
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

        <div className="w-full flex flex-col gap-1 inner-transaction_dialguebox">
          {/* customer information */}
          <div className="w-full relative bg-white rounded-lg px-8 py-4 flex flex-col items-start justify-center gap-4 border-2">
            {Array.isArray(TransactionData?.paymentReference) &&
              TransactionData.paymentReference[0]?.status ===
                TransactionStatus.Paid && (
                <p className="transaction-paid">Paid</p>
              )}
            <p className="text-black font-semibold text-md">
              Customer Information
            </p>
            <div className="w-full flex flex-wrap justify-between gap-2">
              <div>
                <p className="text-gray-600 font-light">Customer Name</p>
                <span>
                  {TransactionData?.customer && TransactionData?.customer.name}
                </span>
              </div>
              <div>
                <p className="text-gray-600 font-light">Customer Phone</p>
                <span>
                  +
                  {TransactionData?.customer &&
                    TransactionData?.customer.number}
                </span>
              </div>
            </div>
          </div>
          {/* tickets info */}
          <div className="w-full flex flex-row">
            {/* 1st transaction if */}
            <div className="w-auto flex flex-col gap-1">
              {/* Route Infotmation */}
              <div className="bg-white rounded-lg px-8 py-4 flex flex-col items-start justify-center gap-4 border-2">
                <p className="text-black font-semibold text-md">
                  Route Information
                </p>
                <div className="w-full flex flex-wrap justify-between gap-2">
                  <div className="w-5/12">
                    <p className="text-gray-600 font-light">Ticket ID</p>
                    <span>
                      {TransactionData?.tickets &&
                        TransactionData?.tickets?.[0]?.ticketId}
                    </span>
                  </div>
                  <div className="w-5/12">
                    <p className="text-gray-600 font-light">Bus Number</p>
                    <span>
                      {TransactionData?.tickets &&
                        TransactionData?.tickets &&
                        TransactionData?.tickets?.[0]?.busIdentifier}
                    </span>
                  </div>
                  <div className="w-5/12">
                    <p className="text-gray-600 font-light">
                      Departure Location
                    </p>
                    <span>
                      {TransactionData?.tickets &&
                        TransactionData?.tickets &&
                        TransactionData.sourceCity?.name}
                    </span>
                  </div>
                  <div className="w-5/12">
                    <p className="text-gray-600 font-light">Arrival Location</p>
                    <span>
                      {TransactionData?.tickets &&
                        TransactionData.arrivalCity?.name}
                    </span>
                  </div>
                  <div className="w-5/12">
                    <p className="text-gray-600 font-light">Departure Time</p>
                    {TransactionData?.tickets &&
                      TransactionData?.tickets?.[0]?.departureTime.toLocaleTimeString(
                        "en-US",
                        {
                          timeZone: "Africa/Harare",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                  </div>
                  <div className="w-5/12">
                    <p className="text-gray-600 font-light">Arrival Time</p>
                    {TransactionData?.tickets &&
                      TransactionData?.tickets?.[0]?.arrivalTime.toLocaleTimeString(
                        "en-US",
                        {
                          timeZone: "Africa/Harare",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                  </div>
                </div>
              </div>
              {/* Ticket Price Details */}
              <div className="bg-white rounded-lg px-8 py-4 flex flex-col items-start justify-center gap-4 border-2">
                <p className="text-black font-semibold text-md">
                  Ticket Price Detail
                </p>
                <div className="w-full flex flex-wrap justify-between gap-2">
                  <div className="w-5/12">
                    <p className="text-gray-600 font-light">Payment Method</p>
                    <span>{TransactionData?.transactions.paymentMethod}</span>
                  </div>
                  <div className="w-5/12">
                    <p className="text-gray-600 font-light">
                      Bus Company Amount
                    </p>
                    <span>
                      ${busCompanyAmountOne && busCompanyAmountOne.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-5/12">
                    <p className="text-gray-600 font-light">Carma Commission</p>
                    <span>
                      {TransactionData?.tickets &&
                        TransactionData?.tickets?.[0].priceDetails
                          .carmaCommissionPercentage}
                      %
                    </span>
                  </div>
                  <div className="w-5/12">
                    <p className="text-gray-600 font-light">Carma Amount</p>
                    <span>${carmaProfitOne.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              {/* Kuppi Price */}
              <div className="bg-white rounded-lg px-8 py-4 flex flex-col items-start justify-center gap-4 border-2">
                <p className="text-black font-semibold text-md">
                  Kupi Price Detail
                </p>
                <div className="w-full flex flex-wrap justify-between gap-2">
                  <div className="w-5/12">
                    <p className="text-gray-600 font-light">Kupi Markup</p>
                    <span>
                      {TransactionData?.tickets &&
                        TransactionData?.tickets[0].priceDetails
                          .kupiCommissionPercentage}
                      %
                    </span>
                  </div>
                  <div className="w-5/12">
                    <p className="text-gray-600 font-light">Kupi Commission</p>
                    <span>
                      {TransactionData?.tickets &&
                        TransactionData?.tickets[0].priceDetails
                          .kupiMarkupPercentage}
                      %
                    </span>
                  </div>
                  <div className="w-5/12">
                    <p className="text-gray-600 font-light">Sales Commission</p>
                    <span>{0}%</span>
                  </div>
                  <div className="w-5/12">
                    <p className="text-gray-600 font-light">Kupi Amount</p>
                    {TransactionData?.tickets &&
                    TransactionData?.tickets?.[0]?.priceDetails.kupiMarkup >
                      0 ? (
                      <span>
                        (${kupiProfitOne.toFixed(1)} + $
                        {kupiMarkupiOne.toFixed(1)}) = $
                        {(kupiProfitOne + kupiMarkupiOne).toFixed(1)}
                      </span>
                    ) : (
                      <span>
                        $
                        {TransactionData?.tickets &&
                          TransactionData?.tickets?.[0]?.priceDetails.kupiProfit.toFixed(
                            1
                          )}
                      </span>
                    )}
                  </div>
                </div>
                {TransactionData?.tickets &&
                  TransactionData?.tickets?.length > 1 && (
                    <>
                      <div className="w-full hrGap bg-gray-500"></div>

                      <div className="flex w-full flex-row justify-between">
                        <p className="text-gray-600 font-light">Price</p>
                        <p className="text-black font-semibold text-md">
                          $
                          {TransactionData?.tickets &&
                            TransactionData?.tickets?.[0]?.priceDetails.totalPrice.toFixed(
                              1
                            )}
                        </p>
                      </div>
                    </>
                  )}
              </div>
            </div>
            {/* second transaction if */}
            {TransactionData?.tickets &&
              TransactionData?.tickets?.length > 1 && (
                <div className="w-auto flex flex-col gap-1">
                  {/* Route Infotmation */}
                  <div className="bg-white rounded-lg px-8 py-4 flex flex-col items-start justify-center gap-4 border-2">
                    <p className="text-black font-semibold text-md">
                      Route Information
                    </p>
                    <div className="w-full flex flex-wrap justify-between gap-2">
                      <div className="w-5/12">
                        <p className="text-gray-600 font-light">Ticket ID</p>
                        <span>
                          {TransactionData?.tickets &&
                            TransactionData?.tickets?.[1]?.ticketId}
                        </span>
                      </div>
                      <div className="w-5/12">
                        <p className="text-gray-600 font-light">Bus Number</p>
                        <span>
                          {TransactionData?.tickets &&
                            TransactionData?.tickets &&
                            TransactionData?.tickets?.[1]?.busIdentifier}
                        </span>
                      </div>
                      <div className="w-5/12">
                        <p className="text-gray-600 font-light">
                          Departure Location
                        </p>
                        <span>
                          {TransactionData?.tickets &&
                            TransactionData.arrivalCity?.name}
                        </span>
                      </div>
                      <div className="w-5/12">
                        <p className="text-gray-600 font-light">
                          Arrival Location
                        </p>
                        <span>
                          {TransactionData?.tickets &&
                            TransactionData?.tickets &&
                            TransactionData.sourceCity?.name}
                        </span>
                      </div>
                      <div className="w-5/12">
                        <p className="text-gray-600 font-light">
                          Departure Time
                        </p>
                        {TransactionData?.tickets &&
                          TransactionData?.tickets?.[1]?.departureTime.toLocaleTimeString(
                            "en-US",
                            {
                              timeZone: "Africa/Harare",
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                      </div>
                      <div className="w-5/12">
                        <p className="text-gray-600 font-light">Arrival Time</p>
                        {TransactionData?.tickets &&
                          TransactionData?.tickets?.[1]?.arrivalTime.toLocaleTimeString(
                            "en-US",
                            {
                              timeZone: "Africa/Harare",
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                      </div>
                    </div>
                  </div>
                  {/* Ticket Price Details */}
                  <div className="bg-white rounded-lg px-8 py-4 flex flex-col items-start justify-center gap-4 border-2">
                    <p className="text-black font-semibold text-md">
                      Ticket Price Detail
                    </p>
                    <div className="w-full flex flex-wrap justify-between gap-2">
                      <div className="w-5/12">
                        <p className="text-gray-600 font-light">
                          Payment Method
                        </p>
                        <span>
                          {TransactionData?.transactions.paymentMethod}
                        </span>
                      </div>
                      <div className="w-5/12">
                        <p className="text-gray-600 font-light">
                          Bus Company Amount
                        </p>
                        <span>
                          $
                          {busCompanyAmountTwo &&
                            busCompanyAmountTwo.toFixed(1)}
                        </span>
                      </div>
                      <div className="w-5/12">
                        <p className="text-gray-600 font-light">
                          Carma Commission
                        </p>
                        <span>
                          {TransactionData?.tickets &&
                            TransactionData?.tickets?.[0].priceDetails
                              .carmaCommissionPercentage}
                          %
                        </span>
                      </div>
                      <div className="w-5/12">
                        <p className="text-gray-600 font-light">Carma Amount</p>
                        <span>${carmaProfitTwo.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  {/* Kuppi Price */}
                  <div className="bg-white rounded-lg px-8 py-4 flex flex-col items-start justify-center gap-4 border-2">
                    <p className="text-black font-semibold text-md">
                      Kupi Price Detail
                    </p>
                    <div className="w-full flex flex-wrap justify-between gap-2">
                      <div className="w-5/12">
                        <p className="text-gray-600 font-light">Kupi Markup</p>
                        <span>
                          {TransactionData?.tickets &&
                            TransactionData?.tickets?.[1]?.priceDetails
                              .kupiCommissionPercentage}
                          %
                        </span>
                      </div>
                      <div className="w-5/12">
                        <p className="text-gray-600 font-light">
                          Kupi Commission
                        </p>
                        <span>
                          {TransactionData?.tickets &&
                            TransactionData?.tickets?.[1]?.priceDetails
                              .kupiMarkupPercentage}
                          %
                        </span>
                      </div>
                      <div className="w-5/12">
                        <p className="text-gray-600 font-light">
                          Sales Commission
                        </p>
                        <span>{0}%</span>
                      </div>
                      <div className="w-5/12">
                        <p className="text-gray-600 font-light">Kupi Amount</p>
                        {TransactionData?.tickets &&
                        TransactionData?.tickets?.[1]?.priceDetails.kupiMarkup >
                          0 ? (
                          <span>
                            (${kupiProfitTwo.toFixed(1)} + $
                            {kupiMarkupiTwo.toFixed(1)}) = $
                            {(kupiProfitTwo + kupiMarkupiTwo).toFixed(1)}
                          </span>
                        ) : (
                          <span>
                            $
                            {TransactionData?.tickets &&
                              TransactionData?.tickets?.[1]?.priceDetails.kupiProfit.toFixed(
                                1
                              )}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full hrGap bg-gray-500"></div>
                    <div className="flex w-full flex-row justify-between">
                      <p className="text-gray-600 font-light">Price</p>
                      <p className="text-black font-semibold text-md">
                        $
                        {TransactionData?.tickets &&
                          TransactionData?.tickets?.[1]?.priceDetails.totalPrice.toFixed(
                            1
                          )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>
          {/* total amount */}
          <div className="relative bg-white rounded-lg px-8 py-4 flex flex-row items-start justify-between gap-4 border-2">
            <p className="text-gray-600 font-light">Total Price</p>
            <p className="text-black font-semibold text-md">
              ${TransactionData?.transactions.totalAmount}
            </p>
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

export default TransactionDetailDialgue;
