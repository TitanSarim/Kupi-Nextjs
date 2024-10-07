"use client";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
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
import RouteTable from "./RouteTable";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Cities } from "@prisma/client";
import { PaginationDataType, RouteDataType } from "@/types/route";

interface RouteListProps {
  routeData: RouteDataType[];
  paginationData: PaginationDataType;
  cities: Cities[];
}

const RouteList: React.FC<RouteListProps> = ({
  routeData,
  paginationData,
  cities,
}) => {
  const [busOperator, setBusOperator] = useState("");
  const [departureCity, setDepartureCity] = useState("");
  const [arrivalCity, setArrivalCity] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [onlyPending, setOnlyPending] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [openArrival, setOpenArrival] = React.useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Update the search params and trigger filtering
  const updateSearchParams = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (busOperator) {
      params.set("carrier", busOperator);
    } else {
      params.delete("carrier");
    }
    if (departureCity) {
      params.set("departureCity", departureCity);
    } else {
      params.delete("departureCity");
    }
    if (arrivalCity) {
      params.set("arrivalCity", arrivalCity);
    } else {
      params.delete("arrivalCity");
    }
    if (busNumber) {
      params.set("busNumber", busNumber);
    } else {
      params.delete("busNumber");
    }
    if (onlyPending) {
      params.set("onlyPending", String(onlyPending));
    } else {
      params.delete("onlyPending");
    }

    // Reset pagination when filters change
    params.set("pageIndex", "0");

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Apply search filter changes with a slight delay
  useEffect(() => {
    const timer = setTimeout(() => {
      updateSearchParams();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [busOperator, departureCity, arrivalCity, busNumber, onlyPending]);

  // Edit Route page
  const handleEditRoute = (routeId: string) => {
    router.push(`/app/routes/editRoute?id=${routeId}`);
  };

  return (
    <div className="w-full mt-10 flex items-center justify-center">
      <div className="h-fit w-full bg-white shadow-sm rounded-md px-8 py-8 mb-5">
        <div className="w-full flex flex-row items-start justify-between">
          <p className="text-lg text-black font-semibold">Routes List</p>
          <div className="flex flex-row gap-5">
            <div className="flex flex-row gap-10 border-2 border-gray-400 px-4 py-3 rounded-lg box-bg">
              <p className="darkGray-text font-normal text-sm">
                Pending Routes
              </p>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={onlyPending}
                  onChange={() => setOnlyPending((prev) => !prev)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <button
              className="bg-kupi-yellow px-4 py-2 rounded-lg"
              onClick={() => {
                router.push("/app/routes/addRoute");
              }}
            >
              Add Route
            </button>
          </div>
        </div>

        {/* Bus Operator Input */}
        <div>
          <p className="mb-1 darkGray-text font-normal text-sm">Bus Operator</p>
          <Input
            type="text"
            value={busOperator}
            onChange={(e) => setBusOperator(e.target.value)}
            placeholder="Search bus operator"
            className="h-12 rounded-lg text-gray-500 border-gray-700"
          />
        </div>

        <div className="w-full flex flex-wrap justify-between mt-6">
          {/* Search Departure City */}
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
                  {departureCity || "Select city..."}
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
                          setDepartureCity("");
                          setOpen(false);
                        }}
                        className="cursor-pointer w-full"
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            departureCity === "" ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        Clear
                      </CommandItem>
                      {cities.map((city) => (
                        <CommandItem
                          key={city.id}
                          value={city.name}
                          onSelect={(currentValue) => {
                            setDepartureCity(
                              currentValue === departureCity ? "" : currentValue
                            );
                            setOpen(false);
                          }}
                          className="cursor-pointer w-full"
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              city.name === departureCity
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

          {/* Search Arrival City */}
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

          {/* Search Bus Number */}
          <div className="w-3/12">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Search Bus Number
            </p>
            <Input
              type="text"
              value={busNumber}
              onChange={(e) => setBusNumber(e.target.value)}
              placeholder="Enter bus number"
              className="h-12 rounded-lg text-gray-500 border-gray-700"
            />
          </div>
        </div>

        {/* Route Table */}
        <RouteTable
          routeData={routeData}
          paginationData={paginationData}
          onEditRoute={handleEditRoute}
        />
      </div>
    </div>
  );
};

export default RouteList;
