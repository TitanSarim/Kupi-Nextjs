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
import { TicketsDataType, TicketsReturn } from "@/types/ticket";
import TicketDetailDialgue from "./TicketDetailDialgue";
import TableComponent from "../Table/Table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";

const TicketTable: React.FC<TicketsReturn> = ({
  ticketData,
  paginationData,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: paginationData.pageSize,
  });
  const [selectedTicket, setSelectedTicket] = useState<TicketsDataType | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleShowDetail = (id: string) => {
    const ticket = ticketData.find((t) => t.tickets.id === id) || null;
    setSelectedTicket(ticket);
    setDialogOpen(true);
  };

  const handleDownloadPdf = async (id: string) => {
    try {
      const response = `https://1921mideab.execute-api.us-east-1.amazonaws.com/getTicket?id=${id}`;
      if (response) {
        window.open(response, "_blank");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
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

  // Table initialization
  const columns: ColumnDef<TicketsDataType>[] = [
    {
      accessorKey: "reservedAt",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          {row.original?.tickets.reservedAt?.toLocaleTimeString("en-US", {
            timeZone: "Africa/Harare",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
          })}
        </div>
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
          <span>{row.original.tickets.ticketId}</span>
        </div>
      ),
    },
    {
      accessorKey: "CustomerName",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => <span>{row.original.customer?.name}</span>,
    },
    {
      accessorKey: "sourceCity",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Locations <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          <div>
            <span className="midGray-text">Departure:</span>{" "}
            {row.original.sourceCity.name}
          </div>
          <div>
            <span className="midGray-text">Arrival:</span>{" "}
            {row.original.arrivalCity.name}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          {row.original.tickets.status === "CONFIRMED" ? (
            <p className="text-green-600">Confirmed</p>
          ) : row.original.tickets.status === "CANCELED" ? (
            <p className="text-orange-500">Canceled </p>
          ) : (
            <p className="text-kupi-yellow">{row.original.tickets.status}</p>
          )}
        </div>
      ),
    },

    {
      accessorKey: "totalPrice",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => (
        <div>${row.original.tickets.priceDetails.totalPrice}</div>
      ),
    },
    {
      accessorKey: "action",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="p-2 rounded-md hover:bg-gray-100 border-none outline-none"
              >
                <Image
                  src="/img/icons/actions.svg"
                  alt="icon"
                  height={4.5}
                  width={4.5}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40  px-5 py-2">
              <button
                onClick={() => {
                  handleShowDetail(row.original.tickets.id);
                }}
                className="w-full text-left py-1 text-sm"
              >
                View
              </button>
              <DropdownMenuSeparator />
              <button
                className="w-full text-left py-1 text-sm"
                onClick={() => handleDownloadPdf(row.original.tickets.id)}
              >
                {" "}
                PDF Download
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: ticketData,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(paginationData.totalCount / pagination.pageSize),
  });

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
        <TicketDetailDialgue
          open={dialogOpen}
          onClose={handleCloseDialog}
          TicketData={selectedTicket}
        />
      </div>
    </div>
  );
};

export default TicketTable;
