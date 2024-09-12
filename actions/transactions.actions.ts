"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import { FilterProps, SortOrderProps } from "@/types/ticket";
import { PaymentReference, TransactionReturn, TransactionsType } from "@/types/transactions";


export async function getAllTransactions(searchParams: {
    busId?: string;
    source?: string;
    destinationCity?: string;
    arrivalCity?: string;
    onlyPending?: boolean;
    sort?: string;
    pageIndex?: number;
    pageSize?: number;
  }): Promise<TransactionReturn | null> {

    try {

        const session = await auth();

        if(!session || !session.userId ) {
            return null
        }

        const { destinationCity, arrivalCity, sort, pageIndex=0, pageSize = 10 } = searchParams;

        const pageSizeNumber = Number(pageSize);
        const pageIndexNumber = Number(pageIndex);

        const skip = pageIndexNumber * pageSizeNumber;
        const take = pageSizeNumber;

        const filter: FilterProps = {};
        if (destinationCity) filter.sourceCity = { name: { contains: destinationCity, mode: 'insensitive' } };
        if (arrivalCity) filter.arrivalCity = { name: { contains: arrivalCity, mode: 'insensitive' } };

        const sortOrder: SortOrderProps = {};
        if (sort) {
            const [field, order] = sort.split('_');
            if (field === 'customer') {
                sortOrder['customer'] = { 
                    name: order === 'asc' ? 'asc' : 'desc',
                };
            }
            if(field === "totalAmount" || field === 'date'){
                sortOrder[field] = order === 'asc' ? 'asc' : 'desc';
            }
        }

        const sortOrderForTicket: SortOrderProps = {};
        if (sort) {
            const [field, order] = sort.split('_');
            if (field === 'ticketId') {
                sortOrder[field] = order === 'asc' ? 'asc' : 'desc';
            }
        }

        const transactionData = await db.transactions.findMany({
            where: {
                tickets: {
                  some: {
                    sourceCity: filter.sourceCity || undefined,
                    arrivalCity: filter.arrivalCity || undefined, 
                  },
                },
            },
            orderBy: sortOrder,
            skip,
            take,
            include: {
                customer: true,
                tickets: {
                    include: {
                        customer: true,
                        bus: true,
                        sourceCity: true,
                        arrivalCity: true,
                    },
                },
            },
        });

        if(!transactionData){
            return null
        }


        const wrappedTransactionData: TransactionsType[] = transactionData.map((transaction) => {
            const firstTicket = transaction.tickets[0];
            return {
              transactions: transaction,
              customer: transaction.customer,
              paymentReference:
                transaction.paymentReference && typeof transaction.paymentReference === 'object'
                  ? (transaction.paymentReference as PaymentReference)
                  : null,
              tickets: transaction.tickets || [],
              bus: firstTicket?.bus || null, 
              sourceCity: firstTicket?.sourceCity || null,
              arrivalCity: firstTicket?.arrivalCity || null,
            };
        });

        const totalCount = await db.tickets.count();

        return {
            transactionData: wrappedTransactionData,
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