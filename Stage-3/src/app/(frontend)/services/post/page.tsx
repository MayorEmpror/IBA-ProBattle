import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import PostServiceForm from './PostServiceForm'
import { getUser } from '../../Components/server/actions'

export const metadata: Metadata = {
  title: 'Post a Service - Neighbourly',
  description: 'List your service in the neighborhood',
}

export default async function PostServicePage() {
  // Check if user is a seeker and redirect
  try {
    const user = await getUser()
    if (user && user.role === 'seeker') {
      redirect('/services')
    }
  } catch {
    // User not logged in - allow access (they'll need to login to post)
  }

  return <PostServiceForm />
}
