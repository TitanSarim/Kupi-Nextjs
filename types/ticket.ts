import {
  Busses,
  Cities,
  Customers,
  Operators,
  Tickets,
  Transactions,
} from "@prisma/client";
import { OperatorsType } from "./transactions";

export enum TicketStatus {
  CONFIRMED = "CONFIRMED",
  RESERVED = "RESERVED",
  AVAILABLE = "AVAILABLE",
}

export type TicketQuery = {
  searchParams: {
    busId?: string;
    source?: string;
    destinationCity?: string;
    arrivalCity?: string;
    onlyPending?: boolean;
    sort?: string;
  };
};

export type PassengerDetails = {
  name: string;
  passportNumber: string;
};

export type TicketsDataType = {
  tickets: Tickets;
  bus?: Busses | null;
  customer?: Customers | null;
  transaction?: Transactions | null;
  sourceCity: Cities;
  arrivalCity: Cities;
  passengerDetails?: PassengerDetails[] | null;
};

export type TicketsReturn = {
  ticketData: TicketsDataType[];
  paginationData: {
    totalCount: number;
    pageSize: number;
    pageIndex: number;
  };
  urlParamName?: string;
  cities: Cities[];
  operators: OperatorsType[];
};

export type TicketsActionReturn = {
  ticketData: TicketsDataType[];
  paginationData: {
    totalCount: number;
    pageSize: number;
    pageIndex: number;
  };
  urlParamName?: string;
};

enum TicketSources {
  CARMA = "CARMA",
  KUPI = "KUPI",
}

export interface FilterProps {
  operatorId?: string;
  carmaDetails?: {
    selectedAvailability?: {
      contains?: string;
      mode?: "insensitive";
    };
  };

  source?: TicketSources;
  sourceCity?: {
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
  status?: "RESERVED";
}

export interface SortOrderProps {
  [key: string]: { [key: string]: "asc" | "desc" } | "asc" | "desc";
}

export function convertToTicketSources(
  source: string | undefined
): TicketSources | undefined {
  if (!source) return undefined;

  switch (source.toUpperCase()) {
    case "CARMA":
      return TicketSources.CARMA;
    case "KUPI":
      return TicketSources.KUPI;
    default:
      return undefined;
  }
}
