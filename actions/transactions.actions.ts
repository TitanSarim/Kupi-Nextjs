"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import {
  FilterProps,
  FilterPropsTickets,
  ManualFilterProps,
  ManualTransactionReturnActions,
  ManualTransactionsType,
  OperatorsType,
  PaymentReference,
  TransactionActionReturn,
  TransactionsType,
} from "@/types/transactions";
import { Prisma, Transactions } from "@prisma/client";
import { getSignedURL, uploadPdfToS3 } from "@/libs/s3";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { RolesEnum } from "@/types/auth";

export async function getAllTransactions(
  searchParams: {
    operator?: string;
    ticketId?: string;
    source?: string;
    destinationCity?: string;
    arrivalCity?: string;
    onlyPending?: boolean;
    startDate?: string;
    endDate?: string;
    sort?: string;
    pageIndex?: number;
    pageSize?: number;
  },
  fetchAll: boolean = false
): Promise<TransactionActionReturn | null> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const {
      operator,
      ticketId,
      startDate,
      endDate,
      destinationCity,
      arrivalCity,
      sort,
      pageIndex = 0,
      pageSize = 10,
    } = searchParams;

    const pageSizeNumber = Number(pageSize);
    const pageIndexNumber = Number(pageIndex);

    const skip = fetchAll ? undefined : pageIndexNumber * pageSizeNumber;
    const take = fetchAll ? undefined : pageSizeNumber;

    const filter: FilterProps = {};
    const Cities: FilterProps = {};
    let ticketsFilter;
    let operatorFilter;
    if (operator) {
      operatorFilter = operator;
    }
    if (ticketId) {
      ticketsFilter = { contains: ticketId };
    }
    if (destinationCity)
      Cities.sourceCity = {
        name: { contains: destinationCity, mode: "insensitive" },
      };
    if (arrivalCity)
      Cities.arrivalCity = {
        name: { contains: arrivalCity, mode: "insensitive" },
      };
    if (startDate && endDate) {
      filter.paidAt = {
        gte: new Date(parseInt(startDate)),
        lte: new Date(parseInt(endDate)),
      };
    } else if (startDate) {
      filter.paidAt = {
        gte: new Date(parseInt(startDate)),
      };
    } else if (endDate) {
      filter.paidAt = {
        lte: new Date(parseInt(endDate)),
      };
    }

    const sortOrder: Array<Prisma.TransactionsOrderByWithRelationInput> = [];

    if (sort) {
      const [field, order] = sort.split("_");
      if (field === "customer") {
        sortOrder.push({
          customer: { name: order === "asc" ? "asc" : "desc" },
        });
      }
      if (field === "ticketId") {
        sortOrder.push({
          tickets: {
            _count: order === "asc" ? "asc" : "desc",
          },
        });
      }
      if (field === "operator") {
        sortOrder.push({
          paymentMethod: order === "asc" ? "asc" : "desc",
        });
      }
      if (
        field === "totalAmount" ||
        field === "paidAt" ||
        field === "paymentMethod"
      ) {
        sortOrder.push({ [field]: order === "asc" ? "asc" : "desc" });
      }
    } else {
      sortOrder.push({ paidAt: "desc" });
    }
    const ticketsSortOrder: Array<Prisma.TicketsOrderByWithAggregationInput> =
      [];
    if (sort) {
      const [field, order] = sort.split("_");
      if (field === "source") {
        ticketsSortOrder.push({
          source: order === "asc" ? "asc" : "desc",
        });
      }
    }

    let transactionData;
    if (
      session.role === RolesEnum.SuperAdmin ||
      session.role === RolesEnum.KupiUser
    ) {
      transactionData = await db.transactions.findMany({
        where: {
          ...filter,
          paymentMethod: {
            not: "manual",
          },
          tickets: {
            some: {
              operatorId: operatorFilter,
              ticketId: ticketsFilter,
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
            orderBy: ticketsSortOrder,
            include: {
              customer: true,
              bus: true,
              sourceCity: true,
              arrivalCity: true,
            },
          },
        },
      });
    } else if (
      session.role === RolesEnum.BusCompanyAdmin ||
      session.role === RolesEnum.BusCompanyUser
    ) {
      transactionData = await db.transactions.findMany({
        where: {
          ...filter,
          paymentMethod: {
            not: "manual",
          },
          tickets: {
            some: {
              operatorId: session.operatorId,
              ticketId: ticketsFilter,
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
            orderBy: ticketsSortOrder,
            include: {
              customer: true,
              bus: true,
              sourceCity: true,
              arrivalCity: true,
            },
          },
        },
      });
    }

    if (!transactionData) {
      return null;
    }

    const wrappedTransactionData: TransactionsType[] = transactionData.map(
      (transaction) => {
        const firstTicket = transaction.tickets[0];
        const carmaDetails = transaction.tickets
          .map((ticket) =>
            ticket?.carmaDetails?.selectedAvailability &&
            typeof ticket.carmaDetails.selectedAvailability === "object" &&
            "id" in ticket.carmaDetails.selectedAvailability &&
            typeof ticket.carmaDetails.selectedAvailability.id === "string" &&
            "carrier" in ticket.carmaDetails.selectedAvailability &&
            typeof ticket.carmaDetails.selectedAvailability.carrier === "string"
              ? {
                  selectedAvailability: {
                    id: ticket.carmaDetails.selectedAvailability.id,
                    carrier: ticket.carmaDetails.selectedAvailability.carrier,
                    serviceNumber: ticket.carmaDetails.selectedAvailability
                      .serviceNumber as string | undefined,
                  },
                }
              : null
          )
          .filter((detail) => detail !== null);

        return {
          transactions: transaction,
          customer: transaction?.customer,
          paymentReference: Array.isArray(transaction.paymentReference)
            ? (transaction.paymentReference as PaymentReference[])
            : transaction.paymentReference
            ? [transaction.paymentReference as PaymentReference]
            : null,
          tickets: transaction.tickets || [],
          bus: firstTicket?.bus || null,
          sourceCity: firstTicket?.sourceCity || null,
          arrivalCity: firstTicket?.arrivalCity || null,
          carmaDetails,
        };
      }
    );

    let totalCount;
    if (
      session.role === RolesEnum.SuperAdmin ||
      session.role === RolesEnum.KupiUser
    ) {
      totalCount = await db.transactions.count({
        where: {
          ...filter,
          tickets: {
            some: {
              operatorId: operatorFilter,
              ticketId: ticketsFilter,
              sourceCity: Cities.sourceCity || undefined,
              arrivalCity: Cities.arrivalCity || undefined,
            },
          },
        },
      });
    } else if (
      session.role === RolesEnum.BusCompanyAdmin ||
      session.role === RolesEnum.BusCompanyUser
    ) {
      totalCount = await db.transactions.count({
        where: {
          ...filter,
          tickets: {
            some: {
              operatorId: session.operatorId,
              ticketId: ticketsFilter,
              sourceCity: Cities.sourceCity || undefined,
              arrivalCity: Cities.arrivalCity || undefined,
            },
          },
        },
      });
    }

    if (!totalCount) {
      return null;
    }

    return {
      transactionData: wrappedTransactionData,
      paginationData: {
        totalCount,
        pageSize,
        pageIndex,
      },
    };
  } catch (error) {
    console.error("Error getting transactions:", error);
    return null;
  }
}

export async function getBusOperators(): Promise<OperatorsType[] | null> {
  try {
    const operators = await db.operators.findMany({
      where: {
        status: "REGISTERED",
      },
    });

    if (!operators) {
      return null;
    }

    return operators || null;
  } catch (error) {
    console.error("Error getting bus operators:", error);
    return null;
  }
}

export async function createInvoice(
  formData: FormData
): Promise<Transactions | null> {
  try {
    const busOperator = formData.get("busOperator") as string | null;
    const paymentPeriod = formData.get("paymentPeriod") as string | null;
    const totalAmount = formData.get("totalAmount") as string | null;

    if (!busOperator || !totalAmount || !paymentPeriod) {
      console.error("Missing required fields");
      return null;
    }

    const invoiceFile = formData.get("invoiceFiles");
    const receiptFile = formData.get("receiptFiles");

    if (!invoiceFile || !receiptFile) {
      console.error("Please upload files");
      return null;
    }
    const invoiceResult = await uploadPdfToS3(invoiceFile);
    const receiptResult = await uploadPdfToS3(receiptFile);

    const paymentPeriodNumber = Number(paymentPeriod);
    const totalAmountNumber = Number(totalAmount);

    const transactionData = await db.transactions.findMany({
      where: {
        paymentMethod: "manual",
      },
      orderBy: {
        paidAt: "desc",
      },
      take: 1,
    });

    let newPaymentRef: string;
    if (transactionData.length > 0) {
      const latestPaymentRef = transactionData[0].paymentRef;
      const latestNumber = parseInt(latestPaymentRef, 10);
      const newNumber = latestNumber + 1;
      newPaymentRef = newNumber.toString().padStart(8, "0");
    } else {
      newPaymentRef = "00000001";
    }

    const transaction = await db.transactions.create({
      data: {
        operatorId: busOperator,
        totalAmount: totalAmountNumber,
        paymentPeriod: paymentPeriodNumber,
        paymentMethod: "manual",
        currency: "USD",
        paymentReference: "",
        paymentRef: newPaymentRef,
        invoice: invoiceResult,
        recipt: receiptResult,
      },
    });

    revalidatePath("/app/transactions/manualTransaction");
    return transaction || null;
  } catch (error) {
    console.error("Error creating transaction:", error);
    return null;
  }
}

export async function updateInvoice(
  formData: FormData
): Promise<Transactions | null> {
  try {
    const id = formData.get("transactionId") as string | null;
    const busOperator = formData.get("busOperator") as string | null;
    const paymentPeriod = formData.get("paymentPeriod") as string | null;
    const totalAmount = formData.get("totalAmount") as string | null;

    if (!busOperator || !totalAmount || !paymentPeriod || !id) {
      console.error("Missing required fields");
      return null;
    }

    const invoiceFile = formData.get("invoiceFiles");
    const receiptFile = formData.get("receiptFiles");
    const operatorId = busOperator ? busOperator : [busOperator];
    const paymentPeriodNumber = Number(paymentPeriod);
    const totalAmountNumber = Number(totalAmount);

    let invoiceResult;
    if (invoiceFile) {
      invoiceResult = await uploadPdfToS3(invoiceFile);
    }
    let receiptResult;
    if (receiptResult) {
      receiptResult = await uploadPdfToS3(receiptFile);
    }

    const updateData: any = {
      operatorId,
      totalAmount: totalAmountNumber,
      paymentPeriod: paymentPeriodNumber,
      paymentMethod: "manual",
      currency: "USD",
      paymentReference: "",
    };

    if (invoiceResult) {
      updateData.invoice = invoiceResult;
    }
    if (receiptResult) {
      updateData.receipt = receiptResult;
    }

    const transaction = await db.transactions.update({
      where: {
        id: id,
      },
      data: updateData,
    });

    revalidatePath("/app/transactions/manualTransaction");
    return transaction || null;
  } catch (error) {
    console.error("Error updating transaction:", error);
    return null;
  }
}

export async function getAllManualTransactions(searchParams: {
  operator?: string;
  paymentRef?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  pageIndex?: number;
  pageSize?: number;
}): Promise<ManualTransactionReturnActions | null> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const {
      operator,
      paymentRef,
      period,
      startDate,
      endDate,
      sort,
      pageIndex = 0,
      pageSize = 10,
    } = searchParams;

    const pageSizeNumber = Number(pageSize);
    const pageIndexNumber = Number(pageIndex);

    const skip = pageIndexNumber * pageSizeNumber;
    const take = pageSizeNumber;

    const filter: ManualFilterProps = {};
    if (paymentRef) {
      filter.paymentRef = {
        contains: paymentRef,
        mode: "insensitive",
      };
    }
    if (period) filter.paymentPeriod = Number(period);
    if (operator) {
      filter.operatorId = operator;
    }
    if (startDate && endDate) {
      filter.paidAt = {
        gte: new Date(parseInt(startDate)),
        lte: new Date(parseInt(endDate)),
      };
    } else if (startDate) {
      filter.paidAt = {
        gte: new Date(parseInt(startDate)),
      };
    } else if (endDate) {
      filter.paidAt = {
        lte: new Date(parseInt(endDate)),
      };
    }

    const sortOrder: Array<Prisma.TransactionsOrderByWithRelationInput> = [];

    if (sort) {
      const [field, order] = sort.split("_");
      if (field === "BusOperator") {
        sortOrder.push({
          operators: { name: order === "asc" ? "asc" : "desc" },
        });
      }
      if (
        field === "totalAmount" ||
        field === "paidAt" ||
        field === "paymentRef" ||
        field === "paymentPeriod"
      ) {
        sortOrder.push({ [field]: order === "asc" ? "asc" : "desc" });
      }
    } else {
      sortOrder.push({ paidAt: "desc" });
    }

    const transactionData = await db.transactions.findMany({
      where: {
        ...filter,
        paymentMethod: "manual",
      },
      orderBy: sortOrder,
      skip,
      take,
      include: {
        operators: true,
      },
    });

    if (!transactionData) {
      return null;
    }

    const operatorId = transactionData
      .flatMap((transaction) => transaction.operatorId)
      .filter((id): id is string => id !== null);
    const operators = await db.operators.findMany({
      where: {
        id: { in: operatorId },
      },
    });

    const wrappedTransactionData: ManualTransactionsType[] =
      transactionData.map((transaction) => {
        return {
          transactions: transaction,
          operators: operators.filter((operator) =>
            transaction?.operatorId?.includes(operator.id)
          ),
        };
      });

    const totalCount = await db.transactions.count({
      where: {
        ...filter,
        paymentMethod: "manual",
      },
    });

    return {
      transactionData: wrappedTransactionData,
      paginationData: {
        totalCount,
        pageSize,
        pageIndex,
      },
    };
  } catch (error) {
    console.error("Error getting transaction:", error);
    return null;
  }
}

export async function openPdf(path: string): Promise<string | undefined> {
  try {
    const url = await getSignedURL(path);
    if (!url) {
      return;
    }
    return url;
  } catch (error) {
    console.error("Error opening PDF:", error);
    return undefined;
  }
}
