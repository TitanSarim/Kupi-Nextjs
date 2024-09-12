'use client'
import React, {useEffect, useState } from 'react'
import { Input } from '../ui/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import TicketTable from './TicketTable'
import { useRouter } from 'next/navigation'
import { TicketsReturn } from '@/types/ticket'
import { getAllMatchedCity } from '@/actions/search.action'


const TicketList: React.FC<TicketsReturn> = ({ticketData, paginationData}) => {

    const [cities, setCities] = useState<string[]>([])
    const [busOperator, setBusOperator] = useState('');
    const [source, setSource] = useState('');
    const [destinationCity, setDestinationCity] = useState('');
    const [arrivalCity, setArrivalCity] = useState('');
    const [onlyPending, setOnlyPending] = useState(false);
    const [suggestedCity, setSuggestedCity] = useState('');

    useEffect(() => {
        const fetchCities = async () => {
          try {
            const res = await getAllMatchedCity();
            if(!res){
                return null;
            }
            setCities(res);
          } catch (error) {
            console.error('Error fetching cities:', error);
          }
        };
    
        fetchCities(); 
    }, []);

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

    const handleDestinationCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setDestinationCity(value);
    
        const firstMatch = cities.find(city => city.toLowerCase().startsWith(value.toLowerCase()));
        setSuggestedCity(firstMatch && value !== firstMatch ? firstMatch : '');
      };
    
      const handleArrivalCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setArrivalCity(value);
        const firstMatch = cities.find(city => city.toLowerCase().startsWith(value.toLowerCase()));
        setSuggestedCity(firstMatch && value !== firstMatch ? firstMatch : '');
      };
    
      const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: string) => {
        if (e.key === 'Tab' || e.key === 'ArrowRight' && suggestedCity) {
          e.preventDefault();

          if (type === 'destination') {
            setDestinationCity(suggestedCity);
          } else {
            setArrivalCity(suggestedCity);
          }
    
          setSuggestedCity(''); 
        }
      };
    
      const getPlaceholderText = (typedValue: string, suggestion: string): string => {
        if (suggestion && suggestion.toLowerCase().startsWith(typedValue.toLowerCase())) {
          return suggestion.slice(typedValue.length);
        }
        return 'Search by city';
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
                    <Input 
                        type='text' 
                        value={destinationCity} 
                        onChange={handleDestinationCityChange}  
                        onKeyDown={(e) => handleKeyDown(e, 'destination')}
                        placeholder={destinationCity + getPlaceholderText(destinationCity, suggestedCity)}
                        className="h-12 rounded-lg text-gray-500 border-gray-700"
                    />
                </div>
                <div className='w-3/12'>
                    <p className="mb-1 darkGray-text font-normal text-sm">Search Arrival City</p>
                    <Input 
                        type='text'  
                        value={arrivalCity}
                        onChange={handleArrivalCityChange}  
                        onKeyDown={(e) => handleKeyDown(e, 'arrival')}
                        placeholder={arrivalCity + getPlaceholderText(arrivalCity, suggestedCity)}
                        className="h-12 rounded-lg text-gray-500 border-gray-700"
                    />
                </div>
            </div>

            <TicketTable ticketData={ticketData} paginationData={paginationData}/>

        </div>

    </div>
  )
}

export default TicketList