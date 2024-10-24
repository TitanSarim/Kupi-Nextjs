"use client";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";
import { ManualTransactionReturn } from "@/types/transactions";
import Datepicker from "react-tailwindcss-datepicker";
import ManualTransactionTable from "./ManualTransactionTable";
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

const ManualTransactionList: React.FC<ManualTransactionReturn> = ({
  transactionData,
  paginationData,
  operators,
}) => {
  const NEXT_MONTH = new Date();
  NEXT_MONTH.setMonth(NEXT_MONTH.getMonth() + 1);

  const [busOperator, setBusOperator] = useState("");
  const [busOperatorId, setBusOperatorId] = useState("");
  const [operatorOpen, setoperatorOpen] = React.useState(false);
  const [period, setPeriod] = useState("");
  const [id, setId] = useState("");
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

  const updateSearchParams = () => {
    if (id) params.set("paymentRef", id);
    if (busOperator !== "" && busOperator !== "Clear") {
      params.set("operator", busOperatorId);
    } else if (busOperator.length === 0 || busOperator === "Clear") {
      setBusOperator("");
      setBusOperatorId("");
    }
    if (period) params.set("period", period);
    if (value.startDate)
      params.set("startDate", value.startDate.getTime().toString());
    if (value.endDate)
      params.set("endDate", value.endDate.getTime().toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const updateSearchDateParams = () => {
    if (value.startDate)
      params.set("startDate", value.startDate.getTime().toString());
    if (value.endDate)
      params.set("endDate", value.endDate.getTime().toString());
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
    } else if (newValue.startDate && newValue.endDate) {
      setValue({
        startDate: new Date(newValue.startDate),
        endDate: new Date(newValue.endDate),
      });
    }
  };

  useEffect(() => {
    updateSearchParams();
  }, [busOperator, id, period]);

  useEffect(() => {
    updateSearchDateParams();
  }, [value.endDate, value.startDate]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
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

      <div className="w-full flex flex-wrap justify-between mt-6">
        <div className="w-3/12">
          <p className="mb-1 darkGray-text font-normal text-sm">
            Search Transaction ID
          </p>
          <Input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Search by ID"
            className="h-12 rounded-lg text-gray-500 border-gray-700"
          />
        </div>
        <div className="w-3/12">
          <p className="mb-1 darkGray-text font-normal text-sm">
            Search Payment Period
          </p>
          <Input
            type="text"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="Search by period"
            className="h-12 rounded-lg text-gray-500 border-gray-700"
          />
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

      <ManualTransactionTable
        transactionData={transactionData}
        paginationData={paginationData}
        operators={operators}
      />
    </div>
  );
};

export default ManualTransactionList;
