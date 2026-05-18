'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import {
  subscribeToUser,
  unsubscribe,
  type ConnectionState,
  type SupportedTable,
} from '@/lib/realtime'

// ──────────────────────────────────────────────
// Generic hook: subscribe to user-scoped changes
// ──────────────────────────────────────────────

interface UseRealtimeOptions<T> {
  table: SupportedTable
  userId: string
  /** Called for every INSERT / UPDATE / DELETE */
  onChange: (event: 'INSERT' | 'UPDATE' | 'DELETE', row: T) => void
}

function useRealtimeUser<T extends Record<string, unknown> = Record<string, unknown>>({
  table,
  userId,
  onChange,
}: UseRealtimeOptions<T>) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting')
  const channelRef = useRef<RealtimeChannel | null>(null)
  const onChangeRef = useRef(onChange)

  // Keep callback ref fresh without triggering re-subscribe
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!userId) return

    const channel = subscribeToUser<T>(
      table,
      userId,
      (change) => {
        onChangeRef.current(change.eventType, change.new as T)
      },
      setConnectionState,
    )

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        unsubscribe(channelRef.current)
        channelRef.current = null
      }
    }
  }, [table, userId])

  return connectionState
}

// ──────────────────────────────────────────────
// Message types
// ──────────────────────────────────────────────

export interface RealtimeMessage extends Record<string, unknown> {
  id: string
  user_id: string
  from: 'me' | 'them'
  text: string
  timestamp: string
  read: boolean
}

// ──────────────────────────────────────────────
// useRealtimeMessages
// ──────────────────────────────────────────────

interface UseRealtimeMessagesReturn {
  /** Latest message from real-time, or null */
  lastEvent: { type: 'INSERT' | 'UPDATE' | 'DELETE'; message: RealtimeMessage } | null
  connectionState: ConnectionState
}

export function useRealtimeMessages(
  userId: string,
  onNewMessage?: (msg: RealtimeMessage) => void,
): UseRealtimeMessagesReturn {
  const [lastEvent, setLastEvent] = useState<UseRealtimeMessagesReturn['lastEvent']>(null)
  const onNewMessageRef = useRef(onNewMessage)

  useEffect(() => {
    onNewMessageRef.current = onNewMessage
  }, [onNewMessage])

  const handleChange = useCallback((eventType: 'INSERT' | 'UPDATE' | 'DELETE', row: RealtimeMessage) => {
    setLastEvent({ type: eventType, message: row })
    if (eventType === 'INSERT' && onNewMessageRef.current) {
      onNewMessageRef.current(row)
    }
  }, [])

  const connectionState = useRealtimeUser<RealtimeMessage>({
    table: 'messages',
    userId,
    onChange: handleChange,
  })

  return { lastEvent, connectionState }
}

// ──────────────────────────────────────────────
// Memory types
// ──────────────────────────────────────────────

export interface RealtimeMemory extends Record<string, unknown> {
  id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

// ──────────────────────────────────────────────
// useRealtimeMemories
// ──────────────────────────────────────────────

interface UseRealtimeMemoriesReturn {
  lastEvent: { type: 'INSERT' | 'UPDATE' | 'DELETE'; memory: RealtimeMemory } | null
  connectionState: ConnectionState
}

export function useRealtimeMemories(
  userId: string,
  onMemoryChange?: (type: 'INSERT' | 'UPDATE' | 'DELETE', memory: RealtimeMemory) => void,
): UseRealtimeMemoriesReturn {
  const [lastEvent, setLastEvent] = useState<UseRealtimeMemoriesReturn['lastEvent']>(null)
  const onMemoryChangeRef = useRef(onMemoryChange)

  useEffect(() => {
    onMemoryChangeRef.current = onMemoryChange
  }, [onMemoryChange])

  const handleChange = useCallback((eventType: 'INSERT' | 'UPDATE' | 'DELETE', row: RealtimeMemory) => {
    setLastEvent({ type: eventType, memory: row })
    if (onMemoryChangeRef.current) {
      onMemoryChangeRef.current(eventType, row)
    }
  }, [])

  const connectionState = useRealtimeUser<RealtimeMemory>({
    table: 'memories',
    userId,
    onChange: handleChange,
  })

  return { lastEvent, connectionState }
}

// ──────────────────────────────────────────────
// Mood types
// ──────────────────────────────────────────────

export interface RealtimeMood extends Record<string, unknown> {
  id: string
  user_id: string
  mood: string
  score: number
  timestamp: string
}

// ──────────────────────────────────────────────
// useRealtimeMoods
// ──────────────────────────────────────────────

interface UseRealtimeMoodsReturn {
  lastEvent: { type: 'INSERT' | 'UPDATE' | 'DELETE'; mood: RealtimeMood } | null
  connectionState: ConnectionState
}

export function useRealtimeMoods(
  userId: string,
  onMoodChange?: (type: 'INSERT' | 'UPDATE' | 'DELETE', mood: RealtimeMood) => void,
): UseRealtimeMoodsReturn {
  const [lastEvent, setLastEvent] = useState<UseRealtimeMoodsReturn['lastEvent']>(null)
  const onMoodChangeRef = useRef(onMoodChange)

  useEffect(() => {
    onMoodChangeRef.current = onMoodChange
  }, [onMoodChange])

  const handleChange = useCallback((eventType: 'INSERT' | 'UPDATE' | 'DELETE', row: RealtimeMood) => {
    setLastEvent({ type: eventType, mood: row })
    if (onMoodChangeRef.current) {
      onMoodChangeRef.current(eventType, row)
    }
  }, [])

  const connectionState = useRealtimeUser<RealtimeMood>({
    table: 'moods',
    userId,
    onChange: handleChange,
  })

  return { lastEvent, connectionState }
}
