"use client"

import React, { useEffect, useState, useMemo, Suspense } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { RegionSelector } from "@/components/ui/region-selector";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback, AvatarInitials } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Filter, X, Phone, Mail, MapPin as MapPinIcon, User, GraduationCap, Briefcase, Heart, Home, ChevronDown } from "lucide-react";
import Image from "next/image";

// Helper: generate abjad A-Z
const abjadList = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

// Helper: tahun range
const currentYear = new Date().getFullYear();
const tahunMasukList = Array.from({ length: 50 }, (_, i) => currentYear - i);
const tahunKeluarList = Array.from({ length: 50 }, (_, i) => currentYear - i);

function useQueryParam(key: string) {
  // For modal deep-linking
  const params = useSearchParams();
  return params.get(key);
}

function AlumniBookPageContent() {
  // State filter
  const [search, setSearch] = useState("");
  const [abjad, setAbjad] = useState("ALL");
  const [syubiyahId, setSyubiyahId] = useState("ALL");
  const [mustahiqId, setMustahiqId] = useState("ALL");
  const [region, setRegion] = useState({ provinsiId: "", kabupatenId: "", kecamatanId: "", desaId: "" });
  const [tahunMasuk, setTahunMasuk] = useState("ALL");
  const [tahunKeluar, setTahunKeluar] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Data
  const [alumni, setAlumni] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syubiyahList, setSyubiyahList] = useState<any[]>([]);
  const [mustahiqList, setMustahiqList] = useState<any[]>([]);
  const [selectedAlumni, setSelectedAlumni] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Separate mobile modal state
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [mobileSelectedAlumni, setMobileSelectedAlumni] = useState<any | null>(null);
  const [mobileDetailLoading, setMobileDetailLoading] = useState(false);
  const [mobileAnimationState, setMobileAnimationState] = useState<'opening' | 'open' | 'closing' | null>(null);

  // Mobile filter state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const router = useRouter();
  const modalId = useQueryParam("id");

  // Fetch syubiyah & mustahiq for filter
  useEffect(() => {
    fetch("/api/syubiyah")
      .then((res) => res.json())
      .then((data) => setSyubiyahList(data.syubiyah || []));
    fetch("/api/mustahiq")
      .then((res) => res.json())
      .then((data) => setMustahiqList(data || []));
  }, []);

  // Fetch alumni list
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      isVerified: "true",
      status: "VERIFIED",
      search,
      ...(abjad !== "ALL" && { abjad }),
      ...(syubiyahId !== "ALL" && { syubiyahId }),
      ...(mustahiqId !== "ALL" && { mustahiqId }),
      provinsiId: region.provinsiId,
      kabupatenId: region.kabupatenId,
      kecamatanId: region.kecamatanId,
      desaId: region.desaId,
      ...(tahunMasuk !== "ALL" && { tahunMasuk }),
      ...(tahunKeluar !== "ALL" && { tahunKeluar }),
      page: String(page),
      limit: String(limit),
    });
    // Remove empty params
    Array.from(params.keys()).forEach((key) => {
      if (!params.get(key)) params.delete(key);
    });
    fetch(`/api/alumni?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setAlumni(data.alumni || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [search, abjad, syubiyahId, mustahiqId, region, tahunMasuk, tahunKeluar, page, limit]);

  // Modal: fetch detail alumni by id
  useEffect(() => {
    if (modalId) {
      setDetailLoading(true);
      setModalOpen(true);
      fetch(`/api/alumni/${modalId}`)
        .then((res) => res.json())
        .then((data) => setSelectedAlumni(data))
        .finally(() => setDetailLoading(false));
    } else {
      setModalOpen(false);
      setSelectedAlumni(null);
    }
  }, [modalId]);

  // Handle open/close modal (sync with url)
  const handleOpenModal = (id: string) => {
    // Check if mobile
    if (window.innerWidth < 768) {
      setMobileDetailLoading(true);
      setMobileModalOpen(true);
      fetch(`/api/alumni/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setMobileSelectedAlumni(data);
          setMobileDetailLoading(false);
        })
        .catch(() => {
          setMobileDetailLoading(false);
        });
    } else {
      router.push(`?id=${id}`);
    }
  };

  const handleCloseModal = () => {
    router.push("/ikada/alumni");
  };

  // Separate mobile modal handlers
  const handleOpenMobileModal = (id: string) => {
    setMobileDetailLoading(true);
    setMobileModalOpen(true);
    setMobileAnimationState('opening');
    
    fetch(`/api/alumni/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setMobileSelectedAlumni(data);
        setMobileDetailLoading(false);
        // Keep modal open after data loads
        setMobileAnimationState('open');
      })
      .catch(() => {
        setMobileDetailLoading(false);
        setMobileAnimationState('open');
      });
  };

  const handleCloseMobileModal = () => {
    setMobileAnimationState('closing');
    setTimeout(() => {
      setMobileModalOpen(false);
      setMobileSelectedAlumni(null);
      setMobileAnimationState(null);
    }, 300);
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Reset filter
  const handleResetFilter = () => {
    setSearch("");
    setAbjad("ALL");
    setSyubiyahId("ALL");
    setMustahiqId("ALL");
    setRegion({ provinsiId: "", kabupatenId: "", kecamatanId: "", desaId: "" });
    setTahunMasuk("ALL");
    setTahunKeluar("ALL");
    setPage(1);
  };

  // Filter Component
  const FilterSection = () => (
    <Card className="p-4 shadow-sm border bg-background mb-6">
      <div className="flex items-center justify-between mb-4">
        <span className="font-medium text-base">Filter Alumni</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleResetFilter}>Reset</Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setMobileFilterOpen(false)}
            className="md:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Baris 1: Cari Nama, Syubiyah, Mustahiq */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Cari Nama</label>
          <Input
            placeholder="Cari nama alumni..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Syubiyah</label>
          <Select value={syubiyahId} onValueChange={(v) => { setSyubiyahId(v); setPage(1); }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua Syubiyah" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Syubiyah</SelectItem>
              {syubiyahList.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Mustahiq</label>
          <Select value={mustahiqId} onValueChange={(v) => { setMustahiqId(v); setPage(1); }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua Mustahiq" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Mustahiq</SelectItem>
              {mustahiqList.map((m: any) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Baris 2: Wilayah */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Wilayah</label>
        <RegionSelector
          provinsiId={region.provinsiId}
          kabupatenId={region.kabupatenId}
          kecamatanId={region.kecamatanId}
          desaId={region.desaId}
          onRegionChange={(r) => {
            setRegion({
              provinsiId: r.provinsiId || "",
              kabupatenId: r.kabupatenId || "",
              kecamatanId: r.kecamatanId || "",
              desaId: r.desaId || ""
            });
            setPage(1);
          }}
          showKecamatan={true}
          showDesa={true}
        />
      </div>
      
      {/* Alphabet Filter */}
      <div className="flex flex-wrap gap-2">
        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map((letter) => (
          <Button
            key={letter}
            variant={abjad === letter ? "default" : "outline"}
            size="sm"
            className="w-8 h-8 p-0 rounded-full"
            onClick={() => {
              setAbjad(abjad === letter ? 'ALL' : letter);
              setPage(1);
            }}
          >
            {letter}
          </Button>
        ))}
      </div>
    </Card>
  );

  // Mobile Bottom Sheet Component
  const MobileBottomSheet = () => {
    const [activeTab, setActiveTab] = useState("profil");
    
    // Prevent body scroll when modal is open
    useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, []);

    const handleClose = () => {
      handleCloseMobileModal();
    };

    // Determine animation classes based on state
    const getAnimationClasses = () => {
      switch (mobileAnimationState) {
        case 'opening':
          return {
            overlay: 'opacity-0',
            modal: 'translate-y-full'
          };
        case 'open':
          return {
            overlay: 'opacity-100',
            modal: 'translate-y-0'
          };
        case 'closing':
          return {
            overlay: 'opacity-0',
            modal: 'translate-y-full'
          };
        default:
          return {
            overlay: 'opacity-0',
            modal: 'translate-y-full'
          };
      }
    };

    const animationClasses = getAnimationClasses();

    return (
      <div 
        className={`md:hidden fixed inset-0 z-[9999] bg-black/50 flex items-end transition-opacity duration-300 ${animationClasses.overlay}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <div 
          className={`bg-white rounded-t-3xl w-full h-[80vh] flex flex-col transition-transform duration-300 ease-out ${animationClasses.modal}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>
          
          {/* Header */}
          <div className="px-4 pb-4 border-b flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                {mobileSelectedAlumni?.profilePhoto ? (
                  <Image 
                    src={mobileSelectedAlumni.profilePhoto} 
                    alt={mobileSelectedAlumni.fullName}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Avatar className="h-16 w-16">
                    <AvatarInitials name={mobileSelectedAlumni?.fullName || ""} />
                  </Avatar>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold truncate">{mobileSelectedAlumni?.fullName}</h2>
                <p className="text-sm text-gray-600 truncate">{mobileSelectedAlumni?.syubiyah?.name || 'Syubiyah Banjari Kediri'}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <MapPinIcon className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{mobileSelectedAlumni?.asalDaerah || mobileSelectedAlumni?.provinsi || 'Kediri'}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose} className="flex-shrink-0">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Custom Tabs */}
          <div className="flex-shrink-0 border-b">
            <div className="grid grid-cols-3 h-12">
              {[
                { id: "profil", label: "Profil" },
                { id: "alamat", label: "Alamat" },
                { id: "lainnya", label: "Lainnya" }
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
            {mobileDetailLoading ? (
              <div className="p-4 space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="p-4">
                {activeTab === "profil" && (
                  <div className="space-y-4">
                    {/* Quick Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <GraduationCap className="w-4 h-4" />
                          <span>Angkatan</span>
                        </div>
                        <div className="font-semibold">{mobileSelectedAlumni?.tahunMasuk || '-'}/{mobileSelectedAlumni?.tahunKeluar || '-'}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Briefcase className="w-4 h-4" />
                          <span>Pekerjaan</span>
                        </div>
                        <div className="font-semibold text-sm">{mobileSelectedAlumni?.pekerjaan?.join(", ") || '-'}</div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Informasi Kontak</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-gray-600">Email</div>
                            <div className="font-medium truncate">{mobileSelectedAlumni?.email || '-'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-gray-600">No. HP</div>
                            <div className="font-medium truncate">{mobileSelectedAlumni?.phone || '-'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Personal Info */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Informasi Pribadi</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Tempat, Tgl Lahir</span>
                          <span className="font-medium text-right ml-2">{mobileSelectedAlumni?.tempatLahir || '-'}, {mobileSelectedAlumni?.tanggalLahir ? new Date(mobileSelectedAlumni.tanggalLahir).toLocaleDateString() : '-'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Pendidikan</span>
                          <span className="font-medium text-right ml-2">{mobileSelectedAlumni?.pendidikanTerakhir || '-'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Status</span>
                          <span className="font-medium text-right ml-2">{mobileSelectedAlumni?.statusPernikahan || '-'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Jumlah Anak</span>
                          <span className="font-medium text-right ml-2">{mobileSelectedAlumni?.jumlahAnak ?? '-'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Penghasilan</span>
                          <span className="font-medium text-right ml-2">{mobileSelectedAlumni?.penghasilanBulan || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "alamat" && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Alamat Lengkap</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Provinsi:</span>
                            <span className="font-medium">{mobileSelectedAlumni?.provinsi || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Kabupaten:</span>
                            <span className="font-medium">{mobileSelectedAlumni?.kabupaten || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Kecamatan:</span>
                            <span className="font-medium">{mobileSelectedAlumni?.kecamatan || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Desa:</span>
                            <span className="font-medium">{mobileSelectedAlumni?.desa || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">RT/RW:</span>
                            <span className="font-medium">{mobileSelectedAlumni?.rt || '-'}/{mobileSelectedAlumni?.rw || '-'}</span>
                          </div>
                          <div className="pt-2 border-t border-gray-200">
                            <div className="text-gray-600 mb-1">Alamat Jalan:</div>
                            <div className="font-medium">{mobileSelectedAlumni?.namaJalan || '-'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "lainnya" && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Informasi Lainnya</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Username</span>
                          <span className="font-medium text-right ml-2">{mobileSelectedAlumni?.username || '-'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Status Verifikasi</span>
                          <span className="font-medium text-right ml-2">
                            {mobileSelectedAlumni?.isVerified ? 'Terverifikasi' : 'Belum Terverifikasi'}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Tanggal Registrasi</span>
                          <span className="font-medium text-right ml-2">
                            {mobileSelectedAlumni?.createdAt ? new Date(mobileSelectedAlumni.createdAt).toLocaleDateString() : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Terakhir Update</span>
                          <span className="font-medium text-right ml-2">
                            {mobileSelectedAlumni?.updatedAt ? new Date(mobileSelectedAlumni.updatedAt).toLocaleDateString() : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render
  return (
    <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Buku Alumni</h1>
      
      {/* Desktop Filter Section */}
      <div className="hidden md:block">
        <FilterSection />
      </div>
      
      {/* Mobile Floating Filter Button */}
      <div className="md:hidden fixed top-20 right-4 z-40">
        <Button
          onClick={() => setMobileFilterOpen(true)}
          className="rounded-full w-12 h-12 shadow-lg bg-green-600 hover:bg-green-700"
        >
          <Filter className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Mobile Floating Filter Card */}
      {mobileFilterOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 pt-20">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <FilterSection />
          </div>
        </div>
      )}
      
      {/* Grid Alumni */}
      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-full">
                  <div className="flex flex-row bg-white rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="w-1/3">
                      <Skeleton className="aspect-square w-full" />
                    </div>
                    <div className="w-2/3 p-2 md:p-3 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                      <div className="pt-1">
                        <Skeleton className="h-3 w-1/3 ml-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : alumni.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-12">Tidak ada alumni ditemukan.</div>
            ) : (
              alumni.map((a, index) => (
                <Card key={a.id} className="w-full overflow-hidden hover:shadow-md transition-shadow duration-300" onClick={() => {
                  if (window.innerWidth < 768) {
                    handleOpenMobileModal(a.id);
                  } else {
                    handleOpenModal(a.id);
                  }
                }}>
                  <CardContent className="p-0">
                    <div className="flex flex-row">
                      {/* Profile Image */}
                      <div className="w-1/3 relative">
                        <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                          {a.profilePhoto ? (
                            <Image
                              src={a.profilePhoto}
                              alt={a.fullName}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                              priority={index < 4}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Avatar className="h-12 w-12">
                                <AvatarInitials name={a.fullName} />
                              </Avatar>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="w-2/3 p-2 md:p-3 flex flex-col justify-between">
                        <div>
                          {/* Name with truncation */}
                          <h3 className="text-sm font-semibold text-gray-900 truncate leading-tight">{a.fullName}</h3>
                          
                          {/* Syubiyah */}
                          <p className="text-xs text-gray-600 truncate mt-1">{a.syubiyah?.name || 'Syubiyah Banjari Kediri'}</p>
                          
                          {/* Location */}
                           <p className="text-xs text-gray-600 mt-1 flex items-center">
                             <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                             <span className="truncate">{a.asalDaerah || a.provinsi || 'Kediri'}</span>
                           </p>
                        </div>
                        
                        {/* Divider */}
                        <hr className="my-1 md:my-2 border-gray-200" />
                        
                        {/* Years Section */}
                        <div className="text-right">
                          <div className="text-xs text-gray-500">{a.tahunMasuk || '2021'}/{a.tahunKeluar || '2025'}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                      aria-disabled={page === 1}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={page === i + 1}
                        onClick={(e) => { e.preventDefault(); setPage(i + 1); }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                      aria-disabled={page === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </main>
      
      {/* Desktop Modal Detail Alumni */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) handleCloseModal(); }}>
        <DialogContent className="max-w-2xl w-full hidden md:block">
          <DialogHeader>
            <DialogTitle>Detail Alumni</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang alumni yang dipilih
            </DialogDescription>
          </DialogHeader>
          {detailLoading || !selectedAlumni ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Skeleton className="h-24 w-24 rounded-full mb-4" />
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-4 w-56" />
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-20 w-20">
                  {selectedAlumni.profilePhoto ? (
                    <AvatarImage src={selectedAlumni.profilePhoto} alt={selectedAlumni.fullName} />
                  ) : (
                    <AvatarInitials name={selectedAlumni.fullName} />
                  )}
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedAlumni.fullName}</h2>
                  <div className="flex flex-wrap gap-2 mb-1">
                    {selectedAlumni.syubiyah?.name && <Badge variant="secondary">{selectedAlumni.syubiyah.name}</Badge>}
                    {selectedAlumni.mustahiq?.name && <Badge variant="outline">{selectedAlumni.mustahiq.name}</Badge>}
                    {selectedAlumni.tahunMasuk && <Badge variant="outline">Masuk {selectedAlumni.tahunMasuk}</Badge>}
                    {selectedAlumni.tahunKeluar && <Badge variant="outline">Lulus {selectedAlumni.tahunKeluar}</Badge>}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {selectedAlumni.asalDaerah || selectedAlumni.provinsi || "-"}
                  </div>
                </div>
              </div>
              <Tabs defaultValue="profil" className="w-full">
                <TabsList>
                  <TabsTrigger value="profil">Profil</TabsTrigger>
                  <TabsTrigger value="alamat">Alamat</TabsTrigger>
                  <TabsTrigger value="lainnya">Lainnya</TabsTrigger>
                </TabsList>
                <TabsContent value="profil">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="mb-2"><span className="font-medium">Tempat, Tgl Lahir:</span> {selectedAlumni.tempatLahir || "-"}, {selectedAlumni.tanggalLahir ? new Date(selectedAlumni.tanggalLahir).toLocaleDateString() : "-"}</div>
                      <div className="mb-2"><span className="font-medium">Pendidikan:</span> {selectedAlumni.pendidikanTerakhir || "-"}</div>
                      <div className="mb-2"><span className="font-medium">Pekerjaan:</span> {selectedAlumni.pekerjaan?.join(", ") || "-"}</div>
                      <div className="mb-2"><span className="font-medium">Status Pernikahan:</span> {selectedAlumni.statusPernikahan || "-"}</div>
                      <div className="mb-2"><span className="font-medium">Jumlah Anak:</span> {selectedAlumni.jumlahAnak ?? "-"}</div>
                    </div>
                    <div>
                      <div className="mb-2"><span className="font-medium">Email:</span> {selectedAlumni.email}</div>
                      <div className="mb-2"><span className="font-medium">No HP:</span> {selectedAlumni.phone || "-"}</div>
                      <div className="mb-2"><span className="font-medium">Username:</span> {selectedAlumni.username || "-"}</div>
                      <div className="mb-2"><span className="font-medium">Penghasilan/Bulan:</span> {selectedAlumni.penghasilanBulan || "-"}</div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="alamat">
                  <div className="mb-2"><span className="font-medium">Provinsi:</span> {selectedAlumni.provinsi || "-"}</div>
                  <div className="mb-2"><span className="font-medium">Kabupaten:</span> {selectedAlumni.kabupaten || "-"}</div>
                  <div className="mb-2"><span className="font-medium">Kecamatan:</span> {selectedAlumni.kecamatan || "-"}</div>
                  <div className="mb-2"><span className="font-medium">Desa:</span> {selectedAlumni.desa || "-"}</div>
                  <div className="mb-2"><span className="font-medium">Alamat Jalan:</span> {selectedAlumni.namaJalan || "-"}</div>
                  <div className="mb-2"><span className="font-medium">RT/RW:</span> {selectedAlumni.rt || "-"}/{selectedAlumni.rw || "-"}</div>
                </TabsContent>
                <TabsContent value="lainnya">
                  <p>Informasi lainnya akan ditampilkan di sini.</p>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Sheet */}
      {mobileAnimationState !== null && (
        <MobileBottomSheet />
      )}
    </div>
  );
}

export default function AlumniBookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <AlumniBookPageContent />
    </Suspense>
  );
}