import React from "react";
import AddRoute from "@/components/route/AddRoute";
import { getAllMatchedCity, getAllCountries } from "@/actions/search.action";
import { Cities, Countries } from "@prisma/client";


const AddRoutePage = async () => {
  // Fetch cities data
  const cities: Cities[] | null = await getAllMatchedCity();
  const countries: Countries[] | null = await getAllCountries();

  // Check if cities data is available
  if (!cities) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p>No cities data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-page-backgound flex items-start justify-center h-full mb-12 w-full">
      <div className="w-11/12">
        <AddRoute cities={cities} countries = {countries} />
      </div>
    </div>
  );
};

export default AddRoutePage;
