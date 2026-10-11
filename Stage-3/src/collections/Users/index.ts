import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { anyone } from '../../access/anyone'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: anyone, // Allow unauthenticated users to sign up
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Moderator', value: 'moderator' },
        { label: 'Provider', value: 'provider' },
        { label: 'Seeker', value: 'seeker' },
      ],
      defaultValue: 'seeker',
      access: {
        update: ({ req: { user } }) => {
          // Only admins can change roles
          return user?.role === 'admin'
        },
      },
    },
  ],
  timestamps: true,
}
