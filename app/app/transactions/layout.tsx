import SettingsClient from '@/components/settings/SettingsClient';
import TransactionClient from '@/components/transactionInvoices/TransactionClient';
import React from 'react';

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <div className='bg-page-backgound h-screen w-full flex items-start justify-center'>
        <div className='w-11/12 bg-white mt-10 shadow-sm rounded-md px-8 py-8 mb-5'>
            <div className='w-full'>
                <TransactionClient/>
            </div>
            <div className='w-full'>
                {children}
            </div>
        </div>
    </div>
          
  );
}
