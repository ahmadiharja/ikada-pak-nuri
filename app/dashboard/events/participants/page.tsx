'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, Search, Download, Calendar, MapPin, Filter } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  date: string
  location?: string
  status: 'DRAFT' | 'PUBLISHED'
  _count?: {
    registrations: number
  }
}

interface Registration {
  id: string
  createdAt: string
  event: {
    id: string
    title: string
    date: string
  }
  alumni: {
    id: string
    fullName: string
    email: string
    phone?: string
    profilePhoto?: string
    syubiyah?: {
      name: string
    }
  }
  answers: {
    id: string
    value: string
    field: {
      label: string
      type: string
    }
  }[]
}

export default function EventParticipantsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchEvents()
    fetchAllRegistrations()
  }, [])

  useEffect(() => {
    filterRegistrations()
  }, [registrations, selectedEvent, searchTerm])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Gagal memuat data event')
    }
  }

  const fetchAllRegistrations = async () => {
    try {
      // Fetch registrations from all events
      const eventsResponse = await fetch('/api/events')
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        
        const allRegistrations: Registration[] = []
        
        for (const event of eventsData) {
          try {
            const regResponse = await fetch(`/api/events/${event.id}/registrations`)
            if (regResponse.ok) {
              const regData = await regResponse.json()
              allRegistrations.push(...regData)
            }
          } catch (error) {
            console.error(`Error fetching registrations for event ${event.id}:`, error)
          }
        }
        
        setRegistrations(allRegistrations)
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
      toast.error('Gagal memuat data peserta')
    } finally {
      setLoading(false)
    }
  }

  const filterRegistrations = () => {
    let filtered = registrations

    // Filter by event
    if (selectedEvent !== 'all') {
      filtered = filtered.filter(reg => reg.event.id === selectedEvent)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(reg => 
        reg.alumni.fullName.toLowerCase().includes(term) ||
        reg.alumni.email.toLowerCase().includes(term) ||
        reg.alumni.syubiyah?.name.toLowerCase().includes(term) ||
        reg.event?.title?.toLowerCase().includes(term)
      )
    }

    setFilteredRegistrations(filtered)
  }

  const exportToCSV = async () => {
    if (selectedEvent === 'all') {
      toast.error('Pilih event terlebih dahulu untuk export')
      return
    }

    try {
      const response = await fetch(`/api/events/${selectedEvent}/export`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `peserta-event-${selectedEvent}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Data berhasil diexport')
      } else {
        toast.error('Gagal export data')
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Terjadi kesalahan saat export')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Memuat data peserta...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Peserta Event</h1>
          <p className="text-muted-foreground">Kelola dan lihat semua peserta event</p>
        </div>
        <Button onClick={exportToCSV} disabled={selectedEvent === 'all'}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Event</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events ? events.length : 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Peserta</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event Aktif</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events ? events.filter(e => e.status === 'PUBLISHED').length : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Peserta</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events && events.length > 0 ? Math.round(registrations.length / events.length) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Peserta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari peserta, email, syubiyah, atau event..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Event</SelectItem>
                  {events && events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Peserta</CardTitle>
          <CardDescription>
            Menampilkan {filteredRegistrations.length} dari {registrations.length} peserta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Peserta</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Syubiyah</TableHead>
                <TableHead>Tanggal Daftar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations && filteredRegistrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={registration.alumni.profilePhoto || ''} alt={registration.alumni.fullName} />
                        <AvatarFallback>
                          {getInitials(registration.alumni.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{registration.alumni.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {registration.alumni.email}
                        </div>
                        {registration.alumni.phone && (
                          <div className="text-sm text-muted-foreground">
                            {registration.alumni.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{registration.event?.title || 'Event tidak ditemukan'}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {registration.event?.date ? formatDate(registration.event.date) : '-'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {registration.alumni.syubiyah ? (
                      <Badge variant="outline">
                        {registration.alumni.syubiyah.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDate(registration.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">Terdaftar</Badge>
                  </TableCell>
                  <TableCell>
                    {registration.event?.id ? (
                      <Link href={`/dashboard/events/${registration.event.id}/participants`}>
                        <Button size="sm" variant="outline">
                          Detail
                        </Button>
                      </Link>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        Detail
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredRegistrations.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Tidak ada peserta</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedEvent !== 'all'
                  ? 'Tidak ada peserta yang sesuai dengan filter'
                  : 'Belum ada peserta yang mendaftar'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}