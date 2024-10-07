import React from "react";
import EditRoute from "@/components/route/EditRoute";
import { getAllMatchedCity } from "@/actions/search.action";
import { getRouteById } from "@/actions/route.action";
import { Cities } from "@prisma/client";
import { notFound } from "next/navigation";

const EditRoutePage = async ({
  searchParams,
}: {
  searchParams: { id: string };
}) => {
  const routeId = searchParams?.id;

  // Fetch the cities data
  const cities: Cities[] | null = await getAllMatchedCity();

  // Fetch the route data based on routeId
  const route = routeId ? await getRouteById(routeId) : null;

  // Handle case if cities or route data are unavailable
  if (!cities || !route) {
    return <div>No data found</div>;
  }

  return (
    <div className="bg-page-background flex items-start justify-center h-full mb-12 w-full">
      <div className="w-11/12">
        <EditRoute route={route} cities={cities} />
      </div>
    </div>
  );
};

export default EditRoutePage;
