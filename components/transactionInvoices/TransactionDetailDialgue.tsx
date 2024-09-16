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

    const busCompanyAmount = TransactionData?.tickets && (TransactionData?.tickets[0].priceDetails.kupiMarkup -  TransactionData?.tickets[0].priceDetails.kupiProfit) - (TransactionData?.tickets[0].priceDetails.carmaProfit - TransactionData?.tickets[0].priceDetails.totalPrice )
    const kupiCommissionPercent = TransactionData?.tickets && TransactionData?.tickets[0].priceDetails.kupiCommissionPercentage + TransactionData?.tickets[0].priceDetails.kupiMarkupPercentage
    const KupiAmount = TransactionData?.tickets && TransactionData?.tickets[0].priceDetails.kupiMarkup +  TransactionData?.tickets[0].priceDetails.kupiProfit

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 duration-700 ease-out">
        <div className="lightGray py-6 px-8 rounded-lg shadow-lg transaction_dialguebox flex flex-col gap-1 duration-700 ease-out">

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
                <div className='w-full flex flex-wrap justify-between gap-2'>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Customer Name</p>
                        <span>{TransactionData?.customer.name}</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Customer Phone</p>
                        <span>+{TransactionData?.customer.number}</span>
                    </div>
                </div>
            </div>

            <div className='bg-white rounded-lg px-8 py-4 flex flex-col items-start justify-center gap-4 border-2'>
                <p className='text-black font-semibold text-md'>Route Information</p>
                <div className='w-full flex flex-wrap justify-between gap-2'>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Ticket ID</p>
                        <span>{TransactionData?.tickets && TransactionData?.tickets[0]?.ticketId}</span> 
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Bus Number</p>
                        <span>{TransactionData?.tickets && TransactionData?.tickets && TransactionData?.tickets[0]?.busIdentifier}</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Departure Location</p>
                        <span>{TransactionData?.tickets && TransactionData?.tickets &&TransactionData.sourceCity?.name}</span> 
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Arrival Location</p>
                        <span>{TransactionData?.tickets && TransactionData.arrivalCity?.name}</span> 
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Departure Time</p>
                        {TransactionData?.tickets && TransactionData?.tickets[0].departureTime.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Arrival Time</p>
                        {TransactionData?.tickets && TransactionData?.tickets[0].arrivalTime.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                </div>
            </div>

            <div className='bg-white rounded-lg px-8 py-4 flex flex-col items-start justify-center gap-4 border-2'>
                <p className='text-black font-semibold text-md'>Ticket Price Detail</p>
                <div className='w-full flex flex-wrap justify-between gap-2'>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Payment Method</p>
                        <span>{TransactionData?.transactions.paymentMethod}</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Bus Company Amount</p>
                        <span>${busCompanyAmount}</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Carma Commission</p>
                        <span>{TransactionData?.tickets && TransactionData?.tickets[0].priceDetails.carmaCommissionPercentage}%</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Carma Amount</p>
                        <span>${TransactionData?.tickets && TransactionData?.tickets[0].priceDetails.carmaProfit}</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Kupi Commission</p>
                        {TransactionData?.tickets && TransactionData?.tickets[0].priceDetails.kupiMarkupPercentage > 0 ? (
                            <span>({TransactionData?.tickets && TransactionData?.tickets[0].priceDetails.kupiCommissionPercentage}% + {TransactionData?.tickets[0].priceDetails.kupiMarkupPercentage}%) = {kupiCommissionPercent}%</span>
                        ) : (
                            <span>{TransactionData?.tickets && TransactionData?.tickets[0].priceDetails.kupiCommissionPercentage}%</span>
                        )}
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Kupi Amount</p>
                        {TransactionData?.tickets && TransactionData?.tickets[0].priceDetails.kupiMarkup > 0 ? (
                            <span>(${TransactionData?.tickets && TransactionData?.tickets[0].priceDetails.kupiMarkup.toFixed(1)} + ${TransactionData?.tickets && TransactionData?.tickets[0].priceDetails.kupiProfit.toFixed(1)}) = ${KupiAmount && KupiAmount.toFixed(1)}</span>
                        ) : (
                            <span>${TransactionData?.tickets && TransactionData?.tickets[0].priceDetails.kupiProfit.toFixed(1)}</span>
                        )}
                        
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