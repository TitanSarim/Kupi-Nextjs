'use client'
import React, {useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { Calendar as CalendarIcon } from "lucide-react"
import TicketTable from './TransactionTable'
import { useRouter } from 'next/navigation'
import { TransactionReturn } from '@/types/transactions'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"


const TransactionList: React.FC<TransactionReturn> = ({transactionData, paginationData}) => {

    const [busOperator, setBusOperator] = useState('');
    const [source, setSource] = useState('');
    const [destinationCity, setDestinationCity] = useState('');
    const [arrivalCity, setArrivalCity] = useState('');
    const [onlyPending, setOnlyPending] = useState(false);
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: new Date(2022, 0, 20),
        to: addDays(new Date(2022, 0, 20), 20),
    })


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
                <div className='w-3/12 grid gap-2'>
                    <p className="mb-1 darkGray-text font-normal text-sm">Select Date</p>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className="w-full flex flex-row justify-between h-12 rounded-lg text-gray-500 border-gray-700"
                            >
                                {date?.from ? (
                                    date.to ? (
                                    <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="mr-2 h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={1}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <TicketTable transactionData={transactionData} paginationData={paginationData}/>

        </div>

    </div>
  )
}

export default TransactionList