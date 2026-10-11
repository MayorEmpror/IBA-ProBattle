import { InferRealtimeEvents, Realtime } from '@upstash/realtime'
import z from 'zod'

import { redis } from './redis'

const message = z.object({
  id: z.string(),
  roomId: z.string(),
  senderId: z.number(),
  senderName: z.string(),
  text: z.string().max(2000),
  timestamp: z.number(),
})

const schema = {
  chat: {
    message,
  },
}

// Only create Realtime instance if Redis is available
export const realtime = redis ? new Realtime({ schema, redis }) : null
export type RealtimeEvents = any
// export type RealtimeEvents = redis extends null ? never : InferRealtimeEvents<NonNullable<typeof realtime>>
export type ChatMessage = z.infer<typeof message>

