import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

import { getPayloadClient } from '@/lib/payloadClient'
import { redis } from '@/lib/chat/redis'
import { realtime, type ChatMessage } from '@/lib/chat/realtime'

async function requireParticipant(req: Request, roomId: string) {
  if (!redis) {
    return { ok: false as const, status: 500 as const, user: null, error: 'Redis not configured' }
  }

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })

  if (!user) return { ok: false as const, status: 401 as const, user: null }

  try {
    const meta = await redis.hgetall<any>(`chat:meta:${roomId}`)
    let participants: number[] | undefined
    
    if (meta?.participants) {
      try {
        participants = typeof meta.participants === 'string' 
          ? JSON.parse(meta.participants) 
          : meta.participants
      } catch {
        participants = Array.isArray(meta.participants) ? meta.participants : undefined
      }
    }

    if (!participants || !participants.includes(user.id as number)) {
      return { ok: false as const, status: 403 as const, user: null }
    }

    return { ok: true as const, status: 200 as const, user }
  } catch (error) {
    console.error('Error checking participant:', error)
    return { ok: false as const, status: 500 as const, user: null }
  }
}

export async function GET(req: Request, ctx: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await ctx.params

  if (!redis) {
    return NextResponse.json(
      { error: 'Chat service not configured. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env' },
      { status: 500 }
    )
  }

  const auth = await requireParticipant(req, roomId)
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 401 ? 'Unauthorized' : auth.status === 403 ? 'Forbidden' : 'Internal server error' },
      { status: auth.status }
    )
  }

  try {
    const listKey = `chat:messages:${roomId}`
    const messages = (await redis.lrange<ChatMessage>(listKey, 0, -1)) || []

    return NextResponse.json({
      roomId,
      messages: messages.map((m) => ({
        ...m,
        isMine: m.senderId === (auth.user!.id as number),
      })),
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await ctx.params

  if (!redis) {
    return NextResponse.json(
      { error: 'Chat service not configured. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env' },
      { status: 500 }
    )
  }

  if (!realtime) {
    return NextResponse.json(
      { error: 'Realtime service not configured' },
      { status: 500 }
    )
  }

  const auth = await requireParticipant(req, roomId)
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 401 ? 'Unauthorized' : auth.status === 403 ? 'Forbidden' : 'Internal server error' },
      { status: auth.status }
    )
  }

  let body: { text?: string }
  try {
    body = (await req.json()) as { text?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const text = (body.text || '').trim()
  if (!text) {
    return NextResponse.json({ error: 'Message text is required' }, { status: 400 })
  }
  if (text.length > 2000) {
    return NextResponse.json({ error: 'Message too long' }, { status: 400 })
  }

  const message: ChatMessage = {
    id: randomUUID(),
    roomId,
    senderId: auth.user!.id as number,
    senderName: (auth.user as any).name || (auth.user as any).email || 'User',
    text,
    timestamp: Date.now(),
  }

  try {
    const listKey = `chat:messages:${roomId}`
    await redis.rpush(listKey, message)

    // Notify subscribers
    await realtime.channel(roomId).emit('chat.message', message)

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

