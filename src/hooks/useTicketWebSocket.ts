/**
 * useTicketWebSocket
 *
 * Connects to the backend WebSocket endpoint for a given ticket and calls
 * `onMessage` whenever a { type: "new_message", message: ChatMessage } event
 * is pushed by the server. Reconnects automatically on disconnect.
 */
import { useEffect, useRef, useCallback } from 'react'
import { ChatMessage } from '@/services/chat'

const WS_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api')
  .replace(/^http/, 'ws')  // http → ws, https → wss

export function useTicketWebSocket(
  ticketId: string | null,
  onMessage: (msg: ChatMessage) => void
) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)
  // Keep a stable ref to onMessage so we don't reconnect when it changes
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  const connect = useCallback(() => {
    if (!ticketId) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (!token) return

    const url = `${WS_BASE}/chat/${ticketId}/ws?token=${token}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      console.log(`[WS] Connected to ticket ${ticketId}`)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'new_message' && data.message) {
          onMessageRef.current(data.message as ChatMessage)
        }
      } catch (e) {
        // ignore malformed frames
      }
    }

    ws.onclose = () => {
      console.log(`[WS] Disconnected from ticket ${ticketId}. Reconnecting…`)
      if (!mountedRef.current) return
      reconnectTimer.current = setTimeout(() => {
        if (mountedRef.current) connect()
      }, 2500)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [ticketId])

  useEffect(() => {
    mountedRef.current = true
    connect()
    return () => {
      mountedRef.current = false
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [connect])
}
