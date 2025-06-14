'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { 
  ArrowLeft, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Phone, 
  Mail, 
  Calendar, 
  Users, 
  Heart,
  ExternalLink,
  Store,
  Star,
  Eye
} from 'lucide-react'

interface Alumni {
  id: string
  profilePhoto: string | null
  fullName: string
  tahunMasuk: number | null
  tahunKeluar: number | null
  asalDaerah: string | null
  tempatLahir: string | null
  tanggalLahir: string | null
  statusPernikahan: string | null
  jumlahAnak: number | null
  pendidikanTerakhir: string | null
  pekerjaan: string[]
  phone: string | null
  email: string
  penghasilanBulan: string | null
  provinsi: string
  kabupaten: string
  kecamatan: string
  desa: string
  namaJalan: string | null
  rt: string | null
  rw: string | null
  status: string
  createdAt: string
  syubiyah: {
    id: string
    name: string
  } | null
  mustahiq: {
    id: string
    name: string
  } | null
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number | null
  images: string[]
  category: {
    id: string
    name: string
  }
  status: string
  isFeatured: boolean
  viewCount: number
  clickCount: number
  createdAt: string
}

export default function AlumniDetailPage() {
  const params = useParams()
  const [alumni, setAlumni] = useState<Alumni | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const response = await fetch(`/api/alumni/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setAlumni(data)
        } else {
          console.error('Failed to fetch alumni')
        }
      } catch (error) {
        console.error('Error fetching alumni:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchProducts = async () => {
      try {
        const response = await fetch(`/api/products?alumniId=${params.id}&limit=6`)
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
        } else {
          console.error('Failed to fetch products')
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setProductsLoading(false)
      }
    }

    if (params.id) {
      fetchAlumni()
      fetchProducts()
    }
  }, [params.id])

  const formatStatusPernikahan = (status: string) => {
    switch (status) {
      case 'BELUM_MENIKAH': return 'Belum Menikah'
      case 'MENIKAH': return 'Menikah'
      case 'CERAI': return 'Cerai'
      default: return status
    }
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Menunggu Verifikasi'
      case 'VERIFIED': return 'Terverifikasi'
      case 'REJECTED': return 'Ditolak'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'VERIFIED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-32" />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <Skeleton className="h-32 w-32 rounded-full mx-auto" />
                      <Skeleton className="h-6 w-48 mx-auto" />
                      <Skeleton className="h-4 w-32 mx-auto" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!alumni) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Alumni Tidak Ditemukan</h1>
            <p className="text-gray-600 mb-6">Alumni yang Anda cari tidak ditemukan atau telah dihapus.</p>
            <Link href="/alumni">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Direktori Alumni
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/alumni">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Direktori Alumni
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Left Column - Alumni Information */}
          <div className="lg:col-span-2 space-y-4">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage 
                      src={alumni.profilePhoto || '/placeholder-user.jpg'} 
                      alt={alumni.fullName} 
                    />
                    <AvatarFallback className="text-2xl">
                      {alumni.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{alumni.fullName}</h1>
                    <Badge className={`mt-1 ${getStatusColor(alumni.status)}`}>
                      {formatStatus(alumni.status)}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    {alumni.email && (
                      <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{alumni.email}</span>
                      </div>
                    )}
                    {alumni.phone && (
                      <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{alumni.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex space-x-1">
                    {alumni.phone && (
                      <Button size="sm" className="flex-1 text-xs">
                        <Phone className="h-3 w-3 mr-1" />
                        Hubungi
                      </Button>
                    )}
                    {alumni.email && (
                      <Button size="sm" variant="outline" className="flex-1 text-xs">
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Personal Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Users className="h-4 w-4" />
                  <span>Informasi Pribadi</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="grid grid-cols-1 gap-3">
                  {alumni.tempatLahir && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">Tempat Lahir</label>
                      <p className="text-sm text-gray-900">{alumni.tempatLahir}</p>
                    </div>
                  )}
                  {alumni.tanggalLahir && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">Tanggal Lahir</label>
                      <p className="text-sm text-gray-900">{formatDate(alumni.tanggalLahir)}</p>
                    </div>
                  )}
                  {alumni.statusPernikahan && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">Status Pernikahan</label>
                      <p className="text-sm text-gray-900">{formatStatusPernikahan(alumni.statusPernikahan)}</p>
                    </div>
                  )}
                  {alumni.jumlahAnak !== null && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">Jumlah Anak</label>
                      <p className="text-sm text-gray-900">{alumni.jumlahAnak} anak</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Education & Career */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <GraduationCap className="h-4 w-4" />
                  <span>Pendidikan & Karir</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="grid grid-cols-1 gap-3">
                  {alumni.tahunMasuk && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">Tahun Masuk</label>
                      <p className="text-sm text-gray-900">{alumni.tahunMasuk}</p>
                    </div>
                  )}
                  {alumni.tahunKeluar && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">Tahun Keluar</label>
                      <p className="text-sm text-gray-900">{alumni.tahunKeluar}</p>
                    </div>
                  )}
                  {alumni.pendidikanTerakhir && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">Pendidikan Terakhir</label>
                      <p className="text-sm text-gray-900">{alumni.pendidikanTerakhir}</p>
                    </div>
                  )}
                  {alumni.penghasilanBulan && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">Penghasilan per Bulan</label>
                      <p className="text-sm text-gray-900">{alumni.penghasilanBulan}</p>
                    </div>
                  )}
                </div>
                
                {alumni.pekerjaan && alumni.pekerjaan.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Pekerjaan</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {alumni.pekerjaan.map((job, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Briefcase className="h-2 w-2 mr-1" />
                          {job}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <MapPin className="h-4 w-4" />
                  <span>Lokasi</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="grid grid-cols-1 gap-3">
                  {alumni.asalDaerah && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">Asal Daerah</label>
                      <p className="text-sm text-gray-900">{alumni.asalDaerah}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-gray-500">Provinsi</label>
                    <p className="text-sm text-gray-900">{alumni.provinsi}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Kabupaten</label>
                    <p className="text-sm text-gray-900">{alumni.kabupaten}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Kecamatan</label>
                    <p className="text-sm text-gray-900">{alumni.kecamatan}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Desa</label>
                    <p className="text-sm text-gray-900">{alumni.desa}</p>
                  </div>
                  {alumni.namaJalan && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">Alamat Jalan</label>
                      <p className="text-sm text-gray-900">
                        {alumni.namaJalan}
                        {alumni.rt && `, RT ${alumni.rt}`}
                        {alumni.rw && `, RW ${alumni.rw}`}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Organization */}
            {(alumni.syubiyah || alumni.mustahiq) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <Users className="h-4 w-4" />
                    <span>Organisasi</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="grid grid-cols-1 gap-3">
                    {alumni.syubiyah && (
                      <div>
                        <label className="text-xs font-medium text-gray-500">Syubiyah</label>
                        <p className="text-sm text-gray-900">{alumni.syubiyah.name}</p>
                      </div>
                    )}
                    {alumni.mustahiq && (
                      <div>
                        <label className="text-xs font-medium text-gray-500">Mustahiq</label>
                        <p className="text-sm text-gray-900">{alumni.mustahiq.name}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Products UMKM */}
          <div className="lg:col-span-4">
            {/* Products UMKM */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Store className="h-4 w-4" />
                    <span className="text-base">Produk UMKM</span>
                  </div>
                  {products.length > 0 && (
                    <Link href={`/umkm/alumni/${alumni.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        Lihat Semua
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {productsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-3">
                          <Skeleton className="h-24 w-full mb-2" />
                          <Skeleton className="h-3 w-3/4 mb-1" />
                          <Skeleton className="h-2 w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {products.map((product) => (
                      <Link key={product.id} href={`/umkm/products/${product.slug}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-3">
                            <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Store className="h-8 w-8" />
                                </div>
                              )}
                            </div>
                            
                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm">
                              {product.name}
                            </h3>
                            
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <Badge variant="secondary" className="text-xs">{product.category.name}</Badge>
                              {product.isFeatured && (
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                  <Star className="h-2 w-2 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                            
                            {product.price && (
                              <p className="text-sm font-bold text-green-600 mb-1">
                                {formatCurrency(product.price)}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <div className="flex items-center">
                                  <Eye className="h-2 w-2 mr-1" />
                                  <span>{product.viewCount}</span>
                                </div>
                              </div>
                              <span className="text-xs">{formatDate(product.createdAt)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Store className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Belum ada produk UMKM yang terdaftar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}