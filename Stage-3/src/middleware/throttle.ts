import type { PayloadRequest } from 'payload'

/**
 * Simple in-memory rate limiter
 * In production, use Redis or a dedicated rate limiting service
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>()

interface ThrottleOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  keyGenerator?: (req: PayloadRequest) => string // Custom key generator
}

/**
 * Rate limiting middleware for Payload endpoints
 */
export const createThrottle = (options: ThrottleOptions) => {
  const { windowMs, maxRequests, keyGenerator } = options

  return async (req: PayloadRequest): Promise<boolean> => {
    // Generate key for this request
    const key = keyGenerator
      ? keyGenerator(req)
      : req.user?.id?.toString() || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous'

    const now = Date.now()
    const record = requestCounts.get(key)

    // Clean up old entries periodically
    if (requestCounts.size > 10000) {
      for (const [k, v] of requestCounts.entries()) {
        if (v.resetTime < now) {
          requestCounts.delete(k)
        }
      }
    }

    if (!record || record.resetTime < now) {
      // New window or expired
      requestCounts.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      return true
    }

    if (record.count >= maxRequests) {
      return false // Rate limit exceeded
    }

    // Increment count
    record.count++
    return true
  }
}

/**
 * Pre-configured throttlers
 */
export const throttleConfigs = {
  // Strict throttling for search endpoints
  search: createThrottle({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    keyGenerator: (req) => {
      return req.user?.id?.toString() || req.headers.get('x-forwarded-for') || 'anonymous'
    },
  }),

  // Moderate throttling for general API
  api: createThrottle({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    keyGenerator: (req) => {
      return req.user?.id?.toString() || req.headers.get('x-forwarded-for') || 'anonymous'
    },
  }),

  // Lenient throttling for authenticated users
  authenticated: createThrottle({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    keyGenerator: (req) => {
      if (!req.user) {
        return req.headers.get('x-forwarded-for') || 'anonymous'
      }
      return `user:${req.user.id}`
    },
  }),
}
