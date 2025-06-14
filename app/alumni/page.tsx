'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Filter, Users, MapPin, GraduationCap, Briefcase, Phone, Mail, Calendar, Grid3X3, List } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

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

interface Syubiyah {
  id: string
  name: string
}

interface Mustahiq {
  id: string
  name: string
}

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [filteredAlumni, setFilteredAlumni] = useState<Alumni[]>([])
  const [syubiyahList, setSyubiyahList] = useState<Syubiyah[]>([])
  const [mustahiqList, setMustahiqList] = useState<Mustahiq[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSyubiyah, setSelectedSyubiyah] = useState<string>('all')
  const [selectedMustahiq, setSelectedMustahiq] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedAngkatan, setSelectedAngkatan] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('fullName')
  const [sortOrder, setSortOrder] = useState<string>('asc')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [selectedAlphabet, setSelectedAlphabet] = useState<string>('all')

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch alumni
        const alumniResponse = await fetch('/api/alumni')
        if (alumniResponse.ok) {
          const alumniData = await alumniResponse.json()
          setAlumni(alumniData.alumni || [])
          setFilteredAlumni(alumniData.alumni || [])
        }

        // Fetch syubiyah
        const syubiyahResponse = await fetch('/api/syubiyah')
        if (syubiyahResponse.ok) {
          const syubiyahData = await syubiyahResponse.json()
          setSyubiyahList(syubiyahData.syubiyah || [])
        }

        // Fetch mustahiq
        const mustahiqResponse = await fetch('/api/mustahiq')
        if (mustahiqResponse.ok) {
          const mustahiqData = await mustahiqResponse.json()
          setMustahiqList(mustahiqData.mustahiq || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter and search alumni
  useEffect(() => {
    let filtered = [...alumni]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.phone && item.phone.includes(searchTerm)) ||
        (item.asalDaerah && item.asalDaerah.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.provinsi && item.provinsi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.kabupaten && item.kabupaten.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.pendidikanTerakhir && item.pendidikanTerakhir.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.pekerjaan && item.pekerjaan.some(p => p.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    }

    // Syubiyah filter
    if (selectedSyubiyah !== 'all') {
      filtered = filtered.filter(item => item.syubiyah?.id === selectedSyubiyah)
    }

    // Mustahiq filter
    if (selectedMustahiq !== 'all') {
      filtered = filtered.filter(item => item.mustahiq?.id === selectedMustahiq)
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus)
    }

    // Angkatan filter
    if (selectedAngkatan !== 'all') {
      filtered = filtered.filter(item => {
        if (selectedAngkatan === 'active') {
          return !item.tahunKeluar
        } else if (selectedAngkatan === 'graduated') {
          return item.tahunKeluar
        } else {
          return item.tahunMasuk?.toString() === selectedAngkatan
        }
      })
    }

    // Alphabet filter
    if (selectedAlphabet !== 'all') {
      filtered = filtered.filter(item => 
        item.fullName.toLowerCase().startsWith(selectedAlphabet.toLowerCase())
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'fullName':
          aValue = a.fullName
          bValue = b.fullName
          break
        case 'tahunMasuk':
          aValue = a.tahunMasuk || 0
          bValue = b.tahunMasuk || 0
          break
        case 'tahunKeluar':
          aValue = a.tahunKeluar || 0
          bValue = b.tahunKeluar || 0
          break
        case 'createdAt':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        default:
          aValue = a.fullName
          bValue = b.fullName
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredAlumni(filtered)
  }, [alumni, searchTerm, selectedSyubiyah, selectedMustahiq, selectedStatus, selectedAngkatan, selectedAlphabet, sortBy, sortOrder])

  // Get unique angkatan years
  const angkatanYears = Array.from(new Set((alumni && Array.isArray(alumni) ? alumni.map(a => a.tahunMasuk).filter(Boolean) : []))).sort((a, b) => (b || 0) - (a || 0))

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
      case 'PENDING': return 'Menunggu'
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Direktori Alumni IKADA
        </h1>
        <p className="text-lg text-gray-600">
          Temukan dan terhubung dengan alumni Ikatan Alumni Pondok Darussalam Sumbersari
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Alumni</p>
                <p className="text-2xl font-bold text-gray-900">{alumni && Array.isArray(alumni) ? alumni.length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alumni Aktif</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alumni && Array.isArray(alumni) ? alumni.filter(a => !a.tahunKeluar).length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Syubiyah</p>
                <p className="text-2xl font-bold text-gray-900">{syubiyahList.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Filter className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hasil Filter</p>
                <p className="text-2xl font-bold text-gray-900">{filteredAlumni.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Pencarian & Filter
          </CardTitle>
          <CardDescription>
            Gunakan filter di bawah untuk menemukan alumni yang Anda cari
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari berdasarkan nama, email, telepon, asal daerah, pendidikan, atau pekerjaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Select value={selectedSyubiyah} onValueChange={setSelectedSyubiyah}>
              <SelectTrigger>
                <SelectValue placeholder="Syubiyah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Syubiyah</SelectItem>
                {syubiyahList.map((syubiyah) => (
                  <SelectItem key={syubiyah.id} value={syubiyah.id}>
                    {syubiyah.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMustahiq} onValueChange={setSelectedMustahiq}>
              <SelectTrigger>
                <SelectValue placeholder="Mustahiq" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Mustahiq</SelectItem>
                {mustahiqList.map((mustahiq) => (
                  <SelectItem key={mustahiq.id} value={mustahiq.id}>
                    {mustahiq.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="PENDING">Menunggu</SelectItem>
                <SelectItem value="VERIFIED">Terverifikasi</SelectItem>
                <SelectItem value="REJECTED">Ditolak</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedAngkatan} onValueChange={setSelectedAngkatan}>
              <SelectTrigger>
                <SelectValue placeholder="Angkatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Angkatan</SelectItem>
                <SelectItem value="active">Masih Aktif</SelectItem>
                <SelectItem value="graduated">Sudah Lulus</SelectItem>
                <Separator />
                {angkatanYears.map((year) => (
                  <SelectItem key={year} value={year?.toString() || ''}>
                    Angkatan {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fullName">Nama</SelectItem>
                <SelectItem value="tahunMasuk">Tahun Masuk</SelectItem>
                <SelectItem value="tahunKeluar">Tahun Keluar</SelectItem>
                <SelectItem value="createdAt">Tanggal Daftar</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger>
                <SelectValue placeholder="Urutan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">A-Z / Lama-Baru</SelectItem>
                <SelectItem value="desc">Z-A / Baru-Lama</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle & Alphabet Filter */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Tampilan:</span>
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none border-0"
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Card Grid
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-none border-0"
                >
                  <List className="h-4 w-4 mr-2" />
                  Table List
                </Button>
              </div>
            </div>

            {/* Alphabet Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter Huruf:</span>
              <div className="flex flex-wrap gap-1">
                <Button
                  variant={selectedAlphabet === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedAlphabet('all')}
                  className="h-7 text-xs px-2"
                >
                  All
                </Button>
                {Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i)).map((letter) => (
                  <Button
                    key={letter}
                    variant={selectedAlphabet === letter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedAlphabet(letter)}
                    className="w-7 h-7 text-xs p-0"
                  >
                    {letter}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedSyubiyah !== 'all' || selectedMustahiq !== 'all' || selectedStatus !== 'all' || selectedAngkatan !== 'all' || selectedAlphabet !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setSelectedSyubiyah('all')
                setSelectedMustahiq('all')
                setSelectedStatus('all')
                setSelectedAngkatan('all')
                setSelectedAlphabet('all')
              }}
            >
              Hapus Semua Filter
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Alumni Display */}
      {filteredAlumni.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || selectedSyubiyah !== 'all' || selectedMustahiq !== 'all' || selectedStatus !== 'all' || selectedAngkatan !== 'all'
                ? 'Tidak ada alumni yang sesuai dengan filter'
                : 'Belum ada data alumni'}
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedSyubiyah !== 'all' || selectedMustahiq !== 'all' || selectedStatus !== 'all' || selectedAngkatan !== 'all'
                ? 'Coba ubah kriteria pencarian atau filter Anda'
                : 'Data alumni akan muncul di sini setelah ditambahkan'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        // Card Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((alumniItem) => (
            <Link key={alumniItem.id} href={`/alumni/${alumniItem.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={alumniItem.profilePhoto || undefined} 
                      alt={alumniItem.fullName} 
                    />
                    <AvatarFallback className="text-lg font-semibold">
                      {alumniItem.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {alumniItem.fullName}
                        </h3>
                        
                        {alumniItem.asalDaerah && (
                          <p className="text-sm text-gray-600 mb-2">
                            {alumniItem.asalDaerah}
                          </p>
                        )}
                      </div>
                      
                      <Badge className={getStatusColor(alumniItem.status)}>
                        {formatStatus(alumniItem.status)}
                      </Badge>
                    </div>

                    <div className="space-y-2 mt-3">
                      {/* Contact Info */}
                      {alumniItem.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{alumniItem.email}</span>
                        </div>
                      )}
                      
                      {alumniItem.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{alumniItem.phone}</span>
                        </div>
                      )}

                      {/* Education Period */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>
                          {alumniItem.tahunMasuk && `Masuk: ${alumniItem.tahunMasuk}`}
                          {alumniItem.tahunKeluar && ` • Keluar: ${alumniItem.tahunKeluar}`}
                          {!alumniItem.tahunKeluar && alumniItem.tahunMasuk && ' • Masih Aktif'}
                        </span>
                      </div>

                      {/* Education & Work */}
                      {alumniItem.pendidikanTerakhir && (
                        <div className="flex items-center text-sm text-gray-600">
                          <GraduationCap className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{alumniItem.pendidikanTerakhir}</span>
                        </div>
                      )}
                      
                      {alumniItem.pekerjaan && alumniItem.pekerjaan.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{alumniItem.pekerjaan.join(', ')}</span>
                        </div>
                      )}

                      {/* Location */}
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {[alumniItem.desa, alumniItem.kecamatan, alumniItem.kabupaten, alumniItem.provinsi]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>

                      {/* Syubiyah & Mustahiq */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {alumniItem.syubiyah && (
                          <Badge variant="secondary" className="text-xs">
                            {alumniItem.syubiyah.name}
                          </Badge>
                        )}
                        {alumniItem.mustahiq && (
                          <Badge variant="outline" className="text-xs">
                            {alumniItem.mustahiq.name}
                          </Badge>
                        )}
                      </div>

                      {/* Personal Info */}
                      {(alumniItem.statusPernikahan || alumniItem.jumlahAnak) && (
                        <div className="text-xs text-gray-500 mt-2">
                          {alumniItem.statusPernikahan && (
                            <span>{formatStatusPernikahan(alumniItem.statusPernikahan)}</span>
                          )}
                          {alumniItem.jumlahAnak && alumniItem.jumlahAnak > 0 && (
                            <span>
                              {alumniItem.statusPernikahan && ' • '}
                              {alumniItem.jumlahAnak} anak
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        // Table List View
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Foto</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Syubiyah</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlumni.map((alumniItem) => (
                  <TableRow key={alumniItem.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/alumni/${alumniItem.id}`}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={alumniItem.profilePhoto || undefined} 
                          alt={alumniItem.fullName} 
                        />
                        <AvatarFallback className="text-sm">
                          {alumniItem.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{alumniItem.fullName}</div>
                        {alumniItem.asalDaerah && (
                          <div className="text-sm text-gray-500">{alumniItem.asalDaerah}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {alumniItem.syubiyah ? (
                        <Badge variant="secondary" className="text-xs">
                          {alumniItem.syubiyah.name}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {alumniItem.tahunMasuk && (
                          <div>{alumniItem.tahunMasuk}</div>
                        )}
                        {alumniItem.tahunKeluar ? (
                          <div className="text-gray-500">- {alumniItem.tahunKeluar}</div>
                        ) : (
                          <div className="text-green-600">- Aktif</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        <div>{alumniItem.provinsi}</div>
                        <div>{alumniItem.kabupaten}</div>
                        {alumniItem.kecamatan && (
                          <div className="text-gray-500">{alumniItem.kecamatan}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {alumniItem.email && (
                          <div className="flex items-center text-gray-600">
                            <Mail className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-32">{alumniItem.email}</span>
                          </div>
                        )}
                        {alumniItem.phone && (
                          <div className="flex items-center text-gray-600">
                            <Phone className="h-3 w-3 mr-1" />
                            <span>{alumniItem.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(alumniItem.status)}>
                        {formatStatus(alumniItem.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Load More or Pagination could be added here */}
      {filteredAlumni.length > 0 && (
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Menampilkan {filteredAlumni.length} dari {alumni && Array.isArray(alumni) ? alumni.length : 0} alumni
          </p>
        </div>
      )}
      </div>
      
      <Footer />
    </div>
  )
}