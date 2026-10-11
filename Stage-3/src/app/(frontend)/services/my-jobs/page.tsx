import { Metadata } from 'next'
import { getMyServiceListings } from '../../Components/server/services'
import { getUser } from '../../Components/server/actions'
import MyJobsList from './MyJobsList'

export const metadata: Metadata = {
  title: 'My Services - Neighbourly',
  description: 'Manage your listed services',
}

export default async function MyJobsPage() {
  const services = await getMyServiceListings()
  
  // Fetch user for role-based UI
  let user = null
  try {
    const userData = await getUser()
    if (userData) {
      user = {
        name: userData.name || '',
        role: userData.role || '',
      }
    }
  } catch {
    // User not logged in
  }

  return <MyJobsList services={services as any} user={user} />
}
