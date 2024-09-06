import Loading from '@/components/Loading'
import NavBar from '@/components/NavBar'
import SideBar from '@/components/SideBar'
import TicketList from '@/components/tickets/TicketList'
import React, { Suspense } from 'react'

const Discounts = async () => {



  return (
    <div className='bg-page-backgound flex items-start justify-center h-screen w-full'>
      <div className='w-11/12'>
        <TicketList/>
      </div>
    </div>
  )
}

export default Discounts