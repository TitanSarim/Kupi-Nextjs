"use server";

import { db } from "@/db";
import { auth } from "@/auth";;
import { FilterProps, InvoiceFormData, OperatorsType, PaymentReference, TransactionReturn, TransactionsType } from "@/types/transactions";
import { Prisma } from "@prisma/client";
import { uploadToAWS } from "@/libs/s3";
import { observableToPromise } from "@/libs/ClientSideHelpers";

export async function getAllTransactions(searchParams: {
    carrier?: string;
    source?: string;
    destinationCity?: string;
    arrivalCity?: string;
    onlyPending?: boolean;
    startDate?: string;
    endDate?: string;
    sort?: string;
    pageIndex?: number;
    pageSize?: number;
  }): Promise<TransactionReturn | null> {

    try {

        const session = await auth();

        if(!session || !session.userId ) {
            return null
        }

        const {carrier, startDate, endDate, destinationCity, arrivalCity, sort, pageIndex=0, pageSize = 10 } = searchParams;

        const pageSizeNumber = Number(pageSize);
        const pageIndexNumber = Number(pageIndex);

        const skip = pageIndexNumber * pageSizeNumber;
        const take = pageSizeNumber;

        const filter: FilterProps = {}
        const Cities: FilterProps = {};
        if (carrier) { filter.selectedAvailability = { carrier: { contains: carrier, mode: 'insensitive' } } }       
        if (destinationCity) Cities.sourceCity = { name: { contains: destinationCity, mode: 'insensitive' } };
        if (arrivalCity) Cities.arrivalCity = { name: { contains: arrivalCity, mode: 'insensitive' } };
        if (startDate && endDate) {
            filter.paidAt = {
                gte: new Date(parseInt(startDate)),  // Convert timestamp to Date
                lte: new Date(parseInt(endDate)),    // Convert timestamp to Date
            };
        } else if (startDate) {
            filter.paidAt = {
                gte: new Date(parseInt(startDate)),  // Convert timestamp to Date
            };
        } else if (endDate) {
            filter.paidAt = {
                lte: new Date(parseInt(endDate)),    // Convert timestamp to Date
            };
        }

        const sortOrder: Array<Prisma.TransactionsOrderByWithRelationInput> = [];

        if (sort) {
            const [field, order] = sort.split('_');
            if (field === 'customer') {
                sortOrder.push({ customer: { name: order === 'asc' ? 'asc' : 'desc' } });
            }
            if (field === 'totalAmount' || field === 'paidAt') {
                sortOrder.push({ [field]: order === 'asc' ? 'asc' : 'desc' });
            }
        } else {
            sortOrder.push({ paidAt: 'desc' });
        }

        const transactionData = await db.transactions.findMany({
            where: {
                ...filter,
                tickets: {
                  some: {
                    sourceCity: Cities.sourceCity || undefined,
                    arrivalCity: Cities.arrivalCity || undefined, 
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
        

        if (!transactionData) {
            return null;
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

        const totalCount = await db.transactions.count({
            where: {
                ...filter,
                tickets: {
                  some: {
                    sourceCity: Cities.sourceCity || undefined,
                    arrivalCity: Cities.arrivalCity || undefined, 
                  },
                },
            },
        });

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

export async function getBusOperators(): Promise<OperatorsType[] | null> {
    try {
        const operators = await db.operators.findMany();

        if (!operators) {
            return null;
        }

        return operators;
    } catch (error) {
        console.error("Error getting bus operators:", error);
        return null;  
    }
}


export async function createInvoice(formData: any)  {

    try {
        console.log("invoice", formData)

        if(!formData.invoiceFiles || !formData.receiptFiles || !formData.busOperator || !formData.totalAmount){
            return null;
        }

        const invoiceFile = formData.invoiceFiles[0];
        const receiptFile = formData.receiptFiles[0];
    
        // Convert Observables to Promises
        const invoiceUpload$ = uploadToAWS(invoiceFile);
        const receiptUpload$ = uploadToAWS(receiptFile);
    
        // Handle progress and data for invoice
        const invoiceResult = await observableToPromise(invoiceUpload$);
        console.log("Invoice upload result:", invoiceResult);
    
        // Handle progress and data for receipt
        const receiptResult = await observableToPromise(receiptUpload$);
        console.log("Receipt upload result:", receiptResult);
    
        // Extract file information from the results
        const invoice = invoiceResult.data;
        const receipt = receiptResult.data;


        const operatorIds = Array.isArray(formData.busOperator) ? formData.busOperator : [formData.busOperator];

        // const invoice = await db.transactions.create({
        //     data: {
        //         operatorIds: operatorIds,
        //         totalAmount: formData.totalAmount,
        //         paymentPeriod: formData.paymentPeriod,
        //         recipt: receipts[0],
        //         invoice: invoices[0],
        //     }
        // })

        return invoice
        
    } catch (error) {
        console.error("Error getting setting:", error);
        return null;
    }
}