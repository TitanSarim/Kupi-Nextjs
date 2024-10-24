import { Tickets, Transactions } from "@prisma/client";

export type Stats = {
  totalIncome: number;
  totalProfit: number;
  totalTickets: number;
  soldTickets: number;
  reservedTickets: number;
  unconvertedTickets: number;
  unSoldTickets: number;
};

export type IncomeChartStats = {
  labels: string[];
  data: number[];
};

export type RoutesChartData = {
  labels: string[];
  counts: number[];
};

export type DashboardQuery = {
  searchParams: {
    operator?: string;
    startDate: string;
    endDate: string;
  };
};

export type TicketsDataTypeDashboard = {
  tickets: Tickets | null;
  transaction?: Transactions | null;
};
