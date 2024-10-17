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
import { discountDataType, DiscountReturn } from "@/types/discount";
import UpdateDiscount from "./UpdateDiscount";
import TableComponent from "../Table/Table";

const DiscountsTable: React.FC<DiscountReturn> = ({
  discounts,
  cities,
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
  const [selectedDiscount, setSelectedDiscount] =
    useState<discountDataType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleShowDetail = (id: string) => {
    const discount = discounts.find((d) => d.discount.id === id) || null;
    if (!discounts) {
      setDialogOpen(false);
      return null;
    }
    setSelectedDiscount(discount);
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

  useEffect(() => {
    if (pagination.pageIndex >= 0 && pagination.pageSize > 0) {
      updateUrl(pagination.pageIndex, pagination.pageSize);
    }
  }, [pagination, updateUrl]);

  // Table initialization
  const columns: ColumnDef<discountDataType>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Discount Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => {
        const discountName = row.original.discount.name || "";
        const limitedName =
          discountName.length > 9
            ? `${discountName.slice(0, 9)}...`
            : discountName;

        return <span>{limitedName}</span>;
      },
    },
    {
      accessorKey: "percentage",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Discount <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          <span>{row.original.discount.percentage}%</span>
        </div>
      ),
    },
    {
      accessorKey: "source",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Operator <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => {
        const source = row.original.discount.source;
        return (
          <>
            {source && source.length <= 0 ? (
              "NA"
            ) : (
              <span>
                [{source && source.length > 0 ? source?.[0]?.charAt(0) : ""}
                {source && source.length > 1
                  ? `, ${source?.[1]?.charAt(0)}`
                  : ""}
                ] Operator
              </span>
            )}
          </>
        );
      },
    },

    {
      accessorKey: "departure",
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
            {row.original?.sourceCities &&
            row.original?.sourceCities?.length > 0 ? (
              <>
                {row.original?.sourceCities?.slice(0, 2).map((city) => (
                  <span key={city.id} className="city-name">
                    {city.name},{" "}
                  </span>
                ))}
                {row.original?.sourceCities?.length > 2 && <span> ... </span>}
              </>
            ) : (
              <span>NA</span>
            )}
          </div>
          <div>
            <span className="midGray-text">Arrival:</span>{" "}
            {row.original?.arrivalCities &&
            row.original.arrivalCities.length > 0 ? (
              <>
                {row.original.arrivalCities.slice(0, 2).map((city) => (
                  <span key={city.id} className="city-name">
                    {city.name},{" "}
                  </span>
                ))}
                {row.original.arrivalCities.length > 2 && <span> ... </span>}
              </>
            ) : (
              <span>NA</span>
            )}
          </div>
        </div>
      ),
    },

    {
      accessorKey: "expiryDate",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Expiry Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          {row.original.discount?.expiryDate?.toLocaleTimeString("en-US", {
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
      accessorKey: "action",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <button
            onClick={() => {
              handleShowDetail(row.original.discount.id);
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
    data: discounts,
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
        <UpdateDiscount
          open={dialogOpen}
          onClose={handleCloseDialog}
          cities={cities}
          operators={operators}
          discount={selectedDiscount?.discount || undefined}
        />
      </div>
    </div>
  );
};

export default DiscountsTable;
