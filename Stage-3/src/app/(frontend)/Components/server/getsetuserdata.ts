'use server'

import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payloadClient'

/**
 * Fetches the currently logged-in user along with their related userData
 */




export const getUserData = async () => {
  const payload = await getPayloadClient()
  const headersList = await headers()

  // Authenticate user
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    return null
  }

  // Fetch UserData with populated relations
  const userDataResult = await payload.find({
    collection: 'UserData', // ✅ FIXED slug
    where: {
      user: {
        equals: user.id,
      },
    },
    limit: 1,
    depth: 1, // ✅ populate products + media
  })

  const userData = userDataResult.docs[0] ?? null

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    userData,
  }
}


export const increaseUserBalance = async (userId: number, amount: number) => {
    const payload = await getPayloadClient()
  
    // Fetch current UserData
    const userDataOld = await payload.find({ 
      collection: 'UserData',
      where: {
        user: {
            equals: userId
        }
      }
    })
    const userData = await payload.update({
      collection: 'UserData',
      id: userDataOld.docs[0].id,
      data: {
        balance: amount !== undefined ? (userDataOld.docs[0].balance ?? 0) + amount : 0,
      
      },
    })

    return userData
  }