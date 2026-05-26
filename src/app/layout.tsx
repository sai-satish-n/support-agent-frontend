import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Support AI Platform',
  description: 'AI-powered customer support system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-background text-foreground antialiased min-h-screen">
        {children}
        <Toaster position="top-right" toastOptions={{ className: 'glass-card border-border text-foreground' }} />
      </body>
    </html>
  )
}
