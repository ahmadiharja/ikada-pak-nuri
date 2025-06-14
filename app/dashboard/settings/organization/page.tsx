'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, Edit, Trash2, Users, Building2, UserCheck } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface OrganizationMember {
  id: string
  name: string
  position: string
  department: string
  level: number
  parentId?: string
  city?: string
  photo?: string
  description?: string
  email?: string
  phone?: string
  isActive: boolean
  createdAt: string
}

const DEPARTMENTS = [
  'Dewan Penyantun',
  'Dewan Pengawas', 
  'Dewan Harian',
  'Biro Masholihul Mutakhorijin',
  'Biro Konsolidasi Organisasi dan Humasy',
  'Biro Perlengkapan dan Pembantu Umum',
  'Biro Pemberdayaan Perempuan',
  'Biro Ekonomi Kreatif',
  'Biro Penyuluhan dan Bantuan Hukum',
  'Biro Kesehatan',
  'Biro 8',
  'Tim Khusus'
]

const POSITIONS = {
  'Dewan Penyantun': ['Pelindung', 'Penasehat', 'Pembina'],
  'Dewan Pengawas': ['Anggota Dewan Pengawas'],
  'Dewan Harian': ['Ketua', 'Sekretaris', 'Bendahara'],
  'Biro Masholihul Mutakhorijin': ['Kepala Biro', 'Wakil Kepala Biro', 'Anggota Biro'],
  'Biro Konsolidasi Organisasi dan Humasy': ['Kepala Biro', 'Wakil Kepala Biro', 'Anggota Biro'],
  'Biro Perlengkapan dan Pembantu Umum': ['Kepala Biro', 'Wakil Kepala Biro', 'Anggota Biro'],
  'Biro Pemberdayaan Perempuan': ['Kepala Biro', 'Wakil Kepala Biro', 'Anggota Biro'],
  'Biro Ekonomi Kreatif': ['Kepala Biro', 'Wakil Kepala Biro', 'Anggota Biro'],
  'Biro Penyuluhan dan Bantuan Hukum': ['Kepala Biro', 'Wakil Kepala Biro', 'Anggota Biro'],
  'Biro Kesehatan': ['Kepala Biro', 'Wakil Kepala Biro', 'Anggota Biro'],
  'Biro 8': ['Kepala Biro', 'Wakil Kepala Biro', 'Anggota Biro'],
  'Tim Khusus': ['Koordinator Tim', 'Anggota Tim']
}

interface MultiMemberForm {
  name: string
  city: string
  email?: string
  phone?: string
  photo?: string
  description?: string
}

export default function OrganizationPage() {
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(null)
  const [isMultiMode, setIsMultiMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    level: 1,
    parentId: '',
    city: '',
    photo: '',
    description: '',
    email: '',
    phone: '',
    isActive: true
  })
  const [multiMembers, setMultiMembers] = useState<MultiMemberForm[]>([{ name: '', city: '' }])
  const [multiFormData, setMultiFormData] = useState({
    position: '',
    department: '',
    level: 1,
    parentId: '',
    isActive: true
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/organization')
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (isMultiMode && !editingMember) {
        // Handle multi-member submission
        const promises = multiMembers.filter(member => member.name.trim()).map(member => 
          fetch('/api/organization', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...multiFormData,
              name: member.name,
              city: member.city,
              email: member.email,
              phone: member.phone,
              photo: member.photo,
              description: member.description
            }),
          })
        )
        
        const responses = await Promise.all(promises)
        const allSuccessful = responses.every(response => response.ok)
        
        if (allSuccessful) {
          toast({
            title: 'Berhasil ditambahkan',
            description: `${multiMembers.filter(m => m.name.trim()).length} anggota organisasi berhasil ditambahkan.`,
          })
          fetchMembers()
          resetForm()
          setIsDialogOpen(false)
        } else {
          throw new Error('Some members failed to save')
        }
      } else {
        // Handle single member submission
        const url = editingMember ? `/api/organization/${editingMember.id}` : '/api/organization'
        const method = editingMember ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          toast({
            title: editingMember ? 'Berhasil diperbarui' : 'Berhasil ditambahkan',
            description: `Anggota organisasi ${editingMember ? 'diperbarui' : 'ditambahkan'} dengan sukses.`,
          })
          fetchMembers()
          resetForm()
          setIsDialogOpen(false)
        } else {
          throw new Error('Failed to save member')
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat menyimpan data.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus anggota ini?')) return
    
    try {
      const response = await fetch(`/api/organization/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Berhasil dihapus',
          description: 'Anggota organisasi berhasil dihapus.',
        })
        fetchMembers()
      } else {
        throw new Error('Failed to delete member')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat menghapus data.',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      department: '',
      level: 1,
      parentId: '',
      city: '',
      photo: '',
      description: '',
      email: '',
      phone: '',
      isActive: true
    })
    setMultiMembers([{ name: '', city: '' }])
    setMultiFormData({
      position: '',
      department: '',
      level: 1,
      parentId: '',
      isActive: true
    })
    setIsMultiMode(false)
    setEditingMember(null)
  }

  const addMultiMember = () => {
    setMultiMembers([...multiMembers, { name: '', city: '' }])
  }

  const removeMultiMember = (index: number) => {
    if (multiMembers.length > 1) {
      setMultiMembers(multiMembers.filter((_, i) => i !== index))
    }
  }

  const updateMultiMember = (index: number, field: keyof MultiMemberForm, value: string) => {
    const updated = multiMembers.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    )
    setMultiMembers(updated)
  }

  const openEditDialog = (member: OrganizationMember) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      position: member.position,
      department: member.department,
      level: member.level,
      parentId: member.parentId || '',
      city: member.city || '',
      photo: member.photo || '',
      description: member.description || '',
      email: member.email || '',
      phone: member.phone || '',
      isActive: member.isActive
    })
    setIsDialogOpen(true)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Susunan Organisasi</h1>
          <p className="text-muted-foreground">
            Kelola struktur organisasi IKADA
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Anggota
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? 'Edit Anggota' : 'Tambah Anggota Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingMember ? 'Perbarui informasi anggota organisasi' : 'Tambahkan anggota baru ke struktur organisasi'}
              </DialogDescription>
            </DialogHeader>
            
            {!editingMember && (
              <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                <Label className="text-sm font-medium">Mode Input:</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="single-mode"
                    name="input-mode"
                    checked={!isMultiMode}
                    onChange={() => setIsMultiMode(false)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="single-mode" className="text-sm">Satu Anggota</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="multi-mode"
                    name="input-mode"
                    checked={isMultiMode}
                    onChange={() => setIsMultiMode(true)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="multi-mode" className="text-sm">Multiple Anggota</Label>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isMultiMode || editingMember ? (
                // Single Member Form
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">Kota</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Contoh: Tuban"
                    />
                  </div>
                </>
              ) : (
                // Multi Member Form
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Daftar Anggota</Label>
                    <Button type="button" onClick={addMultiMember} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Tambah Nama
                    </Button>
                  </div>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {multiMembers.map((member, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Nama lengkap"
                            value={member.name}
                            onChange={(e) => updateMultiMember(index, 'name', e.target.value)}
                            required
                          />
                          <Input
                            placeholder="Kota asal"
                            value={member.city}
                            onChange={(e) => updateMultiMember(index, 'city', e.target.value)}
                          />
                        </div>
                        {multiMembers.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeMultiMember(index)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Departemen</Label>
                  <Select
                    value={isMultiMode && !editingMember ? multiFormData.department : formData.department}
                    onValueChange={(value) => {
                      if (isMultiMode && !editingMember) {
                        setMultiFormData({ ...multiFormData, department: value, position: '' })
                      } else {
                        setFormData({ ...formData, department: value, position: '' })
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih departemen" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Jabatan</Label>
                  <Select
                    value={isMultiMode && !editingMember ? multiFormData.position : formData.position}
                    onValueChange={(value) => {
                      if (isMultiMode && !editingMember) {
                        setMultiFormData({ ...multiFormData, position: value })
                      } else {
                        setFormData({ ...formData, position: value })
                      }
                    }}
                    disabled={isMultiMode && !editingMember ? !multiFormData.department : !formData.department}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jabatan" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const currentDepartment = isMultiMode && !editingMember ? multiFormData.department : formData.department;
                        const positions = currentDepartment ? POSITIONS[currentDepartment as keyof typeof POSITIONS] : [];
                        return positions?.map((pos) => (
                          <SelectItem key={pos} value={pos}>
                            {pos}
                          </SelectItem>
                        )) || [];
                      })()}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={(isMultiMode && !editingMember ? multiFormData.level : formData.level).toString()}
                    onValueChange={(value) => {
                      if (isMultiMode && !editingMember) {
                        setMultiFormData({ ...multiFormData, level: parseInt(value) })
                      } else {
                        setFormData({ ...formData, level: parseInt(value) })
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Level 1 (Tertinggi)</SelectItem>
                      <SelectItem value="2">Level 2</SelectItem>
                      <SelectItem value="3">Level 3</SelectItem>
                      <SelectItem value="4">Level 4</SelectItem>
                      <SelectItem value="5">Level 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telepon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">URL Foto</Label>
                <Input
                  id="photo"
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi singkat tentang anggota..."
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingMember ? 'Perbarui' : 'Tambah'}
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
            Daftar Anggota Organisasi
          </CardTitle>
          <CardDescription>
            Kelola anggota struktur organisasi IKADA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Anggota</TableHead>
                <TableHead>Kota</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.photo} />
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        {member.email && (
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {member.city || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{member.department}</Badge>
                  </TableCell>
                  <TableCell>{member.position}</TableCell>
                  <TableCell>
                    <Badge variant={member.level <= 2 ? 'default' : 'secondary'}>
                      Level {member.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.isActive ? 'default' : 'secondary'}>
                      {member.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(member)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">Belum ada anggota organisasi</p>
                      <Button variant="outline" onClick={openAddDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Anggota Pertama
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}