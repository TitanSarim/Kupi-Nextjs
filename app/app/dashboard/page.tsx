import { auth } from "@/auth";
import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import NavBar from "@/components/NavBar";
import SideBar from "@/components/SideBar";
import Loading from "@/components/Loading";

const Dashboard = async () => {
  

  return (
    <div className="bg-page-backgound h-screen w-full">
      <p>Dashboard</p>
    </div>
  );
};

export default Dashboard;
