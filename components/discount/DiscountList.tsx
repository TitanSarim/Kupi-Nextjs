"use client";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AddDiscount from "./AddDiscount";
import DiscountsTable from "./DiscountsTable";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Cities, Operators } from "@prisma/client";
import { DiscountReturn } from "@/types/discount";

const DiscountList: React.FC<DiscountReturn> = ({
  discounts,
  cities,
  operators,
  paginationData,
}) => {
  const [allCities, setAllCities] = useState<Cities[]>(cities);
  const [name, setName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [onlyExpiring, setOnlyExpiring] = useState(false);
  const [busOperator, setBusOperator] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [arrivalCity, setArrivalCity] = useState("");
  const [arrivalCityId, setArrivalCityId] = useState("");
  const [open, setOpen] = React.useState(false);
  const [openArrival, setOpenArrival] = React.useState(false);

  const router = useRouter();
  const params = new URLSearchParams();

  const updateSearchParams = () => {
    if (busOperator) params.set("carrier", busOperator);
    if (name) {
      params.set("name", name);
    }
    if (destinationCity !== "clear") {
      params.set("destinationCity", selectedCityId);
    } else {
      setDestinationCity("");
      setSelectedCityId("");
    }
    if (arrivalCity !== "clear") {
      params.set("arrivalCity", arrivalCityId);
    } else {
      setArrivalCity("");
      setArrivalCityId("");
    }
    if (onlyExpiring) params.set("onlyExpiring", String(onlyExpiring));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleShowDetail = () => {
    setDialogOpen(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      updateSearchParams();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [busOperator, name, destinationCity, arrivalCity, onlyExpiring]);

  return (
    <div className="w-full mt-10 h-fit flex items-center justify-center">
      <div className="h-fit w-full bg-white shadow-sm rounded-md px-8 py-8 mb-5">
        <div className="w-full flex flex-row items-start justify-between">
          <p className="text-lg text-black font-semibold">Discount List</p>
          <div className="flex flex-row gap-5">
            <div className="flex flex-row gap-10 border-2 border-gray-400 px-4 py-3 rounded-lg box-bg">
              <p className="darkGray-text font-normal text-sm">
                Expired Discounts
              </p>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={onlyExpiring}
                  onChange={() => setOnlyExpiring((prev) => !prev)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <button
              className="bg-kupi-yellow bg-kupi-yellow px-4 py-2 rounded-lg"
              onClick={() => {
                handleShowDetail();
              }}
            >
              Add Discount
            </button>
          </div>
        </div>

        {/* Filters */}
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

        <div className="w-full flex flex-row justify-between mt-6 gap-4">
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
                          setSelectedCityId("");
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
                      {allCities &&
                        allCities?.map((city) => (
                          <CommandItem
                            key={city.id}
                            value={city.name}
                            onSelect={() => {
                              setDestinationCity(city.name);
                              setSelectedCityId(city.id);
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
                          setArrivalCityId("");
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
                      {allCities &&
                        allCities.map((city) => (
                          <CommandItem
                            key={city.id}
                            value={city.name}
                            onSelect={() => {
                              setArrivalCity(city.name);
                              setArrivalCityId(city.id);
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
            <p className="mb-1 darkGray-text font-normal text-sm">
              Search Discount Name
            </p>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Search by name"
              className="h-12 rounded-lg text-gray-500 border-gray-700"
            />
          </div>
        </div>

        {/* table */}
        <DiscountsTable
          discounts={discounts}
          cities={cities}
          operators={operators}
          paginationData={paginationData}
        />

        <div className="w-full">
          <AddDiscount
            cities={allCities}
            operators={operators}
            open={dialogOpen}
            onClose={handleCloseDialog}
          />
        </div>
      </div>
    </div>
  );
};

export default DiscountList;
