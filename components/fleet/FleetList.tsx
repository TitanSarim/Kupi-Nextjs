"use client";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";
import AddDiscount from "./AddBus";
import { Check, ChevronsUpDown } from "lucide-react";
import { BussesReturn, PaginationData } from "@/types/fleet";
import { Busses } from "@prisma/client";
import FleetTable from "./FleetTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface fleetOptions {
  busses?: Busses[];
  paginationData?: PaginationData;
}

const FleetList: React.FC<fleetOptions> = ({ busses, paginationData }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busOperator, setBusOperator] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [busRegistration, setBusRegistration] = useState("");
  const [busClass, setBusClass] = useState("");

  const router = useRouter();
  const params = new URLSearchParams();

  const updateSearchParams = () => {
    if (busOperator) params.set("carrier", busOperator);
    if (busNumber) params.set("busID", busNumber);
    if (busRegistration) params.set("registration", busRegistration);
    if (busClass !== "Clear") {
      params.set("busClass", busClass);
    } else {
      setBusClass("");
    }
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
  }, [busOperator, busNumber, busRegistration, busClass]);

  return (
    <div className="w-full mt-10 h-fit flex items-center justify-center">
      <div className="h-fit w-full bg-white shadow-sm rounded-md px-8 py-8 mb-5">
        <div className="w-full flex flex-row items-start justify-between">
          <p className="text-lg text-black font-semibold">Fleet List</p>
          <div className="flex flex-row gap-5">
            <button
              className="bg-kupi-yellow bg-kupi-yellow px-4 py-2 rounded-lg"
              onClick={() => {
                handleShowDetail();
              }}
            >
              Add Bus
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
                <SelectValue placeholder="Select source" />
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
          <FleetTable busses={busses} paginationData={paginationData} />
        )}

        <div className="w-full">
          <AddDiscount open={dialogOpen} onClose={handleCloseDialog} />
        </div>
      </div>
    </div>
  );
};

export default FleetList;
