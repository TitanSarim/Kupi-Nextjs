"use client";
import { OperatorsType } from "@/types/transactions";
import React, { useState } from "react";
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
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import Datepicker from "react-tailwindcss-datepicker";
import TicketsCards from "./TicketsCards";
import TicketStatusCard from "./TicketStatusCard";
import { CommonRoutes, IncomeChart } from "./Charts";

interface Dashboard {
  operators: OperatorsType[];
}

const DashboardLayout: React.FC<Dashboard> = ({ operators }) => {
  const [busOperator, setBusOperator] = useState<string>("");
  const [openOperator, setOpenOperator] = useState(false);
  const [value, setValue] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const selectedOperator = operators.find(
    (operator) => operator.id === busOperator
  );

  const handleValueChange = (
    newValue: { startDate: Date | null; endDate: Date | null } | null
  ) => {
    if (
      newValue === null ||
      (newValue.startDate === null && newValue.endDate === null)
    ) {
      setValue({
        startDate: null,
        endDate: null,
      });
    } else {
      setValue({
        startDate: newValue.startDate,
        endDate: newValue.endDate,
      });
    }
  };

  return (
    <div className="w-full h-full px-8 py-8 mb-5 flex flex-col">
      <div className="w-full flex flex-row items-start justify-between">
        <p className="w-4/12 text-lg text-black font-semibold">Dashboard</p>
        <div className="w-7/12 flex flex-row items-end justify-end gap-8">
          <div className="w-5/12">
            <Popover open={openOperator} onOpenChange={setOpenOperator}>
              <PopoverTrigger
                asChild
                className="w-full h-12 rounded-lg text-gray-500 border-gray-700"
              >
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openOperator}
                  className="w-full justify-between outline-none"
                >
                  {selectedOperator?.name || "Select Bus Operator"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 max-h-48 min-h-48 h-48 overflow-y-hidden p-0">
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
          </div>
          <div className="w-5/12">
            <p></p>
            <Datepicker
              primaryColor={"yellow"}
              useRange={false}
              value={value}
              onChange={handleValueChange}
              showShortcuts={false}
              inputClassName="h-12 w-full border text-gray-500 px-2 border-gray-700 rounded-lg datePlaceHolder"
              popoverDirection="down"
            />
          </div>
        </div>
      </div>

      {/* tickets card */}
      <TicketsCards />
      {/* Tickets status */}
      <TicketStatusCard />

      <div className="w-full bg-white shadow-sm rounded-md flex flex-col mt-6 justify-between">
        <div className="w-11/12 px-10 flex flex-col  py-10">
          <p className="text-2xl text-black font-semibold w-[90%] mb-6">
            Most Common Routes
          </p>
          <CommonRoutes />
        </div>
      </div>

      <div className="w-full bg-white shadow-sm rounded-md flex flex-col mt-6 justify-between">
        <div className="w-11/12 px-10 flex flex-col  py-10">
          <p className="text-2xl text-black font-semibold w-[90%] mb-6">
            Income Overview
          </p>
          <IncomeChart />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
