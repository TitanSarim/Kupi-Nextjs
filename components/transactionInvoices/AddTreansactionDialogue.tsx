'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useDropzone } from 'react-dropzone';
import { createInvoice, getBusOperators } from '@/actions/transactions.actions';
import { InvoiceFormData, OperatorsType } from '@/types/transactions';

interface DialogProps {
    open: boolean;
    onClose: () => void;
}

const AddTreansactionDialogue: React.FC<DialogProps> = ({ open, onClose}) => {

    const [invoiceFiles, setInvoiceFiles] = useState<File[]>([]);
    const [receiptFiles, setReceiptFiles] = useState<File[]>([]);
    const [busOperator, setBusOperator] = useState<string>('')
    const [paymentPeriod, setPaymentPeriod] = useState<number>()
    const [totalAmount, setTotalAmount] = useState<number>();
    const [error, setError] = useState<string | null>(null);
    const [operators, setOperators] = useState<OperatorsType[]>([])

    const { getRootProps: getInvoiceRootProps, getInputProps: getInvoiceInputProps, isDragActive: isInvoiceDragActive} = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 1) {
                setError('You can only upload one file.');
                return;
            }

            const file = acceptedFiles[0];
            if (file.type !== 'application/pdf') {
              setError('Only PDF files are allowed.');
              return;
            }
      
            setError(null); 
            setInvoiceFiles(acceptedFiles);

        },
        accept: { 'application/pdf': [] },
        maxFiles: 1,
    });

    const { getRootProps: getReceiptRootProps, getInputProps: getReceiptInputProps, isDragActive: isReceiptDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
          if (acceptedFiles.length > 1) {
            setError('You can only upload one file.');
            return;
          }
    
          const file = acceptedFiles[0];
          if (file.type !== 'application/pdf') {
            setError('Only PDF files are allowed.');
            return;
          }
    
          setError(null); 
          setReceiptFiles(acceptedFiles);
        },
        accept: { 'application/pdf': [] },
        maxFiles: 1,
    });

    const clearInvoiceFiles = () => {
        setInvoiceFiles([]);
    };

    const clearReceiptFiles = () => {
        setReceiptFiles([]);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === '' ? undefined : Number(e.target.value);
        setTotalAmount(value);
    };
    const handlePeriodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === '' ? undefined : Number(e.target.value);
        setPaymentPeriod(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        try {
            const formData: any = {
                busOperator,
                paymentPeriod,
                totalAmount,
                invoiceFiles: invoiceFiles.map(file => ({
                    name: file.name,
                    type: file.type,
                    size: file.size
                })),
                receiptFiles: receiptFiles.map(file => ({
                    name: file.name,
                    type: file.type,
                    size: file.size
                })),
            }

            console.log("formData", formData)

            const res = await createInvoice(formData)
            console.log("res", res)
            
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        const fetchBusOperators = async () => {
            try {
                const operators = await getBusOperators();
                if(!operators){
                    return null;
                }
                setOperators(operators);
            } catch (error) {
                console.error(error);
            }
        };

        fetchBusOperators();  // Call the async function
    }, []);

    if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 duration-700 ease-out">
        <div className="lightGray py-6 px-8 rounded-lg shadow-lg add_transaction_dialguebox flex flex-col gap-1 duration-700 ease-out">

            <div className='w-full flex flex-row justify-between'>
                <p className='text-lg text-black font-semibold'>Add Transaction</p>
                <button 
                    onClick={onClose} 
                    className="text-gray-600 hover:text-gray-800"
                >
                    <Image src="/img/icons/Close-Icon.svg" alt="Close" width={20} height={20}/>
                </button>
            </div>
            
            <form className='w-full flex flex-col gap-4 mt-3' onSubmit={handleSubmit}>
                <div>
                    <p className='mb-1 darkGray-text font-normal text-sm'>Transaction ID</p>
                    <Input type='text' placeholder='Enter ID' disabled className="h-12 rounded-lg bg-white text-gray-500 border-gray-300"/>
                </div>
                <div className='w-full'>
                    <p className='mb-1 darkGray-text font-normal text-sm'>Bus Operator</p>
                    <Select value={busOperator} onValueChange={setBusOperator}>
                        <SelectTrigger className="w-full h-12 rounded-lg bg-white text-gray-900 border-gray-300">
                            <SelectValue placeholder="Search by city"/>
                        </SelectTrigger>
                        <SelectContent className='select-dropdown_add_trans z-50 max-h-28 overflow-y-auto'>
                            {operators.map((operator)=> (
                                <SelectItem key={operator.id} value={operator.id}>{operator.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <p className='mb-1 darkGray-text font-normal text-sm'>Payment Period</p>
                    <Input type='number' placeholder='Enter period' value={paymentPeriod} onChange={handlePeriodChange} required className="h-12 rounded-lg bg-white text-gray-500 border-gray-300"/>
                </div>
                <div>
                    <p className='mb-1 darkGray-text font-normal text-sm'>Total Amount</p>
                    <Input type='number' placeholder='$' value={totalAmount} onChange={handleAmountChange} required className="h-12 rounded-lg bg-white text-gray-500 border-gray-300"/>
                </div>

                {/* Drag and Drop */}
                <div className="w-full">
                    <div className='w-full flex flex-row items-start justify-between gap-4'>
                        
                        <div className='w-full relative'>
                            <p className='mb-1 darkGray-text font-normal text-sm'>Upload Invoice</p>
                                {invoiceFiles.length > 0 ? (
                                    <div className='relative flex flex-col items-center justify-evenly h-40 border-2 bg-white border-gray-400 rounded-lg p-6'>
                                        <button onClick={clearInvoiceFiles} className='absolute bg-kupi-yellow remove-file'><Image src="/img/icons/Close-Icon.svg" alt="Close" width={20} height={20}/></button>
                                        <Image src="/img/icons/pdf.svg" alt='Pdf' width={60} height={60}/>
                                        {invoiceFiles[0].name.length > 15
                                        ? `${invoiceFiles[0].name.slice(0,15)}.${invoiceFiles[0].name.split('.').pop()}`
                                        : invoiceFiles[0].name}
                                    </div>
                                ) : (
                                <div
                                    {...getInvoiceRootProps()}
                                    className={`h-40 w-auto flex justify-center items-center cursor-pointer border-2 border-dashed border-gray-400 rounded-lg p-6 ${
                                        isInvoiceDragActive ? 'bg-gray-200' : 'bg-white'
                                    }`}
                                >
                                <input {...getInvoiceInputProps()} />
                                <div className='w-full flex flex-col items-center justify-center'>
                                    <Image src='/img/icons/Upload icon.svg' alt='Upload' width={50} height={50}/>
                                    <p className='text-xs mt-2'>Drag & drop files or <span className='text-yellow-500 underline'>Browse</span></p>
                                    <span className='text-gray-400 text-xs mt-2'>Supported Formats:</span>
                                    <span className='text-gray-400 text-xs'>JPEG, PNG, PDF, PSD, Word</span>
                                </div>
                            </div>
                            )}
                        </div>

                        <div className='w-full relative'>
                            <p className='mb-1 darkGray-text font-normal text-sm'>Upload Receipt</p>
                                {receiptFiles.length > 0 ? (
                                    <div className='relative flex flex-col items-center justify-evenly h-40 border-2 bg-white border-gray-400 rounded-lg p-6'>
                                        <button onClick={clearReceiptFiles} className='absolute bg-kupi-yellow remove-file'><Image src="/img/icons/Close-Icon.svg" alt="Close" width={20} height={20}/></button>
                                        <Image src="/img/icons/pdf.svg" alt='Pdf' width={60} height={60}/>
                                        {receiptFiles[0].name.length > 15
                                        ? `${receiptFiles[0].name.slice(0,15)}.${receiptFiles[0].name.split('.').pop()}`
                                        : receiptFiles[0].name}
                                    </div>
                                ) : (
                                <div
                                    {...getReceiptRootProps()}
                                    className={`h-40 w-auto flex justify-center items-center cursor-pointer border-2 border-dashed border-gray-400 rounded-lg p-6 ${
                                        isReceiptDragActive ? 'bg-gray-200' : 'bg-white'
                                    }`}
                                >
                                <input {...getReceiptInputProps()} />
                                <div className='w-full flex flex-col items-center justify-center'>
                                    <Image src='/img/icons/Upload icon.svg' alt='Upload' width={50} height={50}/>
                                    <p className='text-xs mt-2'>Drag & drop files or <span className='text-yellow-500 underline'>Browse</span></p>
                                    <span className='text-gray-400 text-xs mt-2'>Supported Formats:</span>
                                    <span className='text-gray-400 text-xs'>JPEG, PNG, PDF, PSD, Word</span>
                                </div>
                            </div>
                            )}
                        </div>

                    </div>

                </div>

                <div className='w-full flex justify-end gap-3 mt-4'>
                    <button onClick={onClose}  className='border-gray-600 py-1 px-8 bg-transparent border-2 rounded-lg text-gray-600'>Cancel</button>
                    <button type='submit' className='border-gray-600 py-1 px-8 bg-kupi-yellow rounded-lg '>Add Transaction</button>
                </div>

            </form>

        </div>
    </div>
  )
}

export default AddTreansactionDialogue