import { NavbarDemo } from "../../components/navbar/navbar"
import Link from "next/link"
import { ROUTES } from "./utils/constants"

export default function MainPage() {
  return (
    <>
      <NavbarDemo />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              Welcome to Neighbourly
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect with your neighborhood. Find services or offer yours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link
              href={ROUTES.SERVICES}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition hover:scale-105"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Browse Services
                </h2>
                <p className="text-gray-600">
                  Find services in your neighborhood
                </p>
              </div>
            </Link>

            <Link
              href={ROUTES.POST_SERVICE}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition hover:scale-105"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">➕</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Post a Service
                </h2>
                <p className="text-gray-600">
                  Offer your services to the community
                </p>
              </div>
            </Link>

            <Link
              href={ROUTES.MY_SERVICES}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition hover:scale-105"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">💼</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  My Services
                </h2>
                <p className="text-gray-600">
                  Manage your listed services
                </p>
              </div>
            </Link>

            <Link
              href={ROUTES.MY_BOOKINGS}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition hover:scale-105"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">📅</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  My Bookings
                </h2>
                <p className="text-gray-600">
                  View and manage your bookings
                </p>
              </div>
            </Link>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🏘️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Stage 1: Single Neighborhood
                </h2>
                <p className="text-gray-600 text-sm">
                  Currently serving Downtown area
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
 

export { MainPage }
