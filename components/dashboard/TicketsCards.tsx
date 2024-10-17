import Image from "next/image";
import React from "react";

const TicketsCards = () => {
  return (
    <div className="w-full flex flex-row mt-12 justify-between">
      <div className="bg-white flex flex-col shadow-sm rounded-md px-4 py-4 w-3/12">
        <p className="text-lg text-black font-semibold">Total Tickets Sold</p>
        <div className="w-full flex flex-row justify-between items-end">
          <span className="text-3xl text-black font-semibold">355</span>
          <Image
            src="/img/dashboard/bus.svg"
            alt="bus"
            width={120}
            height={120}
          />
        </div>
      </div>
      <div className="bg-white shadow-sm rounded-md px-4 py-4 w-3/12">
        <p className="text-lg text-black font-semibold">Total Income</p>
        <div className="w-full flex flex-row justify-between items-end">
          <span className="text-3xl flex flex-row items-end justify-end text-black font-semibold">
            <p className="text-base text-black mb-1">$</p>1500
          </span>
          <Image
            src="/img/dashboard/moneybag.svg"
            alt="bus"
            width={120}
            height={120}
          />
        </div>
      </div>
      <div className="bg-white shadow-sm rounded-md px-4 py-4 w-3/12">
        <p className="text-lg text-black font-semibold">Total Profit</p>
        <div className="w-full flex flex-row justify-between items-end">
          <span className="text-3xl text-black font-semibold flex flex-row items-end justify-end">
            <p className="text-base text-black mb-1">$</p>700
          </span>
          <Image
            src="/img/dashboard/moneybag.svg"
            alt="bus"
            width={120}
            height={120}
          />
        </div>
      </div>
    </div>
  );
};

export default TicketsCards;
