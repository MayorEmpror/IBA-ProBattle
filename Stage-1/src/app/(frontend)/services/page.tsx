import { Metadata } from 'next'
import { getServiceListings } from '../Components/server/services'
import ServicesList from './ServicesList'

export const metadata: Metadata = {
  title: 'Browse Services - Neighbourly',
  description: 'Find services in your neighborhood',
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string }
}) {
  const services = await getServiceListings({
    category: searchParams.category,
    search: searchParams.search,
  })

  return <ServicesList services={services} />
}
