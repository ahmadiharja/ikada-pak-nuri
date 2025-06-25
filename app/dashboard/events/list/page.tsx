'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Edit, Trash2, Plus, Settings, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

interface Event {
  id: string
  title: string
  description: string
  type: string
  eventType?: 'ONLINE' | 'OFFLINE'
  onlineLink?: string
  date: string
  location?: string
  imageUrl?: string
  maxParticipants?: number
  status: 'DRAFT' | 'PUBLISHED'
  createdAt: string
  updatedAt: string
  _count?: {
    registrations: number
  }
}

interface EventFormData {
  title: string
  description: string
  type: string
  eventType: 'ONLINE' | 'OFFLINE'
  onlineLink: string
  date: string
  location: string
  imageUrl: string
  maxParticipants: string
  status: 'DRAFT' | 'PUBLISHED'
}

const eventTypes = [
  'Seminar',
  'Workshop',
  'Reunion',
  'Pelatihan',
  'Diskusi',
  'Networking',
  'Webinar',
  'Lainnya'
]

export default function EventsListPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    type: '',
    eventType: 'OFFLINE' as 'ONLINE' | 'OFFLINE',
    onlineLink: '',
    date: '',
    location: '',
    imageUrl: '',
    maxParticipants: '',
    status: 'DRAFT'
  })

  useEffect(() => {
    fetchEvents()
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/events/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Gagal mengupload gambar')
    }

    const data = await response.json()
    return data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      let finalImageUrl = formData.imageUrl

      // Upload gambar baru jika ada file yang dipilih
      if (selectedFile) {
        setUploadingImage(true)
        try {
          finalImageUrl = await uploadImage(selectedFile)
        } catch (error) {
          toast.error('Gagal mengupload gambar')
          return
        } finally {
          setUploadingImage(false)
        }
      }
      
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events'
      const method = editingEvent ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imageUrl: finalImageUrl,
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null
        }),
      })

      if (response.ok) {
        toast.success(editingEvent ? 'Event berhasil diperbarui' : 'Event berhasil dibuat')
        setIsModalOpen(false)
        resetForm()
        fetchEvents()
      } else {
        toast.error('Gagal menyimpan event')
      }
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error('Terjadi kesalahan')
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      type: event.type,
      eventType: (event as any).eventType || 'OFFLINE',
      onlineLink: (event as any).onlineLink || '',
      date: new Date(event.date).toISOString().slice(0, 16),
      location: event.location || '',
      imageUrl: event.imageUrl || '',
      maxParticipants: event.maxParticipants?.toString() || '',
      status: event.status
    })
    // Reset file input dan preview untuk editing
    setSelectedFile(null)
    setImagePreview(event.imageUrl || '')
    setUploadingImage(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setIsModalOpen(true)
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus event ini?')) return

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Event berhasil dihapus')
        fetchEvents()
      } else {
        toast.error('Gagal menghapus event')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Terjadi kesalahan')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: '',
      eventType: 'OFFLINE',
      onlineLink: '',
      date: '',
      location: '',
      imageUrl: '',
      maxParticipants: '',
      status: 'DRAFT'
    })
    setEditingEvent(null)
    setSelectedFile(null)
    setImagePreview('')
    setUploadingImage(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format file tidak didukung. Gunakan JPEG, JPG, PNG, atau WebP.')
      return
    }

    // Validasi ukuran file (maksimal 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('Ukuran file terlalu besar. Maksimal 5MB.')
      return
    }

    setSelectedFile(file)
    
    // Buat preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    // Jika sedang edit, kembalikan ke gambar asli
    if (editingEvent && editingEvent.imageUrl) {
      setImagePreview(editingEvent.imageUrl)
    }
  }

  const handleSelectImage = () => {
    fileInputRef.current?.click()
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Memuat data event...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Daftar Event</h1>
          <p className="text-muted-foreground">Kelola semua event dan acara alumni</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Edit Event' : 'Tambah Event Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Event</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Jenis Event</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis event" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Tanggal & Waktu</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventType">Tipe Event</Label>
                  <Select value={formData.eventType} onValueChange={(value: 'ONLINE' | 'OFFLINE') => setFormData({ ...formData, eventType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OFFLINE">Offline (Tatap Muka)</SelectItem>
                      <SelectItem value="ONLINE">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {formData.eventType === 'ONLINE' && (
                <div className="space-y-2">
                  <Label htmlFor="onlineLink">Link Online (Zoom, YouTube, dll)</Label>
                  <Input
                    id="onlineLink"
                    value={formData.onlineLink}
                    onChange={(e) => setFormData({ ...formData, onlineLink: e.target.value })}
                    placeholder="https://zoom.us/j/... atau https://youtube.com/..."
                    required={formData.eventType === 'ONLINE'}
                  />
                </div>
              )}
              
              {formData.eventType === 'OFFLINE' && (
                <div className="space-y-2">
                  <Label htmlFor="location">Lokasi</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Lokasi event"
                    required={formData.eventType === 'OFFLINE'}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Maksimal Peserta</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    placeholder="Kosongkan jika tidak terbatas"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'DRAFT' | 'PUBLISHED') => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Gambar Event</Label>
                <div className="space-y-3">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {/* Image preview */}
                  {imagePreview && (
                    <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={handleRemoveImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {selectedFile && (
                        <div className="absolute bottom-2 left-2">
                          <Badge variant="secondary">File baru dipilih</Badge>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Upload button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSelectImage}
                    disabled={uploadingImage}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadingImage ? 'Mengupload...' : imagePreview ? 'Ganti Gambar' : 'Pilih Gambar'}
                  </Button>
                  
                  <p className="text-sm text-muted-foreground">
                    Format: JPEG, JPG, PNG, WebP. Maksimal 5MB.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={uploadingImage}>
                  {uploadingImage ? 'Mengupload...' : editingEvent ? 'Perbarui' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            {event.imageUrl && (
              <div className="relative h-48">
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {event.description.length > 100
                      ? `${event.description.substring(0, 100)}...`
                      : event.description}
                  </CardDescription>
                </div>
                <Badge variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                  {event.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {formatDate(event.date)}
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    {(event as any).eventType === 'ONLINE' ? 'Online' : 'Offline'}
                  </Badge>
                  {(event as any).eventType === 'ONLINE' && (event as any).onlineLink ? (
                    <a 
                      href={(event as any).onlineLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                      Link Event
                    </a>
                  ) : (
                    event.location && (
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        {event.location}
                      </div>
                    )
                  )}
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  {event._count?.registrations || 0} peserta
                  {event.maxParticipants && ` / ${event.maxParticipants} max`}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(event.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/dashboard/events/${event.id}/fields`}>
                    <Button size="sm" variant="outline">
                      <Settings className="mr-1 h-4 w-4" />
                      Fields
                    </Button>
                  </Link>
                  <Link href={`/dashboard/events/${event.id}/participants`}>
                    <Button size="sm" variant="outline">
                      <Users className="mr-1 h-4 w-4" />
                      Peserta
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Belum ada event</h3>
          <p className="text-muted-foreground">Mulai dengan membuat event pertama Anda.</p>
        </div>
      )}
    </div>
  )
}