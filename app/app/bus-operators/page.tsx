import { getAllOperators } from "@/actions/operators.action";
import { auth } from "@/auth";
import Loading from "@/components/Loading";
import NavBar from "@/components/NavBar";
import OperatorsList from "@/components/operators/OperatorsList";
import SideBar from "@/components/SideBar";
import { OperatorsQuery } from "@/types/operator";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

const BusOperators = async ({
  searchParams,
}: {
  searchParams: OperatorsQuery["searchParams"];
}) => {
  const operators = await getAllOperators(searchParams);

  if (!operators) {
    return null;
  }

  return (
    <div className="bg-page-backgound flex items-start justify-center h-screen mb-12 w-full">
      <div className="w-11/12">
        <OperatorsList
          operators={operators.operators}
          paginationData={operators.paginationData}
        />
      </div>
    </div>
  );
};

export default BusOperators;
