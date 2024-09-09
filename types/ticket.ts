import { Tickets } from "@prisma/client";

export enum TicketStatus {
    SOLD = 'SOLD',
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

export type SortOrder = {
    asc: string;
    desc: string;
}


export type TicketsReturn = {
    TicketData: Tickets[],
    paginationData: {
        totalCount: number;
        pageSize: number;
        pageIndex: number;
    }
    urlParamName?: string;
}