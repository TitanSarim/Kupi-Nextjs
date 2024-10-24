"use client";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { TransactionReturnWithDateRange } from "@/types/transactions";
import Datepicker from "react-tailwindcss-datepicker";
import TransactionTable from "./TransactionTable";
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
import { Button } from "@/components/ui/button";

const TransactionList: React.FC<TransactionReturnWithDateRange> = ({
  transactionData,
  paginationData,
  cities,
  allTransactionData,
  operators,
}) => {
  const NEXT_MONTH = new Date();
  NEXT_MONTH.setMonth(NEXT_MONTH.getMonth() + 1);
  const [open, setOpen] = React.useState(false);
  const [busOperator, setBusOperator] = useState("");
  const [busOperatorId, setBusOperatorId] = useState("");
  const [operatorOpen, setoperatorOpen] = React.useState(false);
  const [ticketID, setTicketID] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [arrivalCity, setArrivalCity] = useState("");
  const [openArrival, setOpenArrival] = React.useState(false);
  const [value, setValue] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const router = useRouter();
  const params = new URLSearchParams();
  const handleOperatorChange = async (value: string, id: string) => {
    if (value === "" || value.length <= 0) {
      setBusOperator("");
      setBusOperatorId("");
    } else {
      setBusOperator(value);
      setBusOperatorId(id);
    }
    setoperatorOpen(false);
  };

  console.log("busOperator", busOperator);

  const updateSearchParams = () => {
    if (busOperator !== "" && busOperator !== "Clear") {
      params.set("operator", busOperatorId);
    } else if (busOperator.length <= 0 || busOperator === "Clear") {
      setBusOperator("");
      setBusOperatorId("");
    }
    if (ticketID) {
      params.set("ticketId", ticketID);
    } else {
      params.delete("ticketId");
    }
    if (destinationCity) {
      params.set("destinationCity", destinationCity);
    } else {
      params.delete("destinationCity");
    }
    if (arrivalCity) {
      params.set("arrivalCity", arrivalCity);
    } else {
      params.delete("arrivalCity");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

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

  const updateSearchDateParams = () => {
    if (value.startDate)
      params.set("startDate", value.startDate.getTime().toString());
    if (value.endDate)
      params.set("endDate", value.endDate.getTime().toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    updateSearchParams();
  }, [busOperator, ticketID, destinationCity, arrivalCity]);

  useEffect(() => {
    updateSearchDateParams();
  }, [value.endDate, value.startDate]);

  return (
    <div className="w-full flex flex-col items-center justify-start">
      <div className="w-full">
        <p className="mb-1 darkGray-text font-normal text-sm">Bus Operator</p>
        <Popover open={operatorOpen} onOpenChange={setoperatorOpen}>
          <PopoverTrigger
            asChild
            className="w-full  h-12 rounded-lg  text-gray-500 border-gray-700"
          >
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={operatorOpen}
              className="w-full justify-between outline-none"
            >
              {busOperator || "Select operator..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 select-dropdown_bus_operator_tickets text-left left-0">
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

      <div className="w-full mt-3">
        <p className="mb-1 darkGray-text font-normal text-sm">
          Search Ticket ID
        </p>
        <Input
          type="text"
          value={ticketID}
          onChange={(e) => setTicketID(e.target.value)}
          placeholder="Search by ID"
          className="h-12 rounded-lg text-gray-500 border-gray-700"
        />
      </div>

      <div className="w-full flex flex-wrap justify-between mt-6">
        <div className="w-3/12">
          <p className="mb-1 darkGray-text font-normal text-sm">
            Search Departure City
          </p>
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
                {destinationCity || "Select city..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 select-dropdown">
              <Command>
                <CommandInput placeholder="Search city..." />
                <CommandList className="w-full">
                  <CommandEmpty>No city found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      key="clear"
                      value=""
                      onSelect={() => {
                        setDestinationCity("");
                        setOpen(false);
                      }}
                      className="cursor-pointer w-full"
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          destinationCity === "" ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      Clear
                    </CommandItem>
                    {cities.map((city) => (
                      <CommandItem
                        key={city.id}
                        value={city.name}
                        onSelect={(currentValue) => {
                          setDestinationCity(
                            currentValue === destinationCity ? "" : currentValue
                          );
                          setOpen(false);
                        }}
                        className="cursor-pointer w-full"
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            city.name === destinationCity
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                        {city.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="w-3/12">
          <p className="mb-1 darkGray-text font-normal text-sm">
            Search Arrival City
          </p>
          <Popover open={openArrival} onOpenChange={setOpenArrival}>
            <PopoverTrigger
              asChild
              className="w-full  h-12 rounded-lg  text-gray-500 border-gray-700"
            >
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openArrival}
                className="w-full justify-between outline-none"
              >
                {arrivalCity || "Select city..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 select-dropdown">
              <Command>
                <CommandInput placeholder="Search city..." />
                <CommandList className="w-full">
                  <CommandEmpty>No city found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      key="clear"
                      value=""
                      onSelect={() => {
                        setArrivalCity("");
                        setOpenArrival(false);
                      }}
                      className="cursor-pointer w-full"
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          arrivalCity === "" ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      Clear
                    </CommandItem>
                    {cities.map((city) => (
                      <CommandItem
                        key={city.id}
                        value={city.name}
                        onSelect={(currentValue) => {
                          setArrivalCity(
                            currentValue === arrivalCity ? "" : currentValue
                          );
                          setOpenArrival(false);
                        }}
                        className="cursor-pointer w-full"
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            city.name === arrivalCity
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                        {city.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="w-3/12">
          <p className="mb-1 darkGray-text font-normal text-sm">Select Date</p>
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

      <TransactionTable
        transactionData={transactionData}
        paginationData={paginationData}
        cities={cities}
        dateRange={value}
        allTransactionData={allTransactionData}
        operators={operators}
      />
    </div>
  );
};

export default TransactionList;
