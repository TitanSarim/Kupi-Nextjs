import { Tickets } from "@prisma/client";

export enum TicketStatus {
    CONFIRMED = 'CONFIRMED',
    RESERVED = 'RESERVED',
    AVAILABLE = 'AVAILABLE'
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



export type TicketsReturn = {
    TicketData: Tickets[],
    paginationData: {
        totalCount: number;
        pageSize: number;
        pageIndex: number;
    }
    urlParamName?: string;
}

export interface FilterProps {
    busId?: string;
    source?: string;
    destinationCity?: string;
    arrivalCity?: string;
    status?: "RESERVED"; // Since you're setting this explicitly when `onlyPending` is defined
}

export interface SortOrderProps {
    [field: string]: 'asc' | 'desc';
}