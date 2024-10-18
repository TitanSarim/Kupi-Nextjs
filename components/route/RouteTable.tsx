"use client";
import React, { useState, useEffect, startTransition } from "react";
import {
  ColumnDef,
  SortingState,
  getCoreRowModel,
  useReactTable,
  Column,
  Row,
} from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { updateRouteLiveStatus } from "@/actions/route.action";
import Switch from "@/components/ui/switch";
import { useSession } from "next-auth/react";
import { RolesEnum } from "@/types/auth";
import DeleteModal from "../ui/delete-modal";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  // Handle showing delete modal
  const handleDeleteModal = (id: string) => {
    setSelectedRouteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedRouteId(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedRouteId) {
      await deleteRoute(selectedRouteId);
      startTransition(() => {
        router.refresh();
      });
      handleCloseModal();
    }
  };

  const handleLiveStatusChange = async (id: string, isLive: boolean) => {
    try {
      const result = await updateRouteLiveStatus(id, isLive);
      if (result) {
        startTransition(() => {
          router.refresh();
        });
      } else {
        console.error("Failed to update isLive status");
      }
    } catch (error) {
      console.error("Error updating isLive status:", error);
    }
  };

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
  const session = useSession();

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
      cell: ({ row }) => {
        const routeType = row.original.type;
        const selectedDays = row.original.days;

        return routeType === "WEEKLY" ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>{routeType}</TooltipTrigger>
              <TooltipContent className="bg-white border-2 px-2 py-2">
                {selectedDays.length > 0
                  ? selectedDays.join(", ")
                  : "No days selected"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span>{routeType}</span>
        );
      },
    },

    {
      accessorKey: "routeLocation",
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
            {row.original.departureCity || "N/A"}
          </div>
          <div>
            <span className="midGray-text">Arrival:</span>{" "}
            {row.original.arrivalCity || "N/A"}
          </div>
        </div>
      ),
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
    ...(session.data?.role === RolesEnum.SuperAdmin ||
    session.data?.role === RolesEnum.KupiUser
      ? [
          {
            accessorKey: "operatorName",
            header: ({ column }: { column: Column<RouteDataType> }) => (
              <button
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc", false)
                }
              >
                Operator <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </button>
            ),
            cell: ({ row }: { row: Row<RouteDataType> }) => (
              <span>{row.original.operatorName}</span>
            ),
          },
        ]
      : []),
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
            row.original.status === "APPROVED"
              ? "text-green-600"
              : "text-kupi-yellow"
          }
        >
          {row.original.status}
        </p>
      ),
    },
    {
      accessorKey: "isLive",
      header: "Live",
      cell: ({ row }) => (
        <div className="flex flex-row gap-10">
          <label className="switch">
            <input
              type="checkbox"
              checked={row.original.isLive}
              onChange={(e) =>
                handleLiveStatusChange(row.original.id, e.target.checked)
              }
              disabled={row.original.status !== "APPROVED"}
            />
            <span className="slider round"></span>
          </label>
        </div>
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
            <DropdownMenuContent
              align="end"
              side="bottom"
              className="w-24 dropdown-fixed"
              sideOffset={5}
              avoidCollisions={false}
              alignOffset={5}
            >
              <DropdownMenuItem
                className="gap-2"
                onClick={() => onEditRoute(row.original.id)}
              >
                <Image
                  src="/img/edit.svg"
                  alt="Edit Route"
                  width={20}
                  height={20}
                />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onClick={() => handleDeleteModal(row.original.id)}
              >
                <Image
                  src="/img/delete.svg"
                  alt="Delete Route"
                  width={20}
                  height={20}
                />
                Delete
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
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        message="You want to delete this route"
      />
    </div>
  );
};

export default RouteTable;
