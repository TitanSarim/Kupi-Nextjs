"use client";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";
import { ManualTransactionReturn } from "@/types/transactions";
import Datepicker from "react-tailwindcss-datepicker";
import ManualTransactionTable from "./ManualTransactionTable";

const ManualTransactionList: React.FC<ManualTransactionReturn> = ({
  transactionData,
  paginationData,
  operators,
}) => {
  const NEXT_MONTH = new Date();
  NEXT_MONTH.setMonth(NEXT_MONTH.getMonth() + 1);

  const [busOperator, setBusOperator] = useState("");
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

  const updateSearchParams = () => {
    if (id) params.set("id", id);
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
    const timer = setTimeout(() => {
      updateSearchParams();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [busOperator, id, period, value.endDate, value.startDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateSearchDateParams();
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [value.endDate, value.startDate]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-full">
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
