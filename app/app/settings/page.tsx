'use client'
import Loading from '@/components/Loading';
import AdminSettings from '@/components/setttings/AdminSettings';
import OperatorSettings from '@/components/setttings/OperatorSettings';
import React, {Suspense, useState } from 'react'

const Settings = () => {

  const [selectedView, setSelectedView] = useState('viewAdmin');

  return (
    <div className='bg-page-backgound h-screen w-full'>
      <Suspense fallback={<Loading />}>
        <div className='w-full flex flex-col items-center justify-start'>
          
          <div className='relative w-11/12 py-4 mt-4 flex flex-row justify-between'>
            <p className='text-lg text-black font-semibold'>Kupi Admin</p>

            <div className='flex flex-row gap-8'>
              <div className='radio-input bg-white border-2 rounded-lg py-2 px-3'>
                <input type="radio" id="viewAdmin" name="value-radio"  checked={selectedView === 'viewAdmin'} onChange={() => setSelectedView('viewAdmin')}/>
                <div className="circle">
                </div> 
                <label htmlFor='viewAdmin' className='text-sm	darkGray-text'>View Admin</label>
              </div>
              <div className='radio-input bg-white border-2 rounded-lg py-2 px-3'>
                <input type="radio" id="viewOperator" name="value-radio" checked={selectedView === 'viewOperator'} onChange={() => setSelectedView('viewOperator')}/>
                <div className="circle">
                </div> 
                <label htmlFor='viewOperator' className='text-sm	darkGray-text'>View Operator</label>
              </div>
            </div>
            
          </div>

          <div className='relative w-11/12'>
            {selectedView === 'viewAdmin' ? <AdminSettings/> : <OperatorSettings/>}
          </div>

        </div>
      </Suspense>
    </div>
  )
}

export default Settings