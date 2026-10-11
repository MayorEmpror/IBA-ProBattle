import { Metadata } from 'next'

import Signup from '@/app/(frontend)/Components/Auth/Signup'

export const metadata: Metadata = {
  title: 'Sign Up Page - RoomVision',
  description: 'Create your RoomVision account to start designing stunning 3D spaces.',
}

export default function SignUpPage() {
  return (
    <>
      <Signup />
    </>
  )
}
