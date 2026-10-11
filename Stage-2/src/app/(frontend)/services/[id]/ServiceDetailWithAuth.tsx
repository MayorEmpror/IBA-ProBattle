'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBookingRequest } from '../../Components/server/services'
import { getUser } from '../../Components/server/actions'
import { getAvailableSlots, createSlotForBooking } from '../../Components/server/slots'
import { toast } from 'react-toastify'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Link from 'next/link'

type ServiceDetailWithAuthProps = {
  service: any // Using any to avoid type conflicts with Payload types
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

export default function ServiceDetailWithAuth({ service }: ServiceDetailWithAuthProps) {
  const router = useRouter()
  const [isBooking, setIsBooking] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [bookingData, setBookingData] = useState({
    requestedDate: '',
    requestedTime: '',
    duration: 1,
    notes: '',
  })
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  const providerId = typeof service.provider === 'object' ? service.provider.id : service.provider
  const isOwner = currentUser?.id === providerId

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUser()
        setCurrentUser(user)
      } catch (error) {
        // User not logged in
      } finally {
        setIsLoadingUser(false)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    // Load available slots when date is selected
    const loadSlots = async () => {
      if (bookingData.requestedDate && !isOwner) {
        setIsLoadingSlots(true)
        try {
          const slots = await getAvailableSlots(service.id)
          setAvailableSlots(slots.docs || [])
        } catch (error) {
          console.error('Failed to load slots:', error)
          setAvailableSlots([])
        } finally {
          setIsLoadingSlots(false)
        }
      }
    }
    loadSlots()
  }, [bookingData.requestedDate, service.id, isOwner])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsBooking(true)

    try {
      // Calculate end time based on duration
      const [startHour, startMinute] = bookingData.requestedTime.split(':').map(Number)
      const endHour = startHour + bookingData.duration
      const endTime = `${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`

      // Create or get slot
      let slot
      try {
        // Try to find existing slot first
        const slots = await getAvailableSlots(service.id)
        const matchingSlot = slots.docs.find(
          (s: any) =>
            s.date === bookingData.requestedDate &&
            s.startTime === bookingData.requestedTime &&
            s.status === 'available'
        )

        if (matchingSlot) {
          slot = matchingSlot
        } else {
          // Create slot on-demand
          slot = await createSlotForBooking(
            service.id,
            bookingData.requestedDate,
            bookingData.requestedTime,
            endTime
          )
        }
      } catch (error: any) {
        throw new Error(`Failed to create time slot: ${error.message}`)
      }

      // Create booking with the slot
      await createBookingRequest({
        slot: slot.id,
        notes: bookingData.notes,
      })
      toast.success('Booking request submitted successfully!')
      router.push('/bookings')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking')
    } finally {
      setIsBooking(false)
    }
  }

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
                <p className="text-gray-600">
                  {typeof service.provider === 'object' ? service.provider.name : 'Unknown'}
                </p>
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
                  {service.availabilityStartTime || 'N/A'} - {service.availabilityEndTime || 'N/A'}
                </p>
              </div>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="border-t pt-8">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                  <p className="text-blue-800 font-medium mb-2">This is your service listing</p>
                  <p className="text-blue-700 text-sm mb-4">
                    You cannot book your own service. Manage it from your services page.
                  </p>
                  <Link
                    href="/services/my-jobs"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
                  >
                    Manage My Services
                  </Link>
                </div>
              </div>
            )}

            {/* Booking Form - Only show if not owner */}
            {!isOwner && !isLoadingUser && (
              <div className="border-t pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Book This Service
                </h2>
                {!currentUser ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-yellow-800 mb-4">
                      You must be logged in to book a service.
                    </p>
                    <Link
                      href="/login"
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                      Log In
                    </Link>
                  </div>
                ) : (
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
                    {availableSlots.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Available Slots for {bookingData.requestedDate}
                        </label>
                        <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
                          {availableSlots.length} slot(s) available
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes (optional)
                      </label>
                      <textarea
                        value={bookingData.notes}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, notes: e.target.value })
                        }
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {service.price && (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">Estimated Price:</span>
                          <span className="text-2xl font-bold text-green-600">
                            ${(service.price * bookingData.duration).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Based on ${service.price}/hr × {bookingData.duration} hour(s)
                        </p>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={isBooking || isLoadingSlots}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isBooking ? 'Submitting...' : isLoadingSlots ? 'Loading...' : 'Submit Booking Request'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
