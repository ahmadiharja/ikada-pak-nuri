"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Heart, Building2, ArrowRight, Info, Users, Calendar } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DonationProgram {
  id: string;
  title: string;
  description: string;
  type: 'wajib' | 'sukarela' | 'program';
  targetAmount: number | null;
  currentAmount: number;
  deadline: string | null;
  startDate: string;
  endDate: string | null;
  status: 'draft' | 'aktif' | 'selesai';
  visible: boolean;
  thumbnail: string | null;
  _count: {
    transactions: number;
  };
  createdAt: string;
}

export default function DonasiPage() {
  const [programs, setPrograms] = useState<DonationProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<DonationProgram | null>(null);
  const [modalType, setModalType] = useState<'detail' | 'donate' | null>(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/donations/programs");
        const data = await res.json();
        // Only show active and visible programs
        const filtered = Array.isArray(data)
          ? data.filter((p) => p.status === 'aktif' && p.visible)
          : [];
        setPrograms(filtered);
      } catch {
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return 'Rp' + amount.toLocaleString('id-ID');
  };
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  const getProgress = (current: number, target: number | null) => {
    if (!target || target === 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  };

  const handleShowDetail = (program: DonationProgram) => {
    setSelectedProgram(program);
    setModalType('detail');
  };
  const handleShowDonate = (program: DonationProgram) => {
    setSelectedProgram(program);
    setModalType('donate');
  };
  const handleCloseModal = () => {
    setModalType(null);
    setSelectedProgram(null);
    setDonationAmount("");
    setPaymentMethod("");
  };
  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram || !donationAmount || !paymentMethod) return;
    setIsSubmitting(true);
    try {
      setTimeout(() => {
        setIsSubmitting(false);
        setModalType(null);
        setDonationAmount("");
        setPaymentMethod("");
        alert("Terima kasih atas donasi Anda!");
      }, 1200);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-2 sm:px-4 md:px-0 mx-auto py-6 sm:py-8">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">Donasi & Sponsorship</h1>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          Bersama, kita bisa membangun masa depan yang lebih baik. Dukung program sosial, pendidikan, dan pengembangan Ikada melalui donasi atau sponsorship.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#program-donasi"><Button size="lg" className="gap-2"><Heart className="w-5 h-5" /> Donasi Sekarang</Button></a>
          <a href="#sponsorship"><Button size="lg" variant="outline" className="gap-2"><Building2 className="w-5 h-5" /> Ajukan Sponsorship</Button></a>
        </div>
      </div>

      {/* Daftar Program Donasi */}
      <section id="program-donasi" className="mb-14">
        <h2 className="text-2xl font-semibold mb-6 text-center">Program Donasi Aktif</h2>
        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4 sm:p-6"><Skeleton className="h-6 w-2/3 mb-4" /><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-3/4 mb-4" /><Skeleton className="h-8 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Belum ada program donasi aktif.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {programs.map((program) => (
              <div key={program.id} className="flex flex-col md:flex-row items-stretch rounded-2xl overflow-hidden bg-white shadow-md">
                {/* Image */}
                <div className="w-full md:w-64 flex-shrink-0 flex items-center justify-center bg-gray-100 aspect-[16/9] md:aspect-auto min-h-[180px] md:min-h-0 md:h-auto">
                  {program.thumbnail ? (
                    <img src={program.thumbnail} alt={program.title} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-gray-400 text-xl">image<br/>placeholder</span>
                  )}
                </div>
                {/* Main Content */}
                <div className="flex flex-col flex-1 p-4 sm:p-6 gap-2 justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={program.type === 'wajib' ? 'destructive' : 'default'} className="capitalize">{program.type}</Badge>
                  </div>
                  <h3 className="font-bold text-lg sm:text-2xl mb-2 text-gray-900">{program.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-2 line-clamp-2">{program.description}</p>
                  {program.targetAmount != null && (
                    <div className="mb-2">
                      <Progress value={getProgress(program.currentAmount, program.targetAmount)} className="h-2" />
                      <div className="flex justify-between text-xs sm:text-sm mt-1">
                        <span className="text-gray-600">Terkumpul: <span className="font-medium text-green-600">{formatCurrency(program.currentAmount)}</span></span>
                        <span className="text-gray-500">Target: {formatCurrency(program.targetAmount)}</span>
                      </div>
                    </div>
                  )}
                </div>
                {/* Right Side */}
                <div className="flex flex-col justify-between items-end p-4 sm:p-6 min-w-0 md:min-w-[220px] gap-4 bg-white w-full md:w-auto">
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <span>{program._count.transactions} Donatur</span>
                    </div>
                    {program.deadline && (
                      <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        <span>Berakhir {formatDate(program.deadline)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <Button className="w-full py-2 text-sm sm:text-base font-bold rounded-xl bg-emerald-400 hover:bg-emerald-500" size="sm" onClick={() => handleShowDonate(program)}>
                      Donasi
                    </Button>
                    <Button className="w-full py-2 text-sm sm:text-base font-bold rounded-xl border-2 border-emerald-400 text-emerald-500 bg-white hover:bg-emerald-50" variant="outline" size="sm" onClick={() => handleShowDetail(program)}>
                      Lihat Program
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sponsorship Section */}
      <section id="sponsorship" className="mb-14">
        <div className="bg-blue-50 rounded-xl p-4 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          <div className="flex-1 order-2 md:order-1 mt-4 md:mt-0">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 flex items-center gap-2"><Building2 className="w-6 h-6 text-blue-600" /> Sponsorship & Kerja Sama</h2>
            <p className="text-gray-700 mb-3 text-sm sm:text-base">Buka peluang kolaborasi dengan Ikada! Kami mengundang pelaku bisnis, corporate, dan institusi untuk menjadi sponsor dalam berbagai program sosial, pendidikan, dan pengembangan masyarakat.</p>
            <ul className="list-disc pl-5 text-gray-600 mb-4 text-sm sm:text-base">
              <li>Brand exposure di komunitas alumni dan publik</li>
              <li>Kolaborasi dalam event, pelatihan, dan program sosial</li>
              <li>Kontribusi nyata untuk pengembangan pendidikan & sosial</li>
              <li>Laporan transparan & publikasi media</li>
            </ul>
            <a href="mailto:info@ikada.or.id" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="default" className="gap-2 w-full sm:w-auto"><ArrowRight className="w-5 h-5" /> Hubungi Kami</Button>
            </a>
          </div>
          <div className="flex-1 order-1 md:order-2 flex justify-center w-full">
            <img src="/ikada.png" alt="Sponsorship Ikada" className="max-w-xs w-full rounded-xl shadow-md" />
          </div>
        </div>
      </section>

      {/* FAQ / Info Tambahan */}
      <section className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Info className="w-5 h-5 text-blue-500" /> Info & Transparansi</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-gray-700 space-y-2 text-sm sm:text-base">
              <li>Setiap donasi akan digunakan sesuai tujuan program dan dilaporkan secara transparan.</li>
              <li>Laporan penggunaan dana dan update program dapat diakses secara berkala.</li>
              <li>Untuk pertanyaan atau kerja sama, hubungi <a href="mailto:info@ikada.or.id" className="text-blue-600 underline">info@ikada.or.id</a></li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Modal Bottom Sheet Mobile */}
      {modalType === 'detail' && selectedProgram && (
        <MobileDetailBottomSheet
          open={!!modalType && typeof window !== 'undefined' && window.innerWidth < 768}
          onClose={handleCloseModal}
          onDonate={() => setModalType('donate')}
          program={selectedProgram}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getProgress={getProgress}
        />
      )}
      {/* Modal Desktop */}
      <Dialog open={!!modalType && typeof window !== 'undefined' && window.innerWidth >= 768} onOpenChange={handleCloseModal}>
        <DialogContent className="w-full max-w-sm sm:max-w-4xl p-2 sm:p-6 hidden md:block">
          {modalType === 'detail' && selectedProgram && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-2xl">{selectedProgram.title}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col md:flex-row gap-4 h-full">
                {/* Left: Judul + Image */}
                <div className="md:w-1/3 w-full flex-shrink-0 flex flex-col items-center md:items-start justify-start">
                  {selectedProgram.thumbnail ? (
                    <img src={selectedProgram.thumbnail} alt={selectedProgram.title} className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-cover rounded-lg" />
                  ) : (
                    <span className="text-gray-400 text-xl">image<br/>placeholder</span>
                  )}
                </div>
                {/* Right: Info (Deskripsi, badge, progress, info donatur, deadline) */}
                <div className="md:w-2/3 w-full flex flex-col gap-2 overflow-y-auto max-h-[60vh] sm:max-h-[80vh] pr-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={selectedProgram.type === 'wajib' ? 'destructive' : 'default'} className="capitalize">{selectedProgram.type}</Badge>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line mb-2 text-sm sm:text-base">{selectedProgram.description}</p>
                  {selectedProgram.targetAmount != null && (
                    <div className="mb-2">
                      <Progress value={getProgress(selectedProgram.currentAmount, selectedProgram.targetAmount)} className="h-2" />
                      <div className="flex justify-between text-xs sm:text-sm mt-1">
                        <span className="text-gray-600">Terkumpul: <span className="font-medium text-green-600">{formatCurrency(selectedProgram.currentAmount)}</span></span>
                        <span className="text-gray-500">Target: {formatCurrency(selectedProgram.targetAmount)}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center"><Users className="w-4 h-4 text-emerald-500 mr-1" /> {selectedProgram._count.transactions} Donatur</div>
                    {selectedProgram.deadline && <div className="flex items-center"><Calendar className="w-4 h-4 text-emerald-500 mr-1" /> Berakhir {formatDate(selectedProgram.deadline)}</div>}
                  </div>
                </div>
              </div>
            </>
          )}
          {modalType === 'donate' && selectedProgram && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-2xl">Donasi untuk {selectedProgram.title}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitDonation} className="space-y-4">
                <div>
                  <Label htmlFor="amount">Nominal Donasi</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Masukkan nominal"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    required
                    className="text-sm sm:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="payment">Metode Pembayaran</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                    <SelectTrigger className="text-sm sm:text-base"><SelectValue placeholder="Pilih metode" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transfer_bank">Transfer Bank</SelectItem>
                      <SelectItem value="e_wallet">E-Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full text-sm sm:text-base" disabled={isSubmitting}>
                  {isSubmitting ? 'Memproses...' : 'Kirim Donasi'}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Redesain komponen bottom sheet mobile
type MobileDetailBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  onDonate: () => void;
  program: any;
  formatCurrency: (amount: number | null) => string;
  formatDate: (dateString: string | null) => string;
  getProgress: (current: number, target: number | null) => number;
};

function MobileDetailBottomSheet({ open, onClose, onDonate, program, formatCurrency, formatDate, getProgress }: MobileDetailBottomSheetProps) {
  const [animationState, setAnimationState] = useState<'opening' | 'open' | 'closing' | null>(null);

  // Lock body scroll saat modal open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setAnimationState('opening');
      setTimeout(() => setAnimationState('open'), 30);
    } else {
      document.body.style.overflow = '';
      if (animationState === 'open') {
        setAnimationState('closing');
        setTimeout(() => setAnimationState(null), 300);
      } else {
        setAnimationState(null);
      }
    }
    return () => { document.body.style.overflow = ''; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open && animationState === null) return null;

  const getAnimationClasses = () => {
    switch (animationState) {
      case 'opening':
        return { overlay: 'opacity-0', modal: 'translate-y-full' };
      case 'open':
        return { overlay: 'opacity-100', modal: 'translate-y-0' };
      case 'closing':
        return { overlay: 'opacity-0', modal: 'translate-y-full' };
      default:
        return { overlay: 'opacity-0', modal: 'translate-y-full' };
    }
  };
  const animationClasses = getAnimationClasses();

  return (
    <div className={`md:hidden fixed inset-0 z-[9999] bg-black/50 flex items-end transition-opacity duration-300 ${animationClasses.overlay}`}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`bg-white rounded-t-2xl w-full max-h-[85vh] flex flex-col transition-transform duration-300 ease-out ${animationClasses.modal}`}
        onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>
        {/* Header sticky */}
        <div className="sticky top-0 z-10 bg-white px-4 pt-1 pb-3 border-b flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold truncate">{program.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={program.type === 'wajib' ? 'destructive' : 'default'} className="capitalize">{program.type}</Badge>
              {program.deadline && <span className="text-xs text-gray-500">Berakhir {formatDate(program.deadline)}</span>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-500"><span className="text-2xl">×</span></button>
        </div>
        {/* Content scrollable (gambar + detail) */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 56px - 56px)' }}>
          {/* Gambar ikut tergulir */}
          <div className="w-full aspect-[16/9] bg-gray-100 flex items-center justify-center">
            {program.thumbnail ? (
              <img src={program.thumbnail} alt={program.title} className="object-cover w-full h-full" />
            ) : (
              <span className="text-gray-400 text-xl">image<br/>placeholder</span>
            )}
          </div>
          <div className="px-4 py-3">
            <p className="text-gray-700 whitespace-pre-line mb-2 text-sm">{program.description}</p>
            {program.targetAmount != null && (
              <div className="mb-2">
                <Progress value={getProgress(program.currentAmount, program.targetAmount)} className="h-2" />
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-600">Terkumpul: <span className="font-medium text-green-600">{formatCurrency(program.currentAmount)}</span></span>
                  <span className="text-gray-500">Target: {formatCurrency(program.targetAmount)}</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
              <div className="flex items-center"><Users className="w-4 h-4 text-emerald-500 mr-1" /> {program._count.transactions} Donatur</div>
            </div>
          </div>
        </div>
        {/* Tombol aksi sticky bawah */}
        <div className="sticky bottom-0 z-10 bg-white px-4 py-3 border-t flex flex-col gap-2">
          <Button className="w-full py-3 text-base font-bold rounded-xl bg-emerald-400 hover:bg-emerald-500" size="lg" onClick={onDonate}>
            Donasi Sekarang
          </Button>
        </div>
      </div>
    </div>
  );
} 