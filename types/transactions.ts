import { Busses, Cities, Customers, File, Tickets, TicketSources, Transactions } from "@prisma/client";
import { PassengerDetails } from "./ticket";

export enum TransactionStatus {
    Paid = 'paid',
}

export type TransactionQuery = {
    searchParams: {
      busId?: string;
      source?: string;
      destinationCity?: string;
      arrivalCity?: string;
      onlyPending?: boolean;
      sort?: string;
    };
};

export type PaymentReference = {
    account: string;
    amount: number;
    merchantId: number;
    merchantCharge: number;
    customerCharge: number;
    clientKey: string;
    contiPayRef: number;
    firstName: string;
    lastName: string;
    email: string;
    merchantRef: string;
    message: string;
    methodCode: string;
    currencyCode: string;
    providerCode: string;
    providerName: string;
    correlator: string;
    statusCode: number;
    status: string;
};

export type TransactionsType = {
    transactions: Transactions;
    customer: Customers;
    paymentReference?: PaymentReference | null;
    tickets?: Tickets[] | null;
    bus?: Busses | null;
    sourceCity?: Cities | null;
    arrivalCity?: Cities | null;
  };
export type TransactionReturn = {
    transactionData: TransactionsType[],
    paginationData: {
        totalCount: number;
        pageSize: number;
        pageIndex: number;
    }
}



export interface TransactionSortOrderProps {
    [field: string]: 'asc' | 'desc';
}


export interface FilterProps {
    selectedAvailability?: {
        carrier?: {
            contains?: string;
            mode?: 'insensitive';
        };
    };
    source?: TicketSources;
    sourceCity?: {
        name?: {
            contains?: string;
            mode?: 'insensitive';
        };
    };
    arrivalCity?: {
        name?: {
            contains?: string;
            mode?: 'insensitive';
        };
    };
    paidAt?: {
        gte?: Date;
        lte?: Date;
    };
    status?: "RESERVED";
}

export interface FileType {
    path: string;
    name: string;
    size: number;
    type: string;
}

export interface InvoiceFormData{
    busOperator: string,
    paymentPeriod?: number,
    totalAmount?: number ,
    invoiceFiles: File,
    receiptFiles: File,
}

export interface OperatorsType{
    id: string,
    name: string,
    description: string,
}