'use client'

import { useState, useEffect } from 'react'
import { 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { useToast } from '@/components/ui/use-toast'
import EventRegistrationForm from './event-registration-form'

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

interface EventFormField {
  id: string
  label: string
  type: 'TEXT' | 'TEXTAREA' | 'SELECT' | 'CHECKBOX' | 'RADIO' | 'EMAIL' | 'PHONE' | 'NUMBER' | 'DATE'
  required: boolean
  options: string[] | null
}

interface EventDetailModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
}

export default function EventDetailModal({ event, isOpen, onClose }: EventDetailModalProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [view, setView] = useState<'details' | 'form'>('details')
  const [registrationFields, setRegistrationFields] = useState<EventFormField[]>([])
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  useEffect(() => {
    if (!isOpen) {
      // Reset view when modal is closed
      setTimeout(() => setView('details'), 300)
    }
  }, [isOpen])

  useEffect(() => {
    if (!event || !isOpen) return
    // Cek status registrasi event
    const alumniToken = localStorage.getItem('alumni_token')
    fetch(`/api/events/${event.id}/registrations/check`, {
      headers: { Authorization: `Bearer ${alumniToken}` }
    })
      .then(res => res.ok ? res.json() : { isRegistered: false })
      .then(data => setIsRegistered(!!data.isRegistered))
      .catch(() => setIsRegistered(false))
  }, [event, isOpen])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getEventStatus = (event: Event) => {
    const now = new Date()
    const eventDate = new Date(event.date)
    if (event.status !== 'PUBLISHED') return { label: 'Draft', variant: 'secondary', className: 'bg-gray-200 text-gray-700' }
    if (eventDate > now) return { label: 'Akan Datang', variant: 'default', className: 'bg-blue-100 text-blue-800' }
    return { label: 'Selesai', variant: 'outline', className: 'bg-gray-100 text-gray-600' }
  }

  const handleRegister = async () => {
    if (!event) return
    setIsRegistering(true)

    try {
      const res = await fetch(`/api/events/${event.id}/fields`)
      if (!res.ok) {
        throw new Error('Gagal memuat form pendaftaran.')
      }
      const fields = await res.json()

      if (fields && fields.length > 0) {
        setRegistrationFields(fields)
        setView('form')
      } else {
        // No custom fields, register directly
        const registerResponse = await fetch(`/api/events/${event.id}/registrations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('alumni_token')}`
          },
        })
        if (!registerResponse.ok) {
          const errorData = await registerResponse.json()
          throw new Error(errorData.message || 'Pendaftaran Gagal')
        }
        toast({
          title: 'Pendaftaran Berhasil!',
          description: `Anda berhasil mendaftar untuk event "${event.title}".`,
          className: 'bg-green-600 text-white'
        })
        onClose()
      }
    } catch (error: any) {
      toast({
        title: 'Terjadi Kesalahan',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsRegistering(false)
    }
  }

  if (!event) return null

  const eventStatus = getEventStatus(event)

  const detailViewContent = (
    <>
      <div className="space-y-4">
        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-gray-700">Tanggal</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">{formatDate(event.date)}</p>
            <p className="text-xs text-gray-500">{formatTime(event.date)}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-gray-700">Peserta</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{event._count.registrations}</p>
            <p className="text-xs text-gray-500">terdaftar</p>
          </div>
        </div>

        {event.location && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-gray-700">Lokasi</span>
            </div>
            <p className="text-sm text-gray-900">{event.location}</p>
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">Deskripsi Event</h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
              {event.description}
            </p>
          </div>
        </div>

        {/* Event Details */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-3">Informasi Event</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Tipe Event</span>
              <span className="text-sm font-medium text-gray-900">{event.eventType}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Kategori</span>
              <span className="text-sm font-medium text-gray-900">{event.type}</span>
            </div>
          </div>
        </div>

        {isRegistered && (
          <div className="mb-4">
            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Berpartisipasi</span>
          </div>
        )}

        {/* Tombol Daftar Event */}
        {!isRegistered && (
          <Button onClick={handleRegister} disabled={isRegistering} className="w-full mt-4">
            {isRegistering ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            Daftar Event
          </Button>
        )}
      </div>
    </>
  )

  const renderDesktopView = () => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogTitle className="sr-only">Detail Event - {event.title}</DialogTitle>
        <DialogDescription className="sr-only">
          {view === 'form' ? `Form pendaftaran untuk event ${event.title}` : `Detail lengkap event ${event.title}`}
        </DialogDescription>
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={view === 'form' ? () => setView('details') : onClose}>
                  <X className="w-5 h-5" />
                </Button>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
                  <p className="text-sm text-gray-600">{view === 'form' ? 'Form Pendaftaran' : 'Detail Event'}</p>
                </div>
              </div>
              <Badge variant={eventStatus.variant as any} className={eventStatus.className}>
                {eventStatus.label}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {view === 'details' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Image */}
                <div className="space-y-4">
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {event.imageUrl ? (
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                        <Calendar className="w-16 h-16 text-green-400" />
                      </div>
                    )}
                  </div>

                  {/* Event Info Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-700">Tanggal</span>
                        </div>
                        <p className="text-sm text-gray-900">{formatDate(event.date)}</p>
                        <p className="text-xs text-gray-500">{formatTime(event.date)}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-700">Peserta</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{event._count.registrations}</p>
                        <p className="text-xs text-gray-500">terdaftar</p>
                      </CardContent>
                    </Card>
                  </div>

                  {event.location && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-700">Lokasi</span>
                        </div>
                        <p className="text-sm text-gray-900">{event.location}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right Column - Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Deskripsi Event</h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Event</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Tipe Event</span>
                        <span className="text-sm font-medium text-gray-900">{event.eventType}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Kategori</span>
                        <span className="text-sm font-medium text-gray-900">{event.type}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">Status</span>
                        <Badge variant={eventStatus.variant as any} className={eventStatus.className}>
                          {eventStatus.label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleRegister}
                      disabled={isRegistering}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memuat...
                        </>
                      ) : "Daftar Event"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <EventRegistrationForm
                event={event}
                fields={registrationFields}
                onBack={() => setView('details')}
                onSuccess={onClose}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  const renderMobileView = () => (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DialogTitle className="sr-only">
          {view === 'form' ? `Form Pendaftaran - ${event.title}` : `Detail Event - ${event.title}`}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {view === 'form' ? `Form pendaftaran untuk event ${event.title}` : `Detail lengkap event ${event.title}`}
        </DialogDescription>
        <div className="max-h-[90vh] overflow-y-auto">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 my-4" />
          
          {view === 'details' ? (
            <div className="p-4 pt-0">
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
                {event.imageUrl ? (
                  <img 
                    src={event.imageUrl} 
                    alt={event.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                    <Calendar className="w-12 h-12 text-green-400" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge variant={eventStatus.variant as any} className={eventStatus.className}>
                    {eventStatus.label}
                  </Badge>
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h2>
              <p className="text-sm text-gray-500 mb-4">Detail Event</p>
              
              {detailViewContent}
            </div>
          ) : (
            <EventRegistrationForm
              event={event}
              fields={registrationFields}
              onBack={() => setView('details')}
              onSuccess={onClose}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )

  return isMobile ? renderMobileView() : renderDesktopView()
} 