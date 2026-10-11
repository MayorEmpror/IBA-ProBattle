'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBookingRequest } from '../../Components/server/services'
import { toast } from 'react-toastify'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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

type ServiceDetailProps = {
  service: ServiceListing
}

const categoryLabel = (value: string) => {
  const categories: Record<string, string> = {
    'home-repair': 'Home Repair',
    cleaning: 'Cleaning',
    gardening: 'Gardening',
    'pet-care': 'Pet Care',
    tutoring: 'Tutoring',
    delivery: 'Delivery',
    other: 'Other',
  }
  return categories[value] || value
}

export default function ServiceDetail({ service }: ServiceDetailProps) {
  const router = useRouter()
  const [isBooking, setIsBooking] = useState(false)
  const [bookingData, setBookingData] = useState({
    requestedDate: '',
    requestedTime: '',
    duration: 1,
    message: '',
  })

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsBooking(true)

    try {
      await createBookingRequest({
        serviceListing: service.id,
        ...bookingData,
      })
      toast.success('Booking request submitted successfully!')
      router.push('/bookings')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking')
    } finally {
      setIsBooking(false)
    }
  }

  const totalPrice = service.price * bookingData.duration

  return (
    <div className="min-h-screen bg-gray-50 py-8 text-black">
      <ToastContainer />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {service.title}
                </h1>
                <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded">
                  {categoryLabel(service.category)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${service.price}
                </div>
                <div className="text-sm text-gray-500">per hour</div>
              </div>
            </div>

            <div className="prose max-w-none mb-8">
              <p className="text-gray-700 whitespace-pre-wrap">
                {service.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Provider</h3>
                <p className="text-gray-600">{service.provider?.name || 'Unknown'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                <p className="text-gray-600">{service.location}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Available Days</h3>
                <p className="text-gray-600">
                  {Array.isArray(service.availabilityDays)
                    ? service.availabilityDays.join(', ')
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Available Hours</h3>
                <p className="text-gray-600">
                  {service.availabilityStartTime} - {service.availabilityEndTime}
                </p>
              </div>
            </div>

            {/* Booking Form */}
            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Book This Service
              </h2>
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Requested Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingData.requestedDate}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, requestedDate: e.target.value })
                      }
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Requested Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={bookingData.requestedTime}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, requestedTime: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (hours) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0.5"
                    max="8"
                    step="0.5"
                    value={bookingData.duration}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        duration: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Message (optional)
                  </label>
                  <textarea
                    value={bookingData.message}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, message: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Price:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isBooking}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBooking ? 'Submitting...' : 'Submit Booking Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
