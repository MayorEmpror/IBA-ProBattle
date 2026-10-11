'use server'

import { getPayload, createLocalReq } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { h3CellsInRadius, isWithinRadius } from '@/lib/h3-spatial'

export const getServiceListings = async (filters?: {
  category?: string
  search?: string
  lat?: number
  lng?: number
  radius?: number
  minPrice?: number
  maxPrice?: number
  neighborhood?: string
}) => {
  const payload = await getPayload({ config })

  const where: any = {
    status: { equals: 'active' },
  }

  if (filters?.category) {
    where.category = { equals: filters.category }
  }

  if (filters?.search) {
    where.or = [
      { title: { contains: filters.search } },
      { description: { contains: filters.search } },
    ]
  }

  if (filters?.minPrice != null || filters?.maxPrice != null) {
    where.price = {}
    if (filters.minPrice != null) {
      where.price.greater_than_equal = filters.minPrice
    }
    if (filters.maxPrice != null) {
      where.price.less_than_equal = filters.maxPrice
    }
  }

  if (filters?.neighborhood) {
    where.location = { contains: filters.neighborhood }
  }

  // H3 spatial filter: 5km / 10km / 25km radius via Uber H3
  if (
    filters?.lat != null &&
    filters?.lng != null &&
    filters?.radius != null &&
    filters.radius > 0
  ) {
    const cells = h3CellsInRadius(filters.lat, filters.lng, filters.radius)
    if (cells.length > 0) {
      where.h3Index = { in: cells }
    }
  }

  const result = await payload.find({
    collection: 'service-listings',
    where,
    depth: 2,
    sort: '-createdAt',
    limit: 100,
  })

  // Exact radius filter (Haversine) within H3 candidates
  if (
    filters?.lat != null &&
    filters?.lng != null &&
    filters?.radius != null &&
    filters.radius > 0
  ) {
    const filteredDocs = result.docs.filter((doc: any) => {
      if (!doc.coordinates) return false
      return isWithinRadius(
        filters.lat!,
        filters.lng!,
        doc.coordinates.latitude,
        doc.coordinates.longitude,
        filters.radius!,
      )
    })

    return {
      ...result,
      docs: filteredDocs,
      totalDocs: filteredDocs.length,
    }
  }

  return result
}

/**
 * Get a single service listing by ID
 */
export const getServiceListing = async (id: string | number) => {
  const payload = await getPayload({ config })
  const headersList = await headers()

  const result = await payload.findByID({
    collection: 'service-listings',
    id: typeof id === 'string' ? parseInt(id) : id,
    depth: 2,
  })

  return result
}

/**
 * Create a new service listing
 */
export const createServiceListing = async (data: {
  title: string
  description: string
  category: string
  price: number
  availabilityDays: string[]
  availabilityStartTime: string
  availabilityEndTime: string
  location: string
  coordinates: {
    latitude: number
    longitude: number
  }
}) => {
  const payload = await getPayload({ config })
  const headersList = await headers()

  // Get authenticated user
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    throw new Error('You must be logged in to post a service')
  }

  const req = await createLocalReq({ user, req: { headers: headersList } }, payload)

  const result = await payload.create({
    collection: 'service-listings',
    data: {
      ...data,
      provider: user.id,
    },
    req,
    overrideAccess: false,
  })

  return result
}

/**
 * Get user's own service listings
 */
export const getMyServiceListings = async () => {
  const payload = await getPayload({ config })
  const headersList = await headers()

  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    return { docs: [], totalDocs: 0 }
  }

  const result = await payload.find({
    collection: 'service-listings',
    where: {
      provider: { equals: user.id },
    },
    depth: 1,
    sort: '-createdAt',
  })

  return result
}

/**
 * Update a service listing
 */
export const updateServiceListing = async (
  id: string | number,
  data: {
    title?: string
    description?: string
    category?: string
    price?: number
    status?: string
    location?: string
    availabilityDays?: string[]
    availabilityStartTime?: string
    availabilityEndTime?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  },
) => {
  const payload = await getPayload({ config })
  const headersList = await headers()

  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    throw new Error('You must be logged in')
  }

  const result = await payload.update({
    collection: 'service-listings',
    id: typeof id === 'string' ? parseInt(id) : id,
    data,
    req: {
      user,
      payload,
      headers: headersList,
    } as any,
  })

  return result
}

/**
 * Delete a service listing
 */
export const deleteServiceListing = async (id: string | number) => {
  const payload = await getPayload({ config })
  const headersList = await headers()

  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    throw new Error('You must be logged in')
  }

  await payload.delete({
    collection: 'service-listings',
    id: typeof id === 'string' ? parseInt(id) : id,
    req: {
      user,
      payload,
      headers: headersList,
    } as any,
  })

  return { success: true }
}

/**
 * Create a booking request
 */
export const createBookingRequest = async (data: { slot: string | number; notes?: string }) => {
  const payload = await getPayload({ config })
  const headersList = await headers()

  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    throw new Error('You must be logged in to book a service')
  }

  const result = await payload.create({
    collection: 'booking-requests',
    data: {
      ...data,
      slot: typeof data.slot === 'string' ? parseInt(data.slot) : data.slot,
    },
    req: {
      user,
      payload,
      headers: headersList,
    } as any,
  })

  return result
}

/**
 * Get user's bookings (as seeker or provider)
 */
export const getMyBookings = async () => {
  const payload = await getPayload({ config })
  const headersList = await headers()

  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    return { asSeeker: { docs: [], totalDocs: 0 }, asProvider: { docs: [], totalDocs: 0 } }
  }

  // Get bookings where user is seeker
  const seekerBookings = await payload.find({
    collection: 'booking-requests',
    where: {
      seeker: { equals: user.id },
    },
    depth: 2,
    sort: '-createdAt',
  })

  // Get bookings for services where user is provider
  const myServices = await payload.find({
    collection: 'service-listings',
    where: {
      provider: { equals: user.id },
    },
    depth: 0,
    limit: 1000,
  })

  const serviceIds = myServices.docs.map((s: { id: number }) => s.id)

  const providerBookings =
    serviceIds.length > 0
      ? await payload.find({
          collection: 'booking-requests',
          where: {
            serviceListing: { in: serviceIds },
          },
          depth: 2,
          sort: '-createdAt',
        })
      : { docs: [], totalDocs: 0 }

  return {
    asSeeker: seekerBookings,
    asProvider: providerBookings,
  }
}

/**
 * Update booking status
 */
export const updateBookingStatus = async (
  bookingId: string | number,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
) => {
  const payload = await getPayload({ config })
  const headersList = await headers()

  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    throw new Error('You must be logged in')
  }

  const result = await payload.update({
    collection: 'booking-requests',
    id: typeof bookingId === 'string' ? parseInt(bookingId) : bookingId,
    data: { status },
    req: {
      user,
      payload,
      headers: headersList,
    } as any,
  })

  return result
}
