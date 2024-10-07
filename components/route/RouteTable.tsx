"use client";
import React, { useState, useEffect, startTransition } from "react";
import {
  ColumnDef,
  SortingState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import TableComponent from "../Table/Table";
import { RouteDataType, PaginationDataType } from "@/types/route";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteRoute } from "@/actions/route.action";

interface RouteTableProps {
  routeData: RouteDataType[];
  paginationData: PaginationDataType;
  onEditRoute: (id: string) => void;
}

const RouteTable: React.FC<RouteTableProps> = ({
  routeData,
  paginationData,
  onEditRoute,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [pagination, setPagination] = useState({
    pageIndex: paginationData.pageIndex || 0,
    pageSize: paginationData.pageSize || 10,
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  // Function to update the URL for pagination and sorting
  const updateUrl = () => {
    const sortingParam = sorting
      .map((sort) => `${sort.id}_${sort.desc ? "desc" : "asc"}`)
      .join(",");
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageIndex", pagination.pageIndex.toString());
    params.set("pageSize", pagination.pageSize.toString());
    if (sortingParam) {
      params.set("sort", sortingParam);
    } else {
      params.delete("sort");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Handle pagination and sorting changes
  useEffect(() => {
    updateUrl();
  }, [pagination, sorting]);

  // Function to handle route deletion
  const handleDeleteRoute = async (id: string) => {
    await deleteRoute(id);
    startTransition(() => {
      router.refresh();
    });
  };

  // Table column definitions
  const columns: ColumnDef<RouteDataType>[] = [
    {
      accessorKey: "busIdentifier",
      header: ({ column }) => (
        <button
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc", false)
          }
        >
          Bus Number <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => <span>{row.original.busIdentifier}</span>,
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <button
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc", false)
          }
        >
          Route Type <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => <span>{row.original.type}</span>,
    },
    {
      accessorKey: "departureCity",
      header: ({ column }) => (
        <button
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc", false)
          }
        >
          Departure City <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => <span>{row.original.departureCity}</span>,
    },
    {
      accessorKey: "arrivalCity",
      header: ({ column }) => (
        <button
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc", false)
          }
        >
          Arrival City <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => <span>{row.original.arrivalCity}</span>,
    },
    {
      accessorKey: "timings",
      header: ({ column }) => (
        <button
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc", false)
          }
        >
          Timings <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          <div>
            <span className="midGray-text">Departure:</span>{" "}
            {row.original.departureTime}
          </div>
          <div>
            <span className="midGray-text">Arrival:</span>{" "}
            {row.original.arrivalTime}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <button
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc", false)
          }
        >
          Status <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => (
        <p
          className={
            row.original.status === "CONFIRMED"
              ? "text-green-600"
              : "text-kupi-yellow"
          }
        >
          {row.original.status}
        </p>
      ),
    },
    {
      accessorKey: "action",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-2">
                <Image
                  src="/img/icons/actions.svg"
                  alt="Actions"
                  width={4.5}
                  height={4.5}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditRoute(row.original.id)}>
                Edit Route
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteRoute(row.original.id)}
              >
                Delete Route
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: routeData,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
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
    </div>
  );
};

export default RouteTable;
