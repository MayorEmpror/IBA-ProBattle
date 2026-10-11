import { Metadata } from 'next'
import { getServiceListing } from '../../Components/server/services'
import ServiceDetailWithAuth from './ServiceDetailWithAuth'
import { notFound } from 'next/navigation'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  try {
    const { id } = await params
    const service = await getServiceListing(id)
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
  params: Promise<{ id: string }>
}) {
  try {
    const { id } = await params
    const service = await getServiceListing(id)
    return <ServiceDetailWithAuth service={service as any} />
  } catch {
    notFound()
  }
}
