"use client";
import React, { useEffect, useState, startTransition } from "react";
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
// import TicketDetailDialgue from "./TicketDetailDialgue";
import TableComponent from "../Table/Table";
import { Busses } from "@prisma/client";
import { PaginationData } from "@/types/fleet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import UpdateBus from "./UpdateBus";
import toast from "react-hot-toast";
import { updateBusStatus } from "@/actions/fleet.actions";

interface fleetOptions {
  busses: Busses[];
  paginationData: PaginationData;
}

interface LiveStatuses {
  [key: string]: boolean;
}

const FleetTable: React.FC<fleetOptions> = ({ busses, paginationData }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: paginationData.pageSize,
  });
  const [selectedBus, setSelectedBus] = useState<Busses | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [liveStatuses, setLiveStatuses] = useState<LiveStatuses>({});

  const handleShowDetail = (id: string) => {
    const bus = busses.find((b) => b.id === id) || null;
    setSelectedBus(bus);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleChange = async (id: string, status: boolean) => {
    let newLiveStatus = false;
    if (status === true) {
      newLiveStatus = false;
      setLiveStatuses((prev) => ({
        ...prev,
        [id]: false,
      }));
    } else if (status === false) {
      newLiveStatus = true;
      setLiveStatuses((prev) => ({
        ...prev,
        [id]: true,
      }));
    }

    try {
      const liveStatus = await updateBusStatus(id, newLiveStatus);
      if (liveStatus === true) {
        toast.success("Status updated successfully");
        startTransition(() => {
          router.refresh();
        });
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

  useEffect(() => {
    if (pagination.pageIndex >= 0 && pagination.pageSize > 0) {
      updateUrl(pagination.pageIndex, pagination.pageSize);
    }
  }, [pagination, updateUrl]);

  // Table initialization
  const columns: ColumnDef<Busses>[] = [
    {
      accessorKey: "#",
      header: ({ column }) => <div>#</div>,
      cell: ({ row }) => <div>{row.index}</div>,
    },
    {
      accessorKey: "busID",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Bus Number <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => <div>{row.original.busID}</div>,
    },
    {
      accessorKey: "driverName",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Driver Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => <span>{row.original.driverName}</span>,
    },
    {
      accessorKey: "registration",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Bus Registration <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => {
        const registrationNum = row.original.registration || "";
        const limitedNum =
          registrationNum.length > 9
            ? `${registrationNum.slice(0, 9)}...`
            : registrationNum;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                {limitedNum}
              </TooltipTrigger>
              <TooltipContent className="bg-white border-2 px-2 py-2">
                {row.original.registration}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "capacity",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Bus Capacity <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => <div>{row.original.capacity}</div>,
    },
    {
      accessorKey: "busClass",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Bus Class <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => <div>{row.original.busClass}</div>,
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
                checked={liveStatuses[row.original.id] || row.original.isLive}
                onChange={(e) => {
                  handleChange(row.original.id, row.original.isLive);
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
        <button
          className="flex justify-end"
          onClick={() => {
            handleShowDetail(row.original.id);
          }}
        >
          <Image
            src="/img/icons/actions.svg"
            alt="icon"
            height={4.5}
            width={4.5}
          />
        </button>
      ),
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: busses,
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
        <UpdateBus
          open={dialogOpen}
          onClose={handleCloseDialog}
          busData={selectedBus}
        />
      </div>
    </div>
  );
};

export default FleetTable;