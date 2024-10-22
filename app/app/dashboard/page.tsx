import { auth } from "@/auth";
import React, { Suspense } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getAllOperators } from "@/actions/search.action";
import {
  getIncomeChartStats,
  getRoutesChartStats,
  getStats,
} from "@/actions/dashboard.actions";
import { DashboardQuery } from "@/types/dashboard";

const Dashboard = async ({
  searchParams,
}: {
  searchParams: DashboardQuery["searchParams"];
}) => {
  const operators = await getAllOperators();

  const stats = await getStats(searchParams);
  const IncomeChartStats = await getIncomeChartStats(searchParams);
  const RoutesChartStats = await getRoutesChartStats(searchParams);
  if (!operators) {
    return null;
  }

  return (
    <div className="bg-page-backgound h-full w-full">
      <DashboardLayout
        operators={operators}
        stats={stats}
        IncomeChartStats={IncomeChartStats}
        RoutesChartStats={RoutesChartStats}
      />
    </div>
  );
};

export default Dashboard;
