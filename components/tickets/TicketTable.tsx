import React, { useEffect, useState } from 'react'
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
import Image from 'next/image';
import TicketDetailDialgue from './TicketDetailDialgue'
import { Tickets } from '@prisma/client'
import { usePathname, useSearchParams, useRouter} from 'next/navigation';
import { TicketsReturn } from '@/types/ticket'

const TicketTable: React.FC<TicketsReturn> = ({ TicketData, paginationData }) => {

    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    const [selectedTicket, setSelectedTicket] = useState<Tickets | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({
        pageIndex: paginationData.pageIndex,
        pageSize: paginationData.pageSize,
    });

    const handleShowDetail = (id: string) => {
        const ticket = TicketData.find(t => t.id === id) || null;
        setSelectedTicket(ticket);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const updateUrl = (newPageIndex?: number, newPageSize?: number) => {
      const sortingParam = sorting.map(sort => `${sort.id}_${sort.desc ? 'desc' : 'asc'}`).join(',');
      const params = new URLSearchParams(searchParams.toString());
      params.set('pageIndex', (newPageIndex !== undefined ? newPageIndex : pagination.pageIndex).toString());
      params.set('pageSize', (newPageSize !== undefined ? newPageSize : pagination.pageSize).toString());
      params.set('sort', sortingParam);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

     // table initalizes here
     const columns: ColumnDef<Tickets>[] = [
        {
            accessorKey: "busId",
            header: ({ column }) => (
              <button
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Bus Number <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </button>
            ),
            cell: ({ row }) => (
              <div>
                {row.original.busId ? <span>{row.original.busId}</span> : <span>NA</span>}
              </div>
            )
          },
        {
          accessorKey: "ticketId",
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
          cell: ({ row }) => (
            <span>NA</span>
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
                    NA
                </div>
                <div>
                  <span className='midGray-text'>Arrival:</span>{" "}
                    NA
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
            cell: ({ row }) => (
              <span>NA</span>
            )
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
                    {row.original.status === "CONFIRMED" ? 
                        <p className='text-red-600'>Sold</p>
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
                    ${row.original.priceDetails.totalPrice}
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
        onSortingChange: (newSorting) => {
          setSorting(newSorting);
          updateUrl();
        },
        onPaginationChange: (newPagination) => {
          setPagination(newPagination);
          updateUrl(); 
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const { pageIndex, pageSize } = pagination;
    const totalCount = paginationData.totalCount;
    const pageCount = Math.ceil(totalCount / pageSize);
    
    const handlePageChange = (newPageIndex: number) => {
      setPagination(prev => ({
        ...prev,
        pageIndex: newPageIndex,
      }));
    
      updateUrl(newPageIndex);
    };

    const handlePageSizeChange = (size: number) => {
      setPagination(prev => ({
        ...prev,
        pageSize: size,
        pageIndex: 0, 
      }));
    
      updateUrl(0, size); 
    };
    
    const range = (start: number, end: number): number[] => {
      let result = [];
      for (let i = start; i <= end; i++) {
          result.push(i);
      }
      return result;
    };

    const pageNumbers = (() => {
      const rangeSize = 5; 
      const start = Math.max(1, Math.min(pageIndex + 1 - Math.floor(rangeSize / 2), pageCount - rangeSize + 1));
      const end = Math.min(pageCount, start + rangeSize - 1);
  
      return range(start, end);
    })();

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
                {/* Change page size */}
                <div className='flex flex-row items-center gap-5'>
                    <p>Show Entries</p>
                    <Select onValueChange={(value) => handlePageSizeChange(parseInt(value, 10))}>
                        <SelectTrigger className="h-10 w-24 rounded-lg text-gray-500 border-gray-700">
                            <SelectValue placeholder={pageSize.toString()}/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="8">8</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="30">30</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Pagination buttons */}
                <div className="flex flex-row items-center gap-2">
                    <button
                        onClick={() => handlePageChange(pageIndex - 1)}
                        disabled={pageIndex === 0}
                        className={`px-1 py-1 rounded-md ${pageIndex === 0 ? 'bg-gray-300' : 'bg-gray-800'}`}
                    >
                        <ChevronLeft style={{ color: pageIndex === 0 ? 'gray' : 'white' }} />
                    </button>
                    <div className="flex gap-2">
                        {pageNumbers.map((page) => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page - 1)}  // Convert to 0-based index
                              className={`px-3 py-1 rounded-md ${pageIndex + 1 === page ? 'bg-kupi-yellow text-gray-800' : 'bg-gray-300'}`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => handlePageChange(pageIndex + 1)}
                        disabled={pageIndex >= pageCount - 1}
                        className={`px-1 py-1 rounded-md ${pageIndex >= pageCount - 1  ? 'bg-gray-300' : 'bg-gray-800'}`}
                    >
                        <ChevronRight style={{ color: pageIndex >= pageCount - 1 ? 'gray' : 'white' }} />
                    </button>
                </div>
            </div>

            {/* dialogue */}
            <div className='w-full'>
                <TicketDetailDialgue open={dialogOpen} onClose={handleCloseDialog} TicketData={selectedTicket}/>
            </div>
            
        </div>
    )
}

export default TicketTable
