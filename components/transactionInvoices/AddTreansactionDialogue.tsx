"use client";
import Image from "next/image";
import React, { useState } from "react";
import { Input } from "../ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDropzone } from "react-dropzone";
import { createInvoice } from "@/actions/transactions.actions";
import { OperatorsType } from "@/types/transactions";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  operators: OperatorsType[];
}

const AddTreansactionDialogue: React.FC<DialogProps> = ({
  open,
  onClose,
  operators,
}) => {
  const [invoiceFiles, setInvoiceFiles] = useState<File[]>([]);
  const [receiptFiles, setReceiptFiles] = useState<File[]>([]);
  const [busOperator, setBusOperator] = useState<string>("");
  const [paymentPeriod, setPaymentPeriod] = useState<number>();
  const [totalAmount, setTotalAmount] = useState<number>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openOperator, setOpenOperator] = useState(false);
  const [errorState, setErrorState] = useState<[string, boolean]>(["", false]);
  const {
    getRootProps: getInvoiceRootProps,
    getInputProps: getInvoiceInputProps,
    isDragActive: isInvoiceDragActive,
  } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 1) {
        setError("You can only upload one file.");
        return;
      }

      const file = acceptedFiles?.[0];
      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed.");
        return;
      }

      setError(null);
      setInvoiceFiles(acceptedFiles);
    },
    accept: { "application/pdf": [] },
    maxFiles: 1,
  });

  const selectedOperator = operators.find(
    (operator) => operator.id === busOperator
  );
  const {
    getRootProps: getReceiptRootProps,
    getInputProps: getReceiptInputProps,
    isDragActive: isReceiptDragActive,
  } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 1) {
        setError("You can only upload one file.");
        return;
      }

      const file = acceptedFiles?.[0];
      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed.");
        return;
      }

      setError(null);
      setReceiptFiles(acceptedFiles);
    },
    accept: { "application/pdf": [] },
    maxFiles: 1,
  });

  const clearInvoiceFiles = () => {
    setInvoiceFiles([]);
  };

  const clearReceiptFiles = () => {
    setReceiptFiles([]);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length > 6) {
      return;
    }
    const amountValue = numericValue === "" ? undefined : Number(numericValue);
    setTotalAmount(amountValue);
    if (!amountValue) {
      setError("Amount");
      return;
    } else if (amountValue) {
      setError(null);
    }
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length > 3) {
      return;
    }
    const periodValue = numericValue === "" ? undefined : Number(numericValue);
    setPaymentPeriod(periodValue);
    if (!periodValue) {
      setError("Payment");
      return;
    } else if (periodValue) {
      setError(null);
    }
  };

  const handleClose = () => {
    setErrorState(["", false]);
    setInvoiceFiles([]);
    setReceiptFiles([]);
    setBusOperator("");
    setPaymentPeriod(0);
    setTotalAmount(0);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorState(["", false]);
    if (invoiceFiles.length === 0) {
      setErrorState(["Please upload invoice files.", true]);
      return;
    } else if (receiptFiles.length === 0) {
      setErrorState(["Please upload receipt files.", true]);
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      invoiceFiles.forEach((file) => formData.append("invoiceFiles", file));
      receiptFiles.forEach((file) => formData.append("receiptFiles", file));
      formData.append("busOperator", busOperator);
      formData.append("paymentPeriod", paymentPeriod?.toString() || "");
      formData.append("totalAmount", totalAmount?.toString() || "");
      await createInvoice(formData);
    } catch (error) {
      console.error(error);
    } finally {
      setErrorState(["", false]);
      setLoading(false);
      setInvoiceFiles([]);
      setReceiptFiles([]);
      setBusOperator("");
      setPaymentPeriod(0);
      setTotalAmount(0);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 duration-700 ease-out">
      <div className="lightGray py-6 px-8 rounded-lg shadow-lg add_transaction_dialguebox flex flex-col gap-1 duration-700 ease-out">
        <div className="w-full flex flex-row justify-between">
          <p className="text-lg text-black font-semibold">Add Transaction</p>
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <Image
              src="/img/icons/Close-Icon.svg"
              alt="Close"
              width={20}
              height={20}
            />
          </button>
        </div>

        <form
          className="w-full flex flex-col gap-4 mt-3"
          onSubmit={handleSubmit}
        >
          <div>
            <p className="mb-1 darkGray-text font-normal text-sm">
              Transaction ID
            </p>
            <Input
              type="text"
              placeholder="Enter ID"
              disabled
              className="h-12 rounded-lg bg-white text-gray-500 border-gray-300"
            />
          </div>
          <div className="w-full">
            <p className="mb-1 darkGray-text font-normal text-sm">
              Bus Operator
            </p>
            <Popover open={openOperator} onOpenChange={setOpenOperator}>
              <PopoverTrigger
                asChild
                className="w-full h-12 rounded-lg text-gray-500 border-gray-700"
              >
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openOperator}
                  className="w-full justify-between outline-none"
                >
                  {selectedOperator?.name || "Select operator..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 select-dropdown_add_trans">
                <Command>
                  <CommandInput placeholder="Search operator..." />
                  <CommandList className="w-full">
                    <CommandEmpty>No operator found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        key="clear"
                        value=""
                        onSelect={() => {
                          setBusOperator(""); // Clear selection
                          setOpenOperator(false);
                        }}
                        className="cursor-pointer w-full"
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            busOperator === "" ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        Clear
                      </CommandItem>
                      {operators.map((operator) => (
                        <CommandItem
                          key={operator.id}
                          value={operator.id}
                          onSelect={() => {
                            setBusOperator(operator.id); // Save operator ID instead of name
                            setOpenOperator(false);
                          }}
                          className="cursor-pointer w-full"
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              operator.id === busOperator
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          {operator.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <p className="mb-1 darkGray-text font-normal text-sm">
              Payment Period
            </p>
            <Input
              min={0}
              type="number"
              placeholder="Enter period"
              value={paymentPeriod}
              onChange={handlePeriodChange}
              required
              className="h-12 rounded-lg bg-white text-gray-500 border-gray-300"
            />
            {error === "Payment" && (
              <p className="text-red-500">Payment Period is required</p>
            )}
          </div>
          <div>
            <p className="mb-1 darkGray-text font-normal text-sm">
              Total Amount
            </p>
            <Input
              min={0}
              type="number"
              placeholder="$"
              value={totalAmount}
              onChange={handleAmountChange}
              required
              className="h-12 rounded-lg bg-white text-gray-500 border-gray-300"
            />
            {error === "Amount" && (
              <p className="text-red-500">Total amount is required</p>
            )}
          </div>

          {/* Drag and Drop */}
          <div className="w-full">
            <div className="w-full flex flex-row items-start justify-between gap-4">
              <div className="w-full relative">
                <p className="mb-1 darkGray-text font-normal text-sm">
                  Upload Invoice
                </p>
                {invoiceFiles.length > 0 ? (
                  <div className="relative flex flex-col items-center justify-evenly h-40 border-2 bg-white border-gray-400 rounded-lg p-6">
                    <button
                      onClick={clearInvoiceFiles}
                      className="absolute bg-kupi-yellow remove-file"
                    >
                      <Image
                        src="/img/icons/Close-Icon.svg"
                        alt="Close"
                        width={20}
                        height={20}
                      />
                    </button>
                    <Image
                      src="/img/icons/pdf.svg"
                      alt="Pdf"
                      width={60}
                      height={60}
                    />
                    {invoiceFiles?.[0]?.name.length > 15
                      ? `${invoiceFiles?.[0]?.name.slice(
                          0,
                          15
                        )}.${invoiceFiles?.[0]?.name.split(".").pop()}`
                      : invoiceFiles?.[0]?.name}
                  </div>
                ) : (
                  <div
                    {...getInvoiceRootProps()}
                    className={`h-40 w-auto flex justify-center items-center cursor-pointer border-2 border-dashed border-gray-400 rounded-lg p-6 ${
                      isInvoiceDragActive ? "bg-gray-200" : "bg-white"
                    }`}
                  >
                    <input {...getInvoiceInputProps()} />
                    <div className="w-full flex flex-col items-center justify-center">
                      <Image
                        src="/img/icons/Upload icon.svg"
                        alt="Upload"
                        width={50}
                        height={50}
                      />
                      <p className="text-xs mt-2">
                        Drag & drop files or{" "}
                        <span className="text-yellow-500 underline">
                          Browse
                        </span>
                      </p>
                      <span className="text-gray-400 text-xs mt-2">
                        Supported Formats:
                      </span>
                      <span className="text-gray-400 text-xs">PDF</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full relative">
                <p className="mb-1 darkGray-text font-normal text-sm">
                  Upload Receipt
                </p>
                {receiptFiles.length > 0 ? (
                  <div className="relative flex flex-col items-center justify-evenly h-40 border-2 bg-white border-gray-400 rounded-lg p-6">
                    <button
                      onClick={clearReceiptFiles}
                      className="absolute bg-kupi-yellow remove-file"
                    >
                      <Image
                        src="/img/icons/Close-Icon.svg"
                        alt="Close"
                        width={20}
                        height={20}
                      />
                    </button>
                    <Image
                      src="/img/icons/pdf.svg"
                      alt="Pdf"
                      width={60}
                      height={60}
                    />
                    {receiptFiles?.[0]?.name.length > 15
                      ? `${receiptFiles?.[0]?.name.slice(
                          0,
                          15
                        )}.${receiptFiles?.[0]?.name.split(".").pop()}`
                      : receiptFiles?.[0]?.name}
                  </div>
                ) : (
                  <div
                    {...getReceiptRootProps()}
                    className={`h-40 w-auto flex justify-center items-center cursor-pointer border-2 border-dashed border-gray-400 rounded-lg p-6 ${
                      isReceiptDragActive ? "bg-gray-200" : "bg-white"
                    }`}
                  >
                    <input {...getReceiptInputProps()} />
                    <div className="w-full flex flex-col items-center justify-center">
                      <Image
                        src="/img/icons/Upload icon.svg"
                        alt="Upload"
                        width={50}
                        height={50}
                      />
                      <p className="text-xs mt-2">
                        Drag & drop files or{" "}
                        <span className="text-yellow-500 underline">
                          Browse
                        </span>
                      </p>
                      <span className="text-gray-400 text-xs mt-2">
                        Supported Formats:
                      </span>
                      <span className="text-gray-400 text-xs">PDF</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {errorState[1] && errorState[0] && (
              <p className="text-red-500">Invoice and Receipt required</p>
            )}
          </div>

          <div className="w-full flex justify-end gap-3 mt-4">
            <button
              onClick={handleClose}
              className="border-gray-600 py-1 px-8 bg-transparent border-2 rounded-lg text-gray-600"
            >
              Cancel
            </button>
            <button
              disabled={loading || error !== null}
              type="submit"
              className={`${
                loading || error !== null ? "opacity-50" : ""
              } py-2 px-10 bg-kupi-yellow rounded-lg font-semibold`}
            >
              {loading ? "Please Wait" : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTreansactionDialogue;
