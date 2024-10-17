import Image from "next/image";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TicketStatusCard = () => {
  return (
    <div className="w-full flex flex-row mt-6 justify-between">
      <div className="w-full bg-white flex rounded-lg flex-row justify-between shadow-sm px-2 py-5">
        <div className="w-auto flex flex-col gap-8 px-5">
          <p className="text-lg text-black flex flex-row gap-2 font-semibold">
            Tickets Initiate{" "}
            <span className="mt-1">
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
          <div className="flex flex-row justify-between  items-end">
            <p className="text-xl flex flex-row items-end gap-1 text-black  font-semibold">
              500
              <span className="text-sm text-lime-600 font-medium mb-1">
                {" "}
                Initiate
              </span>
            </p>
            <Image
              src="/img/dashboard/tickets.svg"
              alt="ticket"
              width={30}
              height={30}
            />
          </div>
        </div>
        <div className="h-full dashboard-tiket-divider"></div>
        <div className="w-auto flex flex-col gap-8 px-5">
          <p className="text-lg text-black  flex flex-row gap-2 font-semibold">
            Tickets Reserved{" "}
            <span className="mt-1">
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
          <div className="flex flex-row justify-between  items-end">
            <p className="text-xl flex flex-row items-end gap-1 text-black  font-semibold">
              500
              <span className="text-sm text-yellow-500 font-medium mb-1">
                {" "}
                Reserved
              </span>
            </p>
            <Image
              src="/img/dashboard/tickets.svg"
              alt="ticket"
              width={30}
              height={30}
            />
          </div>
        </div>
        <div className="h-full dashboard-tiket-divider"></div>
        <div className="w-auto flex flex-col gap-8 px-5">
          <p className="text-lg text-black  flex flex-row gap-2 font-semibold">
            Tickets Unconverted
            <span className="mt-1">
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
          <div className="flex flex-row justify-between  items-end">
            <p className="text-xl flex flex-row items-end gap-1 text-black  font-semibold">
              500
              <span className="text-sm text-black font-medium mb-1">
                Unconverted
              </span>
            </p>
            <Image
              src="/img/dashboard/tickets.svg"
              alt="ticket"
              width={30}
              height={30}
            />
          </div>
        </div>
        <div className="h-full dashboard-tiket-divider"></div>
        <div className="w-auto flex flex-col gap-8 px-5">
          <p className="text-lg text-black  flex flex-row gap-2 font-semibold">
            Tickets Unsold
            <span className="mt-1">
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
          <div className="flex flex-row justify-between  items-end">
            <p className="text-xl flex flex-row items-end gap-1 text-black  font-semibold">
              500
              <span className="text-sm text-red-600 font-medium mb-1">
                {" "}
                Unsold
              </span>
            </p>
            <Image
              src="/img/dashboard/tickets.svg"
              alt="ticket"
              width={30}
              height={30}
            />
          </div>
        </div>
        <div className="h-full dashboard-tiket-divider"></div>
        <div className="w-auto flex flex-col gap-8 px-5">
          <p className="text-lg text-black  flex flex-row gap-2 font-semibold">
            Tickets Sold{" "}
            <span className="mt-1">
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
          <div className="flex flex-row justify-between  items-end">
            <p className="text-xl flex flex-row items-end gap-1 text-black  font-semibold">
              500
              <span className="text-sm text-green-600 font-medium mb-1">
                {" "}
                Sold
              </span>
            </p>
            <Image
              src="/img/dashboard/tickets.svg"
              alt="ticket"
              width={30}
              height={30}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketStatusCard;
