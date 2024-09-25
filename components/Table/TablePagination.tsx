"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

interface PaginationComponentProps<> {
  paginationData: {
    totalCount: number;
  };
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  handleDownload?: () => void;
}

const TablePagination: React.FC<PaginationComponentProps> = ({
  pagination,
  setPagination,
  paginationData,
  handleDownload,
}) => {
  const pathname = usePathname();

  const { pageIndex, pageSize } = pagination;
  const totalCount = paginationData.totalCount;
  const pageCount = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPageIndex: number) => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: newPageIndex,
    }));
  };

  const range = (start: number, end: number): number[] => {
    let result = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  };

  const pageNumbers = (() => {
    const firstTwoPages = [1, 2];
    const lastPage = pageCount;

    if (pageCount <= 4) {
      return range(1, pageCount);
    }

    if (pageIndex + 1 <= 2) {
      return [...range(1, 2), "...", lastPage];
    } else if (pageIndex + 1 >= pageCount - 1) {
      return [1, "...", ...range(pageCount - 2, pageCount)];
    } else {
      return [1, "...", pageIndex + 1, "...", lastPage];
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
    <div className="flex flex-row gap-3">
      {pathname === "/app/transactions/transactions" && (
        <button
          className="bg-kupi-yellow mr-5 px-3 py-1 rounded-md"
          onClick={handleDownload}
        >
          Download Excel
        </button>
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
