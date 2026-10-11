'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ROUTES } from '../utils/constants'

type ServiceListing = {
  id: number
  title: string
  description: string
  category: string
  price: number
  provider: {
    id: number
    name: string
    email: string
  }
  availability: {
    days: string[]
    startTime: string
    endTime: string
  }
  location: string
  createdAt: string
}

type ServicesListProps = {
  services: {
    docs: ServiceListing[]
    totalDocs: number
  }
}

const categories = [
  { label: 'All', value: '' },
  { label: 'Home Repair', value: 'home-repair' },
  { label: 'Cleaning', value: 'cleaning' },
  { label: 'Gardening', value: 'gardening' },
  { label: 'Pet Care', value: 'pet-care' },
  { label: 'Tutoring', value: 'tutoring' },
  { label: 'Delivery', value: 'delivery' },
  { label: 'Other', value: 'other' },
]

export default function ServicesList({ services }: ServicesListProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    router.push(`/services?${params.toString()}`)
  }

  const categoryLabel = (value: string) => {
    return categories.find((c) => c.value === value)?.label || value
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Browse Services
          </h1>
          <p className="text-gray-600">
            Find services in your neighborhood ({services.totalDocs} available)
          </p>
        </div>

        {/* Search and Filter */}
        <form onSubmit={handleSearch} className="mb-8 bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Post Service Button */}
        <div className="mb-6">
          <Link
            href={ROUTES.POST_SERVICE}
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
          >
            + Post a Service
          </Link>
        </div>

        {/* Services Grid */}
        {services.docs.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 text-lg">No services found</p>
            <p className="text-gray-400 mt-2">
              Be the first to post a service in your neighborhood!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.docs.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {service.title}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {categoryLabel(service.category)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Provider:</span>
                      <span className="ml-2">{service.provider?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Price:</span>
                      <span className="ml-2 font-semibold text-green-600">
                        ${service.price}/hr
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Available:</span>
                      <span className="ml-2">
                        {service.availability.days.join(', ')} •{' '}
                        {service.availability.startTime} - {service.availability.endTime}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Location:</span>
                      <span className="ml-2">{service.location}</span>
                    </div>
                  </div>
                  <Link
                    href={`/services/${service.id}`}
                    className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
