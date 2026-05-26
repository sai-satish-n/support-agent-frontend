'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Bot, Ticket, LayoutDashboard, Settings, LogOut, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout, restoreSession } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    restoreSession()
    setMounted(true)
  }, [restoreSession])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [mounted, isAuthenticated, router])

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tickets', href: '/tickets', icon: Ticket },
    ...(user?.role === 'admin' || user?.role === 'ai_operator' 
      ? [{ name: 'Knowledge', href: '/knowledge', icon: Bot }] 
      : []),
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-surface/50 backdrop-blur flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            <span className="font-bold tracking-tight text-foreground">AgenticAI</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium border border-primary/20' 
                    : 'text-muted hover:text-foreground hover:bg-surface-hover'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="px-3 py-2 mb-2">
            <div className="text-sm font-medium text-foreground">{user?.name}</div>
            <div className="text-xs text-muted truncate">{user?.email}</div>
          </div>
          <button
            onClick={() => {
              logout()
              router.push('/auth/login')
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
        {/* Ambient Light */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur z-10 flex items-center px-8">
          <h1 className="text-lg font-medium text-foreground capitalize">
            {pathname.split('/')[1] || 'Dashboard'}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-8 z-10">
          {children}
        </main>
      </div>
    </div>
  )
}
