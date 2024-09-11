'use client'
import React from 'react';
import Image from 'next/image';
import { TransactionStatus } from '@/types/transactions';
import { TransactionsType } from '@/types/transactions';

interface DialogProps {
    open: boolean;
    onClose: () => void;
    TransactionData: TransactionsType | null;
}

const TransactionDetailDialgue : React.FC<DialogProps> = ({ open, onClose, TransactionData }) => {

    if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 duration-700 ease-out">
        <div className="lightGray py-6 px-8 rounded-lg shadow-lg dialguebox flex flex-col gap-2 duration-700 ease-out">

            <div className='w-full flex flex-row justify-between'>
                <p className='text-lg text-black font-semibold'>Transaction Detail</p>
                <button 
                    onClick={onClose} 
                    className="text-gray-600 hover:text-gray-800"
                >
                    <Image src="/img/icons/Close-Icon.svg" alt="Close" width={20} height={20}/>
                </button>
            </div>

            <div className='relative bg-white rounded-lg px-8 py-4 flex flex-col items-start justify-center gap-4 border-2'>
                {TransactionData?.paymentReference?.status === TransactionStatus.Paid && <p className='transaction-paid'>Paid</p>}
                <p className='text-black font-semibold text-md'>Customer Information</p>
                <div className='flex flex-wrap justify-between gap-4'>
                    <div>
                        <p className='text-gray-600 font-light'>Customer Name</p>
                        <span>{TransactionData?.customer.name}</span>
                    </div>
                    <div >
                        <p className='text-gray-600 font-light'>Customer Phone</p>
                        <span>+{TransactionData?.customer.number}</span>
                    </div>
                    <div >
                        <p className='text-gray-600 font-light'>Passport Number</p>
                        <span>NA</span>
                    </div>
                </div>
            </div>

            <div className='bg-white rounded-lg px-8 py-4 flex flex-col items-start justify-center gap-4 border-2'>
                <p className='text-black font-semibold text-md'>Route Information</p>
                <div className='w-full flex flex-wrap justify-between gap-4'>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Ticket ID</p>
                        <span>NA</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Bus Number</p>
                        <span>NA</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Departure Location</p>
                        <span className='break-words'>NA</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Arrival Location</p>
                        <span>NA</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Departure Time</p>
                        <span>NA</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Arrival Time</p>
                        <span>NA</span>
                    </div>
                </div>
            </div>

            <div className='bg-white rounded-lg px-8 py-4 flex flex-col items-start justify-center gap-4 border-2'>
                <p className='text-black font-semibold text-md'>Ticket Price Detail</p>
                <div className='w-full flex flex-wrap justify-between gap-4'>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Payment Method</p>
                        <span>{TransactionData?.transactions.paymentMethod}</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Ticket Price</p>
                        <span>${TransactionData?.transactions.totalAmount}</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Carma Commission</p>
                        <span>NA%</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Carma Amount</p>
                        <span>$NA</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Kupi Commission</p>
                        <span>NA%</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Kupi Amount</p>
                        <span>$NA</span>
                    </div>
                </div>
                <div className='w-full hrGap bg-gray-500'>
                </div>
                <div className='flex w-full flex-row justify-between'>
                    <p className='text-gray-600 font-light'>Total Price</p>
                    <p className='text-black font-semibold text-md'>${TransactionData?.paymentReference?.amount}</p>
                </div>
            </div>

            <div className='w-full flex justify-end'>
                <button onClick={onClose}  className='border-gray-600 py-1 px-8 bg-transparent border-2 rounded-lg text-gray-600'>Close</button>
            </div>
            
        </div>
    </div>
  )
}

export default TransactionDetailDialgue