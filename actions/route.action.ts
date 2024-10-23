"use server";
import { db } from "@/db";
import { auth } from "@/auth";
import { RouteActionReturn, RouteDataType } from "@/types/route";
import { Routes, DAYS, Operators } from "@prisma/client";
import { RolesEnum } from "@/types/auth";

export async function getAllRoutes(searchParams?: {
  busNumber?: string;
  carrier?: string;
  departureCity?: string;
  arrivalCity?: string;
  onlyPending?: boolean;
  sort?: string;
  pageIndex?: number;
  pageSize?: number;
}) {
  try {
    const session = await auth();
    if (!session || !session.userId) {
      return {
        routeData: [],
        paginationData: { totalCount: 0, pageSize: 10, pageIndex: 0 },
      };
    }

    const {
      pageIndex = 0,
      pageSize = 10,
      sort,
      onlyPending,
      departureCity = null,
      arrivalCity = null,
      busNumber = null,
    } = searchParams || {};

    const pageSizeNumber = Number(pageSize);
    const pageIndexNumber = Number(pageIndex);
    const skip = pageIndexNumber * pageSizeNumber;
    const take = pageSizeNumber;

    // Create filter conditions
    const filterConditions: any = {};

    // Filter by operatorId
    if (session.operatorId) {
      filterConditions.operatorIds = { has: session.operatorId };
    }

    // Apply filters based on search parameters
    if (departureCity) {
      filterConditions.departureCity = {
        contains: departureCity,
        mode: "insensitive",
      };
    }
    if (arrivalCity) {
      filterConditions.arrivalCity = {
        contains: arrivalCity,
        mode: "insensitive",
      };
    }
    if (busNumber) {
      filterConditions.bus = {
        busID: { contains: busNumber, mode: "insensitive" },
      };
    }
    if (onlyPending) {
      filterConditions.status = "PENDING";
    }

    // Prepare the sortOrder
    const sortOrder: Array<any> = [];
    let sortDirection: "asc" | "desc" = "desc";

    if (typeof sort === "string" && sort.includes("_")) {
      const [field, order] = sort.split("_");
      sortDirection = order === "asc" ? "asc" : "desc";

      // Apply sorting based on the selected field
      if (field === "busIdentifier") {
        sortOrder.push({ bus: { name: sortDirection } });
      } else if (field === "routeLocation") {
        sortOrder.push({ departureCity: sortDirection });
        sortOrder.push({ arrivalCity: sortDirection });
      } else if (field === "departureCity" || field === "arrivalCity") {
        sortOrder.push({ [field]: sortDirection });
      } else if (field === "type" || field === "status") {
        sortOrder.push({ [field]: sortDirection });
      } else if (field === "timings") {
        sortOrder.push({ departureTime: sortDirection });
        sortOrder.push({ arrivalTime: sortDirection });
      } else {
        sortOrder.push({ departureTime: "desc" });
      }
    } else {
      sortOrder.push({ createdAt: "desc" });
    }

    // Fetch routes with filters, sorting, and pagination
    const routes = await db.routes.findMany({
      where: filterConditions,
      include: {
        bus: true,
      },
      orderBy: sortOrder,
      skip,
      take,
    });

    const totalCount = await db.routes.count({ where: filterConditions });

    // Fetch operator names using operatorIds
    const routeWithOperators = await Promise.all(
      routes.map(async (route) => {
        let operatorNames = "Unknown";
        if (route.operatorIds && route.operatorIds.length > 0) {
          const operators = await db.operators.findMany({
            where: { id: { in: route.operatorIds } },
            select: { name: true },
          });

          // Map operator names
          operatorNames = operators.map((operator) => operator.name).join(", ");
        }

        return {
          ...route,
          busIdentifier: route.bus?.busID || "Unknown Bus",
          operatorName: operatorNames,
          pricing: {
            amountUSD:
              typeof route.pricing.amountUSD === "number"
                ? route.pricing.amountUSD
                : 0,
            pricingData: route.pricing.pricingData || {},
          },
          stops: route.stops.map((stop: any) => ({
            ...stop,
            arrivalTime: stop.arrivalTime,
            departureTime: stop.departureTime,
          })),
          isLive: route.isLive,
        };
      })
    );

    return {
      routeData: routeWithOperators,
      paginationData: {
        totalCount,
        pageSize: pageSizeNumber,
        pageIndex: pageIndexNumber,
      },
    };
  } catch (error) {
    return {
      routeData: [],
      paginationData: { totalCount: 0, pageSize: 10, pageIndex: 0 },
    };
  }
}

export async function createRoute(routeData: any): Promise<Routes | null> {
  try {
    const session = await auth();
    if (!session || !session.userId) {
      return null;
    }

    const {
      type,
      days,
      departureLocation,
      arrivalLocation,
      departureCity,
      arrivalCity,
      departureTime,
      arrivalTime,
      stops,
      pricing = {},
      status,
      busId,
      exceptionDates,
    } = routeData;

    const operatorIds = session.operatorId ? [session.operatorId] : [];

    const newRoute = await db.routes.create({
      data: {
        type,
        days: days.map((day: keyof typeof DAYS) => DAYS[day]),
        departureLocation,
        arrivalLocation,
        departureCity,
        arrivalCity,
        departureTime,
        arrivalTime,
        stops: stops.map((stop: any) => ({
          location: stop.location,
          arrivalTime: stop.arrivalTime,
          departureTime: stop.departureTime,
          priceUSD: stop.priceUSD ?? 0,
          priceLocal: stop.priceLocal ?? 0,
        })),
        pricing: {
          set: {
            amountUSD: pricing.amountUSD ?? 0,
            amountLocal: pricing.amountLocal ?? 0,
            departureLocation: pricing.departureLocation,
            arrivalLocation: pricing.arrivalLocation,
            pricingData: pricing.pricingData ?? [],
          },
        },
        operatorIds,
        busId,
        status,
        exceptionDates: exceptionDates?.length ? exceptionDates : [],
      },
    });

    return newRoute;
  } catch (error) {
    return null;
  }
}

export async function updateRoute(
  routeId: string,
  routeData: any
): Promise<Routes | null> {
  try {
    const session = await auth();
    if (!session || !session.userId) {
      return null;
    }

    // Sanitize locations and pricing data
    const sanitizedDepartureLocation = { ...routeData.departureLocation };
    const sanitizedArrivalLocation = { ...routeData.arrivalLocation };
    delete sanitizedDepartureLocation.cityName;
    delete sanitizedArrivalLocation.cityName;

    const sanitizedPricing = { ...routeData.pricing };
    if (sanitizedPricing.departureLocation) {
      sanitizedPricing.departureLocation = {
        ...sanitizedPricing.departureLocation,
      };
      delete sanitizedPricing.departureLocation.cityName;
    }
    if (sanitizedPricing.arrivalLocation) {
      sanitizedPricing.arrivalLocation = {
        ...sanitizedPricing.arrivalLocation,
      };
      delete sanitizedPricing.arrivalLocation.cityName;
    }

    // Fetch the city names from the Cities table using cityId
    const departureCity = await db.cities.findUnique({
      where: { id: routeData.departureLocation.cityId },
      select: { name: true },
    });

    const arrivalCity = await db.cities.findUnique({
      where: { id: routeData.arrivalLocation.cityId },
      select: { name: true },
    });

    // Perform the update operation
    const updatedRoute = await db.routes.update({
      where: { id: routeId },
      data: {
        type: routeData.type,
        days: routeData.days.map((day: keyof typeof DAYS) => DAYS[day]),
        departureLocation: {
          set: sanitizedDepartureLocation,
        },
        arrivalLocation: {
          set: sanitizedArrivalLocation,
        },
        departureCity: departureCity?.name ?? routeData.departureCity,
        arrivalCity: arrivalCity?.name ?? routeData.arrivalCity,
        departureTime: routeData.departureTime,
        arrivalTime: routeData.arrivalTime,
        stops: routeData.stops.map((stop: any) => ({
          location: stop.location,
          arrivalTime: stop.arrivalTime,
          departureTime: stop.departureTime,
          priceUSD: stop.priceUSD ?? 0,
          priceLocal: stop.priceLocal ?? 0,
        })),
        pricing: {
          set: {
            amountUSD: sanitizedPricing.amountUSD ?? 0,
            amountLocal: sanitizedPricing.amountLocal ?? 0,
            departureLocation: sanitizedPricing.departureLocation,
            arrivalLocation: sanitizedPricing.arrivalLocation,
            pricingData: sanitizedPricing.pricingData ?? [],
          },
        },
        busId: routeData.busId,
        status: routeData.status,
        exceptionDates: routeData.exceptionDates?.length
          ? routeData.exceptionDates
          : undefined, // Add exception dates if provided
      },
    });

    return updatedRoute;
  } catch (error) {
    console.error("Error updating route:", error);
    return null;
  }
}

export async function deleteRoute(routeId: string): Promise<boolean> {
  try {
    const session = await auth();
    if (!session || !session.userId) {
      return false;
    }

    await db.routes.delete({
      where: { id: routeId },
    });
    return true;
  } catch (error) {
    return false;
  }
}

export async function getRouteById(
  routeId: string
): Promise<RouteDataType | null> {
  try {
    const session = await auth();
    if (!session || !session.userId) {
      return null;
    }

    const route = await db.routes.findUnique({
      where: { id: routeId },
      include: {
        bus: true,
      },
    });

    if (!route) {
      return null;
    }

    // Fetch operator names using operatorIds
    const operators =
      route.operatorIds && route.operatorIds.length > 0
        ? await db.operators.findMany({
            where: { id: { in: route.operatorIds } },
            select: { name: true },
          })
        : [];

    const operatorNames =
      operators.map((operator) => operator.name).join(", ") || "Unknown";

    const formattedRoute: RouteDataType = {
      ...route,
      busIdentifier: route.bus?.busID || "Unknown Bus",
      operatorName: operatorNames,
      pricing: {
        amountUSD:
          typeof route.pricing.amountUSD === "number"
            ? route.pricing.amountUSD
            : 0,
        pricingData: route.pricing.pricingData || {},
      },
      stops: route.stops.map((stop) => ({
        ...stop,
        arrivalTime: stop.arrivalTime,
        departureTime: stop.departureTime,
      })),
    };

    return formattedRoute;
  } catch (error) {
    return null;
  }
}

export async function updateRouteLiveStatus(
  routeId: string,
  isLive: boolean
): Promise<Routes | null> {
  try {
    const session = await auth();
    if (!session || !session.userId) {
      return null;
    }

    const updatedRoute = await db.routes.update({
      where: { id: routeId },
      data: { isLive },
    });

    return updatedRoute;
  } catch (error) {
    console.error("Failed to update isLive status:", error);
    return null;
  }
}
