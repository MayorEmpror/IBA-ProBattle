import { Metadata } from 'next'
import PostServiceForm from './PostServiceForm'

export const metadata: Metadata = {
  title: 'Post a Service - Neighbourly',
  description: 'List your service in the neighborhood',
}

export default function PostServicePage() {
  return <PostServiceForm />
}
