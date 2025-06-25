'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  LogOut,
  Home,
  Users,
  Store,
  Calendar as CalendarIcon,
  Heart,
  CreditCard,
  Newspaper,
  Settings,
  Eye,
  ArrowLeft,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import EventDetailModal from './event-detail-modal'

// Re-using interfaces from other pages
interface AlumniData {
  id: string
  fullName: string
  email: string
  profilePhoto?: string
  syubiyah?: {
    name: string
  }
  tahunMasuk?: number
  tahunKeluar?: number
  store?: any
}

interface Event {
  id: string
  title: string
  description: string
  type: string
  eventType: string
  date: string
  location?: string
  imageUrl?: string
  status: string
  _count: {
    registrations: number
  }
}

export default function AlumniDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [alumniData, setAlumniData] = useState<AlumniData | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [checking, setChecking] = useState(true)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  
  const getEventStatus = (event: Event) => {
    const now = new Date()
    const eventDate = new Date(event.date)
    if (event.status !== 'PUBLISHED') return { label: 'Draft', variant: 'secondary', className: 'bg-gray-200 text-gray-700' }
    if (eventDate > now) return { label: 'Akan Datang', variant: 'default', className: 'bg-blue-100 text-blue-800' }
    return { label: 'Selesai', variant: 'outline', className: 'bg-gray-100 text-gray-600' }
  }

  const handleLogout = () => {
    localStorage.setItem('alumni_logout_in_progress', 'true');
    localStorage.removeItem('alumni_token');
    localStorage.removeItem('alumni_data');
    document.cookie = 'alumni_token=; path=/; max-age=0';
    document.cookie = 'alumni_token=; path=/alumni; max-age=0';
    document.cookie = 'alumni_token=; max-age=0';
    document.cookie = 'alumni_token=; domain=' + window.location.hostname + '; path=/; max-age=0';
    localStorage.removeItem('alumni_logout_in_progress');
    router.push('/');
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }

  const closeEventModal = () => {
    setIsEventModalOpen(false)
    setSelectedEvent(null)
  }

  useEffect(() => {
    setChecking(true)
    setTimeout(() => {
      const storedAlumniData = localStorage.getItem('alumni_data')
      const token = localStorage.getItem('alumni_token')
      if (storedAlumniData && token) {
        setAlumniData(JSON.parse(storedAlumniData))
        setChecking(false)
      } else {
        router.push('/alumni-login')
      }
    }, 100)
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const getPageTitle = () => {
    if (pathname.includes('/alumnibook')) return 'Buku Alumni';
    if (pathname.includes('/donations')) return 'Donasi';
    if (pathname.includes('/news')) return 'Berita & Artikel';
    if (pathname.includes('/products/detail')) return 'Detail Produk';
    return 'Dashboard';
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Mobile Sticky Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h1>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        </div>
        <div className="p-4">
          {children}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600/80 backdrop-blur-md rounded-full shadow-lg px-6 py-3 z-50 lg:w-auto lg:max-w-md">
          <div className="flex justify-center space-x-8 lg:space-x-6">
            <Link href="/" className="flex flex-col items-center py-1 text-green-100 hover:text-white transition-colors">
              <Home className="w-5 h-5" />
              <span className="text-xs mt-1">Beranda</span>
            </Link>
            <Link href="/alumni/dashboard/alumnibook" className="flex flex-col items-center py-1 text-green-100 hover:text-white transition-colors">
              <Users className="w-5 h-5" />
              <span className="text-xs mt-1">Alumni</span>
            </Link>
            <Link href="/alumni/dashboard/daftarumkm" className="flex flex-col items-center py-1 text-green-100 hover:text-white transition-colors">
              <Store className="w-5 h-5" />
              <span className="text-xs mt-1">UMKM</span>
            </Link>
            <Link href="/alumni/dashboard/daftarevent" className="flex flex-col items-center py-1 text-green-100 hover:text-white transition-colors">
              <CalendarIcon className="w-5 h-5" />
              <span className="text-xs mt-1">Event</span>
            </Link>
            <Link href="/alumni/dashboard" className="flex flex-col items-center py-1 text-green-100 hover:text-white transition-colors">
              <User className="w-5 h-5" />
              <span className="text-xs mt-1">Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-12 gap-6 relative">
            {/* Left Sidebar */}
            <div className="col-span-3 sticky top-6 h-fit">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <Avatar className="h-20 w-20 mx-auto mb-4">
                      <AvatarImage src={alumniData?.profilePhoto || ''} alt={alumniData?.fullName || ''} />
                      <AvatarFallback className="bg-green-600 text-white text-xl">
                        {alumniData?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="font-bold text-lg">{alumniData?.fullName}</h2>
                    <p className="text-gray-600 text-sm">{alumniData?.syubiyah?.name}</p>
                    {alumniData?.tahunMasuk && alumniData?.tahunKeluar && (
                      <p className="text-gray-500 text-xs">
                        Angkatan {alumniData?.tahunMasuk} - {alumniData?.tahunKeluar}
                      </p>
                    )}
                  </div>
                  <div className="text-center mb-6">
                    <div className="text-2xl font-bold text-green-600">Rp 250.000</div>
                    <p className="text-sm text-gray-500">Saldo</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <Button variant="outline" size="sm" className="flex flex-col items-center py-2 h-auto">
                      <ArrowUpCircle className="w-4 h-4 mb-1" />
                      <span className="text-xs">Isi Saldo</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex flex-col items-center py-2 h-auto">
                      <ArrowDownCircle className="w-4 h-4 mb-1" />
                      <span className="text-xs">Tarik Saldo</span>
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <Link href="/alumni/dashboard/donations">
                      <Button variant="outline" size="sm" className="flex flex-col items-center py-3 h-auto w-full">
                        <Heart className="w-4 h-4 mb-1" />
                        <span className="text-xs">Donasi</span>
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="flex flex-col items-center py-3 h-auto w-full">
                      <CreditCard className="w-4 h-4 mb-1" />
                      <span className="text-xs">Pembelian</span>
                    </Button>
                    <Link href="/alumni/dashboard/news">
                      <Button variant="outline" size="sm" className="flex flex-col items-center py-3 h-auto w-full">
                        <Newspaper className="w-4 h-4 mb-1" />
                        <span className="text-xs">Berita</span>
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="flex flex-col items-center py-3 h-auto w-full">
                      <Settings className="w-4 h-4 mb-1" />
                      <span className="text-xs">Pengaturan</span>
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Profil
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <main className="col-span-6 h-[calc(100vh-3rem)] overflow-y-auto pr-4">
              {children}
            </main>

            {/* Right Sidebar */}
            <div className="col-span-3 sticky top-6 h-fit">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Kegiatan & Event Terbaru</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.length > 0 ? events.map((event) => {
                      const eventStatus = getEventStatus(event)
                      return (
                        <div 
                          key={event.id} 
                          className="border-l-4 border-green-500 pl-4 py-2 cursor-pointer hover:bg-gray-50 rounded-r-lg transition-colors group"
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden">
                              {event.imageUrl ? (
                                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <CalendarIcon className="w-4 h-4 text-green-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{event.title}</h4>
                              <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
                              <Badge variant={eventStatus.variant as any} className={`text-xs mt-1 ${eventStatus.className}`}>
                                {eventStatus.label}
                              </Badge>
                            </div>
                            <Eye className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                          </div>
                        </div>
                      )
                    }) : (
                      <div className="text-center py-8">
                        <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">Belum ada event terbaru</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Bottom Navigation is now separate for mobile */}
         <div className="hidden lg:block fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600/80 backdrop-blur-md rounded-full shadow-lg px-6 py-3 z-50 lg:w-auto lg:max-w-md">
           <div className="flex justify-center space-x-8 lg:space-x-6">
             <Link href="/" className="flex flex-col items-center py-1 text-green-100 hover:text-white transition-colors">
               <Home className="w-5 h-5" />
               <span className="text-xs mt-1">Beranda</span>
             </Link>
             <Link href="/alumni/dashboard/alumnibook" className="flex flex-col items-center py-1 text-green-100 hover:text-white transition-colors">
               <Users className="w-5 h-5" />
               <span className="text-xs mt-1">Alumni</span>
             </Link>
             <Link href="/alumni/dashboard/daftarumkm" className="flex flex-col items-center py-1 text-green-100 hover:text-white transition-colors">
               <Store className="w-5 h-5" />
               <span className="text-xs mt-1">UMKM</span>
             </Link>
             <Link href="/alumni/dashboard/daftarevent" className="flex flex-col items-center py-1 text-green-100 hover:text-white transition-colors">
               <CalendarIcon className="w-5 h-5" />
               <span className="text-xs mt-1">Event</span>
             </Link>
             <Link href="/alumni/dashboard" className="flex flex-col items-center py-1 text-green-100 hover:text-white transition-colors">
               <User className="w-5 h-5" />
               <span className="text-xs mt-1">Dashboard</span>
             </Link>
           </div>
         </div>
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={closeEventModal}
      />
    </>
  )
} 