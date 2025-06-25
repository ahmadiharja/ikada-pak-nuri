'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  User, 
  Store,
  Calendar as CalendarIcon,
  Plus,
  ShoppingBag,
  Eye,
  MoreHorizontal,
  MapPin,
  Clock,
  UserCheck,
  ArrowUpCircle,
  ArrowDownCircle,
  Heart,
  Newspaper,
  CreditCard,
  Settings,
  LogOut
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import EventDetailModal from './event-detail-modal'

interface AlumniData {
  id: string
  fullName: string
  email: string
  profilePhoto?: string
  store?: {
    id: string
  }
}

interface UMKMProduct {
  id: string
  name: string
  price: number
  image?: string
  category?: any
  slug: string
}

interface Event {
  id: string
  title: string
  description: string
  date: string
  type: string
  eventType: string
  location?: string
  imageUrl?: string
  status: string
  _count: {
    registrations: number
  }
}

export default function AlumniDashboardPage() {
  const router = useRouter()
  const [alumniData, setAlumniData] = useState<AlumniData | null>(null)
  const [umkmProducts, setUmkmProducts] = useState<UMKMProduct[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [hasStore, setHasStore] = useState<boolean | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    const token = localStorage.getItem('alumni_token')
    const storedAlumniData = localStorage.getItem('alumni_data')
    if (!token || !storedAlumniData) {
      router.push('/alumni-login')
      return
    }
    
    try {
      const parsedData = JSON.parse(storedAlumniData)
      setAlumniData(parsedData)
    } catch (error) {
       router.push('/alumni-login');
       return;
    }
    
    checkStoreAccess()
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [router])

  const checkStoreAccess = async () => {
    try {
      // Check if alumni has store from localStorage first
      const storedAlumniData = localStorage.getItem('alumni_data')
      if (storedAlumniData) {
        const alumniData = JSON.parse(storedAlumniData)
        if (alumniData.store) {
          setHasStore(true)
          fetchPageData()
          return
        }
      }

      // If no store in localStorage, check from API
      const token = localStorage.getItem('alumni_token')
      if (!token) {
        router.push('/alumni-login')
        return
      }

      const response = await fetch('/api/alumni/store', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setHasStore(true)
        
        // Update localStorage with store data
        if (storedAlumniData) {
          const alumniData = JSON.parse(storedAlumniData)
          alumniData.store = data.store
          localStorage.setItem('alumni_data', JSON.stringify(alumniData))
          setAlumniData(alumniData)
        }
        
        fetchPageData()
      } else {
        setHasStore(false)
        fetchPageData()
      }
    } catch (error) {
      console.error('Error checking store access:', error)
      setHasStore(false)
      fetchPageData()
    } finally {
      setIsLoading(false)
    }
    }
    
    const fetchPageData = async () => {
      setIsLoading(true)
      try {
      const token = localStorage.getItem('alumni_token')
        const [productsResponse, eventsResponse] = await Promise.all([
          fetch('/api/alumni/products?limit=6', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/events?limit=3&status=PUBLISHED')
        ]);

        if (productsResponse.ok) {
          const data = await productsResponse.json()
          const transformedProducts: UMKMProduct[] = data.products.map((p: any) => ({
            id: p.id, slug: p.slug, name: p.name, price: p.price || p.priceMin || 0,
            image: p.thumbnailImage || p.images?.[0], category: p.category?.name
        }))
        setUmkmProducts(transformedProducts)
        }
        if (eventsResponse.ok) {
          setEvents(await eventsResponse.json())
        }
      } catch (err) {
        console.error("Failed to fetch page data", err)
    } finally {
      setIsLoading(false)
    }
    }

  useEffect(() => {
    if (!events.length) return
    const alumniToken = localStorage.getItem('alumni_token')
    Promise.all(events.map(ev =>
      fetch(`/api/events/${ev.id}/registrations/check`, {
        headers: { Authorization: `Bearer ${alumniToken}` }
      })
        .then(res => res.ok ? res.json() : { isRegistered: false })
        .then(data => data.isRegistered ? ev.id : null)
    )).then(ids => setRegisteredEventIds(ids.filter(Boolean)))
  }, [events])

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    localStorage.setItem('alumni_logout_in_progress', 'true');
    localStorage.removeItem('alumni_token');
    localStorage.removeItem('alumni_data');
    document.cookie = 'alumni_token=; path=/; max-age=0';
    document.cookie = 'alumni_token=; path=/alumni; max-age=0';
    document.cookie = 'alumni_token=; max-age=0';
    document.cookie = 'alumni_token=; domain=' + window.location.hostname + '; path=/; max-age=0';
    window.dispatchEvent(new Event('alumni-auth-change'));
    setShowLogoutDialog(true);
    setTimeout(() => {
      setShowLogoutDialog(false);
      localStorage.removeItem('alumni_logout_in_progress');
      router.push('/');
    }, 1500);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }

  const closeEventModal = () => {
    setIsEventModalOpen(false)
    setSelectedEvent(null)
  }

  if (isLoading || !alumniData) {
        return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Dialog logout sukses
  const LogoutDialog = () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg px-8 py-6 text-center max-w-xs w-full">
        <div className="text-emerald-600 mb-2">
          <LogOut className="mx-auto w-10 h-10" />
        </div>
        <div className="font-semibold text-lg mb-1">Berhasil Logout</div>
        <div className="text-gray-500 text-sm mb-2">Anda akan diarahkan ke halaman utama...</div>
        <div className="w-full flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    </div>
  );



  const renderDesktopView = () => (
    <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Produk UMKM Saya</CardTitle>
                    {hasStore && (
                      <Link href="/alumni/dashboard/products">
                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">Lihat Semua</Button>
                      </Link>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!hasStore ? (
                    <div className="text-center py-8">
                      <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Memiliki Etalase Toko</h3>
                      <p className="text-gray-500 mb-6">Buat etalase toko untuk mulai menjual produk UMKM Anda</p>
                      <Link href="/alumni/dashboard/store/create">
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                          <Store className="w-4 h-4 mr-2" />
                          Buka Etalase Toko
                        </Button>
                      </Link>
                    </div>
                  ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {umkmProducts.length > 0 ? (
                  umkmProducts.slice(0, 2).map((product) => (
                          <div key={product.id} className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden relative">
                              {product.image ? (
                                <img 
                                  src={product.image} 
                                  alt={product.name}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                                  <ShoppingBag className="w-10 h-10 text-green-400" />
                                </div>
                              )}
                              <div className="absolute top-2 right-2">
                                <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                                  <span className="text-xs font-medium text-gray-600">#{product.id.slice(-4)}</span>
                                </div>
                              </div>
                            </div>
                            <h3 className="font-bold text-sm mb-2 text-gray-900 truncate">{product.name}</h3>
                            <p className="text-green-600 font-bold text-base mb-1">{formatCurrency(product.price)}</p>
                            {product.category && (
                              <div className="mb-3">
                                <span className="inline-block bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                  {product.category}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center mt-2 space-x-2">
                              <Link href={`/alumni/dashboard/products/detail/${product.id}`} className="flex-1">
                                <Button size="sm" className="text-xs px-3 py-2 w-full bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors duration-200">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Lihat Detail
                                </Button>
                              </Link>
                              <Link href={`/alumni/dashboard/products/${product.id}/edit`}>
                                <Button size="sm" variant="outline" className="text-xs px-3 py-2 border-gray-200 hover:bg-gray-50 rounded-xl transition-colors duration-200">
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))
                      ) : (
                  <div className="col-span-1 sm:col-span-2 text-center py-8">
                          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 mb-4">Belum ada produk yang terdaftar</p>
                          <Link href="/alumni/dashboard/products/create">
                            <Button variant="outline" size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              Tambah Produk
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
                        </div>
                      )

  const renderMobileView = () => (
    <div className="space-y-6">
      {/* 1. Welcome Card */}
      <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-white/50">
              <AvatarImage src={alumniData.profilePhoto} alt={alumniData.fullName} />
              <AvatarFallback className="bg-green-800 text-white text-xl">
                  {alumniData.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
              <p className="text-sm font-light">Selamat datang,</p>
              <h2 className="font-bold text-lg">{alumniData.fullName}</h2>
              </div>
            </div>
          <Button onClick={handleLogout} variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <LogOut className="w-5 h-5" />
            </Button>
        </CardContent>
      </Card>

      {/* 2. Balance Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">Saldo Anda</p>
            <p className="font-bold text-xl text-gray-800">{formatCurrency(250000)}</p>
                </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline"><ArrowUpCircle className="w-4 h-4 mr-2" /> Isi Saldo</Button>
            <Button variant="outline"><ArrowDownCircle className="w-4 h-4 mr-2" /> Tarik Saldo</Button>
              </div>
        </CardContent>
      </Card>
      
      {/* 3. Quick Navigation */}
      <div className="grid grid-cols-4 gap-3 text-center">
        <Link href="/alumni/dashboard/donations" className="p-2 bg-white rounded-lg shadow-sm">
            <Heart className="w-6 h-6 text-red-500 mx-auto" />
            <p className="text-xs mt-1">Donasi</p>
              </Link>
        <Link href="/alumni/dashboard/news" className="p-2 bg-white rounded-lg shadow-sm">
            <Newspaper className="w-6 h-6 text-blue-500 mx-auto" />
            <p className="text-xs mt-1">Berita</p>
              </Link>
        <div className="p-2 bg-white rounded-lg shadow-sm">
            <CreditCard className="w-6 h-6 text-green-500 mx-auto" />
            <p className="text-xs mt-1">Pembelian</p>
                </div>
        <div className="p-2 bg-white rounded-lg shadow-sm">
            <Settings className="w-6 h-6 text-gray-500 mx-auto" />
            <p className="text-xs mt-1">Pengaturan</p>
          </div>
        </div>

      {/* 4. Products Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Produk Anda</h3>
            {hasStore && (
              <Link href="/alumni/dashboard/products">
                <Button variant="link" size="sm">Lihat Semua</Button>
              </Link>
            )}
              </div>
        
        {!hasStore ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Belum Memiliki Etalase Toko</h4>
              <p className="text-sm text-gray-500 mb-4">Buat etalase toko untuk mulai menjual produk UMKM Anda</p>
              <Link href="/alumni/dashboard/store/create">
                <Button className="bg-green-600 hover:bg-green-700 text-white w-full">
                  <Store className="w-4 h-4 mr-2" />
                  Buka Etalase Toko
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
            {umkmProducts.length > 0 ? umkmProducts.map(p => (
              <Link key={p.id} href={`/alumni/dashboard/products/detail/${p.id}`} className="w-40 flex-shrink-0">
                <Card className="overflow-hidden h-full">
                    <div className="h-32 bg-gray-100">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
            </div>
                    <div className="p-2">
                        <p className="text-xs font-semibold truncate">{p.name}</p>
                        <p className="text-sm font-bold text-green-600">{formatCurrency(p.price)}</p>
                </div>
                </Card>
                              </Link>
            )) : (
              <div className="w-full text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-4">Belum ada produk yang terdaftar</p>
                <Link href="/alumni/dashboard/products/create">
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Produk
                  </Button>
                </Link>
              </div>
            )}
            </div>
        )}
          </div>

      {/* 5. Latest Events */}
      <div>
        <h3 className="font-bold mb-2">Event Terbaru</h3>
        <div className="space-y-3">
            {events.slice(0, 2).map(event => (
                <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEventClick(event)}>
                    <CardContent className="p-3 flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            <img src={event.imageUrl} className="w-full h-full object-cover" />
            </div>
                        <div>
                            <p className="font-semibold text-sm">{event.title}</p>
                            <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
                            {registeredEventIds.includes(event.id) && (
                              <span className="inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold mt-1">Berpartisipasi</span>
                            )}
                          </div>
                    </CardContent>
                </Card>
            ))}
                            </div>
                      </div>
                    </div>
                  )

  return (
    <>
      {isMobile ? renderMobileView() : renderDesktopView()}
      
      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={closeEventModal}
      />
    </>
  )
}