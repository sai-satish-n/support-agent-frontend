'use client'

import { useEffect, useState } from 'react'
import { analyticsService, type DashboardStats } from '@/services/analytics'
import { useAuthStore } from '@/store/auth'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'
import { 
  Ticket, Clock, AlertTriangle, Zap, CheckCircle, Database, ServerCrash
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await analyticsService.getDashboardStats()
      setStats(data)
    } catch (err) {
      setError('Failed to load dashboard statistics.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !stats) {
    return <div className="text-red-400 text-center py-20">{error}</div>
  }

  // Calculate hallucination rate based on faithfulness metric (1 - faithfulness)
  const hallucinationRate = Math.max(0, 1 - stats.evaluation.avg_faithfulness)

  const ticketStatusData = [
    { name: 'Open', value: stats.ticket_metrics.open || 0, color: '#3b82f6' },
    { name: 'In Progress', value: stats.ticket_metrics.in_progress || 0, color: '#f59e0b' },
    { name: 'Closed/Resolved', value: (stats.ticket_metrics.resolved || 0) + ((stats.ticket_metrics as any).closed || 0), color: '#10b981' },
    { name: 'Escalated', value: stats.ticket_metrics.escalated || 0, color: '#ef4444' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Welcome back, {user?.name || 'Agent'}</h2>
        <p className="text-muted mt-1">Here's what's happening with your AI support system today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted">Total Tickets</p>
            <h3 className="text-2xl font-bold text-foreground">{stats.ticket_metrics.total}</h3>
          </div>
        </div>
        
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted">Resolved</p>
            <h3 className="text-2xl font-bold text-foreground">{stats.ticket_metrics.resolved}</h3>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted">Avg Resolution Time</p>
            <h3 className="text-2xl font-bold text-foreground">{stats.ticket_metrics.avg_resolution_time_minutes} min</h3>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-lg text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted">Escalation Rate</p>
            <h3 className="text-2xl font-bold text-foreground">{(stats.ticket_metrics.escalation_rate * 100).toFixed(1)}%</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-6">
            <h3 className="text-lg font-medium text-foreground mb-6">Ticket Volume (Last 7 Days)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.daily_tickets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#ffffff50" 
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })}
                  />
                  <YAxis stroke="#ffffff50" />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#ffffff20', color: '#fff', borderRadius: '8px' }} 
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-medium text-foreground mb-6">Ticket Status Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ticketStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ticketStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#ffffff20', color: '#fff', borderRadius: '8px' }} 
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Performance Section */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-primary" /> AI Performance
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-sm text-muted">Success Rate</span>
                <span className="font-medium text-foreground">{(stats.ai_performance.success_rate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-sm text-muted">Avg Latency</span>
                <span className="font-medium text-foreground">{stats.ai_performance.avg_latency_ms} ms</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-sm text-muted text-red-400 flex items-center gap-1">
                  <ServerCrash className="w-4 h-4" /> Hallucination Rate
                </span>
                <span className="font-medium text-red-400">{(hallucinationRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-sm text-muted">Tokens Consumed</span>
                <span className="font-medium text-foreground">{stats.ai_performance.total_tokens_used.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-indigo-400" /> Knowledge Base
            </h3>
            <div className="bg-surface rounded-xl p-4 border border-border">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-muted">Indexed Documents</p>
                  <h4 className="text-2xl font-bold mt-1 text-foreground">
                    {stats.knowledge_base.indexed_documents} <span className="text-sm font-normal text-muted">/ {stats.knowledge_base.total_documents}</span>
                  </h4>
                </div>
                <div className="h-12 w-12 rounded-full border-4 border-indigo-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-400">
                    {stats.knowledge_base.total_documents > 0 
                      ? Math.round((stats.knowledge_base.indexed_documents / stats.knowledge_base.total_documents) * 100) 
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
