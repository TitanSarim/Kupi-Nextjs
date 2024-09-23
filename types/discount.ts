import { Cities, Discounts, Operators } from "@prisma/client";

export interface DiscountFormData {
  discountname: string;
  percentage: number;
  source: string;
  count: number;
  date: string;
  operatorId: string;
  destinationCityId: string;
  arrivalCityId: string;
}

export enum TicketSources {
  CARMA = "CARMA",
  KUPI = "KUPI",
}

export type discountDataType = {
  discount: Discounts;
  sourceCity: Cities;
  arrivalCity: Cities;
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
  operators: Operators[];
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
}
