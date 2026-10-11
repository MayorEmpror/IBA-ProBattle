import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const ServiceListings: CollectionConfig = {
  slug: 'service-listings',
  access: {
    admin: authenticated,
    create: authenticated, // Only authenticated users can create listings
    read: () => true, // Anyone can read (browse services)
    update: ({ req: { user }, doc }) => {
      // Only the provider who created the listing can update it
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      if (!doc) return false
      
      // Handle both relationship object and ID
      const providerId = typeof doc.provider === 'object' ? doc.provider.id : doc.provider
      return providerId === user.id
    },
    delete: ({ req: { user }, doc }) => {
      // Only the provider who created the listing can delete it
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      if (!doc) return false
      
      // Handle both relationship object and ID
      const providerId = typeof doc.provider === 'object' ? doc.provider.id : doc.provider
      return providerId === user.id
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
      name: 'availability',
      type: 'group',
      fields: [
        {
          name: 'days',
          type: 'select',
          hasMany: true,
          required: true,
          options: [
            { label: 'Monday', value: 'monday' },
            { label: 'Tuesday', value: 'tuesday' },
            { label: 'Wednesday', value: 'wednesday' },
            { label: 'Thursday', value: 'thursday' },
            { label: 'Friday', value: 'friday' },
            { label: 'Saturday', value: 'saturday' },
            { label: 'Sunday', value: 'sunday' },
          ],
        },
        {
          name: 'startTime',
          type: 'text',
          required: true,
          label: 'Start Time (e.g., 09:00)',
        },
        {
          name: 'endTime',
          type: 'text',
          required: true,
          label: 'End Time (e.g., 17:00)',
        },
      ],
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
      defaultValue: 'Downtown', // Single neighborhood for Stage 1
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Auto-set provider to current user on create
        if (operation === 'create' && req.user && !data.provider) {
          data.provider = req.user.id
        }
        return data
      },
    ],
  },
  timestamps: true,
}
