import { getPayload } from 'payload'
import type { Payload } from 'payload'
import config from '@payload-config'

declare global {
  // eslint-disable-next-line no-var
  var __payloadClient: Payload | undefined
}

/**
 * Next dev can initialize Payload multiple times (HMR / route reloads).
 * Cache the instance on globalThis to avoid creating new Postgres pools
 * and hitting "Max client connections reached".
 */
export async function getPayloadClient(): Promise<Payload> {
  if (!globalThis.__payloadClient) {
    globalThis.__payloadClient = await getPayload({ config })
  }
  return globalThis.__payloadClient
}

