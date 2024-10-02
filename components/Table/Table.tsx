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
import TablePagination from "./TablePagination";

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
  const { pageSize } = pagination;

  const handlePageSizeChange = (size: number) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: size,
      pageIndex: 0,
    }));
  };

  return (
    <div>
      <div className="w-full tickettableclass">
        <Table className="w-full">
          <TableHeader className="w-full">
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
          <TableBody className="w-full">
            {tableData.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="h-12">
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
        <TablePagination
          paginationData={paginationData}
          pagination={pagination}
          setPagination={setPagination}
          handleDownload={handleDownload}
        />
      </div>
    </div>
  );
};

export default TableComponent;
