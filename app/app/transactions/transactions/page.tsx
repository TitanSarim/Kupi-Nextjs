import { getAllMatchedCity } from "@/actions/search.action";
import { getAllTransactions } from "@/actions/transactions.actions";
import TransactionList from "@/components/transactions/TransactionList";
import { TransactionQuery } from "@/types/transactions";
import React, { Suspense } from "react";

const Transactions = async ({
  searchParams,
}: {
  searchParams: TransactionQuery["searchParams"];
}) => {
  const data = await getAllTransactions(searchParams);
  const cities = await getAllMatchedCity();

  if (!data || !cities) {
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
        <TransactionList
          transactionData={data?.transactionData}
          cities={cities}
          paginationData={data.paginationData}
        />
      </div>
    </div>
  );
};

export default Transactions;
