import { Busses, Cities, Customers, Operators, Tickets, Transactions } from "@prisma/client";
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


export interface TransactionFilterProp {
    busId?: string;
    source?: string;
    destinationCity?: string;
    arrivalCity?: string;
    status?: "RESERVED"; // Since you're setting this explicitly when `onlyPending` is defined
}

export interface TransactionSortOrderProps {
    [field: string]: 'asc' | 'desc';
}