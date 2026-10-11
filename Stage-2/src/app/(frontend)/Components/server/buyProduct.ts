'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

export const buyProduct = async (productId: number) => {
  const payload = await getPayload({ config })
  const headersList = await headers()

  // Authenticate the user
  const { user } = await payload.auth({ headers: headersList })
  if (!user) throw new Error('User not authenticated')

  // Fetch UserData for this user
  const userDataRes = await payload.find({
    collection: 'UserData', // ✅ Use the exact slug
    where: { user: { equals: user.id } },
    limit: 1,
    depth: 1, // populate products array
  })

  const userData = userDataRes.docs[0]
  if (!userData) throw new Error('UserData not found for this user')

  // Prevent duplicates
  const alreadyOwned =
    userData.products?.some((p: any) => (typeof p === 'object' ? p.id === productId : p === productId)) ?? false
  if (alreadyOwned) return { success: false, message: 'Product already owned' }

  // Add product
  const updatedUserData = await payload.update({
    collection: 'UserData', // ✅ slug matches exactly
    id: userData.id,
    data: {
      products: [...(userData.products || []), { id: productId }], // use object with id
    },
  })

  return { success: true, userData: updatedUserData }
}
