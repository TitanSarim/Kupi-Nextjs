"use client";
import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  ManualTransactionReturn,
  ManualTransactionsType,
} from "@/types/transactions";
import { openPdf } from "@/actions/transactions.actions";
import UpdateTreansactionDialogue from "./UpdateTreansactionDialogue";
import TableComponent from "../Table/Table";

const ManualTransactionTable: React.FC<ManualTransactionReturn> = ({
  transactionData,
  paginationData,
  operators,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: paginationData.pageSize,
  });
  const [selectedTransaction, setSelectedTransaction] =
    useState<ManualTransactionsType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleShowDetail = (id: string) => {
    const transaction =
      transactionData.find((t) => t.transactions.id === id) || null;
    if (!transaction) {
      setDialogOpen(false);
      return null;
    }
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const updateUrl = (newPageIndex?: number, newPageSize?: number) => {
    const sortingParam = sorting
      .map((sort) => `${sort.id}_${sort.desc ? "desc" : "asc"}`)
      .join(",");
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageIndex", pagination?.pageIndex?.toString() ?? "");
    params.set(
      "pageSize",
      (newPageSize !== undefined ? newPageSize : pagination.pageSize).toString()
    );
    params.set("sort", sortingParam);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePdfOpen = async (path: string | undefined) => {
    if (!path) {
      return null;
    }
    try {
      const url = await openPdf(path);
      if (url) {
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Error opening PDF", error);
    }
  };

  useEffect(() => {
    if (pagination.pageIndex >= 0 && pagination.pageSize > 0) {
      updateUrl(pagination.pageIndex, pagination.pageSize);
    }
  }, [pagination, updateUrl]);

  // table initalizes here
  const columns: ColumnDef<ManualTransactionsType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Transaction ID <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => {
        const transactionId = row.original.transactions.id;
        const isFullIdVisible = expandedId === transactionId;

        return (
          <div className="relative inline-block">
            <button
              className="bg-yellow-300 px-3 p-1 rounded-md"
              onClick={() =>
                setExpandedId(isFullIdVisible ? null : transactionId)
              }
            >
              {isFullIdVisible
                ? transactionId
                : transactionId.slice(0, 5) + "..."}
            </button>
          </div>
        );
      },
    },
    {
      accessorKey: "BusOperator",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Bus Operator <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => {
        const operatorName = row.original.operators?.[0]?.name || "";
        const limitedName =
          operatorName.length > 9
            ? `${operatorName.slice(0, 9)}...`
            : operatorName;

        return <span>{limitedName}</span>;
      },
    },
    {
      accessorKey: "paymentPeriod",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Payment Period <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => {
        return <span>{row.original.transactions.paymentPeriod}</span>;
      },
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => <div>${row.original.transactions.totalAmount}</div>,
    },
    {
      accessorKey: "invoice",
      header: ({ column }) => <button>Invoice</button>,
      cell: ({ row }) => (
        <button
          onClick={() => handlePdfOpen(row.original.transactions.invoice?.path)}
        >
          <Image src="/img/icons/pdf.svg" alt="pdf" width={25} height={25} />
        </button>
      ),
    },
    {
      accessorKey: "receipt",
      header: ({ column }) => <button>Receipt</button>,
      cell: ({ row }) => (
        <button
          onClick={() => handlePdfOpen(row.original.transactions.recipt?.path)}
        >
          <Image src="/img/icons/pdf.svg" alt="pdf" width={25} height={25} />
        </button>
      ),
    },
    {
      accessorKey: "paidAt",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => (
        <span>
          {row.original.transactions.paidAt.toLocaleTimeString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
          })}
        </span>
      ),
    },
    {
      accessorKey: "action",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <button
            onClick={() => {
              handleShowDetail(row.original.transactions.id);
            }}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Image
              src="/img/icons/actions.svg"
              alt="icon"
              height={4.5}
              width={4.5}
            />
          </button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: transactionData,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(paginationData.totalCount / pagination.pageSize),
  });

  // actual table
  return (
    <div className="w-full mt-8">
      <TableComponent
        paginationData={paginationData}
        setPagination={setPagination}
        pagination={pagination}
        tableData={table}
      />
      {/* Dialogue */}
      <div className="w-full">
        <UpdateTreansactionDialogue
          open={dialogOpen}
          onClose={handleCloseDialog}
          operators={operators}
          transaction={selectedTransaction || undefined}
        />
      </div>
    </div>
  );
};

export default ManualTransactionTable;
