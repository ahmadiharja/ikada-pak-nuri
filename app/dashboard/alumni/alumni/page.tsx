"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, Users, MapPin, Phone, Mail, Camera, Upload, Eye, GraduationCap, Calendar, User } from "lucide-react";
import { RegionSelector } from "@/components/ui/region-selector";
import Image from "next/image";

interface Alumni {
  id: string;
  fullName: string;
  profilePhoto?: string;
  email?: string;
  phone?: string;
  tahunMasuk: number;
  tahunKeluar?: number;
  asalDaerah?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  statusPernikahan?: string;
  jumlahAnak?: number;
  pendidikanTerakhir?: string;
  pekerjaan?: string;
  penghasilanBulan?: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  desa: string;
  provinsiId?: string;
  kabupatenId?: string;
  kecamatanId?: string;
  desaId?: string;
  namaJalan?: string;
  rt?: string;
  rw?: string;
  username?: string;
  createdAt: string;
  updatedAt: string;
  syubiyah?: {
    name: string;
  };
  mustahiq?: {
    name: string;
  };
}

interface AlumniFormData {
  fullName: string;
  email: string;
  phone: string;
  tahunMasuk: string;
  tahunKeluar: string;
  asalDaerah: string;
  syubiyahId: string;
  mustahiqId: string;
  tempatLahir: string;
  tanggalLahir: string;
  statusPernikahan: string;
  jumlahAnak: string;
  pendidikanTerakhir: string;
  pendidikanCustom: string;
  pekerjaan: string;
  penghasilanBulan: string;
  provinsi: string;
  provinsiId: string;
  kabupaten: string;
  kabupatenId: string;
  kecamatan: string;
  kecamatanId: string;
  desa: string;
  desaId: string;
  namaJalan: string;
  rt: string;
  rw: string;
  profilePhoto?: File;
  username: string;
  password: string;
}

const pendidikanEnum = [
  "SD/MI", "SMP/MTs", "SMA/MA/SMK", "D1", "D2", "D3", "S1", "S2", "S3", "Lainnya"
];

const statusPernikahanEnum = [
  "BELUM_MENIKAH", "MENIKAH", "CERAI_HIDUP", "CERAI_MATI"
];

const penghasilanEnum = [
  "KURANG_1_JUTA", "1_3_JUTA", "3_5_JUTA", "5_10_JUTA", "LEBIH_10_JUTA"
];

const initialFormData: AlumniFormData = {
  fullName: "",
  email: "",
  phone: "",
  tahunMasuk: "",
  tahunKeluar: "",
  asalDaerah: "",
  syubiyahId: "",
  mustahiqId: "",
  tempatLahir: "",
  tanggalLahir: "",
  statusPernikahan: "",
  jumlahAnak: "",
  pendidikanTerakhir: "",
  pendidikanCustom: "",
  pekerjaan: "",
  penghasilanBulan: "",
  provinsi: "",
  provinsiId: "",
  kabupaten: "",
  kabupatenId: "",
  kecamatan: "",
  kecamatanId: "",
  desa: "",
  desaId: "",
  namaJalan: "",
  rt: "",
  rw: "",
  username: "",
  password: ""
};

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AlumniFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [syubiyahs, setSyubiyahs] = useState<any[]>([]);
  const [mustahiqs, setMustahiqs] = useState<any[]>([]);

  // Fetch alumni
  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/alumni');
      if (response.ok) {
        const data = await response.json();
        setAlumni(data.alumni || []);
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data alumni",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching alumni:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data alumni",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch syubiyahs
  const fetchSyubiyahs = async () => {
    try {
      const response = await fetch('/api/syubiyah');
      if (response.ok) {
        const data = await response.json();
        setSyubiyahs(data);
      }
    } catch (error) {
      console.error('Error fetching syubiyahs:', error);
    }
  };

  // Fetch mustahiqs
  const fetchMustahiqs = async () => {
    try {
      const response = await fetch('/api/mustahiq');
      if (response.ok) {
        const data = await response.json();
        setMustahiqs(data);
      }
    } catch (error) {
      console.error('Error fetching mustahiqs:', error);
    }
  };

  useEffect(() => {
    fetchAlumni();
    fetchSyubiyahs();
    fetchMustahiqs();
  }, []);

  // Generate username from phone number
  const generateUsername = (phone: string) => {
    return phone.replace(/[^0-9]/g, '').slice(-10);
  };

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Handle phone change and auto-generate username
  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      phone: value,
      username: generateUsername(value)
    }));
  };

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Ukuran file maksimal 5MB",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "File harus berupa gambar",
          variant: "destructive",
        });
        return;
      }

      setFormData(prev => ({ ...prev, profilePhoto: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle region selection
  const handleRegionChange = (regionData: any) => {
    setFormData(prev => ({
      ...prev,
      provinsi: regionData.provinsi || "",
      provinsiId: regionData.provinsiId || "",
      kabupaten: regionData.kabupaten || "",
      kabupatenId: regionData.kabupatenId || "",
      kecamatan: regionData.kecamatan || "",
      kecamatanId: regionData.kecamatanId || "",
      desa: regionData.desa || "",
      desaId: regionData.desaId || ""
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitData = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'profilePhoto' && value instanceof File) {
          submitData.append(key, value);
        } else if (value !== null && value !== undefined) {
          submitData.append(key, value.toString());
        }
      });

      const url = editingId ? `/api/alumni/${editingId}` : '/api/alumni';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: submitData,
      });

      if (response.ok) {
        toast({
          title: "Sukses",
          description: editingId ? "Alumni berhasil diperbarui" : "Alumni berhasil ditambahkan",
        });
        setIsDialogOpen(false);
        resetForm();
        fetchAlumni();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Gagal menyimpan data alumni",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan data alumni",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (alumniData: Alumni) => {
    setEditingId(alumniData.id);
    setFormData({
      fullName: alumniData.fullName,
      email: alumniData.email || "",
      phone: alumniData.phone || "",
      tahunMasuk: alumniData.tahunMasuk.toString(),
      tahunKeluar: alumniData.tahunKeluar?.toString() || "",
      asalDaerah: alumniData.asalDaerah || "",
      syubiyahId: "", // Will need to get from API
      mustahiqId: "", // Will need to get from API
      tempatLahir: alumniData.tempatLahir || "",
      tanggalLahir: alumniData.tanggalLahir || "",
      statusPernikahan: alumniData.statusPernikahan || "",
      jumlahAnak: alumniData.jumlahAnak?.toString() || "",
      pendidikanTerakhir: alumniData.pendidikanTerakhir || "",
      pendidikanCustom: "",
      pekerjaan: alumniData.pekerjaan || "",
      penghasilanBulan: alumniData.penghasilanBulan || "",
      provinsi: alumniData.provinsi,
      provinsiId: alumniData.provinsiId || "",
      kabupaten: alumniData.kabupaten,
      kabupatenId: alumniData.kabupatenId || "",
      kecamatan: alumniData.kecamatan,
      kecamatanId: alumniData.kecamatanId || "",
      desa: alumniData.desa,
      desaId: alumniData.desaId || "",
      namaJalan: alumniData.namaJalan || "",
      rt: alumniData.rt || "",
      rw: alumniData.rw || "",
      username: alumniData.username || "",
      password: ""
    });
    
    if (alumniData.profilePhoto) {
      setPhotoPreview(alumniData.profilePhoto);
    }
    
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/alumni/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Sukses",
          description: "Alumni berhasil dihapus",
        });
        fetchAlumni();
      } else {
        toast({
          title: "Error",
          description: "Gagal menghapus alumni",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting alumni:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus alumni",
        variant: "destructive",
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setPhotoPreview(null);
  };

  // Filter alumni based on search term
  const filteredAlumni = alumni && Array.isArray(alumni) ? alumni.filter(item =>
    item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.phone?.includes(searchTerm) ||
    item.asalDaerah?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Format status pernikahan
  const formatStatusPernikahan = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'BELUM_MENIKAH': 'Belum Menikah',
      'MENIKAH': 'Menikah',
      'CERAI_HIDUP': 'Cerai Hidup',
      'CERAI_MATI': 'Cerai Mati'
    };
    return statusMap[status] || status;
  };

  // Format penghasilan
  const formatPenghasilan = (penghasilan: string) => {
    const penghasilanMap: { [key: string]: string } = {
      'KURANG_1_JUTA': '< Rp 1 Juta',
      '1_3_JUTA': 'Rp 1-3 Juta',
      '3_5_JUTA': 'Rp 3-5 Juta',
      '5_10_JUTA': 'Rp 5-10 Juta',
      'LEBIH_10_JUTA': '> Rp 10 Juta'
    };
    return penghasilanMap[penghasilan] || penghasilan;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Alumni</h1>
          <p className="text-muted-foreground">
            Kelola data alumni pesantren
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setFormData(prev => ({ ...prev, password: generatePassword() }));
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Alumni
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Alumni" : "Tambah Alumni Baru"}
              </DialogTitle>
              <DialogDescription>
                {editingId ? "Perbarui informasi alumni" : "Tambahkan alumni baru ke sistem"}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Foto Profil */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Foto Profil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={photoPreview || undefined} />
                        <AvatarFallback>
                          <Camera className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Label htmlFor="photo-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-md hover:bg-secondary/80">
                          <Upload className="h-4 w-4" />
                          {photoPreview ? "Ganti Foto" : "Upload Foto"}
                        </div>
                      </Label>
                      <Input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        Format: JPG, PNG. Maksimal 5MB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informasi Dasar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informasi Dasar
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nama Lengkap *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="asalDaerah">Asal Daerah</Label>
                    <Input
                      id="asalDaerah"
                      value={formData.asalDaerah}
                      onChange={(e) => setFormData(prev => ({ ...prev, asalDaerah: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tempatLahir">Tempat Lahir</Label>
                    <Input
                      id="tempatLahir"
                      value={formData.tempatLahir}
                      onChange={(e) => setFormData(prev => ({ ...prev, tempatLahir: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
                    <Input
                      id="tanggalLahir"
                      type="date"
                      value={formData.tanggalLahir}
                      onChange={(e) => setFormData(prev => ({ ...prev, tanggalLahir: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Informasi Akademik */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Informasi Akademik
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tahunMasuk">Tahun Masuk *</Label>
                    <Input
                      id="tahunMasuk"
                      type="number"
                      value={formData.tahunMasuk}
                      onChange={(e) => setFormData(prev => ({ ...prev, tahunMasuk: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tahunKeluar">Tahun Keluar</Label>
                    <Input
                      id="tahunKeluar"
                      type="number"
                      value={formData.tahunKeluar}
                      onChange={(e) => setFormData(prev => ({ ...prev, tahunKeluar: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="syubiyahId">Syubiyah</Label>
                    <Select value={formData.syubiyahId} onValueChange={(value) => setFormData(prev => ({ ...prev, syubiyahId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Syubiyah" />
                      </SelectTrigger>
                      <SelectContent>
                        {syubiyahs && Array.isArray(syubiyahs) && syubiyahs.map((syubiyah) => (
                          <SelectItem key={syubiyah.id} value={syubiyah.id}>
                            {syubiyah.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mustahiqId">Mustahiq</Label>
                    <Select value={formData.mustahiqId} onValueChange={(value) => setFormData(prev => ({ ...prev, mustahiqId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Mustahiq" />
                      </SelectTrigger>
                      <SelectContent>
                        {mustahiqs && Array.isArray(mustahiqs) && mustahiqs.map((mustahiq) => (
                          <SelectItem key={mustahiq.id} value={mustahiq.id}>
                            {mustahiq.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pendidikanTerakhir">Pendidikan Terakhir</Label>
                    <Select 
                      value={formData.pendidikanTerakhir} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, pendidikanTerakhir: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Pendidikan" />
                      </SelectTrigger>
                      <SelectContent>
                        {pendidikanEnum.map((pendidikan) => (
                          <SelectItem key={pendidikan} value={pendidikan}>
                            {pendidikan}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.pendidikanTerakhir === "Lainnya" && (
                    <div className="space-y-2">
                      <Label htmlFor="pendidikanCustom">Pendidikan Lainnya</Label>
                      <Input
                        id="pendidikanCustom"
                        value={formData.pendidikanCustom}
                        onChange={(e) => setFormData(prev => ({ ...prev, pendidikanCustom: e.target.value }))}
                        placeholder="Sebutkan pendidikan lainnya"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informasi Personal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Informasi Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="statusPernikahan">Status Pernikahan</Label>
                    <Select value={formData.statusPernikahan} onValueChange={(value) => setFormData(prev => ({ ...prev, statusPernikahan: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusPernikahanEnum.map((status) => (
                          <SelectItem key={status} value={status}>
                            {formatStatusPernikahan(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jumlahAnak">Jumlah Anak</Label>
                    <Input
                      id="jumlahAnak"
                      type="number"
                      min="0"
                      value={formData.jumlahAnak}
                      onChange={(e) => setFormData(prev => ({ ...prev, jumlahAnak: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pekerjaan">Pekerjaan</Label>
                    <Input
                      id="pekerjaan"
                      value={formData.pekerjaan}
                      onChange={(e) => setFormData(prev => ({ ...prev, pekerjaan: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="penghasilanBulan">Penghasilan per Bulan</Label>
                    <Select value={formData.penghasilanBulan} onValueChange={(value) => setFormData(prev => ({ ...prev, penghasilanBulan: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Range Penghasilan" />
                      </SelectTrigger>
                      <SelectContent>
                        {penghasilanEnum.map((penghasilan) => (
                          <SelectItem key={penghasilan} value={penghasilan}>
                            {formatPenghasilan(penghasilan)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Alamat */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Alamat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RegionSelector
                    onRegionChange={handleRegionChange}
                    initialData={{
                      provinsi: formData.provinsi,
                      provinsiId: formData.provinsiId,
                      kabupaten: formData.kabupaten,
                      kabupatenId: formData.kabupatenId,
                      kecamatan: formData.kecamatan,
                      kecamatanId: formData.kecamatanId,
                      desa: formData.desa,
                      desaId: formData.desaId
                    }}
                    showKecamatan={true}
                    showDesa={true}
                    required={true}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="namaJalan">Nama Jalan</Label>
                      <Input
                        id="namaJalan"
                        value={formData.namaJalan}
                        onChange={(e) => setFormData(prev => ({ ...prev, namaJalan: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rt">RT</Label>
                      <Input
                        id="rt"
                        value={formData.rt}
                        onChange={(e) => setFormData(prev => ({ ...prev, rt: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rw">RW</Label>
                      <Input
                        id="rw"
                        value={formData.rw}
                        onChange={(e) => setFormData(prev => ({ ...prev, rw: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Akun Login */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Akun Login
                  </CardTitle>
                  <CardDescription>
                    Username akan otomatis dibuat dari nomor telepon
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Otomatis dari nomor telepon"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="flex gap-2">
                      <Input
                        id="password"
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Password akan dibuat otomatis"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData(prev => ({ ...prev, password: generatePassword() }))}
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Menyimpan..." : editingId ? "Perbarui" : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari alumni berdasarkan nama, email, telepon, atau asal daerah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alumni && Array.isArray(alumni) ? alumni.length : 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alumni Aktif</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alumni && Array.isArray(alumni) ? alumni.filter(a => !a.tahunKeluar).length : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alumni Lulus</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alumni && Array.isArray(alumni) ? alumni.filter(a => a.tahunKeluar).length : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hasil Pencarian</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAlumni.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alumni Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Alumni</CardTitle>
          <CardDescription>
            Menampilkan {filteredAlumni.length} dari {alumni && Array.isArray(alumni) ? alumni.length : 0} alumni
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Memuat data...</div>
            </div>
          ) : filteredAlumni.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">
                {searchTerm ? "Tidak ada alumni yang sesuai dengan pencarian" : "Belum ada data alumni"}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumni</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead>Tahun</TableHead>
                    <TableHead>Pendidikan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlumni.map((alumniItem) => (
                    <TableRow key={alumniItem.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={alumniItem.profilePhoto || undefined} 
                            />
                            <AvatarFallback>
                              {alumniItem.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{alumniItem.fullName}</div>
                            <div className="text-sm text-muted-foreground">
                              {alumniItem.asalDaerah}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {alumniItem.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="mr-1 h-3 w-3" />
                              {alumniItem.email}
                            </div>
                          )}
                          {alumniItem.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="mr-1 h-3 w-3" />
                              {alumniItem.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            Masuk: {alumniItem.tahunMasuk}
                          </div>
                          {alumniItem.tahunKeluar && (
                            <div className="text-sm text-muted-foreground">
                              Keluar: {alumniItem.tahunKeluar}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {alumniItem.pendidikanTerakhir && (
                            <Badge variant="outline">
                              {alumniItem.pendidikanTerakhir}
                            </Badge>
                          )}
                          {alumniItem.pekerjaan && (
                            <div className="text-sm text-muted-foreground">
                              {alumniItem.pekerjaan}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {alumniItem.statusPernikahan && (
                            <Badge variant="secondary">
                              {formatStatusPernikahan(alumniItem.statusPernikahan)}
                            </Badge>
                          )}
                          {alumniItem.jumlahAnak && alumniItem.jumlahAnak > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {alumniItem.jumlahAnak} anak
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{alumniItem.desa}, {alumniItem.kecamatan}</div>
                          <div className="text-muted-foreground">
                            {alumniItem.kabupaten}, {alumniItem.provinsi}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(alumniItem)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Alumni</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus alumni {alumniItem.fullName}? 
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(alumniItem.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}