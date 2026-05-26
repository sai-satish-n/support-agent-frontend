// Ticket service - handles ticket CRUD and lifecycle operations
import { apiClient } from './api'

export interface Ticket {
  id: string
  org_id: string
  customer_id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'escalated' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
  updated_at: string
  ai_summary?: string
  assigned_agent_id?: string
}

export interface CreateTicketRequest {
  title: string
  description: string
  customer_email: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

export const ticketService = {
  // Create a new ticket
  async createTicket(data: CreateTicketRequest): Promise<Ticket> {
    const response = await apiClient.post<Ticket>('/tickets', data)
    return response.data
  },

  // Get ticket by ID
  async getTicket(ticketId: string): Promise<Ticket> {
    const response = await apiClient.get<Ticket>(`/tickets/${ticketId}`)
    return response.data
  },

  // Get all tickets (with pagination and filtering)
  async listTickets(params?: {
    status?: string
    priority?: string
    limit?: number
    offset?: number
  }) {
    const response = await apiClient.get<{
      tickets: Ticket[]
      total: number
    }>('/tickets', { params })
    return response.data
  },

  // Update ticket
  async updateTicket(
    ticketId: string,
    data: { status?: Ticket['status'], priority?: Ticket['priority'], assigned_agent_id?: string }
  ): Promise<Ticket> {
    const response = await apiClient.patch<Ticket>(
      `/tickets/${ticketId}`,
      data
    )
    return response.data
  },

  // Get AI summary of ticket
  async getAISummary(ticketId: string): Promise<{ summary: string }> {
    const response = await apiClient.get<{ summary: string }>(
      `/tickets/${ticketId}/ai-summary`
    )
    return response.data
  },
}
