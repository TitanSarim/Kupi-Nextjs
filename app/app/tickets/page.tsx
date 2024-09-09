import { getAllTickets } from '@/actions/ticket.action'
import TicketList from '@/components/tickets/TicketList'
import React, { Suspense } from 'react'
import { TicketQuery } from '@/types/ticket'


const Tickets = async ({ searchParams }: { searchParams: TicketQuery['searchParams'] }) => {

  const data = await getAllTickets(searchParams) 

  if(!data){
    return null
  }

  return (
    <div className='bg-page-backgound flex items-start justify-center h-screen w-full'>
      <div className='w-11/12'>
        <TicketList TicketData={data?.TicketData} paginationData={data.paginationData}/>
      </div>
    </div>
  )
}

export default Tickets