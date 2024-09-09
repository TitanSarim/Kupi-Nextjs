import React, { ReactNode } from 'react';
import Image from 'next/image';
// import { TicketStatus } from '@/types/ticket';
import { Tickets } from '@prisma/client';

interface DialogProps {
    open: boolean;
    onClose: () => void;
    ticket: Tickets | null;
}


const TicketDetailDialgue : React.FC<DialogProps> = ({ open, onClose, ticket }) => {

    if (!open) return null;


  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 duration-700 ease-out">
        <div className="lightGray py-6 px-8 rounded-lg shadow-lg dialguebox flex flex-col gap-2 duration-700 ease-out">

            <div className='w-full flex flex-row justify-between'>
                <p className='text-lg text-black font-semibold'>Ticket Detail</p>
                <button 
                    onClick={onClose} 
                    className="text-gray-600 hover:text-gray-800"
                >
                    <Image src="/img/icons/Close-Icon.svg" alt="Close" width={20} height={20}/>
                </button>
            </div>

            {/* <div className='relative bg-white rounded-lg px-8 py-4 flex flex-col items-start justify-center gap-4 border-2'>
                {ticket?.status === TicketStatus.SOLD && <p className='ticket-sold'>Sold</p>}
                <p className='text-black font-semibold text-md'>Customer Information</p>
                <div className='flex flex-wrap justify-between gap-4'>
                    <div>
                        <p className='text-gray-600 font-light'>Customer Name</p>
                        <span>{ticket?.CustomerName}</span>
                    </div>
                    <div >
                        <p className='text-gray-600 font-light'>Customer Phone</p>
                        <span>{ticket?.CustomerPhone}</span>
                    </div>
                    <div >
                        <p className='text-gray-600 font-light'>Passport Number</p>
                        <span>{ticket?.PassportNumber}</span>
                    </div>
                </div>
            </div> */}

            {/* <div className='bg-white rounded-lg px-8 py-4 flex flex-col items-start justify-center gap-4 border-2'>
                <p className='text-black font-semibold text-md'>Route Information</p>
                <div className='w-full flex flex-wrap justify-between gap-4'>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Ticket ID</p>
                        <span>{ticket?.TicketID}</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Bus Number</p>
                        <span>{ticket?.BusNumber}</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Departure Location</p>
                        <span className='break-words'>{ticket?.DepartureLocation}</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Arrival Location</p>
                        <span>{ticket?.ArrivalLocation}</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Departure Time</p>
                        <span>{ticket?.DepartureTime}</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Arrival Time</p>
                        <span>{ticket?.ArrivalTime}</span>
                    </div>
                </div>
            </div> */}

            {/* <div className='bg-white rounded-lg px-8 py-4 flex flex-col items-start justify-center gap-4 border-2'>
                <p className='text-black font-semibold text-md'>Ticket Price Detail</p>
                <div className='w-full flex flex-wrap justify-between gap-4'>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Payment Method</p>
                        <span>{ticket?.PaymentMethod}</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Ticket Price</p>
                        <span>${ticket?.TicketPrice}</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Carma Commission</p>
                        <span>{ticket?.CarmaCommission}%</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Carma Amount</p>
                        <span>${ticket?.CarmaAmount}</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Kupi Commission</p>
                        <span>{ticket?.KupiCommission}%</span>
                    </div>
                    <div className='w-5/12'>
                        <p className='text-gray-600 font-light'>Kupi Amount</p>
                        <span>${ticket?.KupiAmount}</span>
                    </div>
                </div>
                <div className='w-full hrGap bg-gray-500'>
                </div>
                <div className='flex w-full flex-row justify-between'>
                    <p className='text-gray-600 font-light'>Total Price</p>
                    <p className='text-black font-semibold text-md'>${ticket?.totalPrice}</p>
                </div>
            </div> */}

            <div className='w-full flex justify-end'>
                <button onClick={onClose}  className='border-gray-600 py-1 px-8 bg-transparent border-2 rounded-lg text-gray-600'>Close</button>
            </div>
            
        </div>
    </div>
  )
}

export default TicketDetailDialgue