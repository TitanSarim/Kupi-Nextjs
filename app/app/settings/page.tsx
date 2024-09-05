import Loading from '@/components/Loading'
import NavBar from '@/components/NavBar'
import SideBar from '@/components/SideBar'
import React, { Suspense } from 'react'

const Settings = async () => {

  return (
    <div className='bg-page-backgound h-full w-full flex items-start justify-center'>
      
      <div className='w-11/12 p-4 mt-4 flex flex-row justify-between'>
        <p className='text-lg text-black font-semibold'>Kupi Admin</p>

        <div className='flex flex-row gap-8'>
          <div className='flex flex-row gap-3 items-center justify-center bg-white border-2 rounded-lg py-1 px-3'>
            <input type="radio" id="viewAdmin" className='setting-radio'/>
            <label htmlFor='viewAdmin' className='text-sm	darkGray-text'>View Admin</label>
          </div>
          <div className='flex flex-row gap-3 items-center justify-center bg-white border-2 rounded-lg py-1 px-3'>
            <input type="radio" id="viewOperator"/>
            <label htmlFor='viewOperator' className='text-sm	darkGray-text'>View Operator</label>
          </div>
        </div>
        
      </div>

    </div>
  )
}

export default Settings