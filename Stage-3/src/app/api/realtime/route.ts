import { handle } from '@upstash/realtime'
import { NextResponse } from 'next/server'

import { realtime } from '@/lib/chat/realtime'

// Upstash Realtime expects this default endpoint by default.
export const GET = realtime ? handle({ realtime }) : async () => {
  return NextResponse.json(
    { error: 'Realtime service not configured' },
    { status: 500 }
  )
}

