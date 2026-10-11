/**
 * Geocoding: tries Nominatim, then Photon (Komoot), then Open-Meteo.
 * All free, no API keys. Used for address → lat/lng (radius search, post service).
 */

export interface GeocodeResult {
  lat: number
  lng: number
  displayName: string
}

const FETCH_OPTS: RequestInit = {
  cache: 'no-store',
  headers: {
    'User-Agent': 'Neighbourly/1.0',
    Accept: 'application/json',
  },
}

/** Nominatim (OpenStreetMap). 1 req/s when retrying; we use delays. */
async function nominatimSearch(query: string): Promise<GeocodeResult | null> {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', query)
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '1')

    const res = await fetch(url.toString(), FETCH_OPTS)
    if (!res.ok) return null

    const data = (await res.json()) as Array<{ lat?: string; lon?: string; display_name?: string }>
    if (!Array.isArray(data) || data.length === 0) return null

    const first = data[0]
    const lat = parseFloat(first.lat as string)
    const lng = parseFloat(first.lon as string)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null

    return {
      lat,
      lng,
      displayName: first.display_name ?? query,
    }
  } catch {
    return null
  }
}

/** Photon (Komoot) – OSM-based, often works when Nominatim is blocked or empty. */
async function photonSearch(query: string): Promise<GeocodeResult | null> {
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`
    const res = await fetch(url, FETCH_OPTS)
    if (!res.ok) return null

    const json = (await res.json()) as { features?: Array<{ geometry?: { coordinates?: [number, number] }; properties?: { name?: string; country?: string } }> }
    const features = json?.features
    if (!Array.isArray(features) || features.length === 0) return null

    const f = features[0]
    const [lng, lat] = f?.geometry?.coordinates ?? [NaN, NaN]
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null

    const displayName = f?.properties?.name || f?.properties?.country || query
    return { lat, lng, displayName }
  } catch {
    return null
  }
}

/** Open-Meteo Geocoding – good for city/place names, no key. */
async function openMeteoSearch(query: string): Promise<GeocodeResult | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1`
    const res = await fetch(url, FETCH_OPTS)
    if (!res.ok) return null

    const json = (await res.json()) as { results?: Array<{ name?: string; latitude?: number; longitude?: number; country?: string }> }
    const results = json?.results
    if (!Array.isArray(results) || results.length === 0) return null

    const r = results[0]
    const lat = Number(r?.latitude)
    const lng = Number(r?.longitude)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null

    return {
      lat,
      lng,
      displayName: [r?.name, r?.country].filter(Boolean).join(', ') || query,
    }
  } catch {
    return null
  }
}

/**
 * Geocode an address to lat/lng. Tries, in order:
 * 1) Nominatim (q, then q+", Pakistan" if no Pakistan in query, then "Karachi, Pakistan" if Karachi)
 * 2) Photon (q, then q+", Pakistan")
 * 3) Open-Meteo (q, then q+", Pakistan")
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const q = address?.trim()
  if (!q) return null

  // --- 1) Nominatim ---
  let r = await nominatimSearch(q)
  if (r) return r

  if (!/pakistan/i.test(q)) {
    await new Promise((x) => setTimeout(x, 1100))
    r = await nominatimSearch(`${q}, Pakistan`)
    if (r) return r
  }

  if (/karachi/i.test(q)) {
    await new Promise((x) => setTimeout(x, 1100))
    r = await nominatimSearch('Karachi, Pakistan')
    if (r) return r
  }

  // --- 2) Photon ---
  r = await photonSearch(q)
  if (r) return r

  if (!/pakistan/i.test(q)) {
    await new Promise((x) => setTimeout(x, 400))
    r = await photonSearch(`${q}, Pakistan`)
    if (r) return r
  }

  // --- 3) Open-Meteo (best for city/place names) ---
  r = await openMeteoSearch(q)
  if (r) return r

  if (!/pakistan/i.test(q)) {
    await new Promise((x) => setTimeout(x, 400))
    r = await openMeteoSearch(`${q}, Pakistan`)
  }

  return r
}
