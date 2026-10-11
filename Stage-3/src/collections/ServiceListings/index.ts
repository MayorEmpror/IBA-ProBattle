import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { servicesSearchEndpoint, servicesStatsEndpoint } from '../../endpoints/services'

export const ServiceListings: CollectionConfig = {
  slug: 'service-listings',
  endpoints: [servicesSearchEndpoint, servicesStatsEndpoint],
  access: {
    admin: authenticated,
    create: authenticated, // Only authenticated users can create listings
    read: () => true, // Anyone can read (browse services)
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { provider: { equals: user.id } }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { provider: { equals: user.id } }
    },
  },
  admin: {
    defaultColumns: ['title', 'provider', 'category', 'price', 'status', 'createdAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Service Title',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Service Description',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Home Repair', value: 'home-repair' },
        { label: 'Cleaning', value: 'cleaning' },
        { label: 'Gardening', value: 'gardening' },
        { label: 'Pet Care', value: 'pet-care' },
        { label: 'Tutoring', value: 'tutoring' },
        { label: 'Delivery', value: 'delivery' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'provider',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Service Provider',
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      label: 'Price (per hour/session)',
      min: 0,
    },
    {
      name: 'availabilityDays',
      type: 'json',
      required: true,
      label: 'Available Days',
      admin: {
        description: 'Array of available days (e.g., ["monday", "tuesday"])',
      },
    },
    {
      name: 'availabilityStartTime',
      type: 'text',
      required: true,
      label: 'Start Time (e.g., 09:00)',
    },
    {
      name: 'availabilityEndTime',
      type: 'text',
      required: true,
      label: 'End Time (e.g., 17:00)',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Paused', value: 'paused' },
      ],
    },
    {
      name: 'location',
      type: 'text',
      required: true,
      label: 'Service Location (Neighborhood/Area)',
    },
    {
      name: 'coordinates',
      type: 'group',
      label: 'Geographic Coordinates',
      fields: [
        {
          name: 'latitude',
          type: 'number',
          required: true,
          label: 'Latitude',
          admin: {
            description: 'Auto-filled from address geocoding',
          },
        },
        {
          name: 'longitude',
          type: 'number',
          required: true,
          label: 'Longitude',
          admin: {
            description: 'Auto-filled from address geocoding',
          },
        },
      ],
    },
    {
      name: 'h3Index',
      type: 'text',
      label: 'H3 Spatial Index',
      admin: {
        readOnly: true,
        description: 'Uber H3 hex index for radius search (5km / 10km / 25km)',
      },
      index: true,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Auto-set provider to current user on create
        if (operation === 'create' && req.user && !data.provider) {
          data.provider = req.user.id
        }
        // Compute H3 index from coordinates for spatial search (Uber H3)
        const lat = data.coordinates?.latitude ?? (data as any).coordinates_latitude
        const lng = data.coordinates?.longitude ?? (data as any).coordinates_longitude
        if (typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)) {
          const { coordsToH3Index } = await import('@/lib/h3-spatial')
          data.h3Index = coordsToH3Index(lat, lng)
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        // Cascade delete related data to avoid Postgres FK failures
        // (Fixes: "Failed query: delete from service_listings ...")
        if (!id) return

        const serviceId = typeof id === 'string' ? parseInt(id) : (id as number)

        // Delete booking-requests that point to this service (or its slots)
        const slots = await req.payload.find({
          collection: 'slots',
          where: { serviceListing: { equals: serviceId } },
          depth: 0,
          limit: 1000,
          req,
        })

        const slotIds = (slots.docs || []).map((s: any) => s.id)

        if (slotIds.length > 0) {
          await req.payload.delete({
            collection: 'booking-requests',
            where: {
              or: [
                { serviceListing: { equals: serviceId } },
                { slot: { in: slotIds } },
              ],
            },
            req,
          })
        } else {
          await req.payload.delete({
            collection: 'booking-requests',
            where: { serviceListing: { equals: serviceId } },
            req,
          })
        }

        // Delete slots for this service
        await req.payload.delete({
          collection: 'slots',
          where: { serviceListing: { equals: serviceId } },
          req,
        })
      },
    ],
  },
  timestamps: true,
}
