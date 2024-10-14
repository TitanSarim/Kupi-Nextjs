"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import AddTreansactionDialogue from "./AddTreansactionDialogue";
import { OperatorsType } from "@/types/transactions";

interface ClientInterface {
  operators: OperatorsType[];
}

const TransactionClient: React.FC<ClientInterface> = ({ operators }) => {
  const [selectedView, setSelectedView] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleMaintainace = (event: React.ChangeEvent<HTMLInputElement>) => {
    const toggle = event.target.checked;
    setSelectedView(toggle);
    localStorage.setItem("manualTransaction", toggle ? "true" : "false");
    try {
    } catch (error) {
      console.error("Error");
    }
  };

  const handleAddTransaction = () => {
    setShowAddDialog(false);
  };

  useEffect(() => {
    if (pathname === "/app/transactions/transactions") {
      setSelectedView(false);
    } else {
      setSelectedView(true);
    }
  }, [pathname]);

  useEffect(() => {
    const storedValue = localStorage.getItem("manualTransaction");
    if (storedValue === "true") {
      setSelectedView(true);
    } else {
      setSelectedView(false);
      localStorage.setItem("manualTransaction", "false");
    }
    if (selectedView === false) {
      router.push("/app/transactions/transactions");
    } else {
      router.push("/app/transactions/manualTransaction");
    }
  }, [selectedView, router]);

  return (
    <div className="w-full flex flex-row items-start justify-between">
      <p className="text-lg text-black font-semibold">Transactions List</p>
      <div className="flex flex-row items-center justify-center gap-4">
        <div className="flex flex-row gap-10 border-2 border-gray-400 px-4 py-3 rounded-lg box-bg">
          <p className="darkGray-text font-normal text-sm">Transactions Type</p>
          <label className="switch">
            <input
              type="checkbox"
              checked={selectedView}
              onChange={handleMaintainace}
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
