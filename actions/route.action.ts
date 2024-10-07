"use server";
import { db } from "@/db";
import { auth } from "@/auth";
import { RouteActionReturn, RouteDataType } from "@/types/route";
import { Routes, DAYS } from "@prisma/client";
import { RolesEnum } from "@/types/auth";

export async function getAllRoutes(searchParams?: any) {
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
        name: { contains: busNumber, mode: "insensitive" },
      };
    }
    if (onlyPending) {
      filterConditions.status = "PENDING";
    }

    // Prepare the sortOrder
    const sortOrder: Array<any> = [];
    if (typeof sort === "string" && sort.includes("_")) {
      const [field, order] = sort.split("_");
      const sortDirection = order === "asc" ? "asc" : "desc";

      if (field === "busIdentifier") {
        sortOrder.push({ bus: { name: sortDirection } });
      } else if (field === "departureCity" || field === "arrivalCity") {
        sortOrder.push({ [field]: sortDirection });
      } else if (field === "type" || field === "status") {
        sortOrder.push({ [field]: sortDirection });
      } else if (field === "departureTime" || field === "arrivalTime") {
        sortOrder.push({ [field]: sortDirection });
      } else {
        sortOrder.push({ departureTime: "desc" });
      }
    } else {
      sortOrder.push({ departureTime: "desc" });
    }

    // Fetch routes with filters
    const routes = await db.routes.findMany({
      where: filterConditions,
      include: {
        bus: true,
      },
      orderBy: sortOrder,
      skip,
      take,
    });

    const formattedRoutes: RouteDataType[] = routes.map((route) => ({
      ...route,
      busIdentifier: route.bus?.name || "Unknown Bus",
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
    }));

    const totalCount = await db.routes.count({ where: filterConditions });

    return {
      routeData: formattedRoutes,
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

    // Use the operatorId from the session
    const operatorIds = session.operatorId ? [session.operatorId] : [];

    const { departureCity, arrivalCity } = routeData;

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
        departureCity,
        arrivalCity,
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
        operatorIds,
        busId: routeData.busId,
        status: routeData.status,
      },
    });

    return updatedRoute;
  } catch (error) {
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

    const formattedRoute: RouteDataType = {
      ...route,
      busIdentifier: route.bus?.name || "Unknown Bus",
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
