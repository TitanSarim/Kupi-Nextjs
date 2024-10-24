"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import {
  IncomeChartStats,
  RoutesChartData,
  Stats,
  TicketsDataTypeDashboard,
} from "@/types/dashboard";
import { format } from "date-fns";
import { RolesEnum } from "@/types/auth";
import { TicketsDataType } from "@/types/ticket";

export async function getStats(searchParams: {
  operator?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Stats | null | undefined> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const { operator, startDate, endDate } = searchParams;

    const start = startDate
      ? new Date(parseInt(startDate))
      : (() => {
          const date = new Date();
          date.setMonth(date.getMonth() - 2);
          return date;
        })();
    const end = endDate ? new Date(parseInt(endDate)) : new Date();
    let operatorFilter;
    if (operator) {
      operatorFilter = operator;
    }

    let tickets;

    if (
      session.role === RolesEnum.SuperAdmin ||
      session.role === RolesEnum.KupiUser
    ) {
      tickets = await db.tickets.findMany({
        where: {
          operatorId: operatorFilter,
          reservedAt: {
            gte: start,
            lte: end,
          },
        },
      });
    } else if (
      session.role === RolesEnum.BusCompanyAdmin ||
      session.role === RolesEnum.BusCompanyUser
    ) {
      tickets = await db.tickets.findMany({
        where: {
          operatorId: session.operatorId,
          reservedAt: {
            gte: start,
            lte: end,
          },
        },
      });
    }

    const totalIncome =
      (tickets &&
        tickets.reduce(
          (sum, ticket) => sum + ticket.priceDetails.totalPrice,
          0
        )) ||
      0;
    const totalProfit =
      tickets?.reduce(
        (sum, ticket) =>
          sum +
          (ticket.priceDetails.kupiProfit || 0) +
          (ticket.priceDetails.kupiMarkup || 0),
        0
      ) || 0;

    const totalTickets = (tickets && tickets.length) || 0;
    const soldTickets =
      (tickets &&
        tickets.filter((ticket) => ticket.status === "CONFIRMED").length) ||
      0;
    const reservedTickets =
      (tickets &&
        tickets.filter((ticket) => ticket.status === "RESERVED").length) ||
      0;
    const unSoldTickets =
      (tickets &&
        tickets.filter((ticket) => ticket.status === "CANCELED").length) ||
      0;
    const unconvertedTickets = 0;

    const stats = {
      totalIncome,
      totalProfit,
      totalTickets,
      soldTickets,
      reservedTickets,
      unconvertedTickets,
      unSoldTickets,
    };

    return stats;
  } catch (error) {
    console.error(error);
  }
}

export async function getIncomeChartStats(searchParams: {
  operator?: string;
  startDate?: string;
  endDate?: string;
}): Promise<IncomeChartStats | null | undefined> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const { operator, startDate, endDate } = searchParams;

    const start = startDate
      ? new Date(parseInt(startDate))
      : (() => {
          const date = new Date();
          date.setMonth(date.getMonth() - 2);
          return date;
        })();

    const end = endDate ? new Date(parseInt(endDate)) : new Date();
    let operatorFilter;
    if (operator) {
      operatorFilter = operator;
    }

    let tickets;

    if (
      session.role === RolesEnum.SuperAdmin ||
      session.role === RolesEnum.KupiUser
    ) {
      tickets = await db.tickets.findMany({
        where: {
          operatorId: operatorFilter,
          reservedAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          transaction: true,
        },
      });
    } else if (
      session.role === RolesEnum.BusCompanyAdmin ||
      session.role === RolesEnum.BusCompanyUser
    ) {
      tickets = await db.tickets.findMany({
        where: {
          operatorId: session.operatorId,
          reservedAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          transaction: true,
        },
      });
    }

    const wrappedTickets: TicketsDataTypeDashboard[] =
      tickets?.map((ticket) => ({
        tickets: ticket,
        transaction: ticket.transaction || null,
      })) || [];

    const monthlyTotals: { [key: string]: number } = {};

    wrappedTickets.forEach((ticket) => {
      const transaction = ticket.transaction;
      const paidAt = transaction?.paidAt;

      if (paidAt) {
        const month = format(paidAt, "MMM yyyy");

        if (!monthlyTotals[month]) {
          monthlyTotals[month] = 0;
        }

        monthlyTotals[month] += transaction.totalAmount || 0;
      }
    });

    const labels = Object.keys(monthlyTotals);
    const data = Object.values(monthlyTotals);

    return { labels, data };
  } catch (error) {
    console.error(error);
  }
}

export async function getRoutesChartStats(searchParams: {
  operator?: string;
  startDate?: string;
  endDate?: string;
}): Promise<RoutesChartData | null | undefined> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const { operator, startDate, endDate } = searchParams;

    const start = startDate
      ? new Date(parseInt(startDate))
      : (() => {
          const date = new Date();
          date.setMonth(date.getMonth() - 2);
          return date;
        })();

    const end = endDate ? new Date(parseInt(endDate)) : new Date();
    let operatorFilter;
    if (operator) {
      operatorFilter = operator;
    }

    let tickets;

    if (
      session.role === RolesEnum.SuperAdmin ||
      session.role === RolesEnum.KupiUser
    ) {
      tickets = await db.tickets.findMany({
        where: {
          operatorId: operatorFilter,
          reservedAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          sourceCity: true,
          arrivalCity: true,
        },
      });
    } else if (
      session.role === RolesEnum.BusCompanyAdmin ||
      session.role === RolesEnum.BusCompanyUser
    ) {
      tickets = await db.tickets.findMany({
        where: {
          operatorId: session.operatorId,
          reservedAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          sourceCity: true,
          arrivalCity: true,
        },
      });
    }

    const routeCounts: { [key: string]: number } = {};

    tickets?.forEach((ticket) => {
      const source = ticket.sourceCity?.name;
      const arrival = ticket.arrivalCity?.name;

      if (source && arrival) {
        const route = `D - ${source}\nA - ${arrival}`;

        if (!routeCounts[route]) {
          routeCounts[route] = 0;
        }
        routeCounts[route]++;
      }
    });

    const chartData = {
      labels: Object.keys(routeCounts),
      counts: Object.values(routeCounts),
    };

    return chartData;
  } catch (error) {
    console.error(error);
  }
}
