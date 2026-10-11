import { Metadata } from 'next'
import { getMyServiceListings } from '../../Components/server/services'
import MyJobsList from './MyJobsList'

export const metadata: Metadata = {
  title: 'My Services - Neighbourly',
  description: 'Manage your listed services',
}

export default async function MyJobsPage() {
  const services = await getMyServiceListings()

  return <MyJobsList services={services} />
}
