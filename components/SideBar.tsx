"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

type SideBarProps = {
  role?: string;
};

const SideBar: React.FC<SideBarProps> = ({ role }) => {
  const pathname = usePathname();

  const handleClientChnage = () => {
    localStorage.setItem("manualTransaction", "false");
  };
  const handleAdminViewChange = () => {
    localStorage.setItem("viewAdmin", "viewAdmin");
  };
  return (
    <div className="sticky top-0 h-screen lightGray  w-72 px-2 py-2 shadow-sm">
      <Image
        src="/img/icons/Kupi.png"
        alt="Kupi"
        width={150}
        height={150}
        className="mt-6"
      />

      <div className="px-2 mt-5 relative">
        <p className="midGray-text mb-3">MENU</p>

        <Link
          href={"/app/dashboard"}
          className={`relative flex flex-row items-center justify-start gap-3 py-3 px-3 rounded-lg transition-all duration-500 text-base 
            ${pathname === "/app/dashboard" ? "bg-kupi-yellow" : ""}`}
        >
          <Image
            src="/img/sidebar/dashboard.svg"
            alt="dashboard"
            height={24}
            width={24}
          />
          Dashboard
        </Link>

        {role === "SuperAdmin" && (
          <Link
            href={"/app/bus-operators"}
            className={`relative flex flex-row items-center justify-start gap-3 py-3 px-3 rounded-lg transition-all duration-500 text-base 
            ${pathname === "/app/bus-operators" ? "bg-kupi-yellow" : ""}`}
          >
            <Image
              src="/img/sidebar/bus-operator.svg"
              alt="dashboard"
              height={24}
              width={24}
            />
            Bus Operators
          </Link>
        )}

        <Link
          href={"/app/users-list"}
          className={`relative flex flex-row items-center justify-start gap-3 py-3 px-3 rounded-lg transition-all duration-500 text-base 
            ${pathname === "/app/users-list" ? "bg-kupi-yellow" : ""}`}
        >
          <Image
            src="/img/sidebar/users.svg"
            alt="dashboard"
            height={24}
            width={24}
          />
          Users List
        </Link>

        <Link
          href={"/app/fleet"}
          className={`relative flex flex-row items-center justify-start gap-3 py-3 px-3 rounded-lg transition-all duration-500 text-base 
            ${pathname === "/app/fleet" ? "bg-kupi-yellow" : ""}`}
        >
          <Image
            src="/img/sidebar/fleet.svg"
            alt="dashboard"
            height={24}
            width={24}
          />
          Fleet
        </Link>

        <Link
          href={"/app/routes"}
          className={`relative flex flex-row items-center justify-start gap-3 py-3 px-3 rounded-lg transition-all duration-500 text-base 
            ${pathname === "/app/routes" ? "bg-kupi-yellow" : ""}`}
        >
          <Image
            src="/img/sidebar/routes.svg"
            alt="dashboard"
            height={24}
            width={24}
          />
          Routes
        </Link>

        <Link
          href={"/app/tickets"}
          className={`relative flex flex-row items-center justify-start gap-3 py-3 px-3 rounded-lg transition-all duration-500 text-base 
            ${pathname === "/app/tickets" ? "bg-kupi-yellow" : ""}`}
        >
          <Image
            src="/img/sidebar/tickets.svg"
            alt="dashboard"
            height={24}
            width={24}
          />
          Tickets
        </Link>

        <Link
          href={"/app/discounts"}
          className={`relative flex flex-row items-center justify-start gap-3 py-3 px-3 rounded-lg transition-all duration-500 text-base 
            ${pathname === "/app/discounts" ? "bg-kupi-yellow" : ""}`}
        >
          <Image
            src="/img/sidebar/discount.svg"
            alt="dashboard"
            height={24}
            width={24}
          />
          Discounts
        </Link>

        <Link
          href={"/app/transactions/transactions"}
          className={`relative flex flex-row items-center justify-start gap-3 py-3 px-3 rounded-lg transition-all duration-500 text-base ${
            pathname === "/app/transactions/transactions" ||
            pathname === "/app/transactions/manualTransaction"
              ? "bg-kupi-yellow"
              : ""
          }`}
          onClick={handleClientChnage}
        >
          <Image
            src="/img/sidebar/transactions.svg"
            alt="dashboard"
            height={24}
            width={24}
          />
          Transactions
        </Link>

        <Link
          href={"/app/settings/admin"}
          className={`relative flex flex-row items-center justify-start gap-3 py-3 px-3 rounded-lg transition-all duration-500 text-base 
            ${pathname === "/app/settings/admin" ? "bg-kupi-yellow" : ""}`}
          onClick={handleAdminViewChange}
        >
          <Image
            src="/img/sidebar/settings.svg"
            alt="dashboard"
            height={24}
            width={24}
          />
          Settings
        </Link>
      </div>
    </div>
  );
};

export default SideBar;
