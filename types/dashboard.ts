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
