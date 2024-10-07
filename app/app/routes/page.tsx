import React from "react";
import { getAllRoutes } from "@/actions/route.action";
import { getAllMatchedCity } from "@/actions/search.action";
import RouteList from "@/components/route/RouteList";
import { RouteQuery } from "@/types/route";

const Routes = async ({
  searchParams,
}: {
  searchParams: RouteQuery["searchParams"];
}) => {
  // Fetch data on the server side
  const routesResponse = await getAllRoutes(searchParams);
  const cities = await getAllMatchedCity();

  // Check for a network or data fetching error
  if (!routesResponse) {
    return (
      <div className="bg-page-background flex items-start justify-center h-screen w-full">
        <div className="mt-32">
          <p>Error fetching data</p>
        </div>
      </div>
    );
  }

  // Render RouteList even if routeData is empty
  return (
    <div className="bg-page-background flex items-start justify-center h-full mb-12 w-full">
      <div className="w-11/12">
        <RouteList
          routeData={routesResponse.routeData || []} // Pass an empty array if no route data
          paginationData={
            routesResponse.paginationData || {
              totalCount: 0,
              pageSize: 10,
              pageIndex: 0,
            }
          } // Default pagination
          cities={cities || []} // Pass empty array if no cities are found
        />
      </div>
    </div>
  );
};

export default Routes;
