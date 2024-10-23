import { Location, RouteType, DAYS } from "@prisma/client";

export interface LocationWithCityName extends Location {
  cityName?: string;
}

export interface StopDataType {
  location: Location;
  arrivalTime: string;
  departureTime: string;
}

export interface RoutePricing {
  amountUSD: number;
  amountLocal?: number;
  pricingData?: any;
}

export interface RouteDataType {
  id: string;
  busId: string;
  busIdentifier: string;
  isLive: boolean;
  type: RouteType;
  days: DAYS[];
  departureTime: string;
  arrivalTime: string;
  status: string;
  departureLocation: LocationWithCityName;
  arrivalLocation: LocationWithCityName;
  departureCity: string;
  arrivalCity: string;
  operatorIds: string[];
  operatorName: string;
  stops: StopDataType[];
  pricing: RoutePricing;
  exceptionDates: Date[];
}

export interface PaginationDataType {
  totalCount: number;
  pageSize: number;
  pageIndex: number;
}

export interface RouteActionReturn {
  routeData: RouteDataType[];
  paginationData: PaginationDataType;
}

export interface RouteQuery {
  searchParams: {
    busId?: string;
    carrier?: string;
    departureCity?: string;
    arrivalCity?: string;
    onlyPending?: boolean;
    sort?: string;
    pageIndex?: number;
    pageSize?: number;
  };
}
