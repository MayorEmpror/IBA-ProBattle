import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const BookingRequests: CollectionConfig = {
  slug: 'booking-requests',
  access: {
    admin: authenticated,
    create: authenticated, // Only authenticated users can create bookings
    read: async ({ req: { user, payload }, doc }) => {
      // Users can only read their own bookings or bookings for their services
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      
      // If doc is provided (single document access), check specific permissions
      if (doc) {
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
      
      // For query-level access (doc is undefined), return query constraint
      // Get all service listings where user is provider
      const myServices = await payload.find({
        collection: 'service-listings',
        where: {
          provider: { equals: user.id },
        },
        depth: 0,
        limit: 1000,
      })
      
      const serviceIds = myServices.docs.map((s) => s.id)
      
      // User can see bookings where they are seeker OR provider
      return {
        or: [
          { seeker: { equals: user.id } },
          ...(serviceIds.length > 0 ? [{ serviceListing: { in: serviceIds } }] : []),
        ],
      }
    },
    update: async ({ req: { user, payload }, doc }) => {
      // Provider can update status, seeker can cancel
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      if (!doc) return false
      
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
    delete: ({ req: { user }, doc }) => {
      // Only seeker can delete (cancel) their booking
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      if (!doc) return false
      const seekerId = typeof doc.seeker === 'object' ? doc.seeker.id : doc.seeker
      return seekerId === user.id
    },
  },
  admin: {
    defaultColumns: ['serviceListing', 'seeker', 'requestedDate', 'status', 'createdAt'],
    useAsTitle: 'serviceListing',
  },
  fields: [
    {
      name: 'serviceListing',
      type: 'relationship',
      relationTo: 'service-listings',
      required: true,
      label: 'Service',
    },
    {
      name: 'seeker',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Service Seeker',
    },
    {
      name: 'requestedDate',
      type: 'date',
      required: true,
      label: 'Requested Date',
    },
    {
      name: 'requestedTime',
      type: 'text',
      required: true,
      label: 'Requested Time (e.g., 14:00)',
    },
    {
      name: 'duration',
      type: 'number',
      required: true,
      label: 'Duration (hours)',
      min: 0.5,
      max: 8,
      defaultValue: 1,
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
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Additional Message (optional)',
    },
    {
      name: 'totalPrice',
      type: 'number',
      label: 'Total Price',
      admin: {
        readOnly: true,
        description: 'Calculated based on service price and duration',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        // Auto-set seeker to current user on create
        if (operation === 'create' && req.user && !data.seeker) {
          data.seeker = req.user.id
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, req, operation, doc }) => {
        // Validation: User cannot book their own service
        if (operation === 'create') {
          const payload = req.payload
          
          // Fetch the service listing to get the provider
          const serviceListing = await payload.findByID({
            collection: 'service-listings',
            id: typeof data.serviceListing === 'object' 
              ? data.serviceListing.id 
              : data.serviceListing,
            depth: 0,
          })

          if (serviceListing.provider === req.user?.id) {
            throw new Error('You cannot book your own service')
          }

          // Calculate total price
          if (serviceListing.price && data.duration) {
            data.totalPrice = serviceListing.price * data.duration
          }
        }

        // Update total price if duration or service changes
        if (operation === 'update' && (data.duration || data.serviceListing)) {
          const payload = req.payload
          const currentDoc = doc || await payload.findByID({
            collection: 'booking-requests',
            id: data.id,
            depth: 1,
          })

          const serviceListingId = data.serviceListing 
            ? (typeof data.serviceListing === 'object' ? data.serviceListing.id : data.serviceListing)
            : (typeof currentDoc.serviceListing === 'object' 
                ? currentDoc.serviceListing.id 
                : currentDoc.serviceListing)

          const serviceListing = await payload.findByID({
            collection: 'service-listings',
            id: serviceListingId,
            depth: 0,
          })

          const duration = data.duration || currentDoc.duration
          if (serviceListing.price && duration) {
            data.totalPrice = serviceListing.price * duration
          }
        }

        return data
      },
    ],
  },
  timestamps: true,
}
