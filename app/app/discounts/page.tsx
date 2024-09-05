import { auth } from '@/auth'
import Loading from '@/components/Loading'
import NavBar from '@/components/NavBar'
import SideBar from '@/components/SideBar'
import { redirect } from 'next/navigation'
import React, { Suspense } from 'react'

const Discounts = async () => {

  return (
    <div className="bg-page-backgound h-screen w-full">
      <p>Discounts</p>
    </div>
  )
}

export default Discounts