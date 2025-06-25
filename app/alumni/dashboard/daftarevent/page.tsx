"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar as CalendarIcon, MapPin, Users } from "lucide-react";
import EventDetailModal from "../event-detail-modal";

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
  _count: {
    registrations: number;
  };
}

export default function AlumniEventListPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);

  useEffect(() => {
    const alumniToken = localStorage.getItem("alumni_token");
    if (!alumniToken) {
      router.push("/alumni-login");
      return;
    }
    fetchEvents();
  }, [router]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/events?status=PUBLISHED");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
        checkRegistrations(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkRegistrations = async (events: Event[]) => {
    const alumniToken = localStorage.getItem("alumni_token");
    const ids = await Promise.all(
      events.map(ev =>
        fetch(`/api/events/${ev.id}/registrations/check`, {
          headers: { Authorization: `Bearer ${alumniToken}` }
        })
          .then(res => res.ok ? res.json() : { isRegistered: false })
          .then(data => data.isRegistered ? ev.id : null)
      )
    );
    setRegisteredEventIds(ids.filter((id): id is string => Boolean(id)));
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const closeEventModal = () => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    if (event.status !== "PUBLISHED") return { label: "Draft", variant: "secondary", className: "bg-gray-200 text-gray-700" };
    if (eventDate > now) return { label: "Akan Datang", variant: "default", className: "bg-blue-100 text-blue-800" };
    return { label: "Selesai", variant: "outline", className: "bg-gray-100 text-gray-600" };
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">Daftar Event Alumni</h2>
        {isLoading ? (
          <div>Memuat event...</div>
        ) : (
          <div className="space-y-4">
            {events.length === 0 && <div>Tidak ada event tersedia.</div>}
            {events.map(event => {
              const eventStatus = getEventStatus(event);
              const isRegistered = registeredEventIds.includes(event.id);
              return (
                <Card key={event.id} className="flex flex-row items-stretch gap-3 p-2 rounded-xl shadow-sm border border-gray-200 bg-white hover:shadow-md transition cursor-pointer" onClick={() => handleEventClick(event)}>
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.title} className="object-cover w-full h-full" />
                    ) : (
                      <CalendarIcon className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex flex-col flex-1 justify-between py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={eventStatus.variant as any} className={`text-xs px-2 py-0.5 ${eventStatus.className}`}>{eventStatus.label}</Badge>
                      {isRegistered && <Badge variant="default" className="text-xs px-2 py-0.5 bg-green-500 text-white">Berpartisipasi</Badge>}
                    </div>
                    <div className="font-bold text-base text-gray-900 line-clamp-1">{event.title}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <CalendarIcon className="w-4 h-4 text-green-500" />
                      <span>{new Date(event.date).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</span>
                    </div>
                    <div className="text-xs text-gray-600 line-clamp-2 mt-1">{event.description}</div>
                  </div>
                  {/* Icon */}
                  <div className="flex items-center pl-2">
                    <Eye className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <EventDetailModal event={selectedEvent} isOpen={isEventModalOpen} onClose={closeEventModal} />
    </div>
  );
} 