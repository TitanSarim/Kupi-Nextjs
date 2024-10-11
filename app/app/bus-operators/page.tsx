import { getAllOperators } from "@/actions/operators.action";
import OperatorsList from "@/components/operators/OperatorsList";
import { OperatorsQuery } from "@/types/operator";
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
    <div className="bg-page-backgound flex items-start justify-center h-full w-full">
      <div className="w-11/12 h-full">
        <OperatorsList
          operators={operators.operators}
          paginationData={operators.paginationData}
        />
      </div>
    </div>
  );
};

export default BusOperators;
