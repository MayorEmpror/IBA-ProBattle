'use client'

import { buyProduct } from '../Components/server/buyProduct'
import { Product } from '@/payload-types'
import { useState } from 'react'

type Props = {
  allProducts: Product[]
  userProducts: Product[]
}

export default function ProductsList({ allProducts, userProducts }: Props) {
  const [ownedProducts, setOwnedProducts] = useState(userProducts)

  const handleBuy = async (productId: number) => {
    try {
      'use server'
      await buyProduct(productId)

      // Update the owned products state
      const boughtProduct = allProducts.find((p) => p.id === productId)
      if (boughtProduct) {
        setOwnedProducts([...ownedProducts, boughtProduct])
      }
    } catch (err) {
      console.error('Failed to buy product', err)
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {allProducts.length === 0 ? (
        <p>No products found</p>
      ) : (
        allProducts.map((p) => {
          const isOwned = ownedProducts.some((up) => up.id === p.id)
          return (
            <div
              key={p.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition relative"
            >
              <h3 className="text-lg font-semibold mb-2">{p.name}</h3>
              <p className="text-gray-700 mb-4">${p.price}</p>
              {isOwned ? (
                <span className="text-green-600 font-bold">✅ Owned</span>
              ) : (
                <button
                  onClick={() => handleBuy(p.id)}
                  className="absolute bottom-4 right-4 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                >
                  Buy
                </button>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
