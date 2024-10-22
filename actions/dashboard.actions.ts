"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import { IncomeChartStats, RoutesChartData, Stats } from "@/types/dashboard";
import { format } from "date-fns";

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

    const { startDate, endDate } = searchParams;

    const start = startDate
      ? new Date(parseInt(startDate))
      : (() => {
          const date = new Date();
          date.setMonth(date.getMonth() - 2);
          return date;
        })();

    const end = endDate ? new Date(parseInt(endDate)) : new Date();

    const tickets = await db.tickets.findMany({
      where: {
        reservedAt: {
          gte: start,
          lte: end,
        },
      },
    });

    const totalIncome = tickets.reduce(
      (sum, ticket) => sum + ticket.priceDetails.totalPrice,
      0
    );
    const totalProfit = tickets.reduce(
      (sum, ticket) =>
        sum + ticket.priceDetails.kupiProfit + ticket.priceDetails.kupiMarkup,
      0
    );

    const totalTickets = tickets.length;
    const soldTickets = tickets.filter(
      (ticket) => ticket.status === "CONFIRMED"
    ).length;
    const reservedTickets = tickets.filter(
      (ticket) => ticket.status === "RESERVED"
    ).length;
    const unSoldTickets = tickets.filter(
      (ticket) => ticket.status === "CANCELED"
    ).length;
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

    const { startDate, endDate } = searchParams;

    const start = startDate
      ? new Date(parseInt(startDate))
      : (() => {
          const date = new Date();
          date.setMonth(date.getMonth() - 2);
          return date;
        })();

    const end = endDate ? new Date(parseInt(endDate)) : new Date();

    const transactions = await db.transactions.findMany({
      where: {
        paidAt: {
          not: null,
          gte: start,
          lte: end,
        },
      },
    });

    const monthlyTotals: { [key: string]: number } = {};

    transactions.forEach((transaction) => {
      const paidAt = transaction.paidAt;

      if (paidAt) {
        const month = format(paidAt, "MMM yyyy");

        if (!monthlyTotals[month]) {
          monthlyTotals[month] = 0;
        }

        monthlyTotals[month] += transaction.totalAmount;
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

    const { startDate, endDate } = searchParams;

    const start = startDate
      ? new Date(parseInt(startDate))
      : (() => {
          const date = new Date();
          date.setMonth(date.getMonth() - 2);
          return date;
        })();

    const end = endDate ? new Date(parseInt(endDate)) : new Date();

    const tickets = await db.tickets.findMany({
      where: {
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

    const routeCounts: { [key: string]: number } = {};

    tickets.forEach((ticket) => {
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
