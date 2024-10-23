"use client";
import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Image from "next/image";
import TransactionDetailDialgue from "./TransactionDetailDialgue";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  TransactionReturn,
  TransactionReturnWithDateRange,
  TransactionsType,
} from "@/types/transactions";
import { TicketsDataType } from "@/types/ticket";
import { getTicketById } from "@/actions/ticket.action";
import TicketDetailDialgue from "../tickets/TicketDetailDialgue";
import * as XLSX from "xlsx";
import TableComponent from "../Table/Table";

const isCarmaDetails = (
  obj: any
): obj is { selectedAvailability: { carrier: string } } => {
  return obj && typeof obj.selectedAvailability?.carrier === "string";
};

const TransactionTable: React.FC<TransactionReturnWithDateRange> = ({
  transactionData,
  paginationData,
  cities,
  dateRange,
  allTransactionData = [],
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: paginationData.pageSize,
  });
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionsType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ticketDialogue, setTicketDialogue] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketsDataType | null>(
    null
  );

  const handleShowDetail = (id: string) => {
    const transaction =
      transactionData.find((t) => t.transactions.id === id) || null;
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };

  const handleShowTicketDetail = async (ticketId: string) => {
    try {
      const ticket = await getTicketById(ticketId);
      if (!ticket) {
        return null;
      }
      setSelectedTicket(ticket);
      setTicketDialogue(true);
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  const handleTicketDialog = () => {
    setTicketDialogue(false);
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

  // table initalizes here
  const columns: ColumnDef<TransactionsType>[] = [
    {
      maxSize: 100,
      minSize: 100,
      accessorKey: "paidAt",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => (
        <span>
          {row.original?.transactions?.paidAt?.toLocaleTimeString("en-US", {
            timeZone: "Africa/Harare",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
          })}
        </span>
      ),
    },
    {
      maxSize: 30,
      minSize: 30,
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
            <button
              key={i}
              onClick={() => handleShowTicketDetail(ticket.ticketId)}
              className="bg-gray-200 rounded-md p-1 ml-1"
            >
              {ticket.ticketId}
            </button>
          ))}
        </div>
      ),
    },
    {
      maxSize: 70,
      minSize: 70,
      accessorKey: "operator",
      header: ({ column }) => <span>Operator One</span>,
      cell: ({ row }) => {
        const operator1 = Array.isArray(row.original.carmaDetails)
          ? row.original.carmaDetails[0]?.selectedAvailability?.carrier || ""
          : "";
        const limitedName =
          operator1.length > 9 ? `${operator1.slice(0, 9)}...` : operator1;

        return <span className="uppercase">{limitedName}</span>;
      },
      enableSorting: false,
    },
    {
      maxSize: 70,
      minSize: 70,
      accessorKey: "operator2",
      header: ({ column }) => <span>Operator Two</span>,
      cell: ({ row }) => {
        const operator2 = Array.isArray(row.original.carmaDetails)
          ? row.original.carmaDetails[1]?.selectedAvailability?.carrier || "NA"
          : "";
        const limitedName =
          operator2.length > 9 ? `${operator2.slice(0, 9)}...` : operator2;

        return <span className="uppercase">{limitedName}</span>;
      },
      enableSorting: false,
    },
    {
      maxSize: 50,
      minSize: 50,
      accessorKey: "paymentMethod",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          PM <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => {
        return <span>{row.original?.transactions.paymentMethod || "N/A"}</span>;
      },
    },
    {
      maxSize: 20,
      minSize: 20,
      accessorKey: "source",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Source <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => <div>{row.original?.tickets?.[0]?.source}</div>,
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
      cell: ({ row }) => <div>${row.original.transactions.totalAmount}</div>,
    },

    {
      maxSize: 10,
      minSize: 10,
      accessorKey: "action",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <button
            onClick={() => {
              handleShowDetail(row.original.transactions.id);
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

  const handleDownloadExcel = () => {
    const dataToExport = allTransactionData.length
      ? allTransactionData
      : transactionData;

    if (!dataToExport || dataToExport.length === 0) {
      console.error("No transaction data available for download.");
      return;
    }

    const exportData = dataToExport.map((transaction) => {
      // Booking Date
      const bookingDate = transaction.transactions?.paidAt
        ? new Date(transaction.transactions.paidAt).toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A";

      // Customer Details
      const customerName = transaction.customer?.name || "N/A";
      const customerPhone = transaction.customer?.number
        ? `+${String(transaction.customer.number)}`
        : "N/A";

      // City Pair
      const cityPair = `${transaction.sourceCity?.name || "N/A"} - ${
        transaction.arrivalCity?.name || "N/A"
      }`;

      // Departure Date & Time
      const departureDateTime = transaction.tickets?.[0]?.departureTime
        ? new Date(transaction.tickets[0].departureTime).toLocaleString(
            "en-US",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }
          )
        : "N/A";

      // Bus Number
      const busNumber = transaction.tickets?.[0]?.busIdentifier || "N/A";
      // Transaction Details
      const transactionNo = transaction.transactions.id || "N/A";
      const transactionFee = Array.isArray(transaction.paymentReference)
        ? transaction.paymentReference[0]?.merchantCharge || 0
        : transaction.paymentReference?.merchantCharge || 0; // Ensure numeric value
      const paymentMethod = transaction.transactions.paymentMethod || "N/A";
      const operator = Array.isArray(transaction.carmaDetails)
        ? transaction.carmaDetails[0]?.selectedAvailability?.carrier || "N/A"
        : "N/A";
      const returnOperator = Array.isArray(transaction.carmaDetails)
        ? transaction.carmaDetails[1]?.selectedAvailability?.carrier || "N/A"
        : "N/A";

      // Ticket Numbers
      const ticketNo =
        transaction.tickets?.map((ticket) => ticket.ticketId).join(", ") ||
        "N/A";

      // Summing kupiMarkup for all tickets
      const markup = transaction.tickets?.reduce((sum, ticket) => {
        return sum + (ticket.priceDetails?.kupiMarkup || 0);
      }, 0);
      const pricePaid = transaction.transactions?.totalAmount || 0;

      // Sum fields across all tickets
      const originalPrice = transaction.tickets?.reduce((sum, ticket) => {
        const totalPrice = ticket.priceDetails?.totalPrice || 0;
        const kupiMarkup = ticket.priceDetails?.kupiMarkup || 0;
        return sum + (totalPrice - kupiMarkup);
      }, 0);

      const OperatorOwed = transaction.tickets?.reduce((sum, ticket) => {
        return (
          sum +
          (ticket.priceDetails?.totalPrice || 0) -
          (ticket.priceDetails?.kupiProfit || 0) -
          (ticket.priceDetails?.carmaProfit || 0)
        );
      }, 0);

      const carmaComission = transaction.tickets?.reduce((sum, ticket) => {
        return sum + (ticket.priceDetails?.carmaProfit || 0);
      }, 0);
      const kupiCommission = transaction.tickets?.reduce((sum, ticket) => {
        return sum + (ticket.priceDetails?.kupiProfit || 0);
      }, 0);

      const kupiRevenue = transaction.tickets?.reduce((sum, ticket) => {
        return (
          sum +
          (ticket.priceDetails?.kupiProfit || 0) +
          (ticket.priceDetails?.kupiMarkup || 0)
        );
      }, 0);

      const kupiProfitFinal =
        (typeof kupiRevenue === "number" ? kupiRevenue : 0) -
        (Array.isArray(transaction.paymentReference)
          ? transaction.paymentReference[0]?.merchantCharge || 0
          : transaction.paymentReference?.merchantCharge || 0);

      return {
        "Ticket Booking Date": bookingDate,
        "Customer Name": customerName,
        "Customer Phone Number": customerPhone,
        "City Pair": cityPair,
        "Departure Date & Time": departureDateTime,
        "Bus Number": busNumber,
        "Ticket No.": ticketNo,
        "Transaction No.": transactionNo,
        "Transaction Fee (merchant fee)": transactionFee,
        "Payment Method": paymentMethod,
        Operator: operator,
        "Return Operator": returnOperator,
        "Price Paid": pricePaid,
        "Original Price": originalPrice,
        Markup: markup,
        "Operator Owed": OperatorOwed,
        "Carma Comission": carmaComission,
        "Kupi Commission": kupiCommission,
        "Kupi Revenue": kupiRevenue,
        "Kupi Profit": kupiProfitFinal,
      };
    });

    // Create Excel file
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    // Trigger Excel download
    XLSX.writeFile(workbook, "transactions_data.xlsx");
  };

  const handleExportCSV = () => {
    const dataToExport = allTransactionData.length
      ? allTransactionData
      : transactionData;

    if (!dataToExport || dataToExport.length === 0) {
      console.error("No transaction data available for download.");
      return;
    }

    const exportData = dataToExport.map((transaction) => {
      // Booking Date
      const bookingDate = transaction.transactions?.paidAt
        ? new Date(transaction.transactions.paidAt).toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A";

      // Customer Details
      const customerName = transaction.customer?.name || "N/A";
      const customerPhone = transaction.customer?.number
        ? `="+${String(transaction.customer.number)}"`
        : "N/A";

      // City Pair
      const cityPair = `${transaction.sourceCity?.name || "N/A"} - ${
        transaction.arrivalCity?.name || "N/A"
      }`;

      // Departure Date & Time
      const departureDateTime = transaction.tickets?.[0]?.departureTime
        ? new Date(transaction.tickets[0].departureTime).toLocaleString(
            "en-US",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }
          )
        : "N/A";

      // Bus Number
      const busNumber = transaction.tickets?.[0]?.busIdentifier || "N/A";
      // Transaction Details
      const transactionNo = transaction.transactions.id || "N/A";
      const transactionFee = Array.isArray(transaction.paymentReference)
        ? transaction.paymentReference[0]?.merchantCharge || 0
        : transaction.paymentReference?.merchantCharge || 0; // Ensure numeric value
      const paymentMethod = transaction.transactions.paymentMethod || "N/A";
      const operator = Array.isArray(transaction.carmaDetails)
        ? transaction.carmaDetails[0]?.selectedAvailability?.carrier || "N/A"
        : "N/A";
      const returnOperator = Array.isArray(transaction.carmaDetails)
        ? transaction.carmaDetails[1]?.selectedAvailability?.carrier || "N/A"
        : "N/A";

      // Ticket Numbers
      const ticketNo =
        transaction.tickets?.map((ticket) => ticket.ticketId).join(", ") ||
        "N/A";

      // Summing kupiMarkup for all tickets
      const markup = transaction.tickets?.reduce((sum, ticket) => {
        return sum + (ticket.priceDetails?.kupiMarkup || 0);
      }, 0);
      const pricePaid = transaction.transactions?.totalAmount || 0;

      // Sum fields across all tickets
      const originalPrice = transaction.tickets?.reduce((sum, ticket) => {
        const totalPrice = ticket.priceDetails?.totalPrice || 0;
        const kupiMarkup = ticket.priceDetails?.kupiMarkup || 0;
        return sum + (totalPrice - kupiMarkup);
      }, 0);

      const OperatorOwed = transaction.tickets?.reduce((sum, ticket) => {
        return (
          sum +
          (ticket.priceDetails?.totalPrice || 0) -
          (ticket.priceDetails?.kupiProfit || 0) -
          (ticket.priceDetails?.carmaProfit || 0)
        );
      }, 0);

      const carmaComission = transaction.tickets?.reduce((sum, ticket) => {
        return sum + (ticket.priceDetails?.carmaProfit || 0);
      }, 0);
      const kupiCommission = transaction.tickets?.reduce((sum, ticket) => {
        return sum + (ticket.priceDetails?.kupiProfit || 0);
      }, 0);

      const kupiRevenue = transaction.tickets?.reduce((sum, ticket) => {
        return (
          sum +
          (ticket.priceDetails?.kupiProfit || 0) +
          (ticket.priceDetails?.kupiMarkup || 0)
        );
      }, 0);

      const kupiProfitFinal =
        (typeof kupiRevenue === "number" ? kupiRevenue : 0) -
        (Array.isArray(transaction.paymentReference)
          ? transaction.paymentReference[0]?.merchantCharge || 0
          : transaction.paymentReference?.merchantCharge || 0);

      return {
        "Ticket Booking Date": bookingDate,
        "Customer Name": customerName,
        "Customer Phone Number": customerPhone,
        "City Pair": cityPair,
        "Departure Date & Time": departureDateTime,
        "Bus Number": busNumber,
        "Ticket No.": ticketNo,
        "Transaction No.": transactionNo,
        "Transaction Fee (merchant fee)": transactionFee,
        "Payment Method": paymentMethod,
        Operator: operator,
        "Return Operator": returnOperator,
        "Price Paid": pricePaid,
        "Original Price": originalPrice,
        Markup: markup,
        "Operator Owed": OperatorOwed,
        "Carma Comission": carmaComission,
        "Kupi Commission": kupiCommission,
        "Kupi Revenue": kupiRevenue,
        "Kupi Profit": kupiProfitFinal,
      };
    });

    // Convert data to CSV
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    // CSV download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transactions_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCarmaCSV = () => {
    const dataToExport = allTransactionData.length
      ? allTransactionData
      : transactionData;

    if (!dataToExport || dataToExport.length === 0) {
      console.error("No transaction data available for download.");
      return;
    }

    const exportData = dataToExport.flatMap((transaction) => {
      // Transaction Datetime
      const transactionDateTime = transaction.transactions?.paidAt
        ? new Date(transaction.transactions.paidAt)
            .toISOString()
            .replace("T", " ")
            .slice(0, 16)
            .replace(/-/g, "")
            .replace(/:/g, "")
        : "N/A";

      // Transaction Type
      const transactionType = "SALE";

      // Implementation ID
      const implementationId = "KPI";

      // Terminal ID
      const terminalId = "INTERNET";

      // Admin (in cents)
      const adminCents = 0;

      return (
        transaction.tickets?.map((ticket, index) => {
          // Reference Number (INTrace)
          const referenceNumber = ticket.ticketId || "N/A";

          // Ticket Number
          const ticketNumber = ticket.ticketId || "N/A";

          // Amount (in cents)
          const amountCents =
            typeof ticket.carmaDetails?.selectedAvailability === "object"
              ? Math.round(
                  (ticket.carmaDetails.selectedAvailability as any).price * 100
                )
              : "N/A";

          // Service Number
          let serviceNumber = "N/A";
          if (Array.isArray(transaction.carmaDetails)) {
            serviceNumber =
              transaction.carmaDetails[index]?.selectedAvailability
                ?.serviceNumber || "N/A";
          } else if (
            transaction.carmaDetails &&
            typeof transaction.carmaDetails === "object"
          ) {
            serviceNumber =
              transaction.carmaDetails?.selectedAvailability?.serviceNumber ||
              "N/A";
          }

          // Departure Date
          const departureDate = ticket.departureTime
            ? new Date(ticket.departureTime)
                .toISOString()
                .slice(0, 10)
                .replace(/-/g, "")
            : "N/A";

          return {
            "TRANSACTION DATETIME": transactionDateTime,
            "TRANSACTION TYPE": transactionType,
            "REFERENCE NUMBER (INTrace)": referenceNumber,
            "IMPLEMENTATION ID": implementationId,
            "TERMINAL ID": terminalId,
            "TICKET NUMBER": ticketNumber,
            "AMOUNT (CENTS)": amountCents,
            "ADMIN (CENTS)": adminCents,
            "SERVICE NUMBER": serviceNumber,
            "DEPARTURE DATE": departureDate,
          };
        }) || []
      );
    });

    // Convert data to CSV
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    // CSV download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "carma_transactions_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = () => {
    if (!transactionData || transactionData.length === 0) {
      console.error("No transaction data available for download.");
      return;
    }

    // Prepare the export data
    const exportData = transactionData.map((transaction) => {
      const bookingDate = transaction.transactions?.paidAt
        ? new Date(transaction.transactions.paidAt).toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A";
      const customerName = transaction.customer?.name || "N/A";
      const customerPhone = transaction.customer?.number || "N/A";
      const cityPair = `${transaction.sourceCity?.name || "N/A"} - ${
        transaction.arrivalCity?.name || "N/A"
      }`;
      const departureDateTime = transaction.tickets?.[0]?.departureTime
        ? new Date(transaction.tickets[0].departureTime).toLocaleString(
            "en-US",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }
          )
        : "N/A";
      const busNumber = transaction.tickets?.[0].busIdentifier || "N/A";
      const ticketNo =
        transaction.tickets?.map((ticket) => ticket.ticketId).join(", ") ||
        "N/A";
      const transactionNo = transaction.transactions.id || "N/A";
      const transactionFee = Array.isArray(transaction.paymentReference)
        ? transaction.paymentReference[0]?.merchantCharge || "N/A"
        : transaction.paymentReference?.merchantCharge || "N/A";
      const paymentMethod = transaction.transactions.paymentMethod || "N/A";
      const operator = Array.isArray(transaction.carmaDetails)
        ? transaction.carmaDetails[0]?.selectedAvailability?.carrier || "N/A"
        : "N/A";
      const returnOperator = Array.isArray(transaction.carmaDetails)
        ? transaction.carmaDetails[1]?.selectedAvailability?.carrier || "N/A"
        : "N/A";
      const pricePaid = transaction.transactions?.totalAmount || "N/A";
      const originalPrice =
        transaction.tickets?.[0]?.priceDetails?.totalPrice || "N/A";
      const markupOperatorOwed =
        (transaction.tickets?.[0]?.priceDetails?.totalPrice || 0) -
          (transaction.tickets?.[0]?.priceDetails?.kupiProfit || 0) -
          (transaction.tickets?.[0]?.priceDetails?.carmaProfit || 0) || "N/A";
      const kupiCommission =
        transaction.tickets?.[0]?.priceDetails?.kupiCommissionPercentage ||
        "N/A";
      const kupiRevenue =
        transaction.tickets?.[0]?.priceDetails?.kupiMarkup || "N/A";
      const kupiProfit =
        transaction.tickets?.[0]?.priceDetails?.kupiProfit || "N/A";

      return {
        "Ticket Booking Date": bookingDate,
        "Customer Name": customerName,
        "Customer Phone Number": customerPhone,
        "City Pair": cityPair,
        "Departure Date & Time": departureDateTime,
        "Bus Number": busNumber,
        "Ticket No.": ticketNo,
        "Transaction No.": transactionNo,
        "Transaction Fee (merchant fee)": transactionFee,
        "Payment Method": paymentMethod,
        Operator: operator,
        "Return Operator": returnOperator,
        "Price Paid": pricePaid,
        "Original Price": originalPrice,
        "Markup Operator Owed": markupOperatorOwed,
        "Kupi Commission": kupiCommission,
        "Kupi Revenue": kupiRevenue,
        "Kupi Profit": kupiProfit,
      };
    });

    // Create a new worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    XLSX.writeFile(workbook, "transactions_data.xlsx");
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transactions_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTicketExcel = () => {
    const dataToExport = allTransactionData.length
      ? allTransactionData
      : transactionData;

    if (!dataToExport || dataToExport.length === 0) {
      console.error("No ticket data available for download.");
      return;
    }

    const exportData = dataToExport.flatMap((transaction) => {
      const totalTransactionFee = Array.isArray(transaction.paymentReference)
        ? transaction.paymentReference[0]?.merchantCharge || 0
        : transaction.paymentReference?.merchantCharge || 0;

      const totalTransactionAmount = transaction.tickets?.reduce(
        (sum, ticket) => {
          return sum + (ticket.priceDetails?.totalPrice || 0);
        },
        0
      );

      return (
        transaction.tickets?.map((ticket) => {
          // Booking Date
          const bookingDate = transaction.transactions?.paidAt
            ? new Date(transaction.transactions.paidAt).toLocaleString(
                "en-US",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )
            : "N/A";

          // Customer Details
          const customerName = transaction.customer?.name || "N/A";
          const customerPhone = transaction.customer?.number
            ? `+${String(transaction.customer.number)}`
            : "N/A";

          // City Pair
          const cityPair = `${transaction.sourceCity?.name || "N/A"} - ${
            transaction.arrivalCity?.name || "N/A"
          }`;

          // Departure Date & Time
          const departureDateTime = ticket.departureTime
            ? new Date(ticket.departureTime).toLocaleString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "N/A";

          // Bus Number
          const busNumber = ticket.busIdentifier || "N/A";

          // Transaction Details
          const transactionNo = transaction.transactions.id || "N/A";
          const paymentMethod = transaction.transactions.paymentMethod || "N/A";

          // Proportional Transaction Fee Calculation
          const ticketPrice = ticket.priceDetails?.totalPrice || 0;
          const proportionalTransactionFee = totalTransactionAmount
            ? (ticketPrice / totalTransactionAmount) * totalTransactionFee
            : 0;

          // Operator Details
          const operator =
            Array.isArray(transaction.carmaDetails) &&
            isCarmaDetails(transaction.carmaDetails[0])
              ? transaction.carmaDetails[0]?.selectedAvailability?.carrier ||
                "N/A"
              : "N/A";

          // Price and Commission Calculations
          const markup = ticket.priceDetails?.kupiMarkup || 0;
          const pricePaid = ticket.priceDetails?.totalPrice || 0;
          const originalPrice = pricePaid - markup;
          const operatorOwed =
            pricePaid -
            (ticket.priceDetails?.kupiProfit || 0) -
            (ticket.priceDetails?.carmaProfit || 0);
          const carmaCommission = ticket.priceDetails?.carmaProfit || 0;
          const kupiCommission = ticket.priceDetails?.kupiProfit || 0;
          const kupiRevenue = kupiCommission + markup;
          const kupiProfitFinal = kupiRevenue - proportionalTransactionFee;

          return {
            "Ticket Booking Date": bookingDate,
            "Customer Name": customerName,
            "Customer Phone Number": customerPhone,
            "City Pair": cityPair,
            "Departure Date & Time": departureDateTime,
            "Bus Number": busNumber,
            "Ticket No.": ticket.ticketId || "N/A",
            "Transaction No.": transactionNo,
            "Transaction Fee (merchant fee)":
              proportionalTransactionFee.toFixed(2),
            "Payment Method": paymentMethod,
            Operator: operator,
            "Price Paid": pricePaid,
            "Original Price": originalPrice,
            Markup: markup,
            "Operator Owed": operatorOwed,
            "Carma Commission": carmaCommission,
            "Kupi Commission": kupiCommission,
            "Kupi Revenue": kupiRevenue,
            "Kupi Profit": kupiProfitFinal,
          };
        }) || []
      );
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets_data");

    // Trigger Excel download
    XLSX.writeFile(workbook, "Tickets_data.xlsx");
  };

  // actual table
  return (
    <div className="w-full mt-8">
      {transactionData.length === 0 ? (
        <div>
          <p className="text-center text-gray-500 text-lg">
            No transactions found. Please check the search criteria.
          </p>
        </div>
      ) : (
        <TableComponent
          paginationData={paginationData}
          setPagination={setPagination}
          pagination={pagination}
          tableData={table}
          handleDownloadExcel={handleDownloadExcel}
          exportCarmaCSV={exportCarmaCSV}
          handleTicketExcel={handleTicketExcel}
        />
      )}

      {/* dialogue */}
      <div className="w-full">
        <TransactionDetailDialgue
          open={dialogOpen}
          onClose={handleCloseDialog}
          TransactionData={selectedTransaction}
        />
        <TicketDetailDialgue
          open={ticketDialogue}
          onClose={handleTicketDialog}
          TicketData={selectedTicket}
        />
      </div>
    </div>
  );
};

export default TransactionTable;
