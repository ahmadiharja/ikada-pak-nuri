"use client"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname, useRouter } from "next/navigation"
import { useMemo, useEffect } from "react"
import { useSession } from "next-auth/react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

// Function to generate breadcrumbs based on pathname
function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = []
  
  // Always start with Dashboard
  breadcrumbs.push({
    label: 'Dashboard',
    href: '/dashboard',
    isLast: segments.length === 1
  })
  
  // Generate breadcrumbs for nested paths
  if (segments.length > 1) {
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i]
      const href = '/' + segments.slice(0, i + 1).join('/')
      const isLast = i === segments.length - 1
      
      // Convert segment to readable label
      let label = segment.charAt(0).toUpperCase() + segment.slice(1)
      
      // Custom labels for specific segments
      switch (segment) {
        case 'alumni':
          label = 'Alumni'
          break
        case 'syubiyah':
          label = 'Syubiyah'
          break
        case 'mustahiq':
          label = 'Mustahiq'
          break
        case 'data':
          label = 'Data Alumni'
          break
        case 'news':
          label = 'Berita & Artikel'
          break
        case 'posts':
          label = 'Post'
          break
        case 'categories':
          label = 'Kategori'
          break
        case 'comments':
          label = 'Komentar'
          break
        case 'events':
          label = 'Event & Acara'
          break
        case 'donations':
          label = 'Donasi & Sponsorship'
          break
        case 'history':
          label = 'Riwayat Donasi'
          break
        case 'donors':
          label = 'Donatur'
          break
        case 'sponsors':
          label = 'Sponsor'
          break
        case 'programs':
          label = 'Program Donasi'
          break
        case 'payment-settings':
          label = 'Pengaturan Pembayaran'
          break
        case 'reports':
          label = 'Laporan'
          break
        case 'settings':
          label = 'Pengaturan'
          break
      }
      
      breadcrumbs.push({
        label,
        href,
        isLast
      })
    }
  }
  
  return breadcrumbs
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const breadcrumbs = useMemo(() => generateBreadcrumbs(pathname), [pathname])

  // Protect dashboard routes
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
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.href} className="flex items-center">
                  {index > 0 && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                  <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                    {breadcrumb.isLast ? (
                      <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={breadcrumb.href}>
                        {breadcrumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="min-h-[100vh] flex-1">
            {children}
          </div>
          <footer className="w-full text-center text-xs text-gray-400 py-4 border-t mt-8">
            © {new Date().getFullYear()} IKADA Admin. All rights reserved.
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}