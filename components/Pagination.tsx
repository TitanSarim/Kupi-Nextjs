import React from "react";
import { ArrowUpDown, ChevronRight, ChevronLeft } from "lucide-react";

interface PaginationProps {
  handlePageChange: (newPage: number) => void;
  pageIndex: number;
  renderPageNumbers: () => JSX.Element;
  pageCount: number;
}
const Pagination: React.FC<PaginationProps> = ({
  handlePageChange,
  pageIndex,
  renderPageNumbers,
  pageCount,
}) => {
  return (
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
  );
};

export default Pagination;
