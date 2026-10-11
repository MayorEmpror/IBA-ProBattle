'use client'

import { useState } from 'react'
import { increaseUserBalance } from '../Components/server/getsetuserdata'
import { revalidatePath } from 'next/cache'
import { Product } from '@/payload-types'

type Props = {
  initialBalance: number
  initialProducts: Product[] | number[]
  userId: number
}

export default function UserProducts({ initialBalance, initialProducts, userId }: Props) {
  const [balance, setBalance] = useState(initialBalance)
  const [products, setProducts] = useState(initialProducts)

  const handleAddBalance = async () => {
    'use server'
    await increaseUserBalance(userId, 10)
    setBalance(balance + 10) // update UI immediately
    revalidatePath('/mainpage') // optional
  }

  return (
    <div>
      <p>Your balance: {balance}</p>
      <button onClick={handleAddBalance}>Get Balance +10</button>

      <h2>Your Products</h2>
      <ul>
        {Array.isArray(products) && products.length > 0 ? (
          products.map((p: any) =>
            typeof p === 'number' ? (
              <li key={p}>Product ID: {p}</li>
            ) : (
              <li key={p.id}>
                {p.name} — ${p.price}
              </li>
            )
          )
        ) : (
          <p>No products found</p>
        )}
      </ul>
    </div>
  )
}
