import { Redis } from '@upstash/redis'

// Requires:
// - UPSTASH_REDIS_REST_URL
// - UPSTASH_REDIS_REST_TOKEN
let redis: Redis | null = null

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv()
  } else {
    console.warn('Upstash Redis credentials not found. Chat functionality will not work.')
  }
} catch (error) {
  console.error('Failed to initialize Redis:', error)
}

export { redis }

