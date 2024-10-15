import React from "react";
import EditRoute from "@/components/route/EditRoute";
import { getAllMatchedCity,getAllCountries } from "@/actions/search.action";
import { getRouteById } from "@/actions/route.action";
import { Cities, Countries } from "@prisma/client";
import { notFound } from "next/navigation";

const EditRoutePage = async ({
  searchParams,
}: {
  searchParams: { id: string };
}) => {
  const routeId = searchParams?.id;

  // Fetch the cities data
  const cities: Cities[] | null = await getAllMatchedCity();
  const countries: Countries[] | null = await getAllCountries();
  

  // Fetch the route data based on routeId
  const route = routeId ? await getRouteById(routeId) : null;

  // Handle case if cities or route data are unavailable
  if (!cities || !countries || !route) {
    return <div>No data found</div>;
  }

  return (
    <div className="bg-page-backgound flex items-start justify-center h-full mb-12 w-full">
      <div className="w-11/12">
        <EditRoute route={route} cities={cities} countries={countries}  />
      </div>
    </div>
  );
};

export default EditRoutePage;
