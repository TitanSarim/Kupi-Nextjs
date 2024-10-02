"use client";
import React, { useEffect, useState } from "react";
import OperatorsTable from "./OperatorsTable";
import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import InviteOperator from "./InviteOperator";
import { OperatorsData } from "@/types/operator";
import { useRouter } from "next/navigation";

const OperatorsList: React.FC<OperatorsData> = ({
  operators,
  paginationData,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setSatus] = useState("");

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleShowDetail = () => {
    setDialogOpen(true);
  };

  const router = useRouter();
  const params = new URLSearchParams();

  const updateSearchParams = () => {
    if (name) params.set("name", name);
    if (email) params.set("email", email);
    if (status !== "clear") {
      params.set("status", status);
    } else {
      setSatus("");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      updateSearchParams();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [name, email, status]);

  return (
    <div className="w-full flex flex-col items-center justify-start">
      <div className="h-fit w-full bg-white shadow-sm rounded-md px-8 py-8 mb-8 mt-10">
        <div className="w-full flex flex-row items-start justify-between">
          <p className="text-lg text-black font-semibold">Bus Operators List</p>
          <button
            className="bg-kupi-yellow px-4 py-2 rounded-lg"
            onClick={() => {
              handleShowDetail();
            }}
          >
            Invite Bus Operator
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-between items-start mt-6 w-full">
          <div className="w-3/12">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Search Operator Name
            </p>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Search by name"
              className="h-12 rounded-lg text-gray-500 border-gray-700"
            />
          </div>
          <div className="w-3/12">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Search Operator Email
            </p>
            <Input
              type="text"
              placeholder="Search by email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-lg text-gray-500 border-gray-700"
            />
          </div>
          <div className="w-3/12">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Search Status
            </p>
            <Select value={status} onValueChange={setSatus}>
              <SelectTrigger className="w-full h-12 rounded-lg text-gray-500 border-gray-700 ">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="select-dropdown z-50">
                <SelectItem value="clear">Clear</SelectItem>
                <SelectItem value="INVITED">Invited</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="REGISTERED">Registered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* table */}
        <OperatorsTable operators={operators} paginationData={paginationData} />

        <div className="w-full">
          <InviteOperator open={dialogOpen} onClose={handleCloseDialog} />
        </div>
      </div>
    </div>
  );
};

export default OperatorsList;
