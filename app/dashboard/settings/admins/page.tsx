"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Search, UserCog, Shield } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: "PUSAT" | "SYUBIYAH"
  syubiyah_id?: string
  syubiyah?: {
    id: string
    name: string
  }
  isVerified: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    userRoles: number
  }
}

interface Syubiyah {
  id: string
  name: string
}

interface UserFormData {
  name: string
  email: string
  password: string
  role: "PUSAT" | "SYUBIYAH"
  syubiyah_id?: string
}

const initialFormData: UserFormData = {
  name: "",
  email: "",
  password: "",
  role: "PUSAT",
  syubiyah_id: undefined
}

export default function AdminsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [syubiyahs, setSyubiyahs] = useState<Syubiyah[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<UserFormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)

  // Fetch users and syubiyahs
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch users
      const usersResponse = await fetch('/api/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users)
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data pengguna",
          variant: "destructive"
        })
      }
      
      // Fetch syubiyahs for dropdown
      const syubiyahsResponse = await fetch('/api/syubiyah')
      if (syubiyahsResponse.ok) {
        const syubiyahsData = await syubiyahsResponse.json()
        setSyubiyahs(syubiyahsData)
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
    fetchData()
  }, [])

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.syubiyah?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingId ? `/api/users/${editingId}` : '/api/users'
      const method = editingId ? 'PUT' : 'POST'

      // If editing and password is empty, remove it from the payload
      const payload = { ...formData }
      if (editingId && !payload.password) {
        delete payload.password
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: editingId ? "Pengguna berhasil diperbarui" : "Pengguna berhasil ditambahkan"
        })
        setIsDialogOpen(false)
        setEditingId(null)
        setFormData(initialFormData)
        fetchData()
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
  const handleEdit = (user: User) => {
    setEditingId(user.id)
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Don't include password when editing
      role: user.role,
      syubiyah_id: user.syubiyah_id
    })
    setIsDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Pengguna berhasil dihapus"
        })
        fetchData()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Gagal menghapus pengguna",
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

  // Format role for display
  const formatRole = (role: string) => {
    switch (role) {
      case "PUSAT":
        return "Admin Pusat"
      case "SYUBIYAH":
        return "Admin Syubiyah"
      default:
        return role
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Admin</h1>
          <p className="text-muted-foreground">
            Kelola pengguna admin sistem
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Admin" : "Tambah Admin Baru"}
              </DialogTitle>
              <DialogDescription>
                {editingId ? "Perbarui informasi admin" : "Tambahkan admin baru ke dalam sistem"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
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
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password {!editingId && "*"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="col-span-3"
                    required={!editingId}
                    placeholder={editingId ? "Biarkan kosong jika tidak ingin mengubah" : ""}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Tipe Admin *
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "PUSAT" | "SYUBIYAH") => {
                      setFormData({
                        ...formData,
                        role: value,
                        syubiyah_id: value === "SYUBIYAH" ? formData.syubiyah_id : undefined
                      })
                    }}
                    required
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih tipe admin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUSAT">Admin Pusat</SelectItem>
                      <SelectItem value="SYUBIYAH">Admin Syubiyah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.role === "SYUBIYAH" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="syubiyah" className="text-right">
                      Syubiyah *
                    </Label>
                    <Select
                      value={formData.syubiyah_id}
                      onValueChange={(value) => setFormData({ ...formData, syubiyah_id: value })}
                      required={formData.role === "SYUBIYAH"}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Pilih syubiyah" />
                      </SelectTrigger>
                      <SelectContent>
                        {syubiyahs.map((syubiyah) => (
                          <SelectItem key={syubiyah.id} value={syubiyah.id}>
                            {syubiyah.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
            <UserCog className="h-5 w-5" />
            Daftar Admin
          </CardTitle>
          <CardDescription>
            Total {users.length} admin terdaftar
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari admin..."
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
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Syubiyah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "Tidak ada admin yang ditemukan" : "Belum ada data admin"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "PUSAT" ? "default" : "outline"}>
                          {formatRole(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.syubiyah ? user.syubiyah.name : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isVerified ? "success" : "destructive"}>
                          {user.isVerified ? "Terverifikasi" : "Belum Verifikasi"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/dashboard/settings/admins/${user.id}/roles`}>
                            Kelola Role ({user._count?.userRoles || 0})
                          </a>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
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
                                <AlertDialogTitle>Hapus Admin</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus admin "{user.name}"?
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(user.id)}
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