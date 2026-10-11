import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payloadClient'
import { redis } from '@/lib/chat/redis'

type CreateRoomBody = {
  serviceListingId: number
  seekerId?: number
}

function roomIdFor(serviceListingId: number, seekerId: number, providerId: number) {
  return `svc_${serviceListingId}_seeker_${seekerId}_provider_${providerId}`
}

// GET endpoint to list chat rooms for a service
export async function GET(req: Request) {
  try {
    if (!redis) {
      return NextResponse.json(
        { error: 'Chat service not configured' },
        { status: 500 }
      )
    }

    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const serviceListingId = searchParams.get('serviceListingId')

    if (!serviceListingId) {
      return NextResponse.json({ error: 'serviceListingId is required' }, { status: 400 })
    }

    const serviceId = Number(serviceListingId)
    if (!Number.isFinite(serviceId)) {
      return NextResponse.json({ error: 'Invalid serviceListingId' }, { status: 400 })
    }

    // Verify user owns this service
    const service = await payload.findByID({
      collection: 'service-listings',
      id: serviceId,
      depth: 0,
    })

    const providerId =
      typeof (service as any).provider === 'object' ? (service as any).provider.id : (service as any).provider

    if (user.id !== providerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all room IDs for this service from the set
    const serviceRoomsKey = `chat:service:${serviceId}:rooms`
    const rooms: Array<{ roomId: string; seekerId: number; lastMessage?: number }> = []

    try {
      // Get all room IDs from the set
      const roomIds = await redis.smembers<any>(serviceRoomsKey)

      if (!roomIds || roomIds.length === 0) {
        return NextResponse.json({ rooms: [] })
      }

      // Fetch metadata for each room
      for (const roomId of roomIds) {
        try {
          const metaKey = `chat:meta:${roomId}`
          const meta = await redis.hgetall<any>(metaKey)

          if (meta && meta.roomId) {
            const seekerId = Number(meta.seekerId)
            if (Number.isFinite(seekerId)) {
              // Get last message timestamp
              const messagesKey = `chat:messages:${roomId}`
              const messages = await redis.lrange<any>(messagesKey, -1, -1)
              const lastMessage = messages && messages.length > 0 ? messages[0]?.timestamp : undefined

              rooms.push({
                roomId: meta.roomId,
                seekerId,
                lastMessage: lastMessage ? Number(lastMessage) : undefined,
              })
            }
          }
        } catch (err) {
          console.error(`Error fetching room ${roomId}:`, err)
          // Continue with other rooms
        }
      }

      // Sort by last message time (most recent first)
      rooms.sort((a, b) => {
        const timeA = a.lastMessage || 0
        const timeB = b.lastMessage || 0
        return timeB - timeA
      })

      return NextResponse.json({ rooms })
    } catch (redisError) {
      console.error('Redis error:', redisError)
      return NextResponse.json({ error: 'Failed to fetch chat rooms' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error fetching chat rooms:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    // Check Redis connection first
    if (!redis) {
      console.error('Upstash Redis not initialized')
      return NextResponse.json(
        { error: 'Chat service not configured. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env' },
        { status: 500 }
      )
    }

    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: CreateRoomBody
    try {
      body = (await req.json()) as CreateRoomBody
    } catch (error) {
      console.error('Failed to parse request body:', error)
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const serviceListingId = Number(body.serviceListingId)
    if (!Number.isFinite(serviceListingId)) {
      return NextResponse.json({ error: 'serviceListingId is required' }, { status: 400 })
    }

    let service
    try {
      service = await payload.findByID({
        collection: 'service-listings',
        id: serviceListingId,
        depth: 0,
      })
    } catch (error) {
      console.error('Failed to fetch service:', error)
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const providerId =
      typeof (service as any).provider === 'object' ? (service as any).provider.id : (service as any).provider

    if (!providerId) {
      return NextResponse.json({ error: 'Service has no provider' }, { status: 400 })
    }

    // If provider is opening a chat, they must specify which seeker
    const seekerId =
      user.id === providerId && body.seekerId != null ? Number(body.seekerId) : (user.id as number)

    if (!Number.isFinite(seekerId)) {
      return NextResponse.json({ error: 'Invalid seekerId' }, { status: 400 })
    }

    // Only provider or seeker can create/access this room
    if (user.id !== providerId && user.id !== seekerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prevent self-chat
    if (providerId === seekerId) {
      return NextResponse.json({ error: 'Cannot create chat with yourself' }, { status: 400 })
    }

    const roomId = roomIdFor(serviceListingId, seekerId, providerId)
    const metaKey = `chat:meta:${roomId}`
    const serviceRoomsKey = `chat:service:${serviceListingId}:rooms`

    try {
      const existing = await redis.hgetall(metaKey)
      const isNewRoom = !existing || Object.keys(existing).length === 0

      if (isNewRoom) {
        await redis.hset(metaKey, {
          roomId,
          serviceListingId: String(serviceListingId),
          seekerId: String(seekerId),
          providerId: String(providerId),
          participants: JSON.stringify([seekerId, providerId]),
          createdAt: String(Date.now()),
        })

        // Add room ID to service's room list
        await redis.sadd(serviceRoomsKey, roomId)
      }
    } catch (redisError) {
      console.error('Redis error:', redisError)
      return NextResponse.json(
        { error: 'Failed to create chat room. Please check Redis configuration.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ roomId })
  } catch (error) {
    console.error('Unexpected error in chat room creation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

