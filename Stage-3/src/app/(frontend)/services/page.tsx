import { Metadata } from 'next'
import { getServiceListings } from '../Components/server/services'
import { getUser } from '../Components/server/actions'
import ServicesList from './ServicesList'

export const metadata: Metadata = {
  title: 'Browse Services - Neighbourly',
  description: 'Find services in your neighborhood',
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    search?: string
    lat?: string
    lng?: string
    radius?: string
    neighborhood?: string
    minPrice?: string
    maxPrice?: string
  }>
}) {
  const params = await searchParams
  
  const services = await getServiceListings({
    category: params.category,
    search: params.search,
    lat: params.lat ? parseFloat(params.lat) : undefined,
    lng: params.lng ? parseFloat(params.lng) : undefined,
    radius: params.radius ? parseFloat(params.radius) : undefined,
    neighborhood: params.neighborhood,
    minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
  })

  // Fetch user for logout button
  let user = null
  try {
    const userData = await getUser()
    if (userData) {
      user = {
        name: userData.name || '',
        role: userData.role || '',
        location: (userData as any).location || undefined,
      }
    }
  } catch {
    // User not logged in
  }

  return <ServicesList services={services as any} user={user} />
}
