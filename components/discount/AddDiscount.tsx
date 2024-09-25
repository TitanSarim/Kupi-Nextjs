"use client";
import Image from "next/image";
import React, { useState } from "react";
import { Input } from "../ui/input";
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
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Cities, Operators } from "@prisma/client";
import { createDiscount } from "@/actions/discount.actions";
import { OperatorsType } from "@/types/transactions";
import { sources } from "@/types/discount";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  cities: Cities[];
  operators: OperatorsType[];
}

const AddDiscount: React.FC<DialogProps> = ({
  cities,
  operators,
  open,
  onClose,
}) => {
  const [discountname, setDiscountname] = useState<string>("");
  const [percentage, setPercentage] = useState<number>(0);
  const [source, setSource] = useState<string[]>([]);
  const [count, setCount] = useState<number>(0);
  const [date, setDate] = useState<string>("");
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [destinationCity, setDestinationCity] = useState<string>("");
  const [destinationCityId, setDestinationCityId] = useState<string>("");
  const [arrivalCity, setArrivalCity] = useState<string>("");
  const [arrivalCityId, setArrivalCityId] = useState<string>("");
  const [openDestination, setOpenDestination] = useState(false);
  const [openArrival, setOpenArrival] = useState(false);
  const [openOperator, setOpenOperator] = useState(false);
  const [openSource, setOpenSource] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePercentageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    const numericValue = value.replace(/[^0-9.]/g, "");
    setPercentage(Number(numericValue));
  };

  const handleClose = () => {
    onClose();
  };

  const handleOperatorSelect = (operatorId: string) => {
    setSelectedOperators((prev) => {
      if (prev.includes(operatorId)) {
        return prev.filter((id) => id !== operatorId);
      } else {
        return [...prev, operatorId];
      }
    });
  };

  const handleSourceChange = (value: string) => {
    setSource((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      discountname,
      percentage,
      source,
      count,
      date,
      selectedOperators,
      destinationCityId,
      arrivalCityId,
    };
    setLoading(true);
    try {
      await createDiscount(formData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setDiscountname("");
      setPercentage(0);
      setSource([]);
      setCount(0);
      setDate("");
      setDestinationCityId("");
      setArrivalCityId("");
      setSelectedOperators([]);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center discount-dialguebox-container justify-center z-50 duration-700 ease-out">
      <div className="lightGray py-6 px-8 rounded-lg shadow-lg discount-dialguebox flex flex-wrap justify-between gap-2 duration-700 ease-out">
        <div className="w-full flex flex-row justify-between">
          <p className="text-lg text-black font-semibold">Add Discount</p>
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

        {/* form */}
        <form className="mt-5 w-full flex flex-col" onSubmit={handleSubmit}>
          <div className="w-full mb-3">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Discount Name
            </p>
            <Input
              type="text"
              placeholder="Enter name"
              value={discountname}
              onChange={(e) => setDiscountname(e.target.value)}
              required
              className="h-12 rounded-lg text-gray-500 border-gray-300 bg-white"
            />
          </div>
          <div className="w-full mb-3">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Discount Percentage
            </p>
            <Input
              type="text"
              placeholder="%"
              value={percentage > 0 ? `${percentage.toFixed(0)}%` : ""}
              onChange={handlePercentageChange}
              required
              className="h-12 rounded-lg text-gray-500 border-gray-300 bg-white"
            />
          </div>
          <div className="w-full mb-3">
            <p className="mb-1 darkGray-text font-normal text-sm">Operator</p>
            <Popover open={openOperator} onOpenChange={setOpenOperator}>
              <PopoverTrigger
                asChild
                className="w-full h-12 rounded-lg text-gray-500 border-gray-300"
              >
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openOperator}
                  className="w-full justify-between outline-none"
                >
                  {selectedOperators.length > 0
                    ? selectedOperators
                        .map((id) => operators.find((op) => op.id === id)?.name)
                        .join(", ")
                    : "Select operator"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 select-discount-dropdown">
                <Command>
                  <CommandInput placeholder="Search operator..." />
                  <CommandList className="w-full">
                    <CommandEmpty>No operator found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        key="clear"
                        value=""
                        onSelect={() => {
                          setSelectedOperators([]); // Clear all selections
                          setOpenOperator(false);
                        }}
                        className="cursor-pointer w-full"
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            selectedOperators.length === 0
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                        Clear
                      </CommandItem>
                      {operators &&
                        operators.map((data) => (
                          <CommandItem
                            key={data.id}
                            value={data.name}
                            onSelect={() => {
                              handleOperatorSelect(data.id); // Use the handleOperatorSelect function
                            }}
                            className="cursor-pointer w-full"
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedOperators.includes(data.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            {data.name}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          {/* break */}
          <div className="hrGap w-full my-2 bg-gray-300"></div>
          {/* citites */}
          <div className="w-full mb-3">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Search Departure City
            </p>
            <Popover open={openDestination} onOpenChange={setOpenDestination}>
              <PopoverTrigger
                asChild
                className="w-full  h-12 rounded-lg  text-gray-500 border-gray-300"
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
              <PopoverContent className="w-full p-0 select-discount-dropdown">
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
                          setDestinationCityId("");
                          setOpenDestination(false);
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
                      {cities &&
                        cities?.map((city) => (
                          <CommandItem
                            key={city.id}
                            value={city.name}
                            onSelect={(currentValue) => {
                              setDestinationCity(
                                currentValue === destinationCity
                                  ? ""
                                  : currentValue
                              );
                              setDestinationCityId(city.id);
                              setOpenDestination(false);
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
          <div className="w-full mb-3">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Search Arrival City
            </p>
            <Popover open={openArrival} onOpenChange={setOpenArrival}>
              <PopoverTrigger
                asChild
                className="w-full  h-12 rounded-lg  text-gray-500 border-gray-300"
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
              <PopoverContent className="w-full p-0 select-discount-dropdown">
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
                      {cities &&
                        cities.map((city) => (
                          <CommandItem
                            key={city.id}
                            value={city.name}
                            onSelect={(currentValue) => {
                              setArrivalCity(
                                currentValue === arrivalCity ? "" : currentValue
                              );
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
          {/* citites */}
          <div className="w-full mb-3">
            <p className="mb-1 darkGray-text font-normal text-sm">Source</p>
            <Popover open={openSource} onOpenChange={setOpenSource}>
              <PopoverTrigger
                asChild
                className="w-full h-12 rounded-lg text-gray-500 border-gray-300"
              >
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openSource}
                  className="w-full justify-between outline-none"
                >
                  {source.length > 0 ? source.join(", ") : "Select source..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 select-discount-dropdown">
                <Command>
                  {/* <CommandInput placeholder="Search city..." /> */}
                  <CommandList className="w-full">
                    <CommandEmpty>No city found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        key="clear"
                        value=""
                        onSelect={() => {
                          setSource([]);
                          setOpenSource(false);
                        }}
                        className="cursor-pointer w-full"
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            source.length === 0 ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        Clear
                      </CommandItem>
                      {sources &&
                        sources.map((data: string) => (
                          <CommandItem
                            key={data}
                            value={data}
                            onSelect={() => {
                              handleSourceChange(data);
                            }}
                            className="cursor-pointer w-full"
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                source.includes(data)
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            {data}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="w-full mb-3">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Max Use Count
            </p>
            <Input
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              min={0}
              max={99}
              placeholder="Enter source"
              className="h-12 rounded-lg text-gray-500 border-gray-300 bg-white"
            />
          </div>
          <div className="w-full mb-3">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Expiry Date
            </p>
            <Input
              type="date"
              value={date || ""}
              onChange={(e) => setDate(e.target.value)}
              placeholder="DD/MM/YYYY"
              required
              className="h-12 w-full flex flex-row justify-between rounded-lg text-gray-500 border-gray-300 bg-white"
            />
          </div>
          {/* buttons */}
          <div className="w-full mt-5 flex flex-row items-center justify-end gap-4">
            <button
              type="reset"
              onClick={handleClose}
              className="border-gray-600 py-2 px-8 bg-transparent border-2 rounded-lg text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${
                loading ? "opacity-50" : ""
              } py-3 px-10 bg-kupi-yellow rounded-lg font-semibold`}
              disabled={loading}
            >
              {loading ? "Loading" : "Add Discount"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDiscount;
