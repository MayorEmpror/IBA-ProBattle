/**
 * Uber H3 spatial indexing for radius-based service discovery.
 * Uses h3-js for hexagon indexing; radius search via gridDisk.
 */

import { latLngToCell, gridDisk, getHexagonEdgeLengthAvg } from 'h3-js'

/** H3 resolution for indexing (res 9 ~= 0.1 km² per hex). */
export const H3_RESOLUTION = 9

/** Radius presets in km. */
export const RADIUS_KM = [5, 10, 25, 50] as const
export type RadiusKm = (typeof RADIUS_KM)[number]

/**
 * Approximate k-ring size for gridDisk to cover a given radius (km).
 * At res 9, hex edge ~0.174 km. Radius ~ k * edge => k ≈ radius / edge.
 */
function radiusKmToK(radiusKm: number): number {
  const edgeKm = getHexagonEdgeLengthAvg(H3_RESOLUTION, 'km')
  const k = Math.ceil(radiusKm / edgeKm)
  return Math.max(1, Math.min(k, 100))
}

/**
 * Get H3 index for a lat/lng at our fixed resolution.
 */
export function coordsToH3Index(lat: number, lng: number): string {
  return latLngToCell(lat, lng, H3_RESOLUTION)
}

/**
 * Get all H3 cell indices within radius (km) of a center.
 * Uses gridDisk for fast spatial lookup.
 */
export function h3CellsInRadius(lat: number, lng: number, radiusKm: number): string[] {
  const center = latLngToCell(lat, lng, H3_RESOLUTION)
  const k = radiusKmToK(radiusKm)
  return gridDisk(center, k)
}

/**
 * Check if a distance (km) is within radius.
 */
export function isWithinRadius(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  radiusKm: number
): boolean {
  const d = haversineKm(lat1, lng1, lat2, lng2)
  return d <= radiusKm
}

/** Haversine distance in km. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
