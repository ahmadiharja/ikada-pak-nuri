'use client'

import { DashboardOverview } from "@/components/dashboard-overview"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Protect dashboard page
  useEffect(() => {
    if (status === 'loading') return // Still loading, wait
    
    if (status === 'unauthenticated') {
      router.push('/admin')
      return
    }
    
    if (session && !['PUSAT', 'SYUBIYAH'].includes(session.user?.role || '')) {
      router.push('/admin')
      return
    }
  }, [session, status, router])

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Don't render anything if not authenticated
  if (status === 'unauthenticated' || (session && !['PUSAT', 'SYUBIYAH'].includes(session.user?.role || ''))) {
    return null
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard IKADA</h1>
        <p className="text-muted-foreground">
          Selamat datang di dashboard Ikatan Alumni Pondok Darussalam Sumbersari
        </p>
      </div>
      <DashboardOverview />
    </div>
  )
}
