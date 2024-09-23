import { getAllOperators } from "@/actions/operators.action";
import { auth } from "@/auth";
import Loading from "@/components/Loading";
import NavBar from "@/components/NavBar";
import OperatorsList from "@/components/operators/OperatorsList";
import SideBar from "@/components/SideBar";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

const BusOperators = async () => {
  const operators = await getAllOperators();

  if (!operators) {
    return null;
  }

  return (
    <div className="bg-page-backgound flex items-start justify-center h-screen mb-12 w-full">
      <div className="w-11/12">
        <OperatorsList />
      </div>
    </div>
  );
};

export default BusOperators;
