'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowBigRight } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { Label } from '@/components/ui/label'
import { updateServiceListing, deleteServiceListing } from '../../Components/server/services'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type ServiceListing = {
  id: number
  title: string
  description: string
  category: string
  price: number
  status: string
  location: string
  availabilityDays: string[]
  availabilityStartTime: string
  availabilityEndTime: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  createdAt: string
  updatedAt: string
}

type MyJobsListProps = {
  services: {
    docs: ServiceListing[]
    totalDocs: number
  }
}

const categories: Record<string, string> = {
  'home-repair': 'Home Repair',
  cleaning: 'Cleaning',
  gardening: 'Gardening',
  'pet-care': 'Pet Care',
  tutoring: 'Tutoring',
  delivery: 'Delivery',
  other: 'Other',
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-neutral-100 text-neutral-800',
  paused: 'bg-yellow-100 text-yellow-800',
}

const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
)

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => <div className={cn('flex w-full flex-col space-y-2', className)}>{children}</div>

const gradientBtnClass =
  'group/btn relative flex h-10 items-center justify-center gap-2 rounded-md bg-gradient-to-br from-black to-neutral-700 px-4 font-medium text-white shadow hover:opacity-95 transition'

export default function MyJobsList({ services: initialServices }: MyJobsListProps) {
  const [services, setServices] = useState(initialServices.docs)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    setIsDeleting(id)
    try {
      await deleteServiceListing(id)
      setServices((prev) => prev.filter((s) => s.id !== id))
      toast.success('Service deleted')
    } catch (error: any) {
      toast.error(error.message || 'Delete failed')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateServiceListing(id, { status })
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      )
      toast.success('Status updated')
    } catch (error: any) {
      toast.error(error.message || 'Update failed')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 text-neutral-900">
      <ToastContainer />
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Services</h1>
            <p className="text-neutral-600">
              Manage your listed services ({services.length})
            </p>
          </div>

          <motion.div whileHover="hover">
            <Link href="/services/post" className={cn(gradientBtnClass, 'px-6')}>
              + Post New Service
              <ArrowBigRight className="h-4 w-4" />
              <BottomGradient />
            </Link>
          </motion.div>
        </div>

        {/* Empty State */}
        {services.length === 0 ? (
          <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">No services yet</h2>
            <p className="mt-2 text-neutral-600">
              Start offering your services to the community.
            </p>

            <Link
              href="/services/post"
              className={cn(gradientBtnClass, 'mt-6 w-full')}
            >
              Post Your First Service
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-xl bg-white p-6 shadow"
              >
                {/* Title + Status */}
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="text-xl font-semibold">{service.title}</h3>
                  <span
                    className={cn(
                      'rounded px-2 py-1 text-xs font-medium',
                      statusColors[service.status]
                    )}
                  >
                    {service.status}
                  </span>
                </div>

                {/* Category */}
                <span className="mb-2 inline-block rounded bg-neutral-200 px-2 py-1 text-xs">
                  {categories[service.category]}
                </span>

                {/* Description */}
                <p className="mb-4 text-sm text-neutral-600 line-clamp-2">
                  {service.description}
                </p>

                {/* Info */}
                <div className="space-y-1 text-sm text-neutral-600">
                  <div>
                    <strong>Price:</strong>{' '}
                    <span className="text-green-600">${service.price}/hr</span>
                  </div>
                  <div>
                    <strong>Location:</strong> {service.location}
                  </div>
                  <div>
                    <strong>Available:</strong>{' '}
                    {service.availabilityDays.join(', ')} •{' '}
                    {service.availabilityStartTime} – {service.availabilityEndTime}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Created {new Date(service.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/services/${service.id}/edit`}
                    className={cn(gradientBtnClass, 'flex-1')}
                  >
                    Edit
                  </Link>

                  <LabelInputContainer className="flex-1">
                    <Label className="text-xs">Status</Label>
                    <select
                      value={service.status}
                      onChange={(e) =>
                        handleStatusChange(service.id, e.target.value)
                      } 
                      className="h-10 rounded-md border bg-gray-50 px-3 text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </LabelInputContainer>

                  <button
                    onClick={() => handleDelete(service.id)}
                    disabled={isDeleting === service.id}
                    className="h-10 rounded-md bg-red-600 px-4 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting === service.id ? '...' : 'Delete'}
                  </button>
                </div>

                {/* Public Link */}
                <Link
                  href={`/services/${service.id}`}
                  className="mt-4 block border-t pt-4 text-center text-sm text-cyan-600 hover:underline"
                >
                  View Public Page
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
