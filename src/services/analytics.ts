import { apiClient } from './api'

export interface DashboardStats {
  ticket_metrics: {
    total: number
    open: number
    in_progress: number
    resolved: number
    escalated: number
    avg_resolution_time_minutes: number
    escalation_rate: number
    priority_breakdown: Record<string, number>
  }
  daily_tickets: Array<{ date: string; count: number }>
  ai_performance: {
    total_agent_runs: number
    successful_runs: number
    success_rate: number
    avg_latency_ms: number
    total_tokens_used: number
  }
  knowledge_base: {
    total_documents: number
    indexed_documents: number
  }
  evaluation: {
    avg_faithfulness: number
    avg_relevance: number
  }
}

export const analyticsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/analytics/dashboard')
    return response.data
  }
}
