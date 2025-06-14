'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, Clock, MapPin, Users, Phone, Mail, Globe, DollarSign, CheckCircle, XCircle, AlertCircle, Search, Filter, Calendar, User, Tag } from 'lucide-react';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';
import Image from 'next/image';

interface EventCategory {
  id: string;
  name: string;
  color: string;
}

interface EventOrganizer {
  id: string;
  name: string;
  email: string;
}

interface EventSession {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  speaker?: string;
  location?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  excerpt?: string;
  imageUrl?: string;
  location?: string;
  locationDetail?: string;
  startDate: string;
  endDate?: string;
  registrationStart?: string;
  registrationEnd?: string;
  maxParticipants?: number;
  currentParticipants: number;
  eventType: 'SINGLE' | 'RECURRING';
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
  visibility: 'ALL_SYUBIYAH' | 'SPECIFIC_SYUBIYAH' | 'PUBLIC';
  registrationFee?: number;
  isOnline: boolean;
  onlineLink?: string;
  requirements: string[];
  benefits: string[];
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  category?: EventCategory;
  organizer: EventOrganizer;
  sessions: EventSession[];
  participantCount: number;
  confirmedParticipants: number;
  attendedParticipants: number;
  sessionCount: number;
}

interface EventsResponse {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<EventCategory[]>([]);

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && selectedCategory !== 'all' && { categoryId: selectedCategory }),
        ...(selectedStatus && selectedStatus !== 'all' && { status: selectedStatus }),
        visibility: 'ALL_SYUBIYAH'
      });

      const response = await fetch(`/api/events?${params}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const data: EventsResponse = await response.json();
      setEvents(data.events);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/events/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentPage, searchTerm, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PUBLISHED: { label: 'Aktif', variant: 'default' as const, icon: CheckCircle },
      PENDING: { label: 'Menunggu', variant: 'secondary' as const, icon: AlertCircle },
      DRAFT: { label: 'Draft', variant: 'outline' as const, icon: XCircle },
      ARCHIVED: { label: 'Arsip', variant: 'destructive' as const, icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const isRegistrationOpen = (event: Event) => {
    const now = new Date();
    const regStart = event.registrationStart ? new Date(event.registrationStart) : null;
    const regEnd = event.registrationEnd ? new Date(event.registrationEnd) : null;
    
    if (regStart && now < regStart) return false;
    if (regEnd && now > regEnd) return false;
    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) return false;
    
    return event.status === 'PUBLISHED';
  };

  const getAvailableSlots = (event: Event) => {
    if (!event.maxParticipants) return null;
    return event.maxParticipants - event.currentParticipants;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Navbar />
        {/* Loading State */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat acara...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 opacity-90"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-blue-900/20"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Acara & Kegiatan
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Ikuti berbagai acara dan kegiatan menarik dari IKA DAPAK NURI
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari acara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="PUBLISHED">Aktif</SelectItem>
                  <SelectItem value="PENDING">Menunggu</SelectItem>
                  <SelectItem value="ARCHIVED">Arsip</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{events.length} acara ditemukan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak ada acara</h3>
              <p className="text-gray-600">Belum ada acara yang tersedia saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <Dialog key={event.id}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 group">
                      <div className="relative overflow-hidden rounded-t-lg">
                        {event.imageUrl ? (
                          <Image
                            src={event.imageUrl}
                            alt={event.title}
                            width={400}
                            height={200}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                            <Calendar className="w-12 h-12 text-white" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          {getStatusBadge(event.status)}
                        </div>
                        {event.category && (
                          <div className="absolute top-4 right-4">
                            <Badge 
                              style={{ backgroundColor: event.category.color }}
                              className="text-white"
                            >
                              {event.category.name}
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardHeader>
                        <CardTitle className="line-clamp-2 group-hover:text-green-600 transition-colors">
                          {event.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {event.excerpt || event.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarDays className="w-4 h-4 mr-2" />
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{formatTime(event.startDate)}</span>
                          {event.endDate && (
                            <span> - {formatTime(event.endDate)}</span>
                          )}
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{event.participantCount} peserta</span>
                          </div>
                          
                          {event.maxParticipants && (
                            <div className="text-right">
                              <span className="text-green-600 font-medium">
                                {getAvailableSlots(event)} slot tersisa
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {event.registrationFee && (
                          <div className="flex items-center text-sm font-medium text-green-600">
                            <DollarSign className="w-4 h-4 mr-1" />
                            <span>Rp {event.registrationFee.toLocaleString('id-ID')}</span>
                          </div>
                        )}
                      </CardContent>
                      
                      <CardFooter>
                        <Button 
                          className="w-full"
                          disabled={!isRegistrationOpen(event)}
                        >
                          {isRegistrationOpen(event) ? 'Lihat Detail' : 'Pendaftaran Ditutup'}
                        </Button>
                      </CardFooter>
                    </Card>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">{event.title}</DialogTitle>
                      <DialogDescription>
                        Informasi lengkap tentang acara ini
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Event Image */}
                      {event.imageUrl && (
                        <div className="relative w-full h-64 rounded-lg overflow-hidden">
                          <Image
                            src={event.imageUrl}
                            alt={event.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Event Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Informasi Acara</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center">
                                <CalendarDays className="w-4 h-4 mr-2 text-gray-500" />
                                <span>{formatDate(event.startDate)}</span>
                              </div>
                              
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                <span>{formatTime(event.startDate)}</span>
                                {event.endDate && (
                                  <span> - {formatTime(event.endDate)}</span>
                                )}
                              </div>
                              
                              {event.location && (
                                <div className="flex items-start">
                                  <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                                  <div>
                                    <div>{event.location}</div>
                                    {event.locationDetail && (
                                      <div className="text-gray-600 text-xs mt-1">
                                        {event.locationDetail}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {event.isOnline && (
                                <div className="flex items-center">
                                  <Globe className="w-4 h-4 mr-2 text-gray-500" />
                                  <span>Acara Online</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Registration Info */}
                          <div>
                            <h4 className="font-semibold mb-2">Pendaftaran</h4>
                            <div className="space-y-2 text-sm">
                              {event.registrationStart && (
                                <div>
                                  <span className="text-gray-600">Mulai: </span>
                                  <span>{formatDate(event.registrationStart)}</span>
                                </div>
                              )}
                              
                              {event.registrationEnd && (
                                <div>
                                  <span className="text-gray-600">Berakhir: </span>
                                  <span>{formatDate(event.registrationEnd)}</span>
                                </div>
                              )}
                              
                              {event.maxParticipants && (
                                <div>
                                  <span className="text-gray-600">Kuota: </span>
                                  <span>{event.maxParticipants} peserta</span>
                                </div>
                              )}
                              
                              {event.registrationFee && (
                                <div>
                                  <span className="text-gray-600">Biaya: </span>
                                  <span className="font-medium text-green-600">
                                    Rp {event.registrationFee.toLocaleString('id-ID')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Organizer Info */}
                          <div>
                            <h4 className="font-semibold mb-2">Penyelenggara</h4>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback>
                                  {event.organizer.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{event.organizer.name}</div>
                                <div className="text-sm text-gray-600">{event.organizer.email}</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Contact Info */}
                          {(event.contactPerson || event.contactPhone || event.contactEmail) && (
                            <div>
                              <h4 className="font-semibold mb-2">Kontak</h4>
                              <div className="space-y-2 text-sm">
                                {event.contactPerson && (
                                  <div className="flex items-center">
                                    <User className="w-4 h-4 mr-2 text-gray-500" />
                                    <span>{event.contactPerson}</span>
                                  </div>
                                )}
                                
                                {event.contactPhone && (
                                  <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                    <span>{event.contactPhone}</span>
                                  </div>
                                )}
                                
                                {event.contactEmail && (
                                  <div className="flex items-center">
                                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                    <span>{event.contactEmail}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Stats */}
                          <div>
                            <h4 className="font-semibold mb-2">Statistik</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="font-bold text-lg">{event.participantCount}</div>
                                <div className="text-gray-600">Total Peserta</div>
                              </div>
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="font-bold text-lg text-green-600">{event.confirmedParticipants}</div>
                                <div className="text-gray-600">Terkonfirmasi</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <div>
                        <h4 className="font-semibold mb-2">Deskripsi</h4>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                        </div>
                      </div>
                      
                      {/* Requirements & Benefits */}
                      {(event.requirements.length > 0 || event.benefits.length > 0) && (
                        <Tabs defaultValue="requirements" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="requirements">Persyaratan</TabsTrigger>
                            <TabsTrigger value="benefits">Manfaat</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="requirements" className="mt-4">
                            {event.requirements.length > 0 ? (
                              <ul className="space-y-2">
                                {event.requirements.map((req, index) => (
                                  <li key={index} className="flex items-start">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{req}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500 text-sm">Tidak ada persyaratan khusus</p>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="benefits" className="mt-4">
                            {event.benefits.length > 0 ? (
                              <ul className="space-y-2">
                                {event.benefits.map((benefit, index) => (
                                  <li key={index} className="flex items-start">
                                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500 text-sm">Informasi manfaat belum tersedia</p>
                            )}
                          </TabsContent>
                        </Tabs>
                      )}
                      
                      {/* Sessions */}
                      {event.sessions.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-4">Sesi Acara</h4>
                          <div className="space-y-3">
                            {event.sessions.map((session, index) => (
                              <div key={session.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="font-medium">{session.title}</h5>
                                  <Badge variant="outline">Sesi {index + 1}</Badge>
                                </div>
                                
                                {session.description && (
                                  <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                                )}
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                                  </div>
                                  
                                  {session.speaker && (
                                    <div className="flex items-center">
                                      <User className="w-4 h-4 mr-2" />
                                      <span>{session.speaker}</span>
                                    </div>
                                  )}
                                  
                                  {session.location && (
                                    <div className="flex items-center">
                                      <MapPin className="w-4 h-4 mr-2" />
                                      <span>{session.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <Separator />
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          className="flex-1"
                          disabled={!isRegistrationOpen(event)}
                        >
                          {isRegistrationOpen(event) ? 'Daftar Sekarang' : 'Pendaftaran Ditutup'}
                        </Button>
                        
                        {event.isOnline && event.onlineLink && (
                          <Button variant="outline" asChild>
                            <a href={event.onlineLink} target="_blank" rel="noopener noreferrer">
                              <Globe className="w-4 h-4 mr-2" />
                              Link Online
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Sebelumnya
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}