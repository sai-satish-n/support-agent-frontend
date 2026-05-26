'use client'

import { useAuthStore } from '@/store/auth'
import { User, Building, Mail, Shield } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuthStore()

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Settings</h1>
        <p className="text-muted">Manage your account and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 bg-surface border border-border rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Profile Information</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted">Full Name</label>
              <div className="mt-1 p-3 bg-surface-hover rounded-md border border-border text-foreground">
                {user?.name || 'N/A'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted">Email Address</label>
              <div className="mt-1 flex items-center gap-2 p-3 bg-surface-hover rounded-md border border-border text-foreground">
                <Mail className="w-4 h-4 text-muted" />
                {user?.email || 'N/A'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted">Role & Permissions</label>
              <div className="mt-1 flex items-center gap-2 p-3 bg-surface-hover rounded-md border border-border text-foreground capitalize">
                <Shield className="w-4 h-4 text-muted" />
                {user?.role?.replace('_', ' ') || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-surface border border-border rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Organization</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted">Organization ID</label>
              <div className="mt-1 p-3 bg-surface-hover rounded-md border border-border text-foreground font-mono text-sm break-all">
                {user?.org_id || 'N/A'}
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h3 className="text-sm font-medium text-primary mb-2">Workspace Information</h3>
              <p className="text-sm text-muted leading-relaxed">
                You are currently part of the AgenticAI multi-tenant platform. Support tickets and AI knowledge base documents are securely isolated within your organization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
