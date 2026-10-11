'use server'

import { getPayload } from 'payload'
import config from '@payload-config'


export const getProducts = async () => {
  const payload = await getPayload({ config })


  // Authenticate the request (optional)
  // If your products are public, you can skip auth

  // Fetch all products
  const productsDataRes = await payload.find({
    collection: 'products',
    limit: 100,   // increase if you expect more
    depth: 1,     // populate any relations
  })

  return productsDataRes.docs || []
}
