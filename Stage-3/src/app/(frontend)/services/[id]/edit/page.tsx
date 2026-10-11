import { Metadata } from 'next'
import { getServiceListing } from '../../../Components/server/services'
import EditServiceForm from './EditServiceForm'
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
      title: `Edit ${service.title} - Neighbourly`,
    }
  } catch {
    return {
      title: 'Service Not Found - Neighbourly',
    }
  }
}

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  try {
    const { id } = await params
    const service = await getServiceListing(id)
    return <EditServiceForm service={service as any} />
  } catch {
    notFound()
  }
}
