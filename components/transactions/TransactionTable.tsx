"use client";
import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Image from "next/image";
import TransactionDetailDialgue from "./TransactionDetailDialgue";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { TransactionReturn, TransactionsType } from "@/types/transactions";
import { TicketsDataType } from "@/types/ticket";
import { getTicketById } from "@/actions/ticket.action";
import TicketDetailDialgue from "../tickets/TicketDetailDialgue";
import * as XLSX from "xlsx";
import TableComponent from "../Table/Table";

const TransactionTable: React.FC<TransactionReturn> = ({
  transactionData,
  paginationData,
  cities,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: paginationData.pageSize,
  });
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionsType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ticketDialogue, setTicketDialogue] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketsDataType | null>(
    null
  );

  const handleShowDetail = (id: string) => {
    const transaction =
      transactionData.find((t) => t.transactions.id === id) || null;
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };

  const handleShowTicketDetail = async (ticketId: string) => {
    try {
      const ticket = await getTicketById(ticketId);
      if (!ticket) {
        return null;
      }
      setSelectedTicket(ticket);
      setTicketDialogue(true);
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  const handleTicketDialog = () => {
    setTicketDialogue(false);
  };

  const updateUrl = (newPageIndex?: number, newPageSize?: number) => {
    const sortingParam = sorting
      .map((sort) => `${sort.id}_${sort.desc ? "desc" : "asc"}`)
      .join(",");
    const params = new URLSearchParams(searchParams.toString());
    params.set(
      "pageIndex",
      (newPageIndex !== undefined
        ? newPageIndex
        : pagination.pageIndex
      ).toString()
    );
    params.set(
      "pageSize",
      (newPageSize !== undefined ? newPageSize : pagination.pageSize).toString()
    );
    params.set("sort", sortingParam);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (pagination.pageIndex >= 0 && pagination.pageSize > 0) {
      updateUrl(pagination.pageIndex, pagination.pageSize);
    }
  }, [pagination, updateUrl]);

  // table initalizes here
  const columns: ColumnDef<TransactionsType>[] = [
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
          {row.original?.transactions?.paidAt?.toLocaleTimeString("en-US", {
            timeZone: "UTC",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      accessorKey: "ticketId",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ticket ID <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          {row.original.tickets?.map((ticket, i) => (
            <button
              key={i}
              onClick={() => handleShowTicketDetail(ticket.ticketId)}
              className="bg-gray-200 rounded-md p-1 ml-1"
            >
              {ticket.ticketId}
            </button>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "operator",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Operator <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => {
        if (!row.original.customer) {
          return <span>NA</span>;
        }
        return (
          <span>{row.original.carmaDetails?.selectedAvailability.carrier}</span>
        );
      },
    },
    {
      accessorKey: "paymentMethod",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Payment Method <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => {
        return <span>{row.original?.transactions.paymentMethod || "N/A"}</span>;
      },
    },
    {
      accessorKey: "source",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Source <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => <div>{row.original?.tickets?.[0]?.source}</div>,
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

  const handleDownload = () => {
    const exportData = transactionData.map((transaction) => ({
      TicketID:
        transaction.tickets?.map((ticket) => ticket.ticketId).join(", ") ||
        "N/A",
      Customer: transaction.customer?.name || "N/A",
      PaymentMethod: transaction.paymentReference?.providerName || "N/A",
      Amount: transaction.transactions?.totalAmount || "N/A",
      Status: transaction.paymentReference?.status || "N/A",
      Date: transaction.transactions?.paidAt
        ? new Date(transaction.transactions.paidAt).toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    XLSX.writeFile(workbook, "transactions_data.xlsx");
  };

  // actual table
  return (
    <div className="w-full mt-8">
      <TableComponent
        paginationData={paginationData}
        setPagination={setPagination}
        pagination={pagination}
        tableData={table}
        handleDownload={handleDownload}
      />

      {/* dialogue */}
      <div className="w-full">
        <TransactionDetailDialgue
          open={dialogOpen}
          onClose={handleCloseDialog}
          TransactionData={selectedTransaction}
        />
        <TicketDetailDialgue
          open={ticketDialogue}
          onClose={handleTicketDialog}
          TicketData={selectedTicket}
        />
      </div>
    </div>
  );
};

export default TransactionTable;
