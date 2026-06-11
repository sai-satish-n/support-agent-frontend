'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { analyticsService, type DashboardStats } from '@/services/analytics'
import { 
  Ticket, CheckCircle2, Clock, AlertTriangle, 
  Bot, Database, Zap, Loader2, Activity, ShieldCheck
} from 'lucide-react'

export default function DashboardIndex() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await analyticsService.getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to load dashboard stats', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center text-muted py-20">Failed to load analytics</div>
  }

  const isStaff = user?.role === 'admin' || user?.role === 'ai_operator' || user?.role === 'agent'

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {user?.name}</h1>
        <p className="text-muted mt-2">Here is a summary of your {isStaff ? 'platform' : 'support ticket'} activity.</p>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-surface border border-border rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Ticket className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-medium text-muted">Total Tickets</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.ticket_metrics.total}</p>
        </div>

        <div className="p-6 bg-surface border border-border rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="font-medium text-muted">Active (Open/In Progress)</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {stats.ticket_metrics.open + stats.ticket_metrics.in_progress}
          </p>
        </div>

        <div className="p-6 bg-surface border border-border rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-medium text-muted">Resolved</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.ticket_metrics.resolved}</p>
        </div>

        <div className="p-6 bg-surface border border-border rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-medium text-muted">Escalated</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.ticket_metrics.escalated}</p>
        </div>
      </div>

      {isStaff && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AI Performance */}
            <div className="p-6 bg-surface border border-border rounded-xl space-y-6">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">AI Agent Performance</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-background border border-border rounded-lg">
                  <div className="text-sm text-muted mb-1">Total Runs</div>
                  <div className="text-2xl font-semibold">{stats.ai_performance.total_agent_runs}</div>
                </div>
                <div className="p-4 bg-background border border-border rounded-lg">
                  <div className="text-sm text-muted mb-1">Success Rate</div>
                  <div className="text-2xl font-semibold">{(stats.ai_performance.success_rate * 100).toFixed(1)}%</div>
                </div>
                <div className="p-4 bg-background border border-border rounded-lg">
                  <div className="text-sm text-muted mb-1">Avg Latency</div>
                  <div className="text-2xl font-semibold">{stats.ai_performance.avg_latency_ms} ms</div>
                </div>
                <div className="p-4 bg-background border border-border rounded-lg">
                  <div className="text-sm text-muted mb-1">Tokens Used</div>
                  <div className="text-2xl font-semibold">
                    {stats.ai_performance.total_tokens_used > 1000 
                      ? `${(stats.ai_performance.total_tokens_used / 1000).toFixed(1)}k` 
                      : stats.ai_performance.total_tokens_used}
                  </div>
                </div>
              </div>
            </div>

            {/* Knowledge Base & Evaluation */}
            <div className="space-y-8">
              <div className="p-6 bg-surface border border-border rounded-xl space-y-6">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-xl font-semibold text-foreground">Knowledge Base</h2>
                </div>
                <div className="flex gap-8">
                  <div>
                    <div className="text-sm text-muted mb-1">Total Documents</div>
                    <div className="text-2xl font-semibold">{stats.knowledge_base.total_documents}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted mb-1">Indexed</div>
                    <div className="text-2xl font-semibold">{stats.knowledge_base.indexed_documents}</div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-surface border border-border rounded-xl space-y-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-semibold text-foreground">Evaluation Metrics</h2>
                </div>
                <div className="flex gap-8">
                  <div>
                    <div className="text-sm text-muted mb-1">Faithfulness</div>
                    <div className="text-2xl font-semibold">{stats.evaluation.avg_faithfulness.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted mb-1">Relevance</div>
                    <div className="text-2xl font-semibold">{stats.evaluation.avg_relevance.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
