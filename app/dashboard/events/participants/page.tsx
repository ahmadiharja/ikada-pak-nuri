'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import { Search, Filter, Users, Calendar, MapPin, Phone, Mail, CheckCircle, XCircle, Clock, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';

interface EventParticipant {
  id: string;
  status: 'REGISTERED' | 'CONFIRMED' | 'ATTENDED' | 'CANCELLED' | 'NO_SHOW';
  paymentStatus: 'NOT_REQUIRED' | 'PENDING' | 'PAID' | 'FAILED';
  registeredAt: string;
  notes?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  event: {
    id: string;
    title: string;
    startDate: string;
    endDate?: string;
    location?: string;
  };
  alumni: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    angkatan?: number;
  };
  syubiyah: {
    id: string;
    name: string;
  };
}

interface Event {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  location?: string;
}

export default function EventParticipantsPage() {
  const { data: session } = useSession();
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedParticipant, setSelectedParticipant] = useState<EventParticipant | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    registered: 0,
    confirmed: 0,
    attended: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchParticipants();
    fetchEvents();
  }, [currentPage, searchTerm, selectedEvent, selectedStatus, selectedPaymentStatus]);

  const fetchParticipants = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedEvent && selectedEvent !== 'all' && { eventId: selectedEvent }),
        ...(selectedStatus && selectedStatus !== 'all' && { status: selectedStatus })
      });
      
      const response = await fetch(`/api/events/participants?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setParticipants(data.participants);
        setTotalPages(data.pagination.totalPages);
        
        // Calculate stats
        const allParticipants = data.participants;
        setStats({
          total: allParticipants.length,
          registered: allParticipants.filter((p: EventParticipant) => p.status === 'REGISTERED').length,
          confirmed: allParticipants.filter((p: EventParticipant) => p.status === 'CONFIRMED').length,
          attended: allParticipants.filter((p: EventParticipant) => p.status === 'ATTENDED').length,
          cancelled: allParticipants.filter((p: EventParticipant) => p.status === 'CANCELLED').length
        });
      } else {
        toast.error(data.error || 'Failed to fetch participants');
      }
    } catch (error) {
      toast.error('Failed to fetch participants');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?limit=100');
      const data = await response.json();
      
      if (response.ok) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const updateParticipantStatus = async (participantId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/events/participants/${participantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Participant status updated successfully');
        fetchParticipants();
      } else {
        toast.error(data.error || 'Failed to update participant status');
      }
    } catch (error) {
      toast.error('Failed to update participant status');
    }
  };

  const exportParticipants = async () => {
    try {
      const params = new URLSearchParams({
        ...(selectedEvent && { eventId: selectedEvent }),
        ...(selectedStatus && { status: selectedStatus }),
        format: 'csv'
      });
      
      const response = await fetch(`/api/events/participants/export?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `event-participants-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Participants exported successfully');
      } else {
        toast.error('Failed to export participants');
      }
    } catch (error) {
      toast.error('Failed to export participants');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REGISTERED': return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'ATTENDED': return 'bg-emerald-100 text-emerald-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'NO_SHOW': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'NOT_REQUIRED': return 'bg-gray-100 text-gray-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'ATTENDED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
      case 'NO_SHOW':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
          <h1 className="text-3xl font-bold">Peserta Event</h1>
          <p className="text-gray-600">Kelola pendaftaran dan kehadiran peserta event</p>
        </div>
        <Button onClick={exportParticipants} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Peserta</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terdaftar</p>
                <p className="text-2xl font-bold text-blue-600">{stats.registered}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dikonfirmasi</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hadir</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.attended}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dibatalkan</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari peserta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Event</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status Peserta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="REGISTERED">Terdaftar</SelectItem>
                <SelectItem value="CONFIRMED">Dikonfirmasi</SelectItem>
                <SelectItem value="ATTENDED">Hadir</SelectItem>
                <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                <SelectItem value="NO_SHOW">Tidak Hadir</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status Pembayaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Pembayaran</SelectItem>
                <SelectItem value="NOT_REQUIRED">Tidak Diperlukan</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Lunas</SelectItem>
                <SelectItem value="FAILED">Gagal</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedEvent('all');
        setSelectedStatus('all');
        setSelectedPaymentStatus('all');
                setCurrentPage(1);
              }}
            >
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Participants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Peserta</CardTitle>
          <CardDescription>
            Menampilkan {participants.length} peserta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Peserta</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Syubiyah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pembayaran</TableHead>
                  <TableHead>Tanggal Daftar</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            <AvatarInitials name={participant.alumni.name} />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{participant.alumni.name}</div>
                          <div className="text-sm text-gray-500">
                            {participant.alumni.email}
                          </div>
                          {participant.alumni.angkatan && (
                            <div className="text-xs text-gray-400">
                              Angkatan {participant.alumni.angkatan}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium">{participant.event.title}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(participant.event.startDate), 'dd MMM yyyy', { locale: id })}
                        </div>
                        {participant.event.location && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {participant.event.location}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline">
                        {participant.syubiyah.name}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={participant.status}
                          onValueChange={(value) => updateParticipantStatus(participant.id, value)}
                        >
                          <SelectTrigger className="w-auto">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(participant.status)}
                              <Badge className={getStatusColor(participant.status)}>
                                {participant.status}
                              </Badge>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="REGISTERED">Terdaftar</SelectItem>
                            <SelectItem value="CONFIRMED">Dikonfirmasi</SelectItem>
                            <SelectItem value="ATTENDED">Hadir</SelectItem>
                            <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                            <SelectItem value="NO_SHOW">Tidak Hadir</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={getPaymentStatusColor(participant.paymentStatus)}>
                        {participant.paymentStatus === 'NOT_REQUIRED' && 'Gratis'}
                        {participant.paymentStatus === 'PENDING' && 'Pending'}
                        {participant.paymentStatus === 'PAID' && 'Lunas'}
                        {participant.paymentStatus === 'FAILED' && 'Gagal'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(participant.registeredAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedParticipant(participant);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
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

      {/* Participant Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Peserta</DialogTitle>
            <DialogDescription>
              Informasi lengkap peserta event
            </DialogDescription>
          </DialogHeader>
          
          {selectedParticipant && (
            <div className="space-y-6">
              {/* Participant Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Informasi Peserta</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{selectedParticipant.alumni.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{selectedParticipant.alumni.email}</span>
                    </div>
                    {selectedParticipant.alumni.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedParticipant.alumni.phone}</span>
                      </div>
                    )}
                    {selectedParticipant.alumni.angkatan && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Angkatan:</span>
                        <span>{selectedParticipant.alumni.angkatan}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Syubiyah:</span>
                      <Badge variant="outline">{selectedParticipant.syubiyah.name}</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Informasi Event</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{selectedParticipant.event.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>
                        {format(new Date(selectedParticipant.event.startDate), 'dd MMM yyyy, HH:mm', { locale: id })}
                        {selectedParticipant.event.endDate && (
                          <span> - {format(new Date(selectedParticipant.event.endDate), 'dd MMM yyyy, HH:mm', { locale: id })}</span>
                        )}
                      </span>
                    </div>
                    {selectedParticipant.event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{selectedParticipant.event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Registration Info */}
              <div>
                <h3 className="font-semibold mb-3">Informasi Pendaftaran</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Status Peserta</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedParticipant.status)}>
                        {selectedParticipant.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Status Pembayaran</Label>
                    <div className="mt-1">
                      <Badge className={getPaymentStatusColor(selectedParticipant.paymentStatus)}>
                        {selectedParticipant.paymentStatus === 'NOT_REQUIRED' && 'Gratis'}
                        {selectedParticipant.paymentStatus === 'PENDING' && 'Pending'}
                        {selectedParticipant.paymentStatus === 'PAID' && 'Lunas'}
                        {selectedParticipant.paymentStatus === 'FAILED' && 'Gagal'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Tanggal Pendaftaran</Label>
                    <div className="mt-1 text-sm">
                      {format(new Date(selectedParticipant.registeredAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Emergency Contact */}
              {(selectedParticipant.emergencyContact || selectedParticipant.emergencyPhone) && (
                <div>
                  <h3 className="font-semibold mb-3">Kontak Darurat</h3>
                  <div className="space-y-2">
                    {selectedParticipant.emergencyContact && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{selectedParticipant.emergencyContact}</span>
                      </div>
                    )}
                    {selectedParticipant.emergencyPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedParticipant.emergencyPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Notes */}
              {selectedParticipant.notes && (
                <div>
                  <h3 className="font-semibold mb-3">Catatan</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">{selectedParticipant.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button onClick={() => setIsDetailModalOpen(false)}>
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}