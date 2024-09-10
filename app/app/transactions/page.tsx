import { getAllTransactions } from '@/actions/transactions.actions'
import TransactionList from '@/components/transactions/TransactionList'
import { TransactionQuery } from '@/types/transactions'
import React, { Suspense } from 'react'

const Transactions = async ({ searchParams }: { searchParams: TransactionQuery['searchParams'] }) => {

  const data = await getAllTransactions(searchParams) 

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
        <TransactionList transactionData={data?.transactionData} paginationData={data.paginationData}/>
      </div>
    </div>
  )
}

export default Transactions