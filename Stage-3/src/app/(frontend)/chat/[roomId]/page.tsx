'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowBigRight } from 'lucide-react'

import { useRealtime } from '@/lib/chat/realtime-client'
import { cn } from '@/utilities/ui'

type ChatMessage = {
  id: string
  roomId: string
  senderId: number
  senderName: string
  text: string
  timestamp: number
  isMine?: boolean
}

export default function ChatRoomPage() {
  const router = useRouter()
  const params = useParams()
  const roomId = (params.roomId as string) || ''

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const endpoint = useMemo(() => `/api/chat/rooms/${encodeURIComponent(roomId)}/messages`, [roomId])

  const fetchMessages = async () => {
    if (!roomId) return
    setError(null)
    try {
      const res = await fetch(endpoint, { cache: 'no-store' })
      if (res.status === 401) {
        setError('You must be logged in to use chat.')
        setMessages([])
        return
      }
      if (res.status === 403) {
        setError('You do not have access to this chat.')
        setMessages([])
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Failed to load messages')
      }
      const data = (await res.json()) as { messages: ChatMessage[] }
      setMessages(data.messages || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint])

  useRealtime({
    channels: roomId ? [roomId] : [],
    events: ['chat.message'],
    onData: ({ event }) => {
      if (event === 'chat.message') fetchMessages()
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const sendMessage = async () => {
    const value = text.trim()
    if (!value || sending) return
    setSending(true)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: value }),
      })
      if (res.status === 401) {
        setError('You must be logged in to send messages.')
        return
      }
      if (res.status === 403) {
        setError('You do not have access to this chat.')
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Failed to send message')
      }
      setText('')
      // optimistic refresh
      await fetchMessages()
    } catch (e: any) {
      setError(e?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background text-foreground px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Chat
            </p>
            <h1 className="text-2xl font-bold">Messages</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Room: <span className="font-mono">{roomId}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
          >
            Back
          </button>
        </div>

        <div className="shadow-input rounded-none bg-card p-4 md:rounded-2xl md:p-8">
          {error && (
            <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {error}{' '}
              {error.includes('logged in') && (
                <Link href="/login" className="underline">
                  Log in
                </Link>
              )}
            </div>
          )}

          <div className="h-[50vh] overflow-y-auto rounded-xl border border-border bg-background p-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn('flex', m.isMine ? 'justify-end' : 'justify-start')}
                  >
                    <div className="max-w-[85%]">
                      <div className={cn('mb-1 text-xs', m.isMine ? 'text-right text-muted-foreground' : 'text-muted-foreground')}>
                        {m.isMine ? 'You' : m.senderName}
                      </div>
                      <div
                        className={cn(
                          'rounded-2xl border border-border px-4 py-3 text-sm leading-relaxed',
                          m.isMine ? 'bg-muted' : 'bg-card',
                        )}
                      >
                        {m.text}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Type your message…"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={sending}
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={sending || !text.trim()}
              className="group/btn relative flex h-10 items-center justify-center gap-2 rounded-md bg-gradient-to-br from-black to-neutral-700 px-4 font-medium text-white shadow transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
              <ArrowBigRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

