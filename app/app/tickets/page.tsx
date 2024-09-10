import { getAllTickets } from '@/actions/ticket.action'
import TicketList from '@/components/tickets/TicketList'
import React, { Suspense } from 'react'
import { TicketQuery } from '@/types/ticket'


const Tickets = async ({ searchParams }: { searchParams: TicketQuery['searchParams'] }) => {

  const data = await getAllTickets(searchParams) 

  if(!data){
    return (
      <div className='bg-page-backgound flex items-start justify-center h-screen w-full'>
          <div className='mt-32'>
            <p>No Data Found</p>
          </div>
      </div>
    )
  }

  return (
    <div className='bg-page-backgound flex items-start justify-center h-screen w-full'>
      <div className='w-11/12'>
        <TicketList ticketData={data?.ticketData} paginationData={data.paginationData}/>
      </div>
    </div>
  )
}

export default Tickets