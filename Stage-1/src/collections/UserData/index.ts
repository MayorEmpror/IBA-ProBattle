import type { CollectionConfig } from 'payload'
import { authenticated } from '../../access/authenticated'

export const UserData: CollectionConfig = {
  slug: 'UserData',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['user', 'balance', 'createdAt'],
    useAsTitle: 'user',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
    },
    {
      name: 'balance',
      type: 'number',
      required: true,
      defaultValue: 0,
    },

    // 👤 Profile Image
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
    },

    // 🖼️ Image Gallery
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },

    // 🛒 Purchased / Owned Products
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
    },
  ],
  timestamps: true,
}
