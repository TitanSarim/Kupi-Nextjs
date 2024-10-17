import { auth } from "@/auth";
import React, { Suspense } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getAllOperators } from "@/actions/search.action";

const Dashboard = async () => {
  const operators = await getAllOperators();

  if (!operators) {
    return null;
  }

  return (
    <div className="bg-page-backgound h-full w-full">
      <DashboardLayout operators={operators} />
    </div>
  );
};

export default Dashboard;
