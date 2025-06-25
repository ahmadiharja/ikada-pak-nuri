'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, Download, Search, Users, Eye } from 'lucide-react'

interface Alumni {
  id: string
  fullName: string
  email: string
  phone?: string
  profilePhoto?: string
  syubiyah?: {
    name: string
  }
}

interface FormField {
  label: string
  type: string
}

interface Answer {
  id: string
  value: string
  field: FormField
}

interface Registration {
  id: string
  createdAt: string
  alumni: Alumni
  answers: Answer[]
}

export default function EventParticipantsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchRegistrations()
  }, [eventId])

  useEffect(() => {
    if (searchTerm) {
      const filtered = registrations.filter(registration => 
        registration.alumni.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.alumni.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.alumni.syubiyah?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredRegistrations(filtered)
    } else {
      setFilteredRegistrations(registrations)
    }
  }, [searchTerm, registrations])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const fetchRegistrations = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/registrations`)
      if (response.ok) {
        const data = await response.json()
        setRegistrations(data)
        setFilteredRegistrations(data)
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/events/${eventId}/export`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `registrasi-event-${eventId}-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Gagal mengekspor data')
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Terjadi kesalahan saat mengekspor data')
    } finally {
      setIsExporting(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid Date'
      }
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Memuat...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/events')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold">Peserta Event</h1>
        </div>
        
        <Button
          onClick={handleExport}
          disabled={isExporting || registrations.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Mengekspor...' : 'Ekspor CSV'}
        </Button>
      </div>

      {/* Stats Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Statistik Pendaftaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{registrations.length}</div>
              <div className="text-sm text-gray-600">Total Peserta</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Set(registrations.map(r => r.alumni.syubiyah?.name)).size}
              </div>
              <div className="text-sm text-gray-600">Syubiyah Terwakili</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {registrations.length > 0 ? 
                  Math.round((registrations.filter(r => r.alumni.phone).length / registrations.length) * 100) 
                  : 0}%
              </div>
              <div className="text-sm text-gray-600">Memiliki No. Telepon</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Cari peserta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredRegistrations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              {searchTerm ? 'Tidak ada peserta yang sesuai dengan pencarian' : 'Belum ada peserta yang mendaftar'}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
              >
                Hapus Filter
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Daftar Peserta ({filteredRegistrations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Foto</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead>Syubiyah</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead>Jawaban Form</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration, index) => (
                    <TableRow key={registration.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Avatar className="w-10 h-10">
                          <AvatarImage 
                            src={registration.alumni.profilePhoto || ''} 
                            alt={registration.alumni.fullName}
                          />
                          <AvatarFallback>
                            {getInitials(registration.alumni.fullName)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {registration.alumni.fullName}
                      </TableCell>
                      <TableCell>{registration.alumni.email}</TableCell>
                      <TableCell>
                        {registration.alumni.phone || (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {registration.alumni.syubiyah?.name ? (
                          <Badge variant="outline">
                            {registration.alumni.syubiyah.name}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDate(registration.createdAt)}
                      </TableCell>
                      <TableCell>
                        {registration.answers.length > 0 ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRegistration(registration)
                              setIsModalOpen(true)
                            }}
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Lihat Detail
                          </Button>
                        ) : (
                          <span className="text-gray-400">Tidak ada jawaban</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal untuk menampilkan detail jawaban form */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Detail Jawaban Form - {selectedRegistration?.alumni.fullName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRegistration && (
            <div className="space-y-6">
              {/* Informasi Peserta */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Informasi Peserta</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nama Lengkap</label>
                    <p className="text-sm">{selectedRegistration.alumni.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm">{selectedRegistration.alumni.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Telepon</label>
                    <p className="text-sm">{selectedRegistration.alumni.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Syubiyah</label>
                    <p className="text-sm">{selectedRegistration.alumni.syubiyah?.name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tanggal Daftar</label>
                    <p className="text-sm">{formatDate(selectedRegistration.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Jawaban Form */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Jawaban Form Registrasi</h3>
                {selectedRegistration.answers.length > 0 ? (
                  <div className="space-y-4">
                    {selectedRegistration.answers.map((answer, index) => (
                      <div key={index} className="border border-gray-200 p-4 rounded-lg">
                        <label className="text-sm font-medium text-gray-600 block mb-2">
                          {answer.field.label}
                        </label>
                        <div className="bg-white p-3 border rounded">
                          {answer.field.type === 'textarea' ? (
                            <p className="text-sm whitespace-pre-wrap">{answer.value}</p>
                          ) : answer.field.type === 'select' || answer.field.type === 'radio' ? (
                            <Badge variant="secondary">{answer.value}</Badge>
                          ) : answer.field.type === 'checkbox' ? (
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                checked={answer.value === 'true' || answer.value === '1'} 
                                readOnly 
                                className="rounded"
                              />
                              <span className="text-sm">{answer.value === 'true' || answer.value === '1' ? 'Ya' : 'Tidak'}</span>
                            </div>
                          ) : (
                            <p className="text-sm">{answer.value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Tidak ada jawaban form yang tersedia</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}