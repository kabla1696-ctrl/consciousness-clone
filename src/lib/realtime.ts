import { supabase } from './supabase'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

// Supported tables for real-time subscriptions
export type SupportedTable = 'memories' | 'messages' | 'moods' | 'achievements'

// Connection state types
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'

// Payload for database changes
export type RealtimeChange<T extends Record<string, unknown> = Record<string, unknown>> = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T
  old: T
  table: string
}

// Callback types
export type TableChangeCallback<T extends Record<string, unknown> = Record<string, unknown>> = (change: RealtimeChange<T>) => void
export type ConnectionStateCallback = (state: ConnectionState) => void

/**
 * Subscribe to all changes on a specific table.
 * Listens for INSERT, UPDATE, and DELETE events.
 */
export function subscribeToTable<T extends Record<string, unknown> = Record<string, unknown>>(
  table: SupportedTable,
  callback: TableChangeCallback<T>,
  onStateChange?: ConnectionStateCallback
): RealtimeChannel {
  const channelName = `realtime:${table}:all`

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes' as never,
      {
        event: '*',
        schema: 'public',
        table,
      } as never,
      (payload: RealtimePostgresChangesPayload<T>) => {
        callback({
          eventType: payload.eventType as RealtimeChange['eventType'],
          new: payload.new as T,
          old: payload.old as T,
          table,
        })
      }
    )
    .subscribe((status: string) => {
      if (onStateChange) {
        const stateMap: Record<string, ConnectionState> = {
          SUBSCRIBED: 'connected',
          CHANNEL_ERROR: 'error',
          TIMED_OUT: 'connecting',
          CLOSED: 'disconnected',
        }
        onStateChange(stateMap[status] || 'connecting')
      }
    })

  return channel
}

/**
 * Subscribe to changes for a specific user on a table.
 * Filters events to only those matching the given user_id.
 */
export function subscribeToUser<T extends Record<string, unknown> = Record<string, unknown>>(
  table: SupportedTable,
  userId: string,
  callback: TableChangeCallback<T>,
  onStateChange?: ConnectionStateCallback
): RealtimeChannel {
  const channelName = `realtime:${table}:user:${userId}`

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes' as never,
      {
        event: '*',
        schema: 'public',
        table,
        filter: `user_id=eq.${userId}`,
      } as never,
      (payload: RealtimePostgresChangesPayload<T>) => {
        callback({
          eventType: payload.eventType as RealtimeChange['eventType'],
          new: payload.new as T,
          old: payload.old as T,
          table,
        })
      }
    )
    .subscribe((status: string) => {
      if (onStateChange) {
        const stateMap: Record<string, ConnectionState> = {
          SUBSCRIBED: 'connected',
          CHANNEL_ERROR: 'error',
          TIMED_OUT: 'connecting',
          CLOSED: 'disconnected',
        }
        onStateChange(stateMap[status] || 'connecting')
      }
    })

  return channel
}

/**
 * Unsubscribe from a real-time channel and clean up.
 */
export async function unsubscribe(channel: RealtimeChannel): Promise<void> {
  await supabase.removeChannel(channel)
}
