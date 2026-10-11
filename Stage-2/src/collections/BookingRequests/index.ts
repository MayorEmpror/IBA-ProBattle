import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const BookingRequests: CollectionConfig = {
  slug: 'booking-requests',
  access: {
    admin: authenticated,
    create: authenticated, // Only authenticated users can create bookings
    read: async ({ req: { user, payload }, id }) => {
      // Users can only read their own bookings or bookings for their services
      if (!user) return false
      if (user.role === 'admin') return true
      
      // If id is provided (single document access), check specific permissions
      if (id) {
        const doc = await payload.findByID({
          collection: 'booking-requests',
          id: id as number,
          depth: 1,
        })
        
        // Check if user is the seeker
        const seekerId = typeof doc.seeker === 'object' ? doc.seeker.id : doc.seeker
        if (seekerId === user.id) return true
        
        // Check if user is the provider (need to fetch service listing)
        if (doc.serviceListing) {
          const serviceListingId = typeof doc.serviceListing === 'object' 
            ? doc.serviceListing.id 
            : doc.serviceListing
          const serviceListing = await payload.findByID({
            collection: 'service-listings',
            id: serviceListingId,
            depth: 0,
          })
          return serviceListing.provider === user.id
        }
        
        return false
      }
      
      // For query-level access (id is undefined), return query constraint
      // User can see bookings where they are seeker
      // For provider bookings, we'll filter in the application layer for now
      // TODO: Optimize with proper relationship filtering when Payload supports it
      return {
        seeker: { equals: user.id },
      }
    },
    update: async ({ req: { user, payload }, id }) => {
      // Provider can update status, seeker can cancel
      if (!user) return false
      if (user.role === 'admin') return true
      if (!id) return false
      
      const doc = await payload.findByID({
        collection: 'booking-requests',
        id: id as number,
        depth: 1,
      })
      
      const seekerId = typeof doc.seeker === 'object' ? doc.seeker.id : doc.seeker
      if (seekerId === user.id) return true // Seeker can cancel
      
      // Check if user is the provider
      if (doc.serviceListing) {
        const serviceListingId = typeof doc.serviceListing === 'object' 
          ? doc.serviceListing.id 
          : doc.serviceListing
        const serviceListing = await payload.findByID({
          collection: 'service-listings',
          id: serviceListingId,
          depth: 0,
        })
        return serviceListing.provider === user.id
      }
      
      return false
    },
    delete: async ({ req: { user, payload }, id }) => {
      // Only seeker can delete (cancel) their booking
      if (!user) return false
      if (user.role === 'admin') return true
      if (!id) return false
      
      const doc = await payload.findByID({
        collection: 'booking-requests',
        id: id as number,
        depth: 0,
      })
      
      const seekerId = typeof doc.seeker === 'object' ? doc.seeker.id : doc.seeker
      return seekerId === user.id
    },
  },
  admin: {
    defaultColumns: ['slot', 'seeker', 'status', 'priceSnapshot', 'createdAt'],
    useAsTitle: 'slot',
  },
  fields: [
    {
      name: 'serviceListing',
      type: 'relationship',
      relationTo: 'service-listings',
      required: true,
      label: 'Service',
      admin: {
        readOnly: true,
        description: 'Derived from slot',
      },
    },
    {
      name: 'slot',
      type: 'relationship',
      relationTo: 'slots' as any,
      required: true,
      label: 'Time Slot',
    },
    {
      name: 'seeker',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Service Seeker',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'priceSnapshot',
      type: 'number',
      required: true,
      label: 'Price Snapshot',
      admin: {
        readOnly: true,
        description: 'Price at time of booking (immutable)',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes (optional)',
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user) {
          if (data) {
            data.seeker = req.user.id
          }
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation !== 'create' || !data) return data

        const payload = req.payload
        const userId = req.user?.id

        if (!userId) throw new Error('Unauthorized')

        // Fetch slot
        const slotId = typeof data.slot === 'object' ? data.slot.id : data.slot
        const slot = await (payload as any).findByID({
          collection: 'slots',
          id: slotId as number,
          depth: 1,
        })

        if (slot.status !== 'available') {
          throw new Error('Slot already booked')
        }

        // Fetch service
        const serviceListingId = typeof slot.serviceListing === 'object' 
          ? slot.serviceListing.id 
          : slot.serviceListing
        const service = await payload.findByID({
          collection: 'service-listings',
          id: serviceListingId as number,
          depth: 0,
        })

        // Prevent self-booking
        if (service.provider === userId) {
          throw new Error('You cannot book your own service')
        }

        // Snapshot price
        data.priceSnapshot = service.price

        // Set serviceListing from slot
        data.serviceListing = serviceListingId

        // Lock slot atomically
        await (payload as any).update({
          collection: 'slots',
          id: slot.id,
          data: {
            status: 'reserved',
          },
          req,
        })

        return data
      },
    ],
  },
  timestamps: true,
}
