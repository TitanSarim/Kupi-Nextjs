import { getBusOperators } from "@/actions/transactions.actions";
import SettingsClient from "@/components/settings/SettingsClient";
import TransactionClient from "@/components/transactionInvoices/TransactionClient";
import React from "react";

export default async function TransactionsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const operators = await getBusOperators();

  if (!operators) {
    return null;
  }

  return (
    <div className="bg-page-backgound h-full w-full flex items-start justify-center">
      <div className="w-11/12 bg-white mt-10 mb-12 h-fit shadow-sm rounded-md px-8 py-8">
        <div className="w-full">
          <TransactionClient operators={operators} />
        </div>
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
