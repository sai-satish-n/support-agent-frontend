'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Loader2, ArrowRight, Ticket as TicketIcon } from 'lucide-react'
import { ticketService, type Ticket } from '@/services/ticket'
import { format } from 'date-fns'
import { useAuthStore } from '@/store/auth'

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    fetchTickets()
  }, [statusFilter])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      const data = await ticketService.listTickets(params)
      setTickets(data.tickets)
    } catch (err) {
      setError('Failed to load tickets.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'in_progress': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'escalated': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400'
      case 'high': return 'text-orange-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-emerald-400'
      default: return 'text-slate-400'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Support Tickets</h2>
          <p className="text-muted">Manage and track your support requests.</p>
        </div>
        {user?.role === 'customer' && (
          <Link 
            href="/tickets/create" 
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </Link>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 bg-background border rounded-lg transition-colors ${showFilters ? 'border-primary text-primary' : 'border-border text-muted hover:text-foreground'}`}
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
          
          {showFilters && (
            <div className="flex gap-4 pt-2 border-t border-border border-dashed animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted">Status:</span>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : tickets.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
              <TicketIcon className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No tickets found</h3>
            <p className="text-muted mb-6">
              {user?.role === 'customer' ? "You don't have any support tickets yet." : "There are no support tickets in the system yet."}
            </p>
            {user?.role === 'customer' && (
              <Link 
                href="/tickets/create" 
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
              >
                Create your first ticket
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tickets
              .filter(t => {
                // Search query is still local since backend doesn't support it yet
                const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      t.description.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesSearch;
              })
              .map((ticket) => (
              <Link 
                key={ticket.id} 
                href={`/tickets/${ticket.id}`}
                className="block p-4 hover:bg-surface-hover transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                    {ticket.title}
                  </h3>
                  <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)} capitalize`}>
                    {ticket.status.replace('_', ' ')}
                  </div>
                </div>
                <p className="text-muted text-sm line-clamp-2 mb-4">
                  {ticket.description}
                </p>
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex gap-4">
                    <span className="text-muted">
                      ID: {ticket.id.substring(0, 8)}
                    </span>
                    <span className="text-muted">
                      Updated {format(new Date(ticket.updated_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className={`capitalize ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority} Priority
                  </div>
                </div>
              </Link>
            ))}
            
            {tickets.filter(t => (statusFilter === 'all' || t.status === statusFilter) && (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase()))).length === 0 && (
              <div className="p-8 text-center text-muted">
                No tickets match your filters.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
