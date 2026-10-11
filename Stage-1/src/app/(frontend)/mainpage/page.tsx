import { getUser, logoutPayloadUser } from '../Components/server/actions'
import { ROUTES } from '@/app/(frontend)/utils/constants'
import { getUserData, increaseUserBalance } from '../Components/server/getsetuserdata'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Product } from '@/payload-types'

type UserDataResult = {
  user: {
    id: number
    email: string
    name?: string | null
  }
  userData: {
    balance?: number | null
    products?: Product[] | number[] | null
  } | null
} | null

export default async function MainPage() {
  const user = await getUser()
  const userData = (await getUserData()) as UserDataResult

  const handleLogout = async () => {
    'use server'

    const result = await logoutPayloadUser()

    if (result.success) {
      redirect(ROUTES.LOGIN)
    }
  }

  const submitandgetbalance = async () => {
    'use server'
  
    // Make sure both user and userData exist
    if (!userData || !userData.user || !userData.userData) {
      console.warn('No user or userData found')
      return
    }
  
    await increaseUserBalance(userData.user.id, 10)
    revalidatePath('/mainpage')
  }
  

  return (
    <>
      welcome {user?.name}
      <br />
      email {user?.email} <br />
      your balance: {userData?.userData?.balance ?? 'null'}
      <br />
<h2 className="mt-6 text-lg font-semibold">Your Products</h2>

{Array.isArray(userData?.userData?.products) &&
userData.userData.products.length > 0 ? (
  <ul className="mt-2 list-disc pl-5">
    {userData.userData.products.map((product) => {
      // If products are NOT populated (IDs only)
      if (typeof product === 'number') {
        return (
          <li key={product}>
            Product ID: {product}
          </li>
        )
      }

      // Populated Product object
      return (
        <li key={product.id}>
          {product.name} — ${product.price}
        </li>
      )
    })}
  </ul>
) : (
  <p className="mt-2 text-gray-500">No products found</p>
)}

      <br />
      <br />
      <form action={handleLogout}>
        <button type="submit" className="w-[10%] bg-blue-500 text-white border-white py-3 px-5">
          log out
        </button>
      </form>
      <form action={submitandgetbalance}>
        <button
          type="submit"
          className="w-[10%] bg-blue-500 text-white border-white py-3 px-5 mt-10"
        >
          get balance
        </button>
      </form>
    </>
  )
}
