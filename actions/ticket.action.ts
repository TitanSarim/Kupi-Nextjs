"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import { Tickets } from "@prisma/client";
import { FilterProps, SortOrderProps, TicketQuery, TicketsReturn } from "@/types/ticket";


export async function getAllTickets(searchParams: {
    busId?: string;
    source?: string;
    destinationCity?: string;
    arrivalCity?: string;
    onlyPending?: boolean;
    sort?: string;
    pageIndex?: number;
    pageSize?: number;
  }): Promise<TicketsReturn | null> {

    try {

        const session = await auth();

        if(!session || !session.userId ) {
            return null
        }

        const { busId, source, destinationCity, arrivalCity, onlyPending, sort, pageIndex=0, pageSize = 1 } = searchParams;

        const pageSizeNumber = Number(pageSize);
        const pageIndexNumber = Number(pageIndex);

        const filter: FilterProps = {};
        // if (busId) filter.busId = busId;
        // if (source) filter.source = source;
        // if (destinationCity) filter.destinationCity = destinationCity;
        // if (arrivalCity) filter.arrivalCity = arrivalCity;
        if (onlyPending !== undefined) filter.status = "RESERVED";

        const sortOrder: SortOrderProps = {};
        if (sort) {
            const [field, order] = sort.split('_');
            if (field === 'priceDetails.totalPrice') {
                sortOrder['priceDetails.totalPrice'] = order === 'asc' ? 'asc' : 'desc';
            } else {
                sortOrder[field] = order === 'asc' ? 'asc' : 'desc';
            }
        }
        
        const skip = pageIndexNumber * pageSizeNumber;
        const take = pageSizeNumber;

        const TicketData = await db.tickets.findMany({
            where: filter,
            orderBy: sortOrder,
            skip,
            take,
        });

        if(!TicketData){
            return null
        }

        const totalCount = await db.tickets.count({ where: filter });

        return {
            TicketData,
            paginationData: {
                totalCount,
                pageSize,
                pageIndex
            }
        };

    }catch(error) {
        console.error("Error getting setting:", error);
        return null;
    }

}