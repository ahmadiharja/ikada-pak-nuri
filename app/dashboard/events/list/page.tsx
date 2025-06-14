'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Calendar, MapPin, Users, Clock, Plus, Search, Filter, Edit, Trash2, Eye, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';

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
  eventType: 'SINGLE' | 'RECURRING';
  recurrencePattern?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  visibility: 'ALL_SYUBIYAH' | 'SPECIFIC_SYUBIYAH';
  targetSyubiyahIds: string[];
  categoryId?: string;
  organizerId: string;
  registrationFee?: number;
  isOnline: boolean;
  onlineLink?: string;
  requirements: string[];
  benefits: string[];
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  createdAt: string;
  updatedAt: string;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
    color: string;
  };
  participantCount: number;
  confirmedParticipants: number;
  attendedParticipants: number;
  sessionCount: number;
}

interface EventCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
}

interface Syubiyah {
  id: string;
  name: string;
}

export default function EventListPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [syubiyahs, setSyubiyahs] = useState<Syubiyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [selectedVisibility, setSelectedVisibility] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    excerpt: '',
    imageUrl: '',
    location: '',
    locationDetail: '',
    startDate: '',
    endDate: '',
    registrationStart: '',
    registrationEnd: '',
    maxParticipants: '',
    eventType: 'SINGLE' as 'SINGLE' | 'RECURRING',
    recurrencePattern: '',
    status: 'PENDING' as 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED',
    visibility: 'ALL_SYUBIYAH' as 'ALL_SYUBIYAH' | 'SPECIFIC_SYUBIYAH',
    targetSyubiyahIds: [] as string[],
    categoryId: '',
    registrationFee: '',
    isOnline: false,
    onlineLink: '',
    requirements: [] as string[],
    benefits: [] as string[],
    contactPerson: '',
    contactPhone: '',
    contactEmail: ''
  });
  
  const [newRequirement, setNewRequirement] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  useEffect(() => {
    fetchEvents();
    fetchCategories();
    fetchSyubiyahs();
  }, [currentPage, searchTerm, selectedCategory, selectedStatus, selectedEventType, selectedVisibility]);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && selectedCategory !== 'all' && selectedCategory !== 'none' && { categoryId: selectedCategory }),
        ...(selectedStatus && selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedEventType && selectedEventType !== 'all' && { eventType: selectedEventType }),
        ...(selectedVisibility && selectedVisibility !== 'all' && { visibility: selectedVisibility })
      });
      
      const response = await fetch(`/api/events?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setEvents(data.events);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast.error(data.error || 'Failed to fetch events');
      }
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/events/categories');
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchSyubiyahs = async () => {
    try {
      const response = await fetch('/api/syubiyah');
      const data = await response.json();
      
      if (response.ok) {
        setSyubiyahs(data.syubiyahs || []);
      }
    } catch (error) {
      console.error('Failed to fetch syubiyahs:', error);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
          registrationFee: formData.registrationFee ? parseFloat(formData.registrationFee) : null
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Event created successfully');
        setIsCreateModalOpen(false);
        resetForm();
        fetchEvents();
      } else {
        toast.error(data.error || 'Failed to create event');
      }
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  const handleEditEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
          registrationFee: formData.registrationFee ? parseFloat(formData.registrationFee) : null
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Event updated successfully');
        setIsEditModalOpen(false);
        setSelectedEvent(null);
        resetForm();
        fetchEvents();
      } else {
        toast.error(data.error || 'Failed to update event');
      }
    } catch (error) {
      toast.error('Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Event deleted successfully');
        fetchEvents();
      } else {
        toast.error(data.error || 'Failed to delete event');
      }
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      excerpt: '',
      imageUrl: '',
      location: '',
      locationDetail: '',
      startDate: '',
      endDate: '',
      registrationStart: '',
      registrationEnd: '',
      maxParticipants: '',
      eventType: 'SINGLE',
      recurrencePattern: '',
      status: 'PENDING',
      visibility: 'ALL_SYUBIYAH',
      targetSyubiyahIds: [],
      categoryId: '',
      registrationFee: '',
      isOnline: false,
      onlineLink: '',
      requirements: [],
      benefits: [],
      contactPerson: '',
      contactPhone: '',
      contactEmail: ''
    });
    setNewRequirement('');
    setNewBenefit('');
  };

  const openEditModal = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      excerpt: event.excerpt || '',
      imageUrl: event.imageUrl || '',
      location: event.location || '',
      locationDetail: event.locationDetail || '',
      startDate: event.startDate ? format(new Date(event.startDate), 'yyyy-MM-dd\'T\'HH:mm') : '',
      endDate: event.endDate ? format(new Date(event.endDate), 'yyyy-MM-dd\'T\'HH:mm') : '',
      registrationStart: event.registrationStart ? format(new Date(event.registrationStart), 'yyyy-MM-dd\'T\'HH:mm') : '',
      registrationEnd: event.registrationEnd ? format(new Date(event.registrationEnd), 'yyyy-MM-dd\'T\'HH:mm') : '',
      maxParticipants: event.maxParticipants?.toString() || '',
      eventType: event.eventType,
      recurrencePattern: event.recurrencePattern || '',
      status: event.status,
      visibility: event.visibility,
      targetSyubiyahIds: event.targetSyubiyahIds,
      categoryId: event.categoryId || '',
      registrationFee: event.registrationFee?.toString() || '',
      isOnline: event.isOnline,
      onlineLink: event.onlineLink || '',
      requirements: event.requirements,
      benefits: event.benefits,
      contactPerson: event.contactPerson || '',
      contactPhone: event.contactPhone || '',
      contactEmail: event.contactEmail || ''
    });
    setIsEditModalOpen(true);
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'SINGLE': return 'bg-blue-100 text-blue-800';
      case 'RECURRING': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Daftar Event</h1>
          <p className="text-gray-600">Kelola event dan acara organisasi</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Buat Event Baru
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
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
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedEventType} onValueChange={setSelectedEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipe Event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="SINGLE">Sekali</SelectItem>
                <SelectItem value="RECURRING">Berulang</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedVisibility} onValueChange={setSelectedVisibility}>
              <SelectTrigger>
                <SelectValue placeholder="Visibilitas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Visibilitas</SelectItem>
                <SelectItem value="ALL_SYUBIYAH">Semua Syubiyah</SelectItem>
                <SelectItem value="SPECIFIC_SYUBIYAH">Syubiyah Tertentu</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSelectedEventType('all');
                setSelectedVisibility('all');
                setCurrentPage(1);
              }}
            >
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {event.excerpt || event.description}
                  </CardDescription>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(event)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(event.startDate), 'dd MMM yyyy, HH:mm', { locale: id })}
                  {event.endDate && (
                    <span> - {format(new Date(event.endDate), 'dd MMM yyyy, HH:mm', { locale: id })}</span>
                  )}
                </div>
                
                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  {event.participantCount} peserta
                  {event.maxParticipants && ` / ${event.maxParticipants} max`}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                  <Badge className={getEventTypeColor(event.eventType)}>
                    {event.eventType === 'SINGLE' ? 'Sekali' : 'Berulang'}
                  </Badge>
                  {event.category && (
                    <Badge 
                      style={{ backgroundColor: event.category.color + '20', color: event.category.color }}
                    >
                      {event.category.name}
                    </Badge>
                  )}
                  {event.isOnline && (
                    <Badge variant="secondary">Online</Badge>
                  )}
                  {event.registrationFee && (
                    <Badge variant="outline">
                      Rp {event.registrationFee.toLocaleString()}
                    </Badge>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  Organizer: {event.organizer.name}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create/Edit Event Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedEvent(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateModalOpen ? 'Buat Event Baru' : 'Edit Event'}
            </DialogTitle>
            <DialogDescription>
              {isCreateModalOpen ? 'Isi form di bawah untuk membuat event baru' : 'Edit informasi event'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Informasi Dasar</h3>
              
              <div>
                <Label htmlFor="title">Judul Event *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Masukkan judul event"
                />
              </div>
              
              <div>
                <Label htmlFor="excerpt">Ringkasan</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Ringkasan singkat event"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Deskripsi *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi lengkap event"
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="imageUrl">URL Gambar</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <Label htmlFor="categoryId">Kategori</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanpa Kategori</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Date & Time */}
            <div className="space-y-4">
              <h3 className="font-semibold">Waktu & Tempat</h3>
              
              <div>
                <Label htmlFor="startDate">Tanggal & Waktu Mulai *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="endDate">Tanggal & Waktu Selesai</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="location">Lokasi</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Nama tempat/lokasi"
                />
              </div>
              
              <div>
                <Label htmlFor="locationDetail">Detail Lokasi</Label>
                <Textarea
                  id="locationDetail"
                  value={formData.locationDetail}
                  onChange={(e) => setFormData(prev => ({ ...prev, locationDetail: e.target.value }))}
                  placeholder="Alamat lengkap, petunjuk arah, dll"
                  rows={2}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isOnline"
                  checked={formData.isOnline}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isOnline: checked }))}
                />
                <Label htmlFor="isOnline">Event Online</Label>
              </div>
              
              {formData.isOnline && (
                <div>
                  <Label htmlFor="onlineLink">Link Online</Label>
                  <Input
                    id="onlineLink"
                    value={formData.onlineLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, onlineLink: e.target.value }))}
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
              )}
            </div>
            
            {/* Registration */}
            <div className="space-y-4">
              <h3 className="font-semibold">Pendaftaran</h3>
              
              <div>
                <Label htmlFor="registrationStart">Mulai Pendaftaran</Label>
                <Input
                  id="registrationStart"
                  type="datetime-local"
                  value={formData.registrationStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, registrationStart: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="registrationEnd">Tutup Pendaftaran</Label>
                <Input
                  id="registrationEnd"
                  type="datetime-local"
                  value={formData.registrationEnd}
                  onChange={(e) => setFormData(prev => ({ ...prev, registrationEnd: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="maxParticipants">Maksimal Peserta</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: e.target.value }))}
                  placeholder="Kosongkan jika tidak ada batas"
                />
              </div>
              
              <div>
                <Label htmlFor="registrationFee">Biaya Pendaftaran (Rp)</Label>
                <Input
                  id="registrationFee"
                  type="number"
                  value={formData.registrationFee}
                  onChange={(e) => setFormData(prev => ({ ...prev, registrationFee: e.target.value }))}
                  placeholder="0 untuk gratis"
                />
              </div>
              
              <div>
                <Label htmlFor="eventType">Tipe Event</Label>
                <Select value={formData.eventType} onValueChange={(value: 'SINGLE' | 'RECURRING') => setFormData(prev => ({ ...prev, eventType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">Sekali</SelectItem>
                    <SelectItem value="RECURRING">Berulang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.eventType === 'RECURRING' && (
                <div>
                  <Label htmlFor="recurrencePattern">Pola Pengulangan</Label>
                  <Input
                    id="recurrencePattern"
                    value={formData.recurrencePattern}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrencePattern: e.target.value }))}
                    placeholder="Contoh: Setiap Minggu, Setiap Bulan"
                  />
                </div>
              )}
            </div>
            
            {/* Visibility & Status */}
            <div className="space-y-4">
              <h3 className="font-semibold">Visibilitas & Status</h3>
              
              <div>
                <Label htmlFor="visibility">Visibilitas</Label>
                <Select value={formData.visibility} onValueChange={(value: 'ALL_SYUBIYAH' | 'SPECIFIC_SYUBIYAH') => setFormData(prev => ({ ...prev, visibility: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_SYUBIYAH">Semua Syubiyah</SelectItem>
                    <SelectItem value="SPECIFIC_SYUBIYAH">Syubiyah Tertentu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.visibility === 'SPECIFIC_SYUBIYAH' && (
                <div>
                  <Label>Target Syubiyah</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
                    {syubiyahs.map((syubiyah) => (
                      <div key={syubiyah.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`syubiyah-${syubiyah.id}`}
                          checked={formData.targetSyubiyahIds.includes(syubiyah.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                targetSyubiyahIds: [...prev.targetSyubiyahIds, syubiyah.id]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                targetSyubiyahIds: prev.targetSyubiyahIds.filter(id => id !== syubiyah.id)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={`syubiyah-${syubiyah.id}`} className="text-sm">
                          {syubiyah.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED') => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Kontak</h3>
              
              <div>
                <Label htmlFor="contactPerson">Nama Kontak</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="Nama person yang bisa dihubungi"
                />
              </div>
              
              <div>
                <Label htmlFor="contactPhone">Nomor Telepon</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              
              <div>
                <Label htmlFor="contactEmail">Email Kontak</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="contact@example.com"
                />
              </div>
            </div>
            
            {/* Requirements & Benefits */}
            <div className="space-y-4">
              <h3 className="font-semibold">Persyaratan & Manfaat</h3>
              
              <div>
                <Label>Persyaratan</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Tambah persyaratan"
                    onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                  />
                  <Button type="button" onClick={addRequirement} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 space-y-1">
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{req}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRequirement(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Manfaat</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    placeholder="Tambah manfaat"
                    onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                  />
                  <Button type="button" onClick={addBenefit} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 space-y-1">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{benefit}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBenefit(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedEvent(null);
                resetForm();
              }}
            >
              Batal
            </Button>
            <Button
              onClick={isCreateModalOpen ? handleCreateEvent : handleEditEvent}
              disabled={!formData.title || !formData.description || !formData.startDate}
            >
              {isCreateModalOpen ? 'Buat Event' : 'Update Event'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}