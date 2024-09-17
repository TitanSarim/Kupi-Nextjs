'use client'
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';

const SettingsClient = () => {

    const [selectedView, setSelectedView] = useState('viewAdmin');

    const router = useRouter();

    useEffect(() => {
      if (selectedView === 'viewAdmin') {
        router.push('/app/settings/admin');
      } else if (selectedView === 'viewOperator') {
        router.push('/app/settings/operator');
      }
    }, [selectedView, router]);


  return (
    <div className='flex flex-row gap-8'>
        <div className='radio-input bg-white border-2 rounded-lg py-2 px-3'>
            <input type="radio" id="viewAdmin" name="value-radio"  checked={selectedView === 'viewAdmin'} onChange={() => setSelectedView('viewAdmin')}/>
            <div className="circle">
            </div> 
            <label htmlFor='viewAdmin' className='text-sm	darkGray-text'> 
              View Admin
            </label>
        </div>
        <div className='radio-input bg-white border-2 rounded-lg py-2 px-3'>
            <input type="radio" id="viewOperator" name="value-radio" checked={selectedView === 'viewOperator'} onChange={() => setSelectedView('viewOperator')}/>
            <div className="circle">
            </div> 
            <label htmlFor='viewOperator' className='text-sm	darkGray-text'>View Operator</label>
        </div>
    </div>
  )
}

export default SettingsClient