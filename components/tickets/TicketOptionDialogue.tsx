'use client'
import React, { useState } from 'react'
import { TicketsDataType } from '@/types/ticket';
import TicketDetailDialgue from './TicketDetailDialgue'
import Image from 'next/image';

interface DialogProps {
    open: boolean;
    onClose: () => void;
    TicketData: TicketsDataType | null;
}


const TicketOptionDialogue: React.FC<DialogProps> = ({ open, onClose, TicketData }) => {
    
    
    const [dialogOpen, setDialogOpen] = useState(false);
    const [TransactionDialogOpen, setTransactionDialogOpen] = useState(false);

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };
    const handleCloseTansactionDialog = () => {
        setTransactionDialogOpen(false);
    };

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
                
                <div className='flex flex-row items-center justify-evenly mt-5 mb-5'>
                    <button className='bg-kupi-yellow px-4 py-2 rounded-md flex flex-row gap-4 items-center justify-center' onClick={() => setDialogOpen(true)}>
                        <Image src="/img/sidebar/tickets.svg" alt='Tickets' height={22} width={22}/>
                        Ticket
                    </button>
                    <button className='bg-kupi-yellow px-4 py-2 rounded-md flex flex-row gap-4 items-center justify-center'>
                        <Image src="/img/sidebar/transactions.svg" alt='Tickets' height={28} width={28}/>
                        Transaction
                    </button>
                </div>

                <div className='w-full'>
                    <TicketDetailDialgue open={dialogOpen} onClose={handleCloseDialog} TicketData={TicketData}/>
                </div>

                <div className='w-full flex justify-end'>
                    <button onClick={onClose}  className='border-gray-600 py-1 px-8 bg-transparent border-2 rounded-lg text-gray-600'>Close</button>
                </div>

            </div>
        </div>
  )
}

export default TicketOptionDialogue