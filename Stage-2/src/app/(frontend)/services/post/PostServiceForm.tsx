'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createServiceListing } from '../../Components/server/services'
import { geocodeAddress } from '../../Components/server/geocode'
import { toast } from 'react-toastify'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function PostServiceForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    address: '',
    coordinates: null as { latitude: number; longitude: number } | null,
    availabilityDays: [] as string[],
    availabilityStartTime: '09:00',
    availabilityEndTime: '17:00',
  })

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

  const handleDayToggle = (day: string) => {
    setFormData({
      ...formData,
      availabilityDays: formData.availabilityDays.includes(day)
        ? formData.availabilityDays.filter((d: string) => d !== day)
        : [...formData.availabilityDays, day],
    })
  }

  const handleLookupAddress = async () => {
    if (!formData.address.trim()) {
      toast.error('Enter an address first')
      return
    }
    setIsGeocoding(true)
    try {
      const result = await geocodeAddress(formData.address.trim())
      if (result) {
        setFormData((prev: typeof formData) => ({
          ...prev,
          coordinates: { latitude: result.lat, longitude: result.lng },
        }))
        toast.success(`Found: ${result.displayName}`)
      } else {
        toast.error('Address not found. Try a more specific address.')
      }
    } catch (e: any) {
      toast.error(e?.message || 'Geocoding failed')
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev: typeof formData) => ({
          ...prev,
          address: prev.address || 'My current location',
          coordinates: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
        }))
        toast.success('Location set from device')
      },
      () => toast.error('Could not get your location'),
    )
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
      if (!formData.coordinates) {
        toast.error('Look up address or use "Use my location" to set coordinates')
        setIsSubmitting(false)
        return
      }

      await createServiceListing({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        location: formData.address || 'Service location',
        coordinates: formData.coordinates,
        availabilityDays: formData.availabilityDays,
        availabilityStartTime: formData.availabilityStartTime,
        availabilityEndTime: formData.availabilityEndTime,
      })

      toast.success('Service posted successfully!')
      router.push('/services')
    } catch (error: any) {
      toast.error(error.message || 'Failed to post service')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 text-black">
      <ToastContainer aria-label="Notifications" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Post a Service</h1>

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
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                placeholder="Describe your service in detail..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
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
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="25.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service address *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g., 123 Main St, New York or Downtown, Mumbai"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleLookupAddress}
                  disabled={isGeocoding || !formData.address.trim()}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isGeocoding ? 'Looking up…' : 'Look up'}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                We use your address to get coordinates for radius search (5km / 10km / 25km).
              </p>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Use my current location
                </button>
              </div>
              {formData.coordinates && (
                <p className="mt-2 text-xs text-green-700">
                  ✓ Coordinates set ({formData.coordinates.latitude.toFixed(4)},{' '}
                  {formData.coordinates.longitude.toFixed(4)})
                </p>
              )}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
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

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Post Service'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
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
