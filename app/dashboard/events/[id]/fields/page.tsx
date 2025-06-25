'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Plus, Edit, Trash2, GripVertical, ArrowLeft } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

interface FormField {
  id: string
  label: string
  type: string
  required: boolean
  options: string[] | null
  order: number
}

interface FormFieldData {
  label: string
  type: string
  required: boolean
  options: string
  order: number
}

const fieldTypes = [
  { value: 'TEXT', label: 'Teks' },
  { value: 'TEXTAREA', label: 'Teks Panjang' },
  { value: 'SELECT', label: 'Pilihan Dropdown' },
  { value: 'RADIO', label: 'Pilihan Radio' },
  { value: 'CHECKBOX', label: 'Checkbox' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Telepon' },
  { value: 'NUMBER', label: 'Angka' },
  { value: 'DATE', label: 'Tanggal' }
]

export default function EventFieldsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [fields, setFields] = useState<FormField[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingField, setEditingField] = useState<FormField | null>(null)
  const [formData, setFormData] = useState<FormFieldData>({
    label: '',
    type: 'TEXT',
    required: false,
    options: '',
    order: 0
  })

  useEffect(() => {
    fetchFields()
  }, [eventId])

  const fetchFields = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/fields`)
      if (response.ok) {
        const data = await response.json()
        setFields(data)
      }
    } catch (error) {
      console.error('Error fetching fields:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const payload = {
        ...formData,
        options: formData.options ? formData.options.split('\n').filter(opt => opt.trim()) : null,
        order: fields.length
      }

      const url = editingField 
        ? `/api/events/${eventId}/fields/${editingField.id}`
        : `/api/events/${eventId}/fields`
      
      const method = editingField ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        await fetchFields()
        setIsModalOpen(false)
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error saving field:', error)
      alert('Terjadi kesalahan')
    }
  }

  const handleEdit = (field: FormField) => {
    setEditingField(field)
    setFormData({
      label: field.label,
      type: field.type,
      required: field.required,
      options: field.options ? field.options.join('\n') : '',
      order: field.order
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (fieldId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus field ini?')) return

    try {
      const response = await fetch(`/api/events/${eventId}/fields/${fieldId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchFields()
      } else {
        const error = await response.json()
        alert(error.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error deleting field:', error)
      alert('Terjadi kesalahan')
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const items = Array.from(fields)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order
    const updatedFields = items.map((item, index) => ({
      ...item,
      order: index
    }))

    setFields(updatedFields)

    try {
      await fetch(`/api/events/${eventId}/fields`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields: updatedFields })
      })
    } catch (error) {
      console.error('Error updating field order:', error)
      // Revert on error
      fetchFields()
    }
  }

  const resetForm = () => {
    setFormData({
      label: '',
      type: 'TEXT',
      required: false,
      options: '',
      order: 0
    })
    setEditingField(null)
  }

  const openModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Memuat...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/events/list')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold">Form Fields Event</h1>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openModal}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Field
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingField ? 'Edit Field' : 'Tambah Field'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="label">Label *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">Tipe Field *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={formData.required}
                  onCheckedChange={(checked) => setFormData({ ...formData, required: checked })}
                />
                <Label htmlFor="required">Field Wajib</Label>
              </div>

              {(formData.type === 'SELECT' || formData.type === 'RADIO' || formData.type === 'CHECKBOX') && (
                <div>
                  <Label htmlFor="options">Pilihan (satu per baris)</Label>
                  <Textarea
                    id="options"
                    value={formData.options}
                    onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                    placeholder="Pilihan 1\nPilihan 2\nPilihan 3"
                    rows={4}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingField ? 'Perbarui' : 'Tambah'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {fields.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">Belum ada form field</p>
            <Button onClick={openModal}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Field Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="fields">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {fields.map((field, index) => (
                  <Draggable key={field.id} draggableId={field.id} index={index}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="w-4 h-4 text-gray-400" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{field.label}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline">
                                    {fieldTypes.find(t => t.value === field.type)?.label}
                                  </Badge>
                                  {field.required && (
                                    <Badge variant="destructive">Wajib</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(field)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(field.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        {field.options && (
                          <CardContent className="pt-0">
                            <div className="text-sm text-gray-600">
                              <strong>Pilihan:</strong> {field.options.join(', ')}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  )
}