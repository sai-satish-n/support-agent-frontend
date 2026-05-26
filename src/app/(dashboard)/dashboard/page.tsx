'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardIndex() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to tickets as the main view
    router.push('/tickets')
  }, [router])

  return null
}
