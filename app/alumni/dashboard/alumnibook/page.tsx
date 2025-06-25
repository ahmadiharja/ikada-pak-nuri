"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, User, GraduationCap, Briefcase, Home, Phone, Mail, MapPin, X } from "lucide-react";

interface Alumni {
  id: string;
  fullName: string;
  email: string;
  profilePhoto: string | null;
  syubiyah?: { name: string } | null;
  tahunMasuk?: number | null;
  tahunKeluar?: number | null;
  pekerjaan?: string | null;
  alamat?: string | null;
  noHp?: string | null;
}

export default function AlumniBookPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [search, setSearch] = useState("");
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const alumniToken = localStorage.getItem("alumni_token");
    if (!alumniToken) {
      router.push("/alumni-login");
      return;
    }
    fetchAlumni();
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchAlumni = async () => {
    try {
      const res = await fetch(`/api/alumni?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setAlumniList(data.alumni || []);
      }
    } catch (err) {
      // handle error
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAlumni();
  };

  const openAlumniModal = (alumni: Alumni) => {
    setSelectedAlumni(alumni);
    setModalOpen(true);
  };

  const closeAlumniModal = () => {
    setModalOpen(false);
    setSelectedAlumni(null);
  };

  // Layout
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-4">
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <Input
            placeholder="Cari nama alumni..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button type="submit" variant="outline">Cari</Button>
        </form>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alumniList.map(alumni => (
              <Card key={alumni.id} className="cursor-pointer hover:shadow-lg transition" onClick={() => openAlumniModal(alumni)}>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar>
                    {alumni.profilePhoto ? (
                      <AvatarImage src={alumni.profilePhoto} alt={alumni.fullName} />
                    ) : (
                      <AvatarFallback>{alumni.fullName?.[0]}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{alumni.fullName}</CardTitle>
                    <div className="text-xs text-gray-500">{alumni.syubiyah?.name || "-"}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1"><GraduationCap className="w-4 h-4 mr-1" /> {alumni.tahunMasuk || "-"} - {alumni.tahunKeluar || "-"}</div>
                    <div className="flex items-center gap-1"><Briefcase className="w-4 h-4 mr-1" /> {alumni.pekerjaan || "-"}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {/* Modal detail alumni */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Alumni</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="absolute right-2 top-2">
                <X className="w-5 h-5" />
              </Button>
            </DialogClose>
          </DialogHeader>
          {selectedAlumni ? (
            <div className="flex flex-col items-center gap-2">
              <Avatar className="w-20 h-20 mb-2">
                {selectedAlumni.profilePhoto ? (
                  <AvatarImage src={selectedAlumni.profilePhoto} alt={selectedAlumni.fullName} />
                ) : (
                  <AvatarFallback>{selectedAlumni.fullName?.[0]}</AvatarFallback>
                )}
              </Avatar>
              <div className="text-lg font-bold">{selectedAlumni.fullName}</div>
              <div className="text-sm text-gray-500 mb-2">{selectedAlumni.syubiyah?.name || "-"}</div>
              <div className="flex flex-col gap-1 text-sm w-full">
                <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> {selectedAlumni.tahunMasuk || "-"} - {selectedAlumni.tahunKeluar || "-"}</div>
                <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {selectedAlumni.pekerjaan || "-"}</div>
                <div className="flex items-center gap-2"><Home className="w-4 h-4" /> {selectedAlumni.alamat || "-"}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {selectedAlumni.noHp || "-"}</div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {selectedAlumni.email}</div>
              </div>
            </div>
          ) : (
            <div>Memuat detail alumni...</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 