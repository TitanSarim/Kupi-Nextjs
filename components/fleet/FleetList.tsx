"use client";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import AddDiscount from "./AddBus";
import { PaginationData } from "@/types/fleet";
import { Busses } from "@prisma/client";
import FleetTable from "./FleetTable";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useSession } from "next-auth/react";
import { RolesEnum } from "@/types/auth";
import { OperatorsType } from "@/types/transactions";

interface fleetOptions {
  busses?: Busses[];
  paginationData?: PaginationData;
  operators: OperatorsType[];
}

const FleetList: React.FC<fleetOptions> = ({
  busses,
  paginationData,
  operators,
}) => {
  const { data } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busOperator, setBusOperator] = useState("");
  const [busOperatorId, setBusOperatorId] = useState("");
  const [operatorOpen, setoperatorOpen] = React.useState(false);
  const [busNumber, setBusNumber] = useState("");
  const [busRegistration, setBusRegistration] = useState("");
  const [busClass, setBusClass] = useState("");

  const router = useRouter();
  const params = new URLSearchParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    const operator = searchParams.get("operator");
    if (operator) {
      setBusOperatorId(operator);
    }
  }, [searchParams]);

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
    if (busOperator) params.set("operator", busOperatorId);
    if (busNumber) params.set("busID", busNumber);
    if (busRegistration) params.set("registration", busRegistration);
    if (busClass !== "Clear") {
      params.set("busClass", busClass);
    } else {
      setBusClass("");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const updateSearchTypeParams = () => {
    if (busNumber) params.set("busID", busNumber);
    if (busRegistration) params.set("registration", busRegistration);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleShowDetail = () => {
    setDialogOpen(true);
  };

  useEffect(() => {
    updateSearchParams();
    updateSearchTypeParams();
  }, [
    busOperator,
    busClass,
    busNumber,
    busRegistration,
    busOperator,
    busOperatorId,
  ]);

  return (
    <div className="w-full mt-10 h-fit flex items-center justify-center">
      <div className="h-fit w-full bg-white shadow-sm rounded-md px-8 py-8 mb-5">
        <div className="w-full flex flex-row items-start justify-between">
          <p className="text-lg text-black font-semibold">Fleet List</p>
          <div className="flex flex-row gap-5">
            {data &&
              (data.role === RolesEnum.SuperAdmin ||
                data.role === RolesEnum.BusCompanyAdmin) && (
                <button
                  className="bg-kupi-yellow bg-kupi-yellow px-4 py-2 rounded-lg"
                  onClick={() => {
                    handleShowDetail();
                  }}
                >
                  Add Bus
                </button>
              )}
          </div>
        </div>

        {/* Filters */}
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

        <div className="w-full flex flex-row justify-between mt-6 gap-4">
          <div className="w-3/12">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Search Bus Number
            </p>
            <Input
              type="text"
              value={busNumber}
              onChange={(e) => setBusNumber(e.target.value)}
              placeholder="Search by bus number"
              className="h-12 rounded-lg text-gray-500 border-gray-700"
            />
          </div>
          <div className="w-3/12">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Search Bus Registration
            </p>
            <Input
              type="text"
              value={busRegistration}
              onChange={(e) => setBusRegistration(e.target.value)}
              placeholder="Search by bus registration"
              className="h-12 rounded-lg text-gray-500 border-gray-700"
            />
          </div>
          <div className="w-3/12">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Search Bus Class
            </p>
            <Select value={busClass} onValueChange={setBusClass}>
              <SelectTrigger className="w-full h-12 rounded-lg text-gray-500 border-gray-700 ">
                <SelectValue placeholder="Search by bus class" />
              </SelectTrigger>
              <SelectContent className="select-dropdown z-50">
                <SelectItem value="Clear">Clear</SelectItem>
                <SelectItem value="LUXURY">Luxury</SelectItem>
                <SelectItem value="STANDARD">Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* table */}
        {!busses || !paginationData ? (
          ""
        ) : (
          <FleetTable
            busses={busses}
            paginationData={paginationData}
            operators={operators}
            role={data?.role}
          />
        )}

        <div className="w-full">
          <AddDiscount
            open={dialogOpen}
            onClose={handleCloseDialog}
            operators={operators}
            role={data?.role}
          />
        </div>
      </div>
    </div>
  );
};

export default FleetList;
