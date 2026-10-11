import { handle } from '@upstash/realtime'

import { realtime } from '@/lib/chat/realtime'

export const GET = handle({ realtime } as any)

