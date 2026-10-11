import { Metadata } from 'next'
import { getMyBookings } from '../Components/server/services'
import BookingsList from './BookingsList'

export const metadata: Metadata = {
  title: 'My Bookings - Neighbourly',
  description: 'View your service bookings',
}

export default async function BookingsPage() {
  const bookings = await getMyBookings()

  return <BookingsList bookings={bookings} />
}
