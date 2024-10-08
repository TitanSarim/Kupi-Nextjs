"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { RolesEnum } from "@/types/auth";

const SettingsClient = () => {
  const session = useSession();

  const [selectedView, setSelectedView] = useState("viewAdmin");

  const router = useRouter();

  const handleChangeView = (view: string) => {
    setSelectedView(view);
    localStorage.setItem("viewAdmin", view);
  };

  useEffect(() => {
    const storedValue = localStorage.getItem("viewAdmin");
    if (storedValue === "viewAdmin") {
      setSelectedView("viewAdmin");
    } else {
      setSelectedView("viewOperator");
      localStorage.setItem("viewAdmin", "false");
    }
    if (selectedView === "viewAdmin") {
      router.push("/app/settings/admin");
    } else if (selectedView === "viewOperator") {
      router.push("/app/settings/operator");
    }
  }, [selectedView, router]);

  return (
    <div className="relative w-11/12 py-4 mt-4 flex flex-row justify-between">
      <p className="text-lg text-black font-semibold">
        {(selectedView === "viewAdmin" &&
          session.data?.role === RolesEnum.SuperAdmin) ||
        session.data?.role === RolesEnum.KupiUser
          ? "Kupi Admin"
          : "Operator"}
      </p>
      {session.data?.role === RolesEnum.SuperAdmin ||
      session.data?.role === RolesEnum.KupiUser ? (
        <div className="flex flex-row gap-8">
          <div className="radio-input bg-white border-2 rounded-lg py-2 px-3">
            <input
              type="radio"
              id="viewAdmin"
              name="value-radio"
              checked={selectedView === "viewAdmin"}
              onChange={() => handleChangeView("viewAdmin")}
            />
            <div className="circle"></div>
            <label htmlFor="viewAdmin" className="text-sm	darkGray-text">
              View Admin
            </label>
          </div>
          <div className="radio-input bg-white border-2 rounded-lg py-2 px-3">
            <input
              type="radio"
              id="viewOperator"
              name="value-radio"
              checked={selectedView === "viewOperator"}
              onChange={() => handleChangeView("viewOperator")}
            />
            <div className="circle"></div>
            <label htmlFor="viewOperator" className="text-sm	darkGray-text">
              View Operator
            </label>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default SettingsClient;
