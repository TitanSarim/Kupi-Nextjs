import React from 'react';
import SideBar from '@/components/SideBar'; 
import NavBar from '@/components/NavBar';

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <div className="flex h-full">
        <SideBar />
        <div className="flex flex-col w-full">
            <NavBar />
            <div className='h-full'>
                {children}
            </div>
        </div>
    </div>
  );
}
