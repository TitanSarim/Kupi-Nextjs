import React from "react";
import AddRoute from "@/components/route/AddRoute";
import { getAllMatchedCity } from "@/actions/search.action";
import { Cities } from "@prisma/client";

const AddRoutePage = async () => {
  // Fetch cities data
  const cities: Cities[] | null = await getAllMatchedCity();

  // Check if cities data is available
  if (!cities) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p>No cities data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-page-background flex items-start justify-center h-full mb-12 w-full">
      <div className="w-11/12">
        <AddRoute cities={cities} />
      </div>
    </div>
  );
};

export default AddRoutePage;
