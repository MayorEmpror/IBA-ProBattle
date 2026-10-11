// Server component: fetch products and user data
import ProductsList from './Prodlist'
import { getProducts } from '../Components/server/getProducts'
import { getUserData } from '../Components/server/getsetuserdata'
import { Product } from '@/payload-types'

export default async function ProductsPage() {
  const allProducts = (await getProducts()) || []
  const userData = await getUserData()
  const userProducts = (userData?.userData?.products ?? []) as Product[]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Products</h1>
      <ProductsList allProducts={allProducts} userProducts={userProducts} />
    </div>
  )
}
