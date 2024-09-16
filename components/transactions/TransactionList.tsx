'use client'
import React, {useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { useRouter } from 'next/navigation'
import { TransactionReturn } from '@/types/transactions'
import Datepicker from "react-tailwindcss-datepicker";
import { getAllMatchedCity } from '@/actions/search.action'
import TransactionTable from './TransactionTable'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const TransactionList: React.FC<TransactionReturn> = ({transactionData, paginationData}) => {

    const NEXT_MONTH = new Date();
    NEXT_MONTH.setMonth(NEXT_MONTH.getMonth() + 1);

    const [cities, setCities] = useState<string[]>([])
    const [invocieTab, setInvocieTab] = useState(false);
    const [open, setOpen] = React.useState(false)
    const [busOperator, setBusOperator] = useState('');
    const [destinationCity, setDestinationCity] = useState('');
    const [arrivalCity, setArrivalCity] = useState('');
    const [openArrival, setOpenArrival] = React.useState(false)
    const [value, setValue] = useState<{ startDate: Date | null; endDate: Date | null }>({
      startDate: null,
      endDate: null,
    });

    const router = useRouter();
    const params = new URLSearchParams();

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

    const updateSearchParams = () => {
        if (busOperator) params.set('carrier', busOperator);
        if (destinationCity !== 'clear'){
          params.set('destinationCity', destinationCity)
        }else{
          setDestinationCity('')
        };
        if (arrivalCity !== 'clear'){
          params.set('arrivalCity', arrivalCity)
        }else{
          setArrivalCity('')
        };
        if (value.startDate) params.set('startDate', value.startDate.toISOString())
        if (value.endDate) params.set('endDate', value.endDate.toISOString())
        router.push(`?${params.toString()}`, { scroll: false });
    };



    const updateSearchDateParams = () => {
      if (value.startDate) params.set('startDate', value.startDate.toISOString())
      if (value.endDate) params.set('endDate', value.endDate.toISOString())
      router.push(`?${params.toString()}`, { scroll: false });
    };
    
    const handleValueChange = (newValue: { startDate: Date | null; endDate: Date | null } | null) => {
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
    }, [busOperator, destinationCity, arrivalCity, value.endDate, value.startDate]);

    useEffect(() => {
        
      const timer = setTimeout(() => {
        updateSearchDateParams();
      }, 200)

      return () => {
          clearTimeout(timer)
      }
  }, [value.endDate, value.startDate]);

  return (
    <div className='w-full flex flex-col items-center justify-center'>

      <div className='w-full'>
          <p className="mb-1 darkGray-text font-normal text-sm">Bus Operator</p>
          <Input type='text'  value={busOperator} onChange={(e) => setBusOperator(e.target.value)} placeholder='Search bus operator' className="h-12 rounded-lg text-gray-500 border-gray-700"/>
      </div>

      <div className='w-full flex flex-wrap justify-between mt-6'>
          <div className='w-3/12'>
              <p className="mb-1 darkGray-text font-normal text-sm">Search Departure City</p>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild className='w-full  h-12 rounded-lg  text-gray-500 border-gray-700'>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between outline-none"
                    >
                    {destinationCity || "Select city..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 select-dropdown">
                    <Command>
                    <CommandInput placeholder="Search city..." />
                    <CommandList className='w-full'>
                        <CommandEmpty>No city found.</CommandEmpty>
                        <CommandGroup>
                        <CommandItem
                            key="clear"
                            value=""
                            onSelect={() => {
                            setDestinationCity("");
                            setOpen(false); 
                            }}
                            className="cursor-pointer w-full"
                        >
                            <Check
                            className={`mr-2 h-4 w-4 ${destinationCity === "" ? 'opacity-100' : 'opacity-0'}`}
                            />
                            Clear
                        </CommandItem>
                        {cities.map((city) => (
                            <CommandItem
                                key={city}
                                value={city}
                                onSelect={(currentValue) => {
                                    setDestinationCity(currentValue === destinationCity ? "" : currentValue); 
                                    setOpen(false);
                                }}
                                className='cursor-pointer w-full'
                            >
                            <Check
                                className={`mr-2 h-4 w-4 ${city === destinationCity ? 'opacity-100' : 'opacity-0'}`} 
                            />
                            {city}
                            </CommandItem>
                        ))}
                        </CommandGroup>
                    </CommandList>
                    </Command>
                </PopoverContent>
              </Popover>
          </div>
          <div className='w-3/12'>
              <p className="mb-1 darkGray-text font-normal text-sm">Search Arrival City</p>
              <Popover open={openArrival} onOpenChange={setOpenArrival}>
                <PopoverTrigger asChild className='w-full  h-12 rounded-lg  text-gray-500 border-gray-700'>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openArrival}
                        className="w-full justify-between outline-none"
                    >
                    {arrivalCity || "Select city..."} 
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 select-dropdown">
                    <Command>
                    <CommandInput placeholder="Search city..." />
                    <CommandList className='w-full'>
                        <CommandEmpty>No city found.</CommandEmpty>
                        <CommandGroup>
                        <CommandItem
                            key="clear"
                            value=""
                            onSelect={() => {
                            setArrivalCity("");
                            setOpenArrival(false);
                            }}
                            className="cursor-pointer w-full"
                        >
                            <Check
                            className={`mr-2 h-4 w-4 ${arrivalCity === "" ? 'opacity-100' : 'opacity-0'}`}
                            />
                            Clear
                        </CommandItem>
                        {cities.map((city) => (
                            <CommandItem
                                key={city}
                                value={city}
                                onSelect={(currentValue) => {
                                    setArrivalCity(currentValue === arrivalCity ? "" : currentValue); 
                                    setOpenArrival(false); 
                                }}
                                className='cursor-pointer w-full'
                            >
                            <Check
                                className={`mr-2 h-4 w-4 ${city === arrivalCity ? 'opacity-100' : 'opacity-0'}`} 
                            />
                            {city}
                            </CommandItem>
                        ))}
                        </CommandGroup>
                    </CommandList>
                    </Command>
                </PopoverContent>
              </Popover>
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
      
      <TransactionTable transactionData={transactionData} paginationData={paginationData}/>

    </div>
  )
}

export default TransactionList