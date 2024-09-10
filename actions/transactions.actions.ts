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

        const { busId, source, destinationCity, arrivalCity, onlyPending, sort, pageIndex=0, pageSize = 1 } = searchParams;

        const pageSizeNumber = Number(pageSize);
        const pageIndexNumber = Number(pageIndex);

        const filter: TransactionFilterProp = {};
        // if (onlyPending !== undefined) filter.status = "RESERVED";

        const sortOrder: TransactionSortOrderProps = {};
        if (sort) {
            const [field, order] = sort.split('_');
            sortOrder[field] = order === 'asc' ? 'asc' : 'desc';
        }
        
        const skip = pageIndexNumber * pageSizeNumber;
        const take = pageSizeNumber;

        const transactionData = await db.transactions.findMany({
            // where: filter,
            orderBy: sortOrder,
            skip,
            take,
            include: {
                customer: true,
            },
        });

        if(!transactionData){
            return null
        }

        const wrappedTransactionData = transactionData.map((transaction) => ({
            transactions: transaction,
            customer: transaction.customer,
            paymentReference: transaction.paymentReference && typeof transaction.paymentReference === 'object'
            ? (transaction.paymentReference as PaymentReference) 
            : null,
        }));

        const totalCount = await db.tickets.count({ where: filter });

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