'use server'

import { cookies, headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payloadClient'




export async function loginPayloadUser(email: string, password: string) {
  const payload = await getPayloadClient()

  try {
    const result = await payload.login({
      collection: 'users',
      data: { email, password },
    })

    // Set HTTP-only cookie manually
    const cookieStore = await cookies()

    cookieStore.set({
      name: 'payload-token',
      value: result.token!,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    })

    return { success: true, user: result.user }
  } catch (err) {
    return { error: (err as Error).message || 'Invalid credentials' }
  }
}

export const fetchJWT = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')
  return token
}

export const registerPayloadUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: string
) => {
  const payload = await getPayloadClient()

  const user = await payload.create({
    collection: 'users',
    data: {
      email,
      password,
      name: `${firstName} ${lastName}`,
      role: role === "provider" || role === "seeker" ? role : undefined,
    },
  })

  await payload.create({
    collection: 'UserData',
    data: {
      user: user.id,
      balance: 0,
    },
    overrideAccess: true, // Allow creation during signup before user is authenticated
  })

  return user
}





export const logoutPayloadUser = async () => {
  const cookieStore = await cookies()
  cookieStore.delete('payload-token')
  return { success: true }
}

export const authenticateUser = async () => {
  const payload = await getPayloadClient()
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (user) {
    return { email: user.email, name: user.name, id: user.id }
  }

  return { email: 'Not authenticated', name: 'Not authenticated', id: 'Not authenticated' }
}

export const getUser = async () => {
  const payload = await getPayloadClient()
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })
  return user
}

export const resetUserPassword = async (email: string) => {
  const payload = await getPayloadClient()
  try {
    const forgotPassword = await payload.forgotPassword({
      collection: 'users',
      data: {
        email: email,
      },
    })
    console.log(forgotPassword)
    return 0
  } catch {
    return 1
  }
}

export const changePassword = async (token: string, new_password: string) => {
  const payload = await getPayloadClient()
  const reset = await payload.resetPassword({
    collection: 'users',
    data: {
      token: token,
      password: new_password,
    },
    overrideAccess: true,
  })
  return reset
}

interface SelectOption {
  label: string
  value: string
}

export type { SelectOption }
