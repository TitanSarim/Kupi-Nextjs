import { Cities, Discounts, Operators } from "@prisma/client";
import { OperatorsType } from "./transactions";

export interface DiscountFormData {
  discountname: string;
  percentage: number;
  source: string[];
  count: number;
  date: string;
  selectedOperators: string[];
  destinationCityIds: string[];
  arrivalCityIds: string[];
}

export enum TicketSources {
  CARMA = "CARMA",
  KUPI = "KUPI",
}

export type CitiesType = {
  name: string;
  id: string;
};
export type discountDataType = {
  discount: Discounts;
  operators?: OperatorsType[] | null;
  sourceCities?: CitiesType[] | null;
  arrivalCities?: CitiesType[] | null;
};

export type DiscountActionReturn = {
  discounts: discountDataType[];
  paginationData: {
    totalCount: number;
    pageSize: number;
    pageIndex: number;
  };
};

export type DiscountReturn = {
  cities: Cities[];
  operators: OperatorsType[];
  discounts: discountDataType[];
  paginationData: {
    totalCount: number;
    pageSize: number;
    pageIndex: number;
  };
};

export type DiscountQuery = {
  searchParams: {
    onlyExpiring?: boolean;
    destinationCity?: string;
    arrivalCity?: string;
    name?: string;
    busOperator?: string;
    sort?: string;
  };
};

export interface FilterProps {
  departureCity?: {
    name?: {
      contains?: string;
      mode?: "insensitive";
    };
  };
  arrivalCity?: {
    name?: {
      contains?: string;
      mode?: "insensitive";
    };
  };
  name?: {
    contains?: string;
    mode?: "insensitive";
  };
  expiryDate?: {
    lt?: Date;
    mode?: "insensitive";
  };
}

export const sources = ["CARMA", "KUPI"];
