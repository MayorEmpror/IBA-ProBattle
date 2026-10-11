import type { Endpoint } from 'payload'
import { APIError } from 'payload'
import { throttleConfigs } from '../../middleware/throttle'
import { h3CellsInRadius, isWithinRadius } from '@/lib/h3-spatial'

/**
 * Advanced service search endpoint with geospatial queries
 * GET /api/services/search
 *
 * Query parameters:
 * - lat: latitude (required for radius search)
 * - lng: longitude (required for radius search)
 * - radius: radius in kilometers (5, 10, 25) - default 10
 * - category: filter by category
 * - minPrice: minimum price
 * - maxPrice: maximum price
 * - neighborhood: filter by neighborhood name
 * - search: text search in title/description
 * - limit: results limit (default 20, max 100)
 * - page: page number (default 1)
 */
export const servicesSearchEndpoint: Endpoint = {
  path: '/search',
  method: 'get',
  handler: async (req) => {
    // Apply rate limiting
    const allowed = await throttleConfigs.search(req)
    if (!allowed) {
      throw new APIError('Too many requests. Please try again later.', 429)
    }
    const url = new URL(req.url ?? 'http://localhost/')
    const params = {
      lat: url.searchParams.get('lat'),
      lng: url.searchParams.get('lng'),
      radius: url.searchParams.get('radius') || '10',
      category: url.searchParams.get('category'),
      minPrice: url.searchParams.get('minPrice'),
      maxPrice: url.searchParams.get('maxPrice'),
      neighborhood: url.searchParams.get('neighborhood'),
      search: url.searchParams.get('search'),
      limit: Math.min(parseInt(url.searchParams.get('limit') || '20'), 100),
      page: parseInt(url.searchParams.get('page') || '1'),
    }

    // Build where clause
    const where: any = {
      status: { equals: 'active' },
    }

    // Category filter
    if (params.category) {
      where.category = { equals: params.category }
    }

    // Price range filter
    if (params.minPrice || params.maxPrice) {
      where.price = {}
      if (params.minPrice) {
        where.price.greater_than_equal = parseFloat(params.minPrice)
      }
      if (params.maxPrice) {
        where.price.less_than_equal = parseFloat(params.maxPrice)
      }
    }

    // Neighborhood filter
    if (params.neighborhood) {
      where.location = { contains: params.neighborhood }
    }

    // Text search
    if (params.search) {
      where.or = [
        { title: { contains: params.search } },
        { description: { contains: params.search } },
      ]
    }

    // H3 spatial radius search (5km / 10km / 25km)
    if (params.lat && params.lng) {
      const latitude = parseFloat(params.lat)
      const longitude = parseFloat(params.lng)
      const radiusKm = parseFloat(params.radius)

      if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm) || radiusKm <= 0) {
        throw new APIError('Invalid coordinates or radius', 400)
      }

      const cells = h3CellsInRadius(latitude, longitude, radiusKm)
      if (cells.length > 0) {
        where.h3Index = { in: cells }
      }
    }

    const result = await req.payload.find({
      collection: 'service-listings',
      where,
      depth: 2,
      limit: params.limit,
      page: params.page,
      sort: '-createdAt',
    })

    // Exact radius filter (Haversine) within H3 candidates
    if (params.lat && params.lng && result.docs.length > 0) {
      const latitude = parseFloat(params.lat)
      const longitude = parseFloat(params.lng)
      const radiusKm = parseFloat(params.radius)
      result.docs = result.docs.filter((doc: any) => {
        if (!doc.coordinates) return false
        return isWithinRadius(
          latitude,
          longitude,
          doc.coordinates.latitude,
          doc.coordinates.longitude,
          radiusKm,
        )
      })
      result.totalDocs = result.docs.length
    }

    return Response.json({
      docs: result.docs,
      totalDocs: result.totalDocs,
      limit: params.limit,
      page: params.page,
      totalPages: Math.ceil(result.totalDocs / params.limit),
    })
  },
}

/**
 * Get service statistics
 * GET /api/services/stats
 */
export const servicesStatsEndpoint: Endpoint = {
  path: '/stats',
  method: 'get',
  handler: async (req) => {
    // Check authentication for stats
    if (!req.user) {
      throw new APIError('Unauthorized', 401)
    }

    // Check RBAC - only admins and moderators can view stats
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      throw new APIError('Forbidden: Insufficient permissions', 403)
    }

    // Apply rate limiting
    const allowed = await throttleConfigs.authenticated(req)
    if (!allowed) {
      throw new APIError('Too many requests. Please try again later.', 429)
    }

    const totalServices = await req.payload.count({
      collection: 'service-listings',
      where: { status: { equals: 'active' } },
    })

    const totalBookings = await req.payload.count({
      collection: 'booking-requests',
    })

    const categories = await req.payload.find({
      collection: 'service-listings',
      where: { status: { equals: 'active' } },
      limit: 1000,
      depth: 0,
    })

    const categoryCounts: Record<string, number> = {}
    categories.docs.forEach((doc) => {
      categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1
    })

    return Response.json({
      totalServices,
      totalBookings,
      categoryCounts,
    })
  },
}
