import {
  getAllManualTransactions,
  getBusOperators,
} from "@/actions/transactions.actions";
import ManualTransactionList from "@/components/transactionInvoices/ManualTransactionList";
import { ManualTransactionQuery } from "@/types/transactions";
import React, { Suspense } from "react";

const Transactions = async ({
  searchParams,
}: {
  searchParams: ManualTransactionQuery["searchParams"];
}) => {
  const data = await getAllManualTransactions(searchParams);
  const operators = await getBusOperators();

  if (!operators) {
    return null;
  }

  if (!data) {
    return (
      <div className="bg-page-backgound flex items-start justify-center h-screen w-full">
        <div className="mt-32">
          <p>No Data Found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full">
        <ManualTransactionList
          transactionData={data?.transactionData}
          paginationData={data.paginationData}
          operators={operators}
        />
      </div>
    </div>
  );
};

export default Transactions;
