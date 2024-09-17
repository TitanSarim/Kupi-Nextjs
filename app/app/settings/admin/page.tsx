import { getAdminSetting } from '@/actions/settings.action';
import Loading from '@/components/Loading';
import AdminSettings from '@/components/settings/AdminSettings';
import React, {Suspense} from 'react'

const Settings = async () => {

  const settings = await getAdminSetting();

  if(!settings){
    return null;
  }

  return (
    <div className='w-full'>
      <Suspense fallback={<Loading />}>
            <AdminSettings settings={settings}/>
      </Suspense>
    </div>
  )
}

export default Settings