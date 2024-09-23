"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import AddTreansactionDialogue from "./AddTreansactionDialogue";
import { Operators } from "@prisma/client";

interface ClientInterface {
  operators: Operators[];
}

const TransactionClient: React.FC<ClientInterface> = ({ operators }) => {
  const [selectedView, setSelectedView] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const router = useRouter();

  const handleAddTransaction = () => {
    setShowAddDialog(false);
  };

  useEffect(() => {
    if (selectedView === false) {
      router.push("/app/transactions/transactions");
    } else {
      router.push("/app/transactions/manualTransaction");
    }
  }, [selectedView, router]);

  return (
    <div className="w-full flex flex-row items-start justify-between">
      <p className="text-lg text-black font-semibold">Transaction List</p>
      <div className="flex flex-row items-center justify-center gap-4">
        <div className="flex flex-row gap-10 border-2 border-gray-400 px-4 py-3 rounded-lg box-bg">
          <p className="darkGray-text font-normal text-sm">Transactions Type</p>
          <label className="switch">
            <input
              type="checkbox"
              checked={selectedView}
              onChange={() => setSelectedView((prevChecked) => !prevChecked)}
            />
            <span className="slider round"></span>
          </label>
        </div>
        {selectedView && (
          <button
            onClick={() => setShowAddDialog(true)}
            className="bg-kupi-yellow py-3 px-4 outtline-none border-none rounded-lg"
          >
            Add Transaction
          </button>
        )}
      </div>

      <AddTreansactionDialogue
        open={showAddDialog}
        onClose={handleAddTransaction}
        operators={operators}
      />
    </div>
  );
};

export default TransactionClient;
