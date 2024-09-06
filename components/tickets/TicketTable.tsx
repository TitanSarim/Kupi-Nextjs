import React, { useState } from 'react'
import { ColumnDef, SortingState,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
  } from "@tanstack/react-table"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import { ArrowUpDown, ChevronRight, ChevronLeft} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import { TicketType } from '@/types/ticket';
import Image from 'next/image';
import TicketDetailDialgue from './TicketDetailDialgue'



  
const TicketTable: React.FC<{ TicketData: TicketType[] }> = ({ TicketData }) => {

    const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 7,
    });

    const handleShowDetail = (id: string) => {
        console.log(dialogOpen)
        const ticket = TicketData.find(t => t.id === id) || null;
        setSelectedTicket(ticket);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };


     // table initalizes here
     const columns: ColumnDef<TicketType>[] = [
        {
            accessorKey: "BusNumber",
            header: ({ column }) => (
              <button
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Bus Number <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </button>
            ),
          },
        {
          accessorKey: "TicketID",
          header: ({ column }) => (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Ticket ID <ArrowUpDown className="ml-2 h-4 w-4 inline" />
            </button>
          ),
        },
        {
          accessorKey: "CustomerName",
          header: ({ column }) => (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Customer Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
            </button>
          ),
        },
        {
            accessorKey: 'ArrivalLocation',  // We use one accessor key but render multiple fields
            header: ({ column }) => (
              <button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Locations <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </button>
            ),
            cell: ({ row }) => (
              <div>
                <div>
                  <span className='midGray-text'>Departure:</span>{" "} 
                    {row.original.DepartureLocation.length > 22
                    ? row.original.DepartureLocation.slice(0, 22) + "..."
                    : row.original.DepartureLocation}
                </div>
                <div>
                  <span className='midGray-text'>Arrival:</span>{" "}
                    {row.original.ArrivalLocation.length > 22
                    ? row.original.ArrivalLocation.slice(0, 22) + "..."
                    : row.original.ArrivalLocation}
                </div>
              </div>
            ),
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
                <div>
                    {row.original.status === "Sold" ? 
                        <p className='text-red-600'>{row.original.status}</p>
                        : 
                        <p className='text-kupi-yellow'>{row.original.status}</p>
                    }
                </div>
            )
        },
    
        {
            accessorKey: "totalPrice",
            header: ({ column }) => (
              <button
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Price <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </button>
            ),
            cell: ({ row }) => (
                <div>
                    ${row.original.totalPrice}
                </div>
            )
        },
        {
            accessorKey: "action",
            header: "",
            cell: ({ row }) => (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    handleShowDetail(row.original.id)
                  }}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <Image src="/img/icons/actions.svg" alt="icon" height={4.5} width={4.5}/>
                </button>
              </div>
            ),
            enableSorting: false, 
        }
    ];

    const table = useReactTable({
        data: TicketData,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const { pageIndex, pageSize } = pagination;
    const pageCount = table.getPageCount();
    
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
    }

    const pageNumbers = pageCount > 1 ? range(1, Math.min(3, pageCount)) : [];



    // actual table
    return (
        <div className="w-full mt-8">
            <div className='w-full tickettableclass'>
                <Table>
                    <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
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
                    {table.getRowModel().rows.map((row) => (
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
            
            <div className='w-full flex justify-between items-center mt-4'>
                
                {/* expende or reduce page count from pageSize  */}
                <div className='flex flex-row items-center gap-5'>
                    <p>Show Entries</p>
                    <Select onValueChange={(value) => handlePageSizeChange(parseInt(value, 10))}>
                        <SelectTrigger className="h-10 w-24 rounded-lg text-gray-500 border-gray-700">
                            <SelectValue placeholder={pageSize.toString()}/>
                        </SelectTrigger>
                        <SelectContent className=''>
                            <SelectItem value="7">7</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="30">30</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-row items-center gap-2">
                    <button
                        onClick={() => table.setPageIndex((old) => Math.max(old - 1, 0))}
                        disabled={!table.getCanPreviousPage()}
                        className={`px-1 py-1 rounded-md ${
                            !table.getCanPreviousPage() ? 'bg-gray-300' : 'bg-gray-800'
                        }`}
                    >
                        <ChevronLeft style={{ color: !table.getCanPreviousPage() ? 'gray' : 'white' }} />
                    </button>
                    <div className="flex gap-2">
                        {pageNumbers.map((page) => (
                            <button
                                key={page}
                                onClick={() => table.setPageIndex(page - 1)}
                                className={`px-3 py-1 rounded-md ${pageIndex === page - 1 ? 'bg-kupi-yellow text-gray-800' : ''}`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => table.setPageIndex((old) => Math.min(old + 1, table.getPageCount() - 1))}
                        disabled={!table.getCanNextPage()}
                        className={`px-1 py-1 rounded-md ${
                            !table.getCanNextPage() ? 'bg-gray-300' : 'bg-gray-800'
                        }`}
                    >
                        <ChevronRight style={{ color: !table.getCanNextPage() ? 'gray' : 'white' }}/>
                    </button>
                </div>

            </div>

            {/* dialogue */}
            <div className='w-full'>
                <TicketDetailDialgue open={dialogOpen} onClose={handleCloseDialog} ticket={selectedTicket}/>
            </div>
            
        </div>
    )
}

export default TicketTable
