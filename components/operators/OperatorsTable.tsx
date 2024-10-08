"use client";
import { OperatorsData, OperatorsDataReturn } from "@/types/operator";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUpDown } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import TableComponent from "../Table/Table";
import Link from "next/link";
import { OperatorStatus } from "@prisma/client";
import UpdateInviteOperator from "./UpdateInviteOperator";
import { TicketSources } from "@/types/discount";
import { updateStatus } from "@/actions/operators.action";
import toast from "react-hot-toast";

interface LiveStatuses {
  [key: string]: boolean;
}

const OperatorsTable: React.FC<OperatorsData> = ({
  operators,
  paginationData,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: paginationData.pageSize,
  });
  const [selectedOperator, setSelectedOperator] =
    useState<OperatorsDataReturn | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [liveStatuses, setLiveStatuses] = useState<LiveStatuses>({});

  const handleShowDetail = (id: string) => {
    const operator = operators.find((O) => O.operators.id === id) || null;
    if (!operator) {
      return null;
    }
    setSelectedOperator(operator);
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

  const handleChange = async (id: string) => {
    const newLiveStatus = !liveStatuses[id];

    setLiveStatuses((prev) => ({
      ...prev,
      [id]: newLiveStatus,
    }));
    try {
      const liveStatus = await updateStatus(id, newLiveStatus);
      if (liveStatus === true) {
        toast.success("Status updated successfully");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (pagination.pageIndex >= 0 && pagination.pageSize > 0) {
      updateUrl(pagination.pageIndex, pagination.pageSize);
    }
  }, [pagination, updateUrl]);

  const columns: ColumnDef<OperatorsDataReturn>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => {
        const operatorName = row.original.operators.name || "";
        const limitedName =
          operatorName.length > 6
            ? `${operatorName.slice(0, 6)}...`
            : operatorName;

        return (
          <span className="text-xs">
            <span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  >
                    {limitedName}
                  </TooltipTrigger>
                  <TooltipContent className="bg-white border-2 px-2 py-2">
                    {row.original.operators.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
          </span>
        );
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
      cell: ({ row }) => (
        <div className="text-xs">{row.original?.operators.source}</div>
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
        <>
          {row.original.operators.source === TicketSources.CARMA ? (
            <div>
              <p className="text-green-600 text-xs font-semibold">Registered</p>
            </div>
          ) : (
            <div>
              {row.original.operators.status === OperatorStatus.INVITED ? (
                <p className="text-yellow-500 text-xs font-semibold">Invited</p>
              ) : row.original.operators.status ===
                OperatorStatus.REGISTERED ? (
                <p className="text-green-600 text-xs font-semibold">
                  Registered
                </p>
              ) : (
                <p className="text-red-500 text-xs font-semibold">Suspended</p>
              )}
            </div>
          )}
        </>
      ),
    },
    {
      accessorKey: "joiningDate",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Joining Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-xs">
          {row.original?.operators.joiningDate &&
            new Date(row.original.operators.joiningDate).toLocaleDateString(
              "en-US",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            )}
        </div>
      ),
    },
    {
      accessorKey: "Users",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Users <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => (
        <>
          {row.original.operators.source === TicketSources.KUPI && (
            <div className="flex flex-row gap-2">
              <Image
                src="/img/sidebar/users.svg"
                alt="User"
                width={18}
                height={18}
              />
              <Link href="/app/bus-operators" className="underline text-xs">
                Users
              </Link>
            </div>
          )}
        </>
      ),
    },
    {
      accessorKey: "Fleet",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fleet <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => (
        <>
          {row.original.operators.source === TicketSources.KUPI && (
            <div className="flex flex-row gap-2">
              <Image
                src="/img/sidebar/fleet.svg"
                alt="User"
                width={18}
                height={18}
              />
              <Link href="/app/bus-operators" className="underline text-xs">
                Fleet
              </Link>
            </div>
          )}
        </>
      ),
    },
    {
      accessorKey: "Routes",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Routes <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => (
        <>
          {row.original.operators.source === TicketSources.KUPI && (
            <div className="flex flex-row gap-2">
              <Image
                src="/img/sidebar/routes.svg"
                alt="User"
                width={18}
                height={18}
              />
              <Link href="/app/bus-operators" className="underline text-xs">
                Routes
              </Link>
            </div>
          )}
        </>
      ),
    },

    {
      accessorKey: "Tickets",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tickets <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-row gap-2">
          <Image
            src="/img/sidebar/tickets.svg"
            alt="User"
            width={18}
            height={18}
          />
          <Link href="/app/bus-operators" className="underline text-xs">
            Tickets
          </Link>
        </div>
      ),
    },
    {
      accessorKey: "Transactions",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Transactions <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-row gap-2">
          <Image
            src="/img/sidebar/transactions.svg"
            alt="User"
            width={18}
            height={18}
          />
          <Link href="/app/bus-operators" className="underline text-xs">
            Transactions
          </Link>
        </div>
      ),
    },
    {
      accessorKey: "Settings",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Settings <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => (
        <>
          {row.original.operators.source === TicketSources.KUPI && (
            <div className="flex flex-row gap-2">
              <Image
                src="/img/sidebar/settings.svg"
                alt="User"
                width={18}
                height={18}
              />
              <Link href="/app/bus-operators" className="underline text-xs">
                Settings
              </Link>
            </div>
          )}
        </>
      ),
    },
    {
      accessorKey: "Live",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Live <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => (
        <>
          <div className="">
            <label className="switch-live">
              <input
                type="checkbox"
                checked={
                  liveStatuses[row.original.operators.id] ||
                  row.original.operators.isLive
                }
                onChange={(e) => {
                  handleChange(row.original.operators.id);
                }}
              />
              <span className="slider-live round-live"></span>
            </label>
          </div>
        </>
      ),
    },
    {
      accessorKey: "action",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          {row.original.operators.source === TicketSources.KUPI && (
            <button
              onClick={() => {
                handleShowDetail(row.original.operators.id);
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
          )}
        </div>
      ),
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: operators,
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

      <UpdateInviteOperator
        operator={selectedOperator}
        open={dialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
};

export default OperatorsTable;
