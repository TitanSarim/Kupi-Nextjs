'use client'
import React, {useEffect, useState } from 'react'
import { Input } from '../ui/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import TicketTable from './TicketTable'
import { useRouter } from 'next/navigation'
import { TicketsReturn } from '@/types/ticket'
import { getAllMatchedCity } from '@/actions/search.action'
import { Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const TicketList: React.FC<TicketsReturn> = ({ticketData, paginationData}) => {

    const [cities, setCities] = useState<string[]>([])
    const [busOperator, setBusOperator] = useState('');
    const [source, setSource] = useState('');
    const [destinationCity, setDestinationCity] = useState('');
    const [arrivalCity, setArrivalCity] = useState('');
    const [onlyPending, setOnlyPending] = useState(false);
    const [open, setOpen] = React.useState(false)
    const [openArrival, setOpenArrival] = React.useState(false)


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

    const handleDestination = (value: string) => {
      setDestinationCity(value);

      if (value) {
          const matchedCities = cities
              .filter(city => city.toLowerCase().includes(value.toLowerCase())) // Filter cities
              .sort((a, b) => {
                  if (a.toLowerCase().startsWith(value.toLowerCase())) return -1;
                  if (b.toLowerCase().startsWith(value.toLowerCase())) return 1;
                  return 0;
              });
          
          setCities(matchedCities.slice(0, 5));
      } else {
          setCities(cities.slice(0, 5));
      }
  };

    const router = useRouter();
    const params = new URLSearchParams();

    const updateSearchParams = () => {
        if (busOperator) params.set('carrier', busOperator);
        if (source) params.set('source', source);
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
                        <SelectTrigger className="w-full h-12 rounded-lg text-gray-500 border-gray-700 ">
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
            </div>

            <TicketTable ticketData={ticketData} paginationData={paginationData}/>

        </div>

    </div>
  )
}

export default TicketList