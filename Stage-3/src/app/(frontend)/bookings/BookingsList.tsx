'use client'

import { useState } from 'react'
import { updateBookingStatus } from '../Components/server/services'
import { toast } from 'react-toastify'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Link from 'next/link'

type Booking = {
  id: number
  serviceListing: {
    id: number
    title: string
    provider: {
      id: number
      name: string
    }
    price: number
  }
  seeker: {
    id: number
    name: string
  }
  requestedDate: string
  requestedTime: string
  duration: number
  status: string
  totalPrice: number
  message?: string
  createdAt: string
}

type BookingsListProps = {
  bookings: {
    asSeeker: {
      docs: Booking[]
      totalDocs: number
    }
    asProvider: {
      docs: Booking[]
      totalDocs: number
    }
  }
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function BookingsList({ bookings }: BookingsListProps) {
  const [activeTab, setActiveTab] = useState<'seeker' | 'provider'>('seeker')
  const [updating, setUpdating] = useState<number | null>(null)
  const [openingChat, setOpeningChat] = useState<number | null>(null)

  const handleStatusUpdate = async (
    bookingId: number,
    status: 'confirmed' | 'cancelled' | 'completed'
  ) => {
    setUpdating(bookingId)
    try {
      await updateBookingStatus(bookingId, status)
      toast.success('Booking status updated')
      window.location.reload() // Refresh to show updated status
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const openChatForBooking = async (booking: Booking, isProvider: boolean) => {
    setOpeningChat(booking.id)
    try {
      const res = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceListingId: booking.serviceListing.id,
          // provider needs to specify the seeker to open the same room
          ...(isProvider ? { seekerId: booking.seeker.id } : {}),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to open chat')

      window.location.href = `/chat/${data.roomId}`
    } catch (error: any) {
      toast.error(error.message || 'Failed to open chat')
    } finally {
      setOpeningChat(null)
    }
  }

  const BookingCard = ({ booking, isProvider }: { booking: Booking; isProvider: boolean }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {isProvider ? booking.serviceListing.title : booking.serviceListing.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {isProvider
              ? `Requested by: ${booking.seeker.name}`
              : `Provider: ${booking.serviceListing.provider.name}`}
          </p>
        </div>
        <span
          className={`px-3 py-1 text-xs font-medium rounded ${statusColors[booking.status] || statusColors.pending}`}
        >
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Date:</span>
          <span className="ml-2 text-gray-600">{formatDate(booking.requestedDate)}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Time:</span>
          <span className="ml-2 text-gray-600">{booking.requestedTime}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Duration:</span>
          <span className="ml-2 text-gray-600">{booking.duration} hours</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Total:</span>
          <span className="ml-2 text-green-600 font-semibold">
            ${booking.totalPrice?.toFixed(2) || (booking.serviceListing.price * booking.duration).toFixed(2)}
          </span>
        </div>
      </div>

      {booking.message && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-700">{booking.message}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => openChatForBooking(booking, isProvider)}
          disabled={openingChat === booking.id}
          className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition disabled:opacity-50"
        >
          {openingChat === booking.id ? 'Opening chat…' : 'Chat'}
        </button>
        {isProvider && booking.status === 'pending' && (
          <>
            <button
              onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
              disabled={updating === booking.id}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
            >
              {updating === booking.id ? 'Updating...' : 'Confirm'}
            </button>
            <button
              onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
              disabled={updating === booking.id}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
            >
              {updating === booking.id ? 'Updating...' : 'Reject'}
            </button>
          </>
        )}
        {isProvider && booking.status === 'confirmed' && (
          <button
            onClick={() => handleStatusUpdate(booking.id, 'completed')}
            disabled={updating === booking.id}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {updating === booking.id ? 'Updating...' : 'Mark Completed'}
          </button>
        )}
        {!isProvider && (booking.status === 'pending' || booking.status === 'confirmed') && (
          <button
            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
            disabled={updating === booking.id}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
          >
            {updating === booking.id ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookings</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('seeker')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'seeker'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bookings I Made ({bookings.asSeeker.totalDocs})
            </button>
            <button
              onClick={() => setActiveTab('provider')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'provider'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bookings for My Services ({bookings.asProvider.totalDocs})
            </button>
          </nav>
        </div>

        {/* Bookings List */}
        {activeTab === 'seeker' ? (
          bookings.asSeeker.docs.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow text-center">
              <p className="text-gray-500 text-lg">No bookings found</p>
              <p className="text-gray-400 mt-2">
                Start booking services from the{' '}
                <Link href="/services" className="text-blue-600 hover:underline">
                  services page
                </Link>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.asSeeker.docs.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isProvider={false} />
              ))}
            </div>
          )
        ) : bookings.asProvider.docs.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 text-lg">No booking requests yet</p>
            <p className="text-gray-400 mt-2">
              Bookings for your services will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.asProvider.docs.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isProvider={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
