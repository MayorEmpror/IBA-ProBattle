'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

/**
 * Get available slots for a service listing
 */
export const getAvailableSlots = async (serviceListingId: string | number) => {
  const payload = await getPayload({ config })
  const headersList = await headers()

  // Get the service listing
  const service = await payload.findByID({
    collection: 'service-listings',
    id: typeof serviceListingId === 'string' ? parseInt(serviceListingId) : serviceListingId,
    depth: 0,
  })

  // Find existing available slots for this service
  const existingSlots = await (payload as any).find({
    collection: 'slots',
    where: {
      and: [
        {
          serviceListing: { equals: typeof serviceListingId === 'string' ? parseInt(serviceListingId) : serviceListingId },
        },
        {
          status: { equals: 'available' },
        },
      ],
    },
    depth: 0,
    sort: 'date',
  })

  return existingSlots
}

/**
 * Create a slot on-demand for booking
 * This is a temporary solution - in production, slots should be pre-generated
 */
export const createSlotForBooking = async (
  serviceListingId: string | number,
  date: string,
  startTime: string,
  endTime: string
) => {
  const payload = await getPayload({ config })
  const headersList = await headers()

  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    throw new Error('You must be logged in')
  }

  // Check if slot already exists
  const existing = await (payload as any).find({
    collection: 'slots',
    where: {
      and: [
        {
          serviceListing: { equals: typeof serviceListingId === 'string' ? parseInt(serviceListingId) : serviceListingId },
        },
        {
          date: { equals: date },
        },
        {
          startTime: { equals: startTime },
        },
        {
          endTime: { equals: endTime },
        },
      ],
    },
    depth: 0,
    limit: 1,
  })

  if (existing.docs.length > 0) {
    // Return existing slot if available
    const slot = existing.docs[0]
    if (slot.status === 'available') {
      return slot
    } else {
      throw new Error('This time slot is already booked')
    }
  }

  // Create new slot
  const slot = await (payload as any).create({
    collection: 'slots',
    data: {
      serviceListing: typeof serviceListingId === 'string' ? parseInt(serviceListingId) : serviceListingId,
      date,
      startTime,
      endTime,
      status: 'available',
    },
    req: {
      user,
      payload,
      headers: headersList,
    } as any,
  })

  return slot
}
