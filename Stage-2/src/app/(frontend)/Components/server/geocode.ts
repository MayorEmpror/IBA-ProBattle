'use server'

import { geocodeAddress as geocode } from '@/lib/geocode'

export type GeocodeResult = { lat: number; lng: number; displayName: string } | null

/**
 * Geocode an address to lat/lng using Nominatim (OpenStreetMap).
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  return geocode(address)
}
