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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import TableComponent from "../Table/Table";
import Link from "next/link";
import { OperatorStatus } from "@prisma/client";
import { TicketSources } from "@/types/discount";
import {
  updateStatus,
  resendInvite,
  accountStatus,
  deleteAccount,
} from "@/actions/operators.action";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import DeleteOperator from "./DeleteOperator";

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

  const handleResendInvite = async (id: string) => {
    try {
      const response = await resendInvite(id);
      if (response === true) {
        toast.success("Invite resent successfully");
      } else if (
        response === false ||
        response === null ||
        response === undefined
      ) {
        toast.error("Failed to resend invite");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSuspendAccount = async (id: string, status: string) => {
    try {
      const response = await accountStatus(id, status);
      if (response === true) {
        toast.success("Account status updated successfully");
      }
    } catch (error) {
      console.error(error);
    }
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

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleDeleteAccount = (id: string) => {
    const operator = operators.find((o) => o.operators.id === id) || null;
    if (!operator) {
      setDialogOpen(false);
      return null;
    }
    setSelectedOperator(operator);
    setDialogOpen(true);
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
          {row.original?.operators?.joiningDate &&
            new Date(row.original.operators.joiningDate).toLocaleDateString(
              "en-UK",
              {
                timeZone: "Africa/Harare",
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
      accessorKey: "isLive",
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
              <DropdownMenuContent className="w-52  px-5 py-2">
                {row.original.operators.status === "REGISTERED" ? (
                  ""
                ) : row.original.operators.status === "SUSPENDED" ? (
                  ""
                ) : (
                  <>
                    <button
                      className="w-full text-left py-1 text-sm"
                      onClick={() =>
                        handleResendInvite(row.original.operators.id)
                      }
                    >
                      Resend Email
                    </button>
                    <DropdownMenuSeparator />
                  </>
                )}
                {row.original.operators.status === "INVITED" ? (
                  ""
                ) : (
                  <button
                    className="w-full text-left py-1 text-sm"
                    onClick={() =>
                      handleSuspendAccount(
                        row.original.operators.id,
                        row.original.operators.status
                      )
                    }
                  >
                    {row.original.operators.status === "SUSPENDED"
                      ? "Reactivate Account"
                      : "Suspend Account"}
                  </button>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
      {operators.length === 0 ? (
        <div>
          <p className="text-center text-gray-500 text-lg">
            No operators found. Please check the search criteria.
          </p>
        </div>
      ) : (
        <TableComponent
          paginationData={paginationData}
          setPagination={setPagination}
          pagination={pagination}
          tableData={table}
        />
      )}

      <DeleteOperator
        open={dialogOpen}
        onClose={handleCloseDialog}
        id={selectedOperator?.operators.id}
      />
    </div>
  );
};

export default OperatorsTable;
