'use client'
import React, {useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { Calendar as CalendarIcon } from "lucide-react"
import TicketTable from './TransactionTable'
import { useRouter } from 'next/navigation'
import { TransactionReturn } from '@/types/transactions'
import Datepicker from "react-tailwindcss-datepicker";


const TransactionList: React.FC<TransactionReturn> = ({transactionData, paginationData}) => {

    const NEXT_MONTH = new Date();
    NEXT_MONTH.setMonth(NEXT_MONTH.getMonth() + 1);

    const [busOperator, setBusOperator] = useState('');
    const [source, setSource] = useState('');
    const [destinationCity, setDestinationCity] = useState('');
    const [arrivalCity, setArrivalCity] = useState('');
    const [onlyPending, setOnlyPending] = useState(false);
    const [value, setValue] = useState<{ startDate: Date; endDate: Date }>({
        startDate: new Date(),
        endDate: NEXT_MONTH,
    });

    const router = useRouter();
    const params = new URLSearchParams();

    const updateSearchParams = () => {
        if (busOperator) params.set('busId', busOperator);
        if (source) params.set('source', source);
        if (destinationCity) params.set('destinationCity', destinationCity);
        if (arrivalCity) params.set('arrivalCity', arrivalCity);
        if (onlyPending) params.set('onlyPending', String(onlyPending));
        router.push(`?${params.toString()}`, { scroll: false });
    };
    
    const handleValueChange = (newValue: { startDate: Date | null; endDate: Date | null } | null) => {
        // Handle case when newValue is null
        if (newValue && newValue.startDate && newValue.endDate) {
            setValue({
                startDate: new Date(newValue.startDate),
                endDate: new Date(newValue.endDate),
            });
        }
    };
    useEffect(() => {
        
        const timer = setTimeout(() => {
            updateSearchParams();
        }, 500)

        return () => {
            clearTimeout(timer)
        }
    }, [busOperator, source, destinationCity, arrivalCity, onlyPending]);

  return (
    <div className='w-full flex items-center mt-10 justify-center'>

        <div className='h-full w-full bg-white shadow-sm rounded-md px-8 py-8 mb-5'>
            <div className='w-full flex flex-row items-start justify-between'>
                <p className='text-lg text-black font-semibold'>Transaction List</p>
                <div className='flex flex-row gap-10 border-2 border-gray-400 px-4 py-3 rounded-lg box-bg'>
                    <p className='darkGray-text font-normal text-sm'>Transactions Type</p>
                    <label className='switch'>
                        <input type='checkbox' checked={onlyPending} onChange={() => setOnlyPending(prev => !prev)}/>
                        <span className='slider round'></span>
                    </label>
                </div>
            </div>

            <div >
                <p className="mb-1 darkGray-text font-normal text-sm">Bus Operator</p>
                <Input type='text'  value={busOperator} onChange={(e) => setBusOperator(e.target.value)} placeholder='Search bus operator' className="h-12 rounded-lg text-gray-500 border-gray-700"/>
            </div>

            <div className='w-full flex flex-wrap justify-between mt-6'>
                <div className='w-3/12'>
                    <p className="mb-1 darkGray-text font-normal text-sm">Search Departure City</p>
                    <Input type='text' value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} placeholder='Search by city' className="h-12 rounded-lg text-gray-500 border-gray-700"/>
                </div>
                <div className='w-3/12'>
                    <p className="mb-1 darkGray-text font-normal text-sm">Search Arrival City</p>
                    <Input type='text' value={destinationCity} onChange={(e) => setArrivalCity(e.target.value)} placeholder='Search by city' className="h-12 rounded-lg text-gray-500 border-gray-700"/>
                </div>
                <div className='w-3/12'>
                    <p className="mb-1 darkGray-text font-normal text-sm">Select Date</p>
                        <Datepicker
                            primaryColor={"yellow"}
                            value={value} 
                            onChange={handleValueChange}
                            showShortcuts={true}
                            inputClassName="h-12 w-full border text-gray-500 px-2 border-gray-700 rounded-lg"
                        /> 
                </div>
            </div>

            <TicketTable transactionData={transactionData} paginationData={paginationData}/>

        </div>

    </div>
  )
}

export default TransactionList