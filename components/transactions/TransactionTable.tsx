'use client'
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
import TransactionDetailDialgue from './TransactionDetailDialgue'
import { usePathname, useSearchParams, useRouter} from 'next/navigation';
import { TransactionReturn, TransactionsType } from '@/types/transactions'

const TransactionTable: React.FC<TransactionReturn> = ({ transactionData, paginationData }) => {

    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    const [pagination, setPagination] = useState({
      pageIndex: 0,  
      pageSize: paginationData.pageSize,
    });  
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionsType | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [sorting, setSorting] = useState<SortingState>([]);
    

    const handleShowDetail = (id: string) => {
        const transaction = transactionData.find(t => t.transactions.id === id) || null;
        setSelectedTransaction(transaction);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const updateUrl = (newPageIndex?: number, newPageSize?: number) => {
      const sortingParam = sorting.map(sort => `${sort.id}_${sort.desc ? 'desc' : 'asc'}`).join(',');
      const params = new URLSearchParams(searchParams.toString());
      params.set('pageIndex', (newPageIndex !== undefined ? newPageIndex : pagination.pageIndex).toString());
      params.set('pageSize', (newPageSize !== undefined ? newPageSize : pagination.pageSize).toString());
      params.set('sort', sortingParam);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    useEffect(() => {
      if (pagination.pageIndex >= 0 && pagination.pageSize > 0) {
        updateUrl(pagination.pageIndex, pagination.pageSize);
      }
    }, [pagination, updateUrl]);

     // table initalizes here
     const columns: ColumnDef<TransactionsType>[] = [
        {
            accessorKey: "ticketId",
            header: ({ column }) => (
              <button
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Ticket ID <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </button>
            ),
            cell: ({ row }) => (
              <div>
                  {row.original.tickets?.map((ticket, i) => (
                    <button key={i}>{ticket.ticketId},</button>
                  ))}
              </div>
            )
          },
        {
          accessorKey: "customer",
          header: ({ column }) => (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Customer <ArrowUpDown className="ml-2 h-4 w-4 inline" />
            </button>
          ),cell: ({ row }) => {     
              if(!row.original.customer ){
                return(
                  <span>NA</span>
                )
              }
            return (
              <span>
                {row.original?.customer.name}
              </span>
            )
          },
        },
        {
          accessorKey: "providerName",
          header: ({ column }) => (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Payment Method <ArrowUpDown className="ml-2 h-4 w-4 inline" />
            </button>
          ),
          cell: ({ row }) => {     
            return (
              <span>{row.original?.paymentReference?.providerName || 'N/A'}</span>
            );
          }
        },
        {
          accessorKey: "totalAmount",
          header: ({ column }) => (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Amount <ArrowUpDown className="ml-2 h-4 w-4 inline" />
            </button>
          ),
          cell: ({ row }) => (
              <div>
                  ${row.original.transactions.totalAmount}
              </div>
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
                    {row.original?.paymentReference?.status === "paid" ? 
                        <p className='text-green-600'>Paid</p>
                        : 
                        <p className='text-kupi-yellow'>{row.original?.paymentReference?.status}</p>
                    }
                </div>
            )
        },

        {
          accessorKey: "date",
          header: ({ column }) => (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
            </button>
          ),
          cell: ({ row }) => (
            <span>12/09/2024</span>
          )
        },
    
        {
            accessorKey: "action",
            header: "",
            cell: ({ row }) => (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    handleShowDetail(row.original.transactions.id)
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
        data: transactionData,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,  
        pageCount: Math.ceil(paginationData.totalCount / pagination.pageSize),
    });

    const { pageIndex, pageSize } = pagination;
    const totalCount = paginationData.totalCount;
    const pageCount = Math.ceil(totalCount / pageSize);
    
    const handlePageChange = (newPageIndex: number) => {
      setPagination(prev => ({
        ...prev,
        pageIndex: newPageIndex,
      }));
    };

    const handlePageSizeChange = (size: number) => {
      setPagination(prev => ({
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
        return [...range(1, 2), '...', lastPage];
      } else if (pageIndex + 1 >= pageCount - 1) {
        return [1, '...', ...range(pageCount - 2, pageCount)];
      } else {
        return [1, '...', pageIndex + 1, '...', lastPage];
      }
    })();

    const renderPageNumbers = () => {
      return pageNumbers.map((page, index) => {
        if (page === '...') {
          return <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>;
        }
        const pageNumber = typeof page === 'number' ? page : 0
        return (
          <button
            key={page}
            onClick={() => handlePageChange(pageNumber - 1)} 
            className={`px-3 py-1 rounded-md ${pageIndex + 1 === page ? 'bg-kupi-yellow text-gray-800' : 'bg-gray-300'}`}
          >
            {page}
          </button>
        );
      });
    };

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
                        <SelectValue placeholder={pageSize.toString()} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
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
                    {renderPageNumbers()}
                  </div>
                  <button
                    onClick={() => handlePageChange(pageIndex + 1)}
                    disabled={pageIndex >= pageCount - 1}
                    className={`px-1 py-1 rounded-md ${pageIndex >= pageCount - 1 ? 'bg-gray-300' : 'bg-gray-800'}`}
                  >
                    <ChevronRight style={{ color: pageIndex >= pageCount - 1 ? 'gray' : 'white' }} />
                  </button>
                </div>
            </div>

            {/* dialogue */}
            <div className='w-full'>
                <TransactionDetailDialgue open={dialogOpen} onClose={handleCloseDialog} TransactionData={selectedTransaction}/>
            </div>
            
        </div>
    )
}

export default TransactionTable
