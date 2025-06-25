"use client"

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Users, Clock, ChevronLeft, ChevronRight, Search, Filter, Eye, ExternalLink, X } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  eventType: string;
  location?: string;
  imageUrl?: string;
  status: string;
  maxParticipants?: number;
  _count?: {
    registrations: number;
  };
  onlineLink?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events');
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setEvents(data);
          setSelectedEvent(data[0]);
        } else {
          setEvents([]);
        }
      } catch (error) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'Terbuka';
      case 'DRAFT':
        return 'Draft';
      case 'CANCELLED':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE, dd MMMM yyyy', { locale: id });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm', { locale: id });
    } catch {
      return '';
    }
  };

  const formatShortDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM', { locale: id });
    } catch {
      return dateString;
    }
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    if (window.innerWidth < 1024) {
      // Mobile: show bottom sheet
      setShowEventDetail(true);
    } else {
      // Desktop: show modal
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleBackToList = () => {
    setShowEventDetail(false);
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "ALL" || event.eventType === filterType;
    return matchesSearch && matchesFilter;
  });

  // Mobile Bottom Sheet Component
  const MobileBottomSheet = () => {
    const [activeTab, setActiveTab] = useState("info");
    const [isClosing, setIsClosing] = useState(false);
    const [isOpening, setIsOpening] = useState(true);
    
    // Prevent body scroll when modal is open
    useEffect(() => {
      document.body.style.overflow = 'hidden';
      
      // Start opening animation
      const timer = setTimeout(() => {
        setIsOpening(false);
      }, 10); // Small delay to ensure initial state is applied
      
      return () => {
        document.body.style.overflow = 'unset';
        clearTimeout(timer);
      };
    }, []);

    const handleClose = () => {
      setIsClosing(true);
      setTimeout(() => {
        handleBackToList();
      }, 300); // Match the animation duration
    };

    return (
      <div 
        className={`md:hidden fixed inset-0 z-[9999] bg-black/50 flex items-end transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : isOpening ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <div 
          className={`bg-white rounded-t-3xl w-full h-[80vh] flex flex-col transition-transform duration-300 ease-out ${
            isClosing ? 'translate-y-full' : isOpening ? 'translate-y-full' : 'translate-y-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>
          
          {/* Header */}
          <div className="px-4 pb-4 border-b flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={selectedEvent?.imageUrl || '/placeholder.jpg'}
                  alt={selectedEvent?.title || ''}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold truncate">{selectedEvent?.title}</h2>
                <p className="text-sm text-gray-600 truncate">{formatShortDate(selectedEvent?.date || '')}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{formatTime(selectedEvent?.date || '')}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose} className="flex-shrink-0">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Custom Tabs */}
          <div className="flex-shrink-0 border-b">
            <div className="grid grid-cols-2 h-12">
              {[
                { id: "info", label: "Informasi" },
                { id: "detail", label: "Detail" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab(tab.id);
                  }}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Content - Scrollable Area */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "info" && (
              <div className="p-4 space-y-4">
                {/* Status Badge */}
                <div className="flex justify-center">
                  <Badge
                    variant="secondary"
                    className={`text-sm ${getStatusColor(selectedEvent?.status || '')}`}
                  >
                    {getStatusText(selectedEvent?.status || '')}
                  </Badge>
                </div>

                {/* Date and Time */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-sm">Tanggal & Waktu</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tanggal:</span>
                        <span className="font-medium">{formatDate(selectedEvent?.date || '')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Waktu:</span>
                        <span className="font-medium">{formatTime(selectedEvent?.date || '')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {selectedEvent?.eventType === 'ONLINE' ? (
                        <span className="inline-flex items-center gap-1 text-blue-600 font-semibold text-sm">
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                            <path d="M17 10.5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5l4 4v-11l-4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Online
                        </span>
                      ) : (
                        <MapPin className="w-5 h-5 text-gray-500" />
                      )}
                      <span className="font-medium text-sm">Lokasi</span>
                    </div>
                    {selectedEvent?.eventType === 'ONLINE' ? (
                      selectedEvent?.onlineLink ? (
                        <a href={selectedEvent.onlineLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all text-sm">
                          {selectedEvent.onlineLink}
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm">Link belum tersedia</span>
                      )
                    ) : (
                      <p className="text-gray-700 text-sm">{selectedEvent?.location || '-'}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Participants */}
                <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-sm">Peserta</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Terdaftar:</span>
                        <span className="font-medium">{selectedEvent?._count?.registrations ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Maksimal:</span>
                        <span className="font-medium">{selectedEvent?.maxParticipants ?? '-'}</span>
                      </div>
                      {selectedEvent?.maxParticipants && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${((selectedEvent._count?.registrations ?? 0) / selectedEvent.maxParticipants) * 100}%`
                            }}
                          ></div>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
          </div>
            )}

            {activeTab === "detail" && (
              <div className="p-4 space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm mb-3">Deskripsi Event</h3>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                      {selectedEvent?.description}
                    </p>
                  </CardContent>
                </Card>
            </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Event IKADA</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 text-center">
        <div className="text-gray-500 text-xl mb-4">
          Belum ada event yang tersedia
        </div>
        <p className="text-gray-400">
          Event dan kegiatan akan ditampilkan di sini
        </p>
      </div>
    );
  }

  // Main Events List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Event IKADA</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Temukan dan ikuti berbagai event menarik dari komunitas alumni IKADA
            </p>
            
            {/* Search and Filter */}
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari event..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-300"
                />
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button
                  variant={filterType === "ALL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("ALL")}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  Semua
                </Button>
                <Button
                  variant={filterType === "ONLINE" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("ONLINE")}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  Online
                </Button>
                <Button
                  variant={filterType === "OFFLINE" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("OFFLINE")}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  Offline
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Content */}
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Daftar Event ({filteredEvents.length})
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>Filter: {filterType === "ALL" ? "Semua" : filterType}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                className="cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => handleEventSelect(event)}
              >
                <div className="relative h-48">
                      <Image
                        src={event.imageUrl || '/placeholder.jpg'}
                        alt={event.title}
                        fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge
                    variant="secondary"
                    className={`absolute top-3 right-3 text-xs ${getStatusColor(event.status)}`}
                  >
                    {getStatusText(event.status)}
                  </Badge>
                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="text-sm font-semibold">{formatShortDate(event.date)}</div>
                    <div className="text-xs opacity-90">{formatTime(event.date)}</div>
                  </div>
                    </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 leading-tight">
                        {event.title}
                      </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{event._count?.registrations ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {event.eventType === 'ONLINE' ? (
                          <span className="text-blue-600 font-medium">Online</span>
                        ) : (
                          <span className="text-gray-600">Offline</span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      Detail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="grid grid-cols-2 gap-3">
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                className="cursor-pointer overflow-hidden hover:shadow-md transition-shadow duration-300"
                onClick={() => handleEventSelect(event)}
              >
                <div className="relative aspect-square">
                  <Image
                    src={event.imageUrl || '/placeholder.jpg'}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                      <Badge
                        variant="secondary"
                    className={`absolute top-2 right-2 text-xs ${getStatusColor(event.status)}`}
                      >
                        {getStatusText(event.status)}
                      </Badge>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-2 leading-tight">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatShortDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(event.date)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="w-3 h-3" />
                      <span>{event._count?.registrations ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {event.eventType === 'ONLINE' ? (
                        <span className="text-blue-600 font-medium">Online</span>
                      ) : (
                        <span className="text-gray-600">Offline</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
                      </div>

      {/* Desktop Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Detail Event</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang event yang dipilih
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Event Image */}
              <div className="relative h-64 lg:h-full rounded-lg overflow-hidden">
                <Image
                  src={selectedEvent.imageUrl || '/placeholder.jpg'}
                  alt={selectedEvent.title}
                  fill
                  className="object-cover"
                />
                      </div>
              
              {/* Event Details */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h2 className="text-2xl font-bold leading-tight">{selectedEvent.title}</h2>
                  <Badge
                    variant="secondary"
                    className={`text-sm ${getStatusColor(selectedEvent.status)}`}
                  >
                    {getStatusText(selectedEvent.status)}
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  {/* Date & Time */}
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{formatDate(selectedEvent.date)}</div>
                      <div className="text-sm">{formatTime(selectedEvent.date)}</div>
                    </div>
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-start gap-3 text-gray-600">
                        {selectedEvent.eventType === 'ONLINE' ? (
                            <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                          <path d="M17 10.5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5l4 4v-11l-4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                              Online
                            </span>
                    ) : (
                      <MapPin className="w-5 h-5 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">Lokasi</div>
                      {selectedEvent.eventType === 'ONLINE' ? (
                        selectedEvent.onlineLink ? (
                          <a href={selectedEvent.onlineLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all text-sm">
                            {selectedEvent.onlineLink}
                          </a>
                        ) : (
                          <span className="text-gray-500 text-sm">Link belum tersedia</span>
                        )
                      ) : (
                        <span className="text-gray-700 text-sm">{selectedEvent.location || '-'}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Participants */}
                  <div className="flex items-start gap-3 text-gray-600">
                    <Users className="w-5 h-5 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">Peserta</div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Terdaftar:</span>
                          <span className="font-medium">{selectedEvent._count?.registrations ?? 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Maksimal:</span>
                          <span className="font-medium">{selectedEvent.maxParticipants ?? '-'}</span>
                        </div>
                        {selectedEvent.maxParticipants && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${((selectedEvent._count?.registrations ?? 0) / selectedEvent.maxParticipants) * 100}%`
                              }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div>
                    <h3 className="font-medium mb-2">Deskripsi Event</h3>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                      {selectedEvent.description}
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1" size="lg">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Daftar Event
                  </Button>
                  <Button variant="outline" size="lg">
                    <Eye className="w-4 h-4 mr-2" />
                    Detail
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Sheet */}
      {showEventDetail && selectedEvent && (
        <MobileBottomSheet />
      )}
    </div>
  );
} 