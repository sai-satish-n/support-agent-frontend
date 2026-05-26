// Chat service - handles all chat-related API calls
import { apiClient } from './api'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: string      // set locally by streaming hook
  created_at?: string     // set by API responses
  sender_id?: string
  confidence?: number
  sources?: string[]
  is_human?: boolean
}

export interface ChatResponse {
  message: ChatMessage
  escalation_required?: boolean
  escalation_reason?: string
}

export interface IntentClassification {
  intent: string
  sentiment: 'positive' | 'neutral' | 'negative'
  urgency: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
}

export const chatService = {
  // Send a chat message and get response with streaming support
  async sendMessage(
    ticketId: string,
    content: string,
    stream: boolean = false
  ): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>(
      `/chat/${ticketId}/messages`,
      { content, stream },
      stream ? { responseType: 'stream' } : {}
    )
    return response.data
  },

  // Get chat history for a ticket
  async getMessages(ticketId: string, limit: number = 50) {
    const response = await apiClient.get<ChatMessage[]>(
      `/chat/${ticketId}/messages?limit=${limit}`
    )
    return response.data
  },

  // Human agent sends a direct reply (bypasses AI pipeline)
  async agentReply(ticketId: string, content: string): Promise<ChatMessage> {
    const response = await apiClient.post<ChatMessage>(
      `/chat/${ticketId}/agent-reply`,
      { content }
    )
    return response.data
  },

  // Get intent classification for a message
  async classifyIntent(content: string): Promise<IntentClassification> {
    const response = await apiClient.post<IntentClassification>(
      '/ai/classify-intent',
      { content }
    )
    return response.data
  },
}
