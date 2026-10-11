import { Metadata } from 'next'
import { getServiceListing } from '../../Components/server/services'
import ServiceDetail from './ServiceDetail'
import { notFound } from 'next/navigation'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  try {
    const service = await getServiceListing(params.id)
    return {
      title: `${service.title} - Neighbourly`,
      description: service.description,
    }
  } catch {
    return {
      title: 'Service Not Found - Neighbourly',
    }
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  try {
    const service = await getServiceListing(params.id)
    return <ServiceDetail service={service} />
  } catch {
    notFound()
  }
}
