import React from 'react';
import SideBar from '@/components/SideBar'; 
import NavBar from '@/components/NavBar';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from "@/components/ui/toaster"


export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <div className="flex h-full">
        <SideBar />
        <div className="flex flex-col w-full">
            <Toaster/>
            <NextTopLoader color="#FFC107"/>
            <NavBar />
            <div className='h-full'>
                {children}
            </div>
        </div>
    </div>
  );
}
