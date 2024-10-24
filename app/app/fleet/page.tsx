import { getAllFleet } from "@/actions/fleet.actions";
import FleetList from "@/components/fleet/FleetList";
import { getAllOperators } from "@/actions/search.action";
import { BusQuery } from "@/types/fleet";
import React, { Suspense } from "react";

const Fleet = async ({
  searchParams,
}: {
  searchParams: BusQuery["searchParams"];
}) => {
  const busses = await getAllFleet(searchParams);
  const operators = await getAllOperators();

  if (!operators) {
    return null;
  }

  return (
    <div className="bg-page-backgound flex items-start justify-center h-full mb-12 w-full">
      <div className="w-11/12">
        <FleetList
          busses={busses?.bussData}
          operators={operators}
          paginationData={busses?.paginationData}
        />
      </div>
    </div>
  );
};

export default Fleet;
