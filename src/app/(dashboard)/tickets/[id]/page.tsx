'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Loader2, Send, User, Bot, AlertTriangle, CheckCircle2,
  Shield, MessageSquare, Lock, UserCheck
} from 'lucide-react'
import { ticketService, type Ticket } from '@/services/ticket'
import { chatService, type ChatMessage } from '@/services/chat'
import { useChatStream } from '@/hooks/useChatStream'
import { useTicketWebSocket } from '@/hooks/useTicketWebSocket'
import { format } from 'date-fns'
import { useAuthStore } from '@/store/auth'

const AI_SENDER_ID = '00000000-0000-0000-0000-000000000000'

export default function TicketDetailPage() {
  const params = useParams()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const { user } = useAuthStore()
  // Single unified message list — the hook manages it for the customer stream path
  const { messages, setMessages, streaming, agentState, sendMessageStream } = useChatStream()

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Role helpers
  const isStaff = user?.role === 'admin' || user?.role === 'ai_operator' || user?.role === 'agent'
  const isAssignedToMe = ticket?.assigned_agent_id === user?.id
  const isEscalated = ticket?.status === 'escalated'
  // Staff can reply once they own the ticket OR it's escalated
  const canReply = isStaff && (isAssignedToMe || isEscalated)

  // Real-time WebSocket connection (only active when human agent is assigned)
  const shouldConnectWs = Boolean(ticket?.assigned_agent_id)
  useTicketWebSocket(shouldConnectWs ? ticketId : null, (newMsg) => {
    setMessages(prev => {
      // 1. Exact ID match (e.g. from agentReply which we already appended locally)
      if (prev.some(m => m.id === newMsg.id)) {
        return prev.map(m => m.id === newMsg.id ? { ...m, ...newMsg } : m)
      }

      // 2. Stream deduplication for customer messages (local temp ID vs DB UUID)
      if (newMsg.role === 'user') {
        const isDuplicate = prev.some(m =>
          m.role === 'user' && m.content === newMsg.content && !m.id.includes('-')
        )
        if (isDuplicate) return prev
      }

      // 3. Stream deduplication for AI messages (local temp ID vs DB UUID)
      if (newMsg.role === 'assistant' && !newMsg.is_human) {
        const tempIndex = prev.findIndex(m => m.id.startsWith('assistant-'))
        if (tempIndex !== -1) {
          // Replace the temporary stream message with the real DB message
          const newArr = [...prev]
          newArr[tempIndex] = newMsg
          return newArr
        }
      }

      return [...prev, newMsg]
    })
  })

  useEffect(() => {
    fetchData()
  }, [ticketId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [ticketData, messagesData] = await Promise.all([
        ticketService.getTicket(ticketId),
        chatService.getMessages(ticketId)
      ])
      setTicket(ticketData)
      // Single source of truth: load into hook state
      setMessages(messagesData)
    } catch (err) {
      console.error('Failed to fetch data', err)
    } finally {
      setLoading(false)
    }
  }

  // ── CUSTOMER: AI chat (triggers full pipeline with streaming) ──────────────
  const handleCustomerSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || streaming) return

    const userMessage = input
    setInput('')

    // sendMessageStream appends messages into the shared `messages` state directly
    await sendMessageStream(ticketId, userMessage)

    // Refresh ticket to pick up escalation status changes from AI
    const updatedTicket = await ticketService.getTicket(ticketId)
    setTicket(updatedTicket)
  }

  // ── STAFF: Direct human reply (no AI, no stream) ──────────────────────────
  const handleAgentReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending || !canReply) return

    const replyText = input
    setInput('')
    setIsSending(true)

    try {
      const newMsg = await chatService.agentReply(ticketId, replyText)
      // Append directly into unified messages state ONLY if WS hasn't added it yet
      setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg])
      // Refresh ticket in case status auto-changed (escalated → in_progress)
      const updatedTicket = await ticketService.getTicket(ticketId)
      setTicket(updatedTicket)
    } catch (err: any) {
      console.error('Agent reply failed', err)
      alert(err?.response?.data?.detail || 'Failed to send reply')
      setInput(replyText) // restore input on error
    } finally {
      setIsSending(false)
    }
  }

  const handleUpdateTicket = async (field: 'status' | 'priority' | 'assigned_agent_id', value: string) => {
    if (!ticket) return
    setIsUpdating(true)
    try {
      const updated = await ticketService.updateTicket(ticket.id, { [field]: value })
      setTicket(updated)
    } catch (err) {
      console.error('Failed to update ticket', err)
      alert('Failed to update ticket')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAssignToMe = async () => {
    if (!user?.id) return
    setIsUpdating(true)
    try {
      const updated = await ticketService.updateTicket(ticketId, {
        assigned_agent_id: user.id,
        status: 'in_progress'
      })
      setTicket(updated)
    } catch (err) {
      console.error('Failed to assign ticket', err)
    } finally {
      setIsUpdating(false)
    }
  }

  // Helper: is a given message a human agent reply?
  // Relies solely on the is_human flag set by the backend model_validate
  const isHumanMessage = (msg: ChatMessage) => msg.is_human === true

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!ticket) {
    return <div className="text-center py-20 text-red-400">Ticket not found</div>
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex gap-6">
      {/* Main Chat Area */}
      <div className="flex-1 glass-card flex flex-col overflow-hidden relative">

        {/* Header */}
        <div className="p-4 border-b border-border bg-surface/50 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <Link href="/tickets" className="text-muted hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="font-semibold text-foreground truncate max-w-md">{ticket.title}</h2>
              <p className="text-xs text-muted">ID: {ticket.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEscalated && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-medium border border-red-500/20">
                <AlertTriangle className="w-3.5 h-3.5" />
                Escalated
              </div>
            )}

            {/* Handle Myself — shown to staff not yet assigned */}
            {isStaff && !isAssignedToMe && (
              <button
                onClick={handleAssignToMe}
                disabled={isUpdating}
                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                Handle Myself
              </button>
            )}

            {isAssignedToMe && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Assigned to You
              </div>
            )}
          </div>
        </div>

        {/* Lock notice for unassigned staff */}
        {isStaff && !canReply && (
          <div className="mx-4 mt-4 flex items-center gap-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-400 text-sm">
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              Click <strong>Handle Myself</strong> to take ownership and enable direct replies, or wait for AI to escalate this ticket.
            </span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Initial ticket description */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-muted" />
            </div>
            <div className="flex-1 bg-surface p-4 rounded-xl rounded-tl-sm border border-border">
              <p className="whitespace-pre-wrap text-sm text-foreground">{ticket.description}</p>
              <div className="text-[10px] text-muted mt-2">
                {format(new Date(ticket.created_at), 'MMM d, h:mm a')}
              </div>
            </div>
          </div>

          {messages.map((msg) => {
            const isHuman = isHumanMessage(msg)
            return (
              <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-primary/20 text-primary'
                    : isHuman
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-primary border border-primary/50 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-4 h-4" />
                    : isHuman
                      ? <UserCheck className="w-4 h-4" />
                      : <Bot className="w-4 h-4" />
                  }
                </div>
                <div className={`flex-1 max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-surface-hover p-4 rounded-xl rounded-tr-sm border border-border'
                    : isHuman
                      ? 'bg-emerald-950/30 p-4 rounded-xl rounded-tl-sm border border-emerald-500/20'
                      : 'bg-surface p-4 rounded-xl rounded-tl-sm border border-border'
                }`}>
                  {/* Human agent label */}
                  {isHuman && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <Shield className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wide">Human Agent</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{msg.content}</p>

                  {msg.role === 'assistant' && !isHuman && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.sources.map((src, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md shadow-sm">
                          Source: {src}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                    <div className="text-[10px] text-muted">
                      {(msg.timestamp || msg.created_at)
                        ? format(new Date((msg.timestamp || msg.created_at)!), 'h:mm a')
                        : 'Just now'}
                    </div>
                    {msg.role === 'assistant' && !isHuman && msg.confidence !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${
                          msg.confidence > 0.8 ? 'bg-green-400' : msg.confidence > 0.5 ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                        <span className="text-[10px] text-muted">{(msg.confidence * 100).toFixed(0)}% Conf.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* AI streaming indicator */}
          {streaming && agentState && (
            <div className="flex justify-center">
              <div className="px-4 py-2 rounded-full bg-surface border border-border flex items-center gap-2 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                <span className="text-xs text-muted">{agentState}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Area ─────────────────────────────────────────────────────── */}
        {!isStaff ? (
          /* CUSTOMER: AI Chat */
          <div className="p-4 border-t border-border bg-surface/50 backdrop-blur">
            <form onSubmit={handleCustomerSend} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={streaming}
                placeholder={streaming ? 'AI is typing...' : 'Type your message...'}
                className="w-full pl-4 pr-12 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || streaming}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground disabled:opacity-50 transition-all shadow-[0_0_10px_rgba(139,92,246,0.3)] hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* STAFF: Direct Reply or locked */
          <div className="p-4 border-t border-border bg-surface/50 backdrop-blur">
            {canReply ? (
              <form onSubmit={handleAgentReply} className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400 font-medium">
                    Direct Reply — your message goes straight to the customer
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isSending}
                    placeholder="Type your reply to the customer..."
                    className="w-full pl-4 pr-12 py-3 bg-background border border-emerald-500/30 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isSending}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white disabled:opacity-50 transition-all hover:bg-emerald-500"
                  >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted">
                <Lock className="w-4 h-4" />
                <span>Take ownership to enable direct replies</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Metadata Sidebar */}
      <div className="w-80 glass-card p-6 flex flex-col space-y-6">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-4">Ticket Details</h3>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted mb-1">Status</div>
              {isStaff ? (
                <select
                  value={ticket.status}
                  onChange={(e) => handleUpdateTicket('status', e.target.value)}
                  disabled={isUpdating}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              ) : (
                <div className="capitalize text-sm font-medium">{ticket.status.replace('_', ' ')}</div>
              )}
            </div>
            <div>
              <div className="text-xs text-muted mb-1">Priority</div>
              {isStaff ? (
                <select
                  value={ticket.priority}
                  onChange={(e) => handleUpdateTicket('priority', e.target.value)}
                  disabled={isUpdating}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              ) : (
                <div className="capitalize text-sm font-medium">{ticket.priority}</div>
              )}
            </div>

            <div>
              <div className="text-xs text-muted mb-1">Handled By</div>
              <div className="text-sm text-foreground">
                {ticket.assigned_agent_id
                  ? isAssignedToMe
                    ? <span className="text-emerald-400 font-medium">You (Human Agent)</span>
                    : <span className="text-amber-400">Human Agent</span>
                  : <span className="text-primary/80">AI Agent</span>}
              </div>
            </div>

            {ticket.ai_summary && (
              <div>
                <div className="text-xs text-muted mb-1">AI Summary</div>
                <div className="text-sm text-foreground bg-surface p-3 rounded-lg border border-border mt-1">
                  {ticket.ai_summary}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
