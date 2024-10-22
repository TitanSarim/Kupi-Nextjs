"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import React from "react";

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

interface PaginationComponentProps {
  paginationData: {
    totalCount: number;
  };
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  handleDownloadExcel?: () => void;
  exportCarmaCSV?: () => void;
  handleTicketExcel?: () => void;
}

const TablePagination: React.FC<PaginationComponentProps> = ({
  pagination,
  setPagination,
  paginationData,
  handleDownloadExcel,
  exportCarmaCSV,
  handleTicketExcel,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { pageIndex, pageSize } = pagination;
  const totalCount = paginationData.totalCount;
  const pageCount = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    const currentPageIndex = parseInt(searchParams.get("pageIndex") || "0", 10);
    const currentPageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    setPagination({
      pageIndex: currentPageIndex,
      pageSize: currentPageSize,
    });
  }, [searchParams, setPagination]);

  const updateUrl = (newPageIndex?: number, newPageSize?: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newPageIndex !== undefined) {
      params.set("pageIndex", newPageIndex.toString());
    }
    if (newPageSize !== undefined) {
      params.set("pageSize", newPageSize.toString());
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPageIndex: number) => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: newPageIndex,
    }));
    updateUrl(newPageIndex, pageSize);
  };

  const range = (start: number, end: number): number[] => {
    let result = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  };

  const pageNumbers = (() => {
    const lastPage = pageCount;

    if (pageCount <= 4) {
      return range(1, pageCount);
    }

    if (pageIndex + 1 <= 1) {
      return [...range(1, 2), "...", lastPage];
    } else if (pageIndex + 1 >= pageCount - 1) {
      return [1, "...", ...range(pageCount - 2, pageCount)];
    } else {
      const currentPage = pageIndex + 1;
      const showPreviousPage = currentPage - 1;
      const showNextPage = currentPage + 1;

      return [
        ...(showPreviousPage > 1 ? [1] : []),
        ...(showPreviousPage > 1 ? ["..."] : []),
        ...(showPreviousPage >= 1 ? [showPreviousPage] : []),
        currentPage,
        ...(showNextPage < lastPage ? [showNextPage] : []),
        ...(showNextPage < lastPage ? ["..."] : []),
        ...(showNextPage < lastPage ? [lastPage] : []),
      ];
    }
  })();

  const renderPageNumbers = () => {
    return pageNumbers.map((page, index) => {
      if (page === "...") {
        return (
          <span key={`ellipsis-${index}`} className="px-3 py-1">
            ...
          </span>
        );
      }
      const pageNumber = typeof page === "number" ? page : 0;
      return (
        <button
          key={page}
          onClick={() => handlePageChange(pageNumber - 1)}
          className={`px-3 py-1 rounded-md ${
            pageIndex + 1 === page
              ? "bg-kupi-yellow text-gray-800"
              : "bg-gray-300"
          }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="flex flex-row gap-3 relative">
      {pathname === "/app/transactions/transactions" && (
        <div className="relative">
          <button
            className="bg-kupi-yellow px-5 py-2 rounded-md flex items-center gap-2"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            Download Files
            <Image
              src="/img/icons/DownArrow.svg"
              alt="Down Arrow"
              width={16}
              height={16}
            />
          </button>
          {dropdownOpen && (
            <div className="absolute bottom-full mb-2 bg-white shadow-lg rounded-md z-10">
              <button
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full"
                onClick={handleDownloadExcel}
              >
                <Image
                  src="/img/icons/download.svg"
                  alt="Download Excel"
                  width={16}
                  height={16}
                />
                Transactions
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full"
                onClick={exportCarmaCSV}
              >
                <Image
                  src="/img/icons/export.svg"
                  alt="Export CSV"
                  width={16}
                  height={16}
                />
                Carma CSV
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full"
                onClick={handleTicketExcel}
              >
                <Image
                  src="/img/icons/export.svg"
                  alt="Export CSV"
                  width={16}
                  height={16}
                />
                Tickets
              </button>
            </div>
          )}
        </div>
      )}
      <div className="flex flex-row items-center gap-2">
        <button
          onClick={() => handlePageChange(pageIndex - 1)}
          disabled={pageIndex === 0}
          className={`px-1 py-1 rounded-md ${
            pageIndex === 0 ? "bg-gray-300" : "bg-gray-800"
          }`}
        >
          <ChevronLeft style={{ color: pageIndex === 0 ? "gray" : "white" }} />
        </button>
        <div className="flex gap-2">{renderPageNumbers()}</div>
        <button
          onClick={() => handlePageChange(pageIndex + 1)}
          disabled={pageIndex >= pageCount - 1}
          className={`px-1 py-1 rounded-md ${
            pageIndex >= pageCount - 1 ? "bg-gray-300" : "bg-gray-800"
          }`}
        >
          <ChevronRight
            style={{ color: pageIndex >= pageCount - 1 ? "gray" : "white" }}
          />
        </button>
      </div>
    </div>
  );
};

export default TablePagination;
