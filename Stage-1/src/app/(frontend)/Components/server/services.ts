'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

/**
 * Get all active service listings
 */
export const getServiceListings = async (filters?: {
  category?: string
  search?: string
}) => {
  const payload = await getPayload({ config })
  const headersList = await headers()

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

  const result = await payload.find({
    collection: 'service-listings',
    where,
    depth: 2, // Populate provider relationship
    sort: '-createdAt',
  })

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
  availability: {
    days: string[]
    startTime: string
    endTime: string
  }
  location?: string
}) => {
  const payload = await getPayload({ config })
  const headersList = await headers()

  // Get authenticated user
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    throw new Error('You must be logged in to post a service')
  }

  const result = await payload.create({
    collection: 'service-listings',
    data: {
      ...data,
      provider: user.id,
      location: data.location || 'Downtown',
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
 * Create a booking request
 */
export const createBookingRequest = async (data: {
  serviceListing: string | number
  requestedDate: string
  requestedTime: string
  duration: number
  message?: string
}) => {
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
      seeker: user.id,
      serviceListing: typeof data.serviceListing === 'string' 
        ? parseInt(data.serviceListing) 
        : data.serviceListing,
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
    return { docs: [], totalDocs: 0 }
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

  const serviceIds = myServices.docs.map((s) => s.id)

  const providerBookings = serviceIds.length > 0
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
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected'
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
