import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const Slots: CollectionConfig = {
  slug: 'slots',
  access: {
    admin: authenticated,
    create: authenticated,
    read: () => true, // Anyone can read available slots
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    defaultColumns: ['serviceListing', 'startTime', 'endTime', 'date', 'status', 'createdAt'],
    useAsTitle: 'id',
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
      name: 'date',
      type: 'date',
      required: true,
      label: 'Slot Date',
    },
    {
      name: 'startTime',
      type: 'text',
      required: true,
      label: 'Start Time (e.g., 14:00)',
    },
    {
      name: 'endTime',
      type: 'text',
      required: true,
      label: 'End Time (e.g., 16:00)',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'available',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Reserved', value: 'reserved' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Booked', value: 'booked' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
  ],
  timestamps: true,
}
