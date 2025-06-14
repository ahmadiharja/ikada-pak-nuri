"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { RegionSelector } from "@/components/ui/region-selector"
import { Plus, Edit, Trash2, Search, Building2, MapPin } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Syubiyah {
  id: string
  name: string
  description?: string
  provinsi: string
  kabupaten: string
  provinsiId?: string
  kabupatenId?: string
  createdAt: string
  updatedAt: string
  _count?: {
    alumni: number
  }
}

interface SyubiyahFormData {
  name: string
  description: string
  provinsi: string
  kabupaten: string
  provinsiId: string
  kabupatenId: string
}

const initialFormData: SyubiyahFormData = {
  name: "",
  description: "",
  provinsi: "",
  kabupaten: "",
  provinsiId: "",
  kabupatenId: ""
}

export default function SyubiyahPage() {
  const [syubiyahs, setSyubiyahs] = useState<Syubiyah[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<SyubiyahFormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)

  // Fetch syubiyahs
  const fetchSyubiyahs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/syubiyah')
      if (response.ok) {
        const data = await response.json()
        setSyubiyahs(data.syubiyah || [])
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data syubiyah",
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
    fetchSyubiyahs()
  }, [])

  // Filter syubiyahs based on search term
  const filteredSyubiyahs = syubiyahs && Array.isArray(syubiyahs) ? syubiyahs.filter(syubiyah =>
    syubiyah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    syubiyah.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    syubiyah.provinsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    syubiyah.kabupaten.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingId ? `/api/syubiyah/${editingId}` : '/api/syubiyah'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: editingId ? "Syubiyah berhasil diperbarui" : "Syubiyah berhasil ditambahkan"
        })
        setIsDialogOpen(false)
        setEditingId(null)
        setFormData(initialFormData)
        fetchSyubiyahs()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Terjadi kesalahan",
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
  const handleEdit = (syubiyah: Syubiyah) => {
    setEditingId(syubiyah.id)
    setFormData({
      name: syubiyah.name,
      description: syubiyah.description || "",
      provinsi: syubiyah.provinsi,
      kabupaten: syubiyah.kabupaten,
      provinsiId: syubiyah.provinsiId || "",
      kabupatenId: syubiyah.kabupatenId || ""
    })
    setIsDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/syubiyah/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Syubiyah berhasil dihapus"
        })
        fetchSyubiyahs()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Gagal menghapus syubiyah",
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

  // Reset form
  const resetForm = () => {
    setFormData(initialFormData)
    setEditingId(null)
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Syubiyah</h1>
          <p className="text-muted-foreground">
            Kelola data syubiyah dan cabang organisasi
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Syubiyah
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Syubiyah" : "Tambah Syubiyah Baru"}
              </DialogTitle>
              <DialogDescription>
                {editingId ? "Perbarui informasi syubiyah" : "Tambahkan syubiyah baru ke dalam sistem"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nama Syubiyah *
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
                  <Label htmlFor="description" className="text-right">
                    Deskripsi
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">
                    Lokasi *
                  </Label>
                  <div className="col-span-3">
                    <RegionSelector
                      provinsiId={formData.provinsiId}
                      kabupatenId={formData.kabupatenId}
                      onProvinsiChange={(provinsiId, provinsiName) => {
                        setFormData({
                          ...formData,
                          provinsiId,
                          provinsi: provinsiName,
                          kabupatenId: "",
                          kabupaten: ""
                        })
                      }}
                      onKabupatenChange={(kabupatenId, kabupatenName) => {
                        setFormData({
                          ...formData,
                          kabupatenId,
                          kabupaten: kabupatenName
                        })
                      }}
                      required
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
            <Building2 className="h-5 w-5" />
            Daftar Syubiyah
          </CardTitle>
          <CardDescription>
            Total {syubiyahs && Array.isArray(syubiyahs) ? syubiyahs.length : 0} syubiyah terdaftar
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari syubiyah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Memuat data...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Syubiyah</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Alumni</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSyubiyahs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "Tidak ada syubiyah yang ditemukan" : "Belum ada data syubiyah"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSyubiyahs.map((syubiyah) => (
                    <TableRow key={syubiyah.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{syubiyah.name}</div>
                          {syubiyah.description && (
                            <div className="text-sm text-muted-foreground">
                              {syubiyah.description.length > 50
                                ? `${syubiyah.description.substring(0, 50)}...`
                                : syubiyah.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{syubiyah.kabupaten}</div>
                            <div className="text-sm text-muted-foreground">{syubiyah.provinsi}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {syubiyah._count?.alumni || 0} alumni
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(syubiyah)}
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
                                <AlertDialogTitle>Hapus Syubiyah</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus syubiyah "{syubiyah.name}"?
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(syubiyah.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}