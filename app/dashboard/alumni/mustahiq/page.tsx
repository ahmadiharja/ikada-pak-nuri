"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { Plus, Search, Edit, Trash2, Users, MapPin, Phone, Mail, Camera, Upload } from "lucide-react"
import { RegionSelector } from "@/components/ui/region-selector"
import Image from "next/image"

interface Mustahiq {
  id: string
  name: string
  profilePhoto?: string
  email?: string
  phone?: string
  provinsi: string
  kabupaten: string
  kecamatan: string
  desa: string
  provinsiId?: string
  kabupatenId?: string
  kecamatanId?: string
  desaId?: string
  namaJalan?: string
  rt?: string
  rw?: string
  bidangKeahlian?: string
  createdAt: string
  updatedAt: string
  _count?: {
    alumni: number
  }
}

interface MustahiqFormData {
  name: string
  email: string
  phone: string
  provinsi: string
  kabupaten: string
  kecamatan: string
  desa: string
  provinsiId: string
  kabupatenId: string
  kecamatanId: string
  desaId: string
  namaJalan: string
  rt: string
  rw: string
  bidangKeahlian: string
  profilePhoto?: File
}

const initialFormData: MustahiqFormData = {
  name: "",
  email: "",
  phone: "",
  provinsi: "",
  kabupaten: "",
  kecamatan: "",
  desa: "",
  provinsiId: "",
  kabupatenId: "",
  kecamatanId: "",
  desaId: "",
  namaJalan: "",
  rt: "",
  rw: "",
  bidangKeahlian: ""
}

export default function MustahiqPage() {
  const [mustahiqs, setMustahiqs] = useState<Mustahiq[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<MustahiqFormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Fetch mustahiqs
  const fetchMustahiqs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/mustahiq')
      if (response.ok) {
        const data = await response.json()
        setMustahiqs(data)
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data mustahiq",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMustahiqs()
  }, [])

  // Filter mustahiqs based on search term
  const filteredMustahiqs = mustahiqs.filter(mustahiq =>
    mustahiq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mustahiq.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mustahiq.provinsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mustahiq.kabupaten.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mustahiq.bidangKeahlian?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formDataToSend = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'profilePhoto' && value) {
          formDataToSend.append(key, value)
        }
      })

      // Add photo if selected
      if (formData.profilePhoto) {
        formDataToSend.append('profilePhoto', formData.profilePhoto)
      }

      const url = editingId ? `/api/mustahiq/${editingId}` : '/api/mustahiq'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formDataToSend
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: editingId ? "Mustahiq berhasil diperbarui" : "Mustahiq berhasil ditambahkan"
        })
        fetchMustahiqs()
        resetForm()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Gagal menyimpan data mustahiq",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan data",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle edit
  const handleEdit = (mustahiq: Mustahiq) => {
    setEditingId(mustahiq.id)
    setFormData({
      name: mustahiq.name,
      email: mustahiq.email || "",
      phone: mustahiq.phone || "",
      provinsi: mustahiq.provinsi,
      kabupaten: mustahiq.kabupaten,
      kecamatan: mustahiq.kecamatan,
      desa: mustahiq.desa,
      provinsiId: mustahiq.provinsiId || "",
      kabupatenId: mustahiq.kabupatenId || "",
      kecamatanId: mustahiq.kecamatanId || "",
      desaId: mustahiq.desaId || "",
      namaJalan: mustahiq.namaJalan || "",
      rt: mustahiq.rt || "",
      rw: mustahiq.rw || "",
      bidangKeahlian: mustahiq.bidangKeahlian || ""
    })
    if (mustahiq.profilePhoto) {
      setPhotoPreview(mustahiq.profilePhoto)
    }
    setIsDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/mustahiq/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Mustahiq berhasil dihapus"
        })
        fetchMustahiqs()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Gagal menghapus mustahiq",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus data",
        variant: "destructive"
      })
    }
  }

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB before compression)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Ukuran file terlalu besar. Maksimal 5MB",
          variant: "destructive"
        })
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "File harus berupa gambar",
          variant: "destructive"
        })
        return
      }

      setFormData({ ...formData, profilePhoto: file })
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData(initialFormData)
    setEditingId(null)
    setIsDialogOpen(false)
    setPhotoPreview(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memuat data mustahiq...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mustahiq</h1>
          <p className="text-muted-foreground">
            Kelola data mustahiq (penerima bantuan)
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Mustahiq
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Mustahiq" : "Tambah Mustahiq Baru"}
              </DialogTitle>
              <DialogDescription>
                {editingId ? "Perbarui informasi mustahiq" : "Tambahkan mustahiq baru ke dalam sistem"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {/* Photo Upload */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Foto Profil</Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={photoPreview || undefined} />
                        <AvatarFallback>
                          <Camera className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                          id="photo-upload"
                        />
                        <Label htmlFor="photo-upload" className="cursor-pointer">
                          <Button type="button" variant="outline" asChild>
                            <span>
                              <Upload className="mr-2 h-4 w-4" />
                              Pilih Foto
                            </span>
                          </Button>
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Maksimal 5MB, akan dikompres otomatis ke 300KB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nama Lengkap *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    No. Telepon
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bidangKeahlian" className="text-right">
                    Bidang Keahlian
                  </Label>
                  <Input
                    id="bidangKeahlian"
                    value={formData.bidangKeahlian}
                    onChange={(e) => setFormData({ ...formData, bidangKeahlian: e.target.value })}
                    className="col-span-3"
                    placeholder="Contoh: Pertanian, Perdagangan, Kerajinan"
                  />
                </div>

                {/* Address Section */}
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">
                    Provinsi & Kabupaten *
                  </Label>
                  <div className="col-span-3">
                    <RegionSelector
                      provinsiId={formData.provinsiId}
                      kabupatenId={formData.kabupatenId}
                      kecamatanId={formData.kecamatanId}
                      desaId={formData.desaId}
                      onProvinsiChange={(provinsiId, provinsiName) => {
                      setFormData(prev => ({
                        ...prev,
                        provinsiId,
                        provinsi: provinsiName,
                        kabupatenId: "",
                        kabupaten: "",
                        kecamatanId: "",
                        kecamatan: "",
                        desaId: "",
                        desa: ""
                      }))
                    }}
                      onKabupatenChange={(kabupatenId, kabupatenName) => {
                      setFormData(prev => ({
                        ...prev,
                        kabupatenId,
                        kabupaten: kabupatenName,
                        kecamatanId: "",
                        kecamatan: "",
                        desaId: "",
                        desa: ""
                      }))
                    }}
                      onKecamatanChange={(kecamatanId, kecamatanName) => {
                      setFormData(prev => ({
                        ...prev,
                        kecamatanId,
                        kecamatan: kecamatanName,
                        desaId: "",
                        desa: ""
                      }))
                    }}
                      onDesaChange={(desaId, desaName) => {
                      setFormData(prev => ({
                        ...prev,
                        desaId,
                        desa: desaName
                      }))
                    }}
                      showKecamatan
                      showDesa
                      required
                    />
                  </div>
                </div>



                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="namaJalan" className="text-right">
                    Alamat Jalan
                  </Label>
                  <Input
                    id="namaJalan"
                    value={formData.namaJalan}
                    onChange={(e) => setFormData({ ...formData, namaJalan: e.target.value })}
                    className="col-span-3"
                    placeholder="Nama jalan, no rumah, patokan"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">
                    RT / RW
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Input
                      placeholder="RT"
                      value={formData.rt}
                      onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                    />
                    <Input
                      placeholder="RW"
                      value={formData.rw}
                      onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Daftar Mustahiq
          </CardTitle>
          <CardDescription>
            Total {mustahiqs.length} mustahiq terdaftar
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari mustahiq..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foto</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Bidang Keahlian</TableHead>
                <TableHead>Alumni</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMustahiqs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {searchTerm ? "Tidak ada mustahiq yang sesuai dengan pencarian" : "Belum ada data mustahiq"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMustahiqs.map((mustahiq) => (
                  <TableRow key={mustahiq.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={mustahiq.profilePhoto || undefined} />
                        <AvatarFallback>
                          {mustahiq.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{mustahiq.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {mustahiq.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {mustahiq.email}
                          </div>
                        )}
                        {mustahiq.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {mustahiq.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm">
                          {mustahiq.kabupaten}, {mustahiq.provinsi}
                        </span>
                      </div>
                      {(mustahiq.kecamatan || mustahiq.desa) && (
                        <div className="text-xs text-muted-foreground">
                          {[mustahiq.desa, mustahiq.kecamatan].filter(Boolean).join(", ")}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {mustahiq.bidangKeahlian && (
                        <Badge variant="secondary">
                          {mustahiq.bidangKeahlian}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {mustahiq._count?.alumni || 0} alumni
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(mustahiq)}
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
                              <AlertDialogTitle>Hapus Mustahiq</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus mustahiq "{mustahiq.name}"? 
                                Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(mustahiq.id)}
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}