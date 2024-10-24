"use client";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TicketTable from "./TicketTable";
import { useRouter } from "next/navigation";
import { TicketsReturn } from "@/types/ticket";
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
import { operatorSettingsReturn } from "@/types/settings";
import { useSession } from "next-auth/react";
import { RolesEnum } from "@/types/auth";

const TicketList: React.FC<TicketsReturn> = ({
  ticketData,
  paginationData,
  cities,
  operators,
}) => {
  const [busOperator, setBusOperator] = useState("");
  const [busOperatorId, setBusOperatorId] = useState("");
  const [source, setSource] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [arrivalCity, setArrivalCity] = useState("");
  const [onlyPending, setOnlyPending] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [operatorOpen, setoperatorOpen] = React.useState(false);
  const [openArrival, setOpenArrival] = React.useState(false);
  const router = useRouter();
  const params = new URLSearchParams();
  const { data } = useSession();

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

  const updateSearchParams = () => {
    if (busOperator !== "" && busOperator !== "Clear") {
      params.set("operator", busOperatorId);
    } else if (busOperator.length === 0 || busOperator === "Clear") {
      setBusOperator("");
      setBusOperatorId("");
    }
    if (source !== "Clear") {
      params.set("source", source);
    } else {
      setSource("");
    }
    if (destinationCity !== "clear") {
      params.set("destinationCity", destinationCity);
    } else {
      setDestinationCity("");
    }
    if (arrivalCity !== "clear") {
      params.set("arrivalCity", arrivalCity);
    } else {
      setArrivalCity("");
    }

    if (onlyPending) params.set("onlyPending", String(onlyPending));

    router.push(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    updateSearchParams();
  }, [busOperator, source, destinationCity, arrivalCity, onlyPending]);

  return (
    <div className="w-full mt-10 flex items-center justify-center">
      <div className="h-fit w-full bg-white shadow-sm rounded-md px-8 py-8 mb-5">
        <div className="w-full flex flex-row items-start justify-between">
          <p className="text-lg text-black font-semibold">Tickets List</p>
          <div className="flex flex-row gap-10 border-2 border-gray-400 px-4 py-3 rounded-lg box-bg">
            <p className="darkGray-text font-normal text-sm">Pending Tickets</p>
            <label className="switch">
              <input
                type="checkbox"
                checked={onlyPending}
                onChange={() => setOnlyPending((prev) => !prev)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {(data?.role === RolesEnum.SuperAdmin ||
          data?.role === RolesEnum.KupiUser) && (
          <div className="w-full">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Bus Operator
            </p>
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
        )}

        <div className="w-full flex flex-wrap justify-between mt-6">
          <div className="w-3/12">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Search Source
            </p>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="w-full h-12 rounded-lg text-gray-500 border-gray-700 ">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent className="select-dropdown z-50">
                <SelectItem value="Clear">Clear</SelectItem>
                <SelectItem value="Carma">Carma</SelectItem>
                <SelectItem value="Kupi">Kupi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-3/12">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Search Destination City
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
                              currentValue === destinationCity
                                ? ""
                                : currentValue
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
        </div>

        <TicketTable
          ticketData={ticketData}
          paginationData={paginationData}
          cities={cities}
          operators={operators}
        />
      </div>
    </div>
  );
};

export default TicketList;
