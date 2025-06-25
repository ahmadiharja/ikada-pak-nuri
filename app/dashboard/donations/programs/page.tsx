'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Plus, Edit, Trash2, Calendar, Target, Users } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface DonationProgram {
  id: string
  title: string
  description: string
  type: 'wajib' | 'sukarela' | 'program'
  targetAmount?: number
  deadline?: string
  startDate: string
  endDate?: string
  status: 'draft' | 'aktif' | 'selesai'
  visible: boolean
  thumbnail?: string
  createdAt: string
  updatedAt: string
  _count?: {
    transactions: number
  }
}

interface ProgramFormData {
  title: string
  description: string
  type: 'wajib' | 'sukarela' | 'program'
  targetAmount: string
  deadline: string
  startDate: string
  endDate: string
  status: 'draft' | 'aktif' | 'selesai'
  visible: boolean
  thumbnail?: string
}

const programTypes = [
  { value: 'wajib', label: 'Donasi Wajib' },
  { value: 'sukarela', label: 'Donasi Sukarela' },
  { value: 'program', label: 'Program Kampanye' }
]

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'selesai', label: 'Selesai' }
]

export default function DonationProgramsPage() {
  const [programs, setPrograms] = useState<DonationProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<DonationProgram | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState<ProgramFormData>({
    title: '',
    description: '',
    type: 'sukarela',
    targetAmount: '',
    deadline: '',
    startDate: '',
    endDate: '',
    status: 'draft',
    visible: true,
    thumbnail: ''
  })

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/donations/programs')
      if (response.ok) {
        const data = await response.json()
        setPrograms(data)
      }
    } catch (error) {
      console.error('Error fetching programs:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data program donasi',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('thumbnail', file)

      const response = await fetch('/api/donations/programs/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, thumbnail: data.imageUrl }))
        toast({
          title: 'Berhasil',
          description: 'Gambar berhasil diupload'
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal mengupload gambar',
        variant: 'destructive'
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const payload = {
        ...formData,
        targetAmount: formData.targetAmount ? parseInt(formData.targetAmount) : null,
        deadline: formData.deadline || null,
        endDate: formData.endDate || null,
        thumbnail: formData.thumbnail || null
      }

      const url = editingProgram 
        ? `/api/donations/programs/${editingProgram.id}`
        : '/api/donations/programs'
      
      const method = editingProgram ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: editingProgram ? 'Program donasi berhasil diperbarui' : 'Program donasi berhasil dibuat'
        })
        fetchPrograms()
        closeModal()
      } else {
        throw new Error('Failed to save program')
      }
    } catch (error) {
      console.error('Error saving program:', error)
      toast({
        title: 'Error',
        description: 'Gagal menyimpan program donasi',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus program ini?')) return

    try {
      const response = await fetch(`/api/donations/programs/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Program donasi berhasil dihapus'
        })
        fetchPrograms()
      } else {
        throw new Error('Failed to delete program')
      }
    } catch (error) {
      console.error('Error deleting program:', error)
      toast({
        title: 'Error',
        description: 'Gagal menghapus program donasi',
        variant: 'destructive'
      })
    }
  }

  const openModal = (program?: DonationProgram) => {
    if (program) {
      setEditingProgram(program)
      setFormData({
        title: program.title,
        description: program.description,
        type: program.type,
        targetAmount: program.targetAmount?.toString() || '',
        deadline: program.deadline ? program.deadline.split('T')[0] : '',
        startDate: program.startDate.split('T')[0],
        endDate: program.endDate ? program.endDate.split('T')[0] : '',
        status: program.status,
        visible: program.visible,
        thumbnail: program.thumbnail || ''
      })
    } else {
      setEditingProgram(null)
      setFormData({
        title: '',
        description: '',
        type: 'sukarela',
        targetAmount: '',
        deadline: '',
        startDate: '',
        endDate: '',
        status: 'draft',
        visible: true,
        thumbnail: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProgram(null)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      aktif: 'default',
      selesai: 'outline'
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      wajib: 'bg-red-100 text-red-800',
      sukarela: 'bg-blue-100 text-blue-800',
      program: 'bg-green-100 text-green-800'
    } as const
    
    const labels = {
      wajib: 'Wajib',
      sukarela: 'Sukarela',
      program: 'Kampanye'
    } as const
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type as keyof typeof colors]}`}>
        {labels[type as keyof typeof labels]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Memuat data...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Program Donasi</h1>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Program
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProgram ? 'Edit Program Donasi' : 'Tambah Program Donasi'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Judul Program *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Tipe Program *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'wajib' | 'sukarela' | 'program') => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {programTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'draft' | 'aktif' | 'selesai') => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="targetAmount">Target Donasi (Rp)</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    placeholder="Opsional untuk kampanye"
                  />
                </div>

                <div>
                  <Label htmlFor="startDate">Tanggal Mulai *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">Tanggal Berakhir</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="deadline">Deadline Kampanye</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    placeholder="Untuk kampanye berbatas waktu"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Deskripsi *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="thumbnail">Thumbnail Program</Label>
                  <div className="space-y-2">
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleImageUpload(file)
                        }
                      }}
                      disabled={uploadingImage}
                    />
                    {uploadingImage && (
                      <p className="text-sm text-gray-500">Mengupload gambar...</p>
                    )}
                    {formData.thumbnail && (
                      <div className="mt-2">
                        <img
                          src={formData.thumbnail}
                          alt="Preview thumbnail"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => setFormData({ ...formData, thumbnail: '' })}
                        >
                          Hapus Gambar
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Format: JPG, PNG, WebP. Maksimal 5MB.
                    </p>
                  </div>
                </div>

                <div className="col-span-2 flex items-center space-x-2">
                  <Switch
                    id="visible"
                    checked={formData.visible}
                    onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
                  />
                  <Label htmlFor="visible">Tampilkan di halaman publik</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingProgram ? 'Perbarui' : 'Simpan'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                >
                  Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {programs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Belum ada program donasi</p>
            </CardContent>
          </Card>
        ) : (
          programs.map((program) => (
            <Card key={program.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    {program.thumbnail && (
                      <div className="flex-shrink-0">
                        <img
                          src={program.thumbnail}
                          alt={program.title}
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg truncate">{program.title}</h3>
                        {getTypeBadge(program.type)}
                        {getStatusBadge(program.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        {program.targetAmount && (
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3 text-green-600" />
                            <span className="truncate">Rp {program.targetAmount.toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          <span className="truncate">{new Date(program.startDate).toLocaleDateString('id-ID')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-purple-600" />
                          <span>{program._count?.transactions || 0} donatur</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(program)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(program.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}