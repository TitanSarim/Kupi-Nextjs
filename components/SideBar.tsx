"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

const SideBar : React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="relative lightGray h-[100%] w-72 px-2 py-2 shadow-sm">
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
          href={"/app/transactions"}
          className={`relative flex flex-row items-center justify-start gap-3 py-3 px-3 rounded-lg transition-all duration-500 text-base 
            ${pathname === "/app/transactions" ? "bg-kupi-yellow" : ""}`}
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
          href={"/app/settings"}
          className={`relative flex flex-row items-center justify-start gap-3 py-3 px-3 rounded-lg transition-all duration-500 text-base 
            ${pathname === "/app/settings" ? "bg-kupi-yellow" : ""}`}
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
