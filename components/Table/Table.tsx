import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  RowModel,
  HeaderGroup,
  RowData,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronRight, ChevronLeft } from "lucide-react";

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

interface TableComponentProps<TData extends RowData> {
  paginationData: {
    totalCount: number;
  };
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  tableData: {
    getHeaderGroups: () => HeaderGroup<TData>[];
    getRowModel: () => RowModel<TData>;
  };
  handleDownload?: () => void;
}

const TableComponent = <TData extends RowData>({
  paginationData,
  setPagination,
  tableData,
  pagination,
  handleDownload,
}: TableComponentProps<TData>) => {
  const { pageIndex, pageSize } = pagination;
  const totalCount = paginationData.totalCount;
  const pageCount = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPageIndex: number) => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: newPageIndex,
    }));
  };

  const handlePageSizeChange = (size: number) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: size,
      pageIndex: 0,
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
    <div>
      <div className="w-full tickettableclass">
        <Table>
          <TableHeader>
            {tableData.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {tableData.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="w-full flex justify-between items-center mt-4">
        {/* Change page size */}
        <div className="flex flex-row items-center gap-5">
          <p>Show Entries</p>
          <Select
            onValueChange={(value) => handlePageSizeChange(parseInt(value, 10))}
          >
            <SelectTrigger className="h-10 w-24 rounded-lg text-gray-500 border-gray-700">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>

            {paginationData.totalCount === 0 ? (
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
              </SelectContent>
            ) : paginationData.totalCount <= 10 ? (
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            ) : paginationData.totalCount <= 20 ? (
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            ) : (
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
              </SelectContent>
            )}
          </Select>
        </div>

        {/* Pagination buttons */}
        <div className="flex flex-row items-center gap-2">
          <button
            onClick={() => handlePageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
            className={`px-1 py-1 rounded-md ${
              pageIndex === 0 ? "bg-gray-300" : "bg-gray-800"
            }`}
          >
            <ChevronLeft
              style={{ color: pageIndex === 0 ? "gray" : "white" }}
            />
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
    </div>
  );
};

export default TableComponent;
