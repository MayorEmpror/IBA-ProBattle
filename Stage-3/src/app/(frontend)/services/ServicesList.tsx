'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { geocodeAddress } from '../Components/server/geocode'
import { logoutPayloadUser } from '../Components/server/actions'
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
  availabilityDays: string[]
  availabilityStartTime: string
  availabilityEndTime: string
  location: string
  createdAt: string
}

type ServicesListProps = {
  services: {
    docs: ServiceListing[]
    totalDocs: number
  }
  user?: { name: string; role: string; location?: string } | null
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

const RADIUS_OPTIONS = [
  { value: '5', label: '5 km' },
  { value: '10', label: '10 km' },
  { value: '25', label: '25 km' },
  { value: '50', label: '50 km' },
] as const

function formatDate(s: string) {
  const d = new Date(s)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatPrice(p: number) {
  return `$${p}/hr`
}

export default function ServicesList({ services, user }: ServicesListProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [address, setAddress] = useState('')
  const [useLocation, setUseLocation] = useState(false)
  const [radius, setRadius] = useState('10')
  const [isSearching, setIsSearching] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logoutPayloadUser()
      toast.success('Logged out successfully')
      // Force a full page reload to clear all state
      window.location.href = '/services'
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout')
      setIsLoggingOut(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    params.set('radius', radius)

    if (useLocation) {
      if (!navigator.geolocation) {
        toast.error('Location is not supported. Please enter an address.')
        router.push(`/services?${params.toString()}`)
        return
      }
      setIsSearching(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          params.set('lat', position.coords.latitude.toString())
          params.set('lng', position.coords.longitude.toString())
          setIsSearching(false)
          router.push(`/services?${params.toString()}`)
        },
        (err) => {
          const msg =
            err?.code === 1
              ? 'Location permission denied. Check browser settings or enter an address.'
              : err?.code === 2
                ? 'Location unavailable. Try entering an address.'
                : 'Could not get your location. Check permissions or enter an address.'
          toast.error(msg)
          setIsSearching(false)
          router.push(`/services?${params.toString()}`)
        },
        { timeout: 15000, maximumAge: 60000, enableHighAccuracy: false },
      )
      return
    }

    if (address.trim()) {
      setIsSearching(true)
      try {
        const geo = await geocodeAddress(address.trim())
        if (geo) {
          params.set('lat', geo.lat.toString())
          params.set('lng', geo.lng.toString())
        } else {
          params.set('neighborhood', address.trim())
        }
      } catch {
        params.set('neighborhood', address.trim())
      } finally {
        setIsSearching(false)
      }
    }

    router.push(`/services?${params.toString()}`)
  }

  const categoryLabel = (value: string) => categories.find((c) => c.value === value)?.label || value

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 bg-white">
      <ToastContainer position="top-center" theme="light" />

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
            {user?.role === 'seeker' ? 'Recommended for you' : 'Available Services'}
          </p>
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
            {user
              ? user.role === 'seeker'
                ? `Hi ${user.name.split(' ')[0]}, here are services near you`
                : `Hi ${user.name.split(' ')[0]}, manage and review your services`
              : 'Browse nearby jobs'}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {services.totalDocs} {services.totalDocs === 1 ? 'service' : 'services'} available
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          {user && (
            <>
              <div className="flex flex-col items-end text-sm text-neutral-600">
                <span className="font-semibold text-neutral-800">{user.name}</span>
                <span className="capitalize">Role: {user.role}</span>
                {user.location && <span className="text-neutral-500">{user.location}</span>}
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </>
          )}
          {(!user || user.role !== 'seeker') && (
            <Link
              href={ROUTES.POST_SERVICE}
              className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
            >
              + Post a Service
            </Link>
          )}
        </div>
      </header>

      {/* Search and Filter */}
      <form
        onSubmit={handleSearch}
        className="mb-10 rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.08)]"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Address or area
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 123 Main St, New York"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
            <p className="mt-1 text-xs text-neutral-500">Geocoded for radius search</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Radius</label>
            <select
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            >
              {RADIUS_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={useLocation}
              onChange={(e) => setUseLocation(e.target.checked)}
              className="rounded border-neutral-300"
            />
            Use my current location
          </label>
          <button
            type="submit"
            disabled={isSearching}
            className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSearching ? 'Looking up…' : 'Search'}
          </button>
        </div>
      </form>

      {/* Services Grid */}
      {services.docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white py-16 text-center shadow-[0_10px_40px_-20px_rgba(0,0,0,0.08)]">
          <p className="text-lg font-medium text-neutral-600">No services found</p>
          <p className="mt-1 text-sm text-neutral-500">
            Be the first to post a service in your neighborhood!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {services.docs.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.id}`}
              className="group relative flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.35)] transition duration-200 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_14px_50px_-16px_rgba(0,0,0,0.35)]"
              aria-label={`View service ${service.title}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                  {categoryLabel(service.category)}
                </span>
                <span className="text-xs font-medium text-neutral-500">
                  Posted {formatDate(service.createdAt)}
                </span>
              </div>

              <h2 className="mb-2 text-lg font-semibold text-neutral-900">{service.title}</h2>
              <p className="mb-4 line-clamp-2 text-sm text-neutral-600">{service.description}</p>

              <div className="mb-3 flex items-center justify-between text-sm font-medium">
                <span className="text-xl font-bold text-neutral-900">
                  {formatPrice(service.price)}
                </span>
                <span className="text-sm text-neutral-600">
                  {service.availabilityStartTime || '—'} – {service.availabilityEndTime || '—'}
                </span>
              </div>

              <div className="mb-4 flex items-center justify-between text-sm text-neutral-600">
                <span>Start: {service.availabilityStartTime || 'N/A'}</span>
                <span>End: {service.availabilityEndTime || 'N/A'}</span>
              </div>

              <div className="mt-auto flex items-center justify-between gap-2 text-sm text-neutral-700">
                <span className="truncate">{service.location}</span>
                <span className="shrink-0 text-neutral-500 transition group-hover:text-neutral-800">
                  View →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
