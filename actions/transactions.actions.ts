"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import { FilterProps, SortOrderProps } from "@/types/ticket";
import { PaymentReference, TransactionFilterProp, TransactionReturn, TransactionSortOrderProps } from "@/types/transactions";


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

        const { busId, destinationCity, arrivalCity, onlyPending, sort, pageIndex=0, pageSize = 10 } = searchParams;

        const pageSizeNumber = Number(pageSize);
        const pageIndexNumber = Number(pageIndex);


        const skip = pageIndexNumber * pageSizeNumber;
        const take = pageSizeNumber;

        const transactionData = await db.transactions.findMany({
            skip,
            take,
            include: {
                customer: true,
                tickets: true
            },
        });

        if(!transactionData){
            return null
        }

        const transactionIds = transactionData.map((transaction) => transaction.id);
        const ticketData = await db.tickets.findMany({
            where: {
                transactionId: {
                    in: transactionIds,
                },
            }
        })
        const transactionsWithTickets = transactionData.map((transaction) => {
            const matchedTickets = ticketData.filter(ticket => ticket.transactionId === transaction.id);
            return {
                ...transaction,
                tickets: matchedTickets
            };
        });

        const wrappedTransactionData = transactionData.map((transactionsWithTickets) => ({
            transactions: transactionsWithTickets,
            customer: transactionsWithTickets.customer,
            paymentReference: transactionsWithTickets.paymentReference && typeof transactionsWithTickets.paymentReference === 'object'
            ? (transactionsWithTickets.paymentReference as PaymentReference) 
            : null,
            tickets: transactionsWithTickets.tickets || []
        }));

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