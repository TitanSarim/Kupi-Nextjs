"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import { convertToTicketSources, FilterProps, PassengerDetails, SortOrderProps, TicketsDataType, TicketsReturn } from "@/types/ticket";
import { TicketSources } from "@prisma/client";


export async function getAllTickets(searchParams: {
    carrier?: string;
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

        const { carrier, source, destinationCity, arrivalCity, onlyPending, sort, pageIndex=0, pageSize = 10 } = searchParams;

        const pageSizeNumber = Number(pageSize);
        const pageIndexNumber = Number(pageIndex);

        const filter: FilterProps = {};
        if (carrier) filter.carmaDetails = { selectedAvailability: {contains: carrier, mode: 'insensitive'}} 
        if (source) filter.source = convertToTicketSources(source);
        if (destinationCity) filter.sourceCity = { name: { contains: destinationCity, mode: 'insensitive' } };
        if (arrivalCity) filter.arrivalCity = { name: { contains: arrivalCity, mode: 'insensitive' } };
        if (onlyPending !== undefined) filter.status = "RESERVED";

        const sortOrder: SortOrderProps = {};
        sortOrder['ticketId'] = 'desc';
        if (sort) {
            const [field, order] = sort.split('_');
            if (field === 'totalPrice') {
                sortOrder['priceDetails'] = { 
                    totalPrice: order === 'asc' ? 'asc' : 'desc',
                };
            }if(field === 'sourceCity'){
                sortOrder['sourceCity'] = { 
                    name: order === 'asc' ? 'asc' : 'desc',
                };
            }
            if (field === 'CustomerName') {
                sortOrder['customer'] = { 
                    name: order === 'asc' ? 'asc' : 'desc',
                };
            }
            if(field === 'busIdentifier' || field === 'ticketId' || field === 'source' || field == 'status'){
                sortOrder[field] = order === 'asc' ? 'asc' : 'desc';
            }
        }
        
        const skip = pageIndexNumber * pageSizeNumber;
        const take = pageSizeNumber;

        console.log("filter", filter)

        const ticketData = await db.tickets.findMany({
            where: filter,
            orderBy: sortOrder,
            skip,
            take,
            include: {
                customer: true,
                transaction: true,
                bus: true,
                sourceCity: true,
                arrivalCity: true,
            },
        });

        if(!ticketData){
            return null
        }

        const wrappedTickets: TicketsDataType[] = ticketData.map((ticket) => ({
            tickets: ticket,
            customer: ticket.customer || null,
            bus: ticket.bus || null,
            transaction: ticket.transaction || null,
            sourceCity: ticket.sourceCity,
            arrivalCity: ticket.arrivalCity,
            passengerDetails: Array.isArray(ticket.passengerDetails)
                ? ticket.passengerDetails as PassengerDetails[]
                : ticket.passengerDetails && typeof ticket.passengerDetails === 'object'
                ? [ticket.passengerDetails as PassengerDetails]
                : null,
        }));

        const totalCount = await db.tickets.count({ where: filter });

        return {
            ticketData: wrappedTickets,
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


export async function getTicketById(ticketId: string): Promise<TicketsDataType | null> {

    try {

        const session = await auth();

        if(!session || !session.userId ) {
            return null
        }

        const ticket = await db.tickets.findFirst({
            where: {
                ticketId: ticketId
            },
            include: {
                customer: true,
                transaction: true,
                bus: true,
                sourceCity: true,
                arrivalCity: true,
            }
        })

        if(!ticket) {
            return null
        }

        const passengerDetails: PassengerDetails[] | null = Array.isArray(ticket.passengerDetails)
            ? ticket.passengerDetails as PassengerDetails[]
            : ticket.passengerDetails && typeof ticket.passengerDetails === 'object'
            ? [ticket.passengerDetails as PassengerDetails]
            : null
    
        const ticketData: TicketsDataType = {
            tickets: ticket, 
            bus: ticket.bus,
            customer: ticket.customer,
            transaction: ticket.transaction,
            sourceCity: ticket.sourceCity,
            arrivalCity: ticket.arrivalCity,
            passengerDetails: passengerDetails 
        };

        return ticketData
        
    } catch (error) {
        console.error("Error getting setting:", error);
        return null;
    }

}