import { auth } from "@/auth";
import React, { Suspense } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getAllOperators } from "@/actions/search.action";
import {
  getIncomeChartStats,
  getRoutesChartStats,
  getStats,
} from "@/actions/dashboard.actions";

const Dashboard = async () => {
  const operators = await getAllOperators();

  const stats = await getStats();
  const IncomeChartStats = await getIncomeChartStats();
  const RoutesChartStats = await getRoutesChartStats();
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
