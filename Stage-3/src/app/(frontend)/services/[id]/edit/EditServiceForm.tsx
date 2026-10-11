'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateServiceListing } from '../../../Components/server/services'
import { toast } from 'react-toastify'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type ServiceListing = {
  id: number
  title: string
  description: string
  category: string
  price: number
  location: string
  coordinates: {
    latitude: number
    longitude: number
  }
  availabilityDays: string[]
  availabilityStartTime: string
  availabilityEndTime: string
  status: string
}

type EditServiceFormProps = {
  service: ServiceListing
}

const categories = [
  { label: 'Home Repair', value: 'home-repair' },
  { label: 'Cleaning', value: 'cleaning' },
  { label: 'Gardening', value: 'gardening' },
  { label: 'Pet Care', value: 'pet-care' },
  { label: 'Tutoring', value: 'tutoring' },
  { label: 'Delivery', value: 'delivery' },
  { label: 'Other', value: 'other' },
]

const days = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
  { label: 'Sunday', value: 'sunday' },
]

export default function EditServiceForm({ service }: EditServiceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: service.title,
    description: service.description,
    category: service.category,
    price: service.price.toString(),
    location: service.location,
    coordinates: {
      latitude: service.coordinates?.latitude?.toString() || '',
      longitude: service.coordinates?.longitude?.toString() || '',
    },
    availabilityDays: service.availabilityDays || [],
    availabilityStartTime: service.availabilityStartTime,
    availabilityEndTime: service.availabilityEndTime,
    status: service.status,
  })

  const handleDayToggle = (day: string) => {
    setFormData({
      ...formData,
      availabilityDays: formData.availabilityDays.includes(day)
        ? formData.availabilityDays.filter((d) => d !== day)
        : [...formData.availabilityDays, day],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (formData.availabilityDays.length === 0) {
        toast.error('Please select at least one available day')
        setIsSubmitting(false)
        return
      }

      await updateServiceListing(service.id, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        location: formData.location,
        coordinates: {
          latitude: parseFloat(formData.coordinates.latitude),
          longitude: parseFloat(formData.coordinates.longitude),
        },
        availabilityDays: formData.availabilityDays,
        availabilityStartTime: formData.availabilityStartTime,
        availabilityEndTime: formData.availabilityEndTime,
        status: formData.status,
      })

      toast.success('Service updated successfully!')
      router.push('/services/my-jobs')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update service')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 text-black">
      <ToastContainer />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Edit Service
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Professional House Cleaning"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={6}
                placeholder="Describe your service in detail..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Hour ($) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="25.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Neighborhood/Area *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., Downtown, Midtown, Uptown"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  value={formData.coordinates.latitude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coordinates: {
                        ...formData.coordinates,
                        latitude: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., 40.7128"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  value={formData.coordinates.longitude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coordinates: {
                        ...formData.coordinates,
                        longitude: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., -74.0060"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          setFormData({
                            ...formData,
                            coordinates: {
                              latitude: position.coords.latitude.toString(),
                              longitude: position.coords.longitude.toString(),
                            },
                          })
                        },
                        () => {
                          alert('Unable to get your location')
                        }
                      )
                    } else {
                      alert('Geolocation is not supported by your browser')
                    }
                  }}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Use my current location
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Days *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {days.map((day) => {
                  const isSelected = formData.availabilityDays.includes(day.value)
                  
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      className={`px-4 py-2 rounded-md border transition ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {day.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.availabilityStartTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      availabilityStartTime: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.availabilityEndTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      availabilityEndTime: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Service'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/services/my-jobs')}
                className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
