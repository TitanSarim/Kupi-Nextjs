import {
  Busses,
  Cities,
  Customers,
  Operators,
  OperatorStatus,
  Tickets,
  TicketSources,
  Transactions,
} from "@prisma/client";

export enum TransactionStatus {
  Paid = "paid",
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

export type ManualTransactionQuery = {
  searchParams: {
    source?: string;
    id?: string;
    startDate?: string;
    endDate?: string;
    period?: string;
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

export type carmaDetails = {
  selectedAvailability: {
    id: string;
    carrier: string;
  };
};

export type TransactionsType = {
  transactions: Transactions;
  customer?: Customers | null;
  paymentReference?: PaymentReference | null;
  tickets?: Tickets[] | null;
  bus?: Busses | null;
  sourceCity?: Cities | null;
  arrivalCity?: Cities | null;
  carmaDetails?: carmaDetails | null;
};

export type TransactionReturn = {
  transactionData: TransactionsType[];
  cities: Cities[];
  paginationData: {
    totalCount: number;
    pageSize: number;
    pageIndex: number;
  };
};

export type TransactionActionReturn = {
  transactionData: TransactionsType[];
  paginationData: {
    totalCount: number;
    pageSize: number;
    pageIndex: number;
  };
};

export type ManualTransactionsType = {
  transactions: Transactions;
  operators: OperatorsType[];
};

export type ManualTransactionReturn = {
  transactionData: ManualTransactionsType[];
  operators?: OperatorsType[];
  paginationData: {
    totalCount: number;
    pageSize: number;
    pageIndex: number;
  };
};

export type ManualTransactionReturnActions = {
  transactionData: ManualTransactionsType[];
  paginationData: {
    totalCount: number;
    pageSize: number;
    pageIndex: number;
  };
};

export interface TransactionSortOrderProps {
  [field: string]: "asc" | "desc";
}

export interface FilterProps {
  selectedAvailability?: {
    carrier?: {
      contains?: string;
      mode?: "insensitive";
    };
  };
  source?: TicketSources;
  sourceCity?: {
    name?: {
      contains?: string;
      mode?: "insensitive";
    };
  };
  arrivalCity?: {
    name?: {
      contains?: string;
      mode?: "insensitive";
    };
  };
  paidAt?: {
    gte?: Date;
    lte?: Date;
  };
  status?: "RESERVED";
  id?: string;
  paymentPeriod?: number;
}

export interface ManualFilterProps {
  selectedAvailability?: {
    carrier?: {
      contains?: string;
      mode?: "insensitive";
    };
  };
  source?: TicketSources;
  sourceCity?: {
    name?: {
      contains?: string;
      mode?: "insensitive";
    };
  };
  arrivalCity?: {
    name?: {
      contains?: string;
      mode?: "insensitive";
    };
  };
  paidAt?: {
    gte?: Date;
    lte?: Date;
  };
  status?: "RESERVED";
  id?: string | { contains: string; mode: "insensitive" };
  paymentPeriod?: number;
}

export interface FileType {
  path: string;
  name: string;
  size: number;
  type: string;
}

export interface InvoiceFormData {
  busOperator: string;
  paymentPeriod?: number;
  totalAmount?: number;
  invoiceFiles: File;
  receiptFiles: File;
}

export type OperatorsType = {
  id: string;
  name: string;
  description?: string;
  status: OperatorStatus;
  joiningDate?: Date;
  source?: TicketSources;
};
