'use client'
import React, { useMemo, useState } from 'react'
import { Input } from '../ui/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import TicketTable from './TicketTable'
import { TicketData } from './Data';

const TicketList: React.FC = () => {


    const [busOperator, setBusOperator] = useState('');
    const [source, setSource] = useState('');
    const [destinationCity, setDestinationCity] = useState('');
    const [arrivalCity, setArrivalCity] = useState('');
    const [onlyPending, setOnlyPending] = useState(false);

    const filteredData = useMemo(() => {
        return TicketData.filter(ticket => {
            return (
                (!busOperator || ticket.BusNumber.toLowerCase().includes(busOperator.toLowerCase())) &&
                (!source || ticket.source === source) &&
                (!destinationCity || ticket.DepartureLocation.toLowerCase().includes(destinationCity.toLowerCase())) &&
                (!arrivalCity || ticket.ArrivalLocation.toLowerCase().includes(arrivalCity.toLowerCase())) &&
                (!onlyPending || ticket.status === 'Reserved')
            );
        });
    }, [busOperator, source, destinationCity, arrivalCity, onlyPending]);

  return (
    <div className='w-full flex items-center mt-10 justify-center'>

        <div className='h-full w-full bg-white shadow-sm rounded-md px-8 py-8 mb-5'>
            <div className='w-full flex flex-row items-start justify-between'>
                <p className='text-lg text-black font-semibold'>Tickets List</p>
                <div className='flex flex-row gap-10 border-2 border-gray-400 px-4 py-3 rounded-lg box-bg'>
                    <p className='darkGray-text font-normal text-sm'>Pending Tickets</p>
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
                    <p className="mb-1 darkGray-text font-normal text-sm">Search Source</p>
                    <Select value={source} onValueChange={setSource}>
                        <SelectTrigger className="w-full h-12 rounded-lg text-gray-500 border-gray-700">
                            <SelectValue placeholder="Select source"/>
                        </SelectTrigger>
                        <SelectContent className='select-dropdown z-50'>
                            <SelectItem value="Carma">Carma</SelectItem>
                            <SelectItem value="Kupi">Kupi</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className='w-3/12'>
                    <p className="mb-1 darkGray-text font-normal text-sm">Search Destination City</p>
                    <Input type='text' value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} placeholder='Search by city' className="h-12 rounded-lg text-gray-500 border-gray-700"/>
                </div>
                <div className='w-3/12'>
                    <p className="mb-1 darkGray-text font-normal text-sm">Search Arrival City</p>
                    <Input type='text'  value={arrivalCity}  onChange={(e) => setArrivalCity(e.target.value)} placeholder='Search by city' className="h-12 rounded-lg text-gray-500 border-gray-700"/>
                </div>
            </div>


            <TicketTable TicketData={filteredData}/>

        </div>

    </div>
  )
}

export default TicketList