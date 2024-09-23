"use client";
import React, { useState } from "react";
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

const OperatorsList = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleShowDetail = () => {
    setDialogOpen(true);
  };

  return (
    <div className="w-full mt-10 h-fit flex items-center justify-center">
      <div className="h-fit w-full bg-white shadow-sm rounded-md px-8 py-8 mb-5">
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
              className="h-12 rounded-lg text-gray-500 border-gray-700"
            />
          </div>
          <div className="w-3/12">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Search Status
            </p>
            <Select>
              <SelectTrigger className="w-full h-12 rounded-lg text-gray-500 border-gray-700 ">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="select-dropdown z-50">
                <SelectItem value="clear">Clear</SelectItem>
                <SelectItem value="Invited">Invited</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Registered">Registered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* table */}
        <OperatorsTable />

        <div className="w-full">
          <InviteOperator open={dialogOpen} onClose={handleCloseDialog} />
        </div>
      </div>
    </div>
  );
};

export default OperatorsList;
