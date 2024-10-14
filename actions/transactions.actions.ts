"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import {
  FilterProps,
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
}): Promise<TransactionActionReturn | null> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const {
      carrier,
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

    const skip = pageIndexNumber * pageSizeNumber;
    const take = pageSizeNumber;

    const filter: FilterProps = {};
    const Cities: FilterProps = {};
    if (carrier) {
      filter.selectedAvailability = {
        carrier: { contains: carrier, mode: "insensitive" },
      };
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

    const transactionData = await db.transactions.findMany({
      where: {
        ...filter,
        paymentMethod: {
          not: "manual",
        },
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
    const operators = await db.operators.findMany();

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

    const operatorIds = Array.isArray(busOperator)
      ? busOperator
      : [busOperator];
    const paymentRef = new Date();
    const paymentPeriodNumber = Number(paymentPeriod);
    const totalAmountNumber = Number(totalAmount);

    const transaction = await db.transactions.create({
      data: {
        operatorIds: operatorIds,
        totalAmount: totalAmountNumber,
        paymentPeriod: paymentPeriodNumber,
        paymentMethod: "manual",
        currency: "USD",
        paymentReference: "",
        paymentRef: JSON.stringify(paymentRef),
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
    const operatorIds = Array.isArray(busOperator)
      ? busOperator
      : [busOperator];
    const paymentRef = new Date();
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
      operatorIds,
      totalAmount: totalAmountNumber,
      paymentPeriod: paymentPeriodNumber,
      paymentMethod: "manual",
      currency: "USD",
      paymentReference: "",
      paymentRef: JSON.stringify(paymentRef),
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
  carrier?: string;
  id?: string;
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
      carrier,
      id,
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
    if (id) {
      filter.id = {
        contains: id,
        mode: "insensitive",
      };
    }
    if (period) filter.paymentPeriod = Number(period);
    if (carrier) {
      filter.selectedAvailability = {
        carrier: { contains: carrier, mode: "insensitive" },
      };
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
        sortOrder.push({ ["id"]: order === "asc" ? "asc" : "desc" });
      }
      if (
        field === "totalAmount" ||
        field === "paidAt" ||
        field === "id" ||
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
    });

    if (!transactionData) {
      return null;
    }

    const operatorIds = transactionData.flatMap(
      (transaction) => transaction.operatorIds
    );
    const operators = await db.operators.findMany({
      where: {
        id: { in: operatorIds },
      },
    });

    const wrappedTransactionData: ManualTransactionsType[] =
      transactionData.map((transaction) => {
        return {
          transactions: transaction,
          operators: operators.filter((operator) =>
            transaction.operatorIds.includes(operator.id)
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
