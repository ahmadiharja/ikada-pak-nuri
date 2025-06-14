'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface EventCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  eventCount?: number;
  createdAt: string;
  updatedAt: string;
}

const colorOptions = [
  { name: 'Biru', value: '#3b82f6' },
  { name: 'Hijau', value: '#10b981' },
  { name: 'Merah', value: '#ef4444' },
  { name: 'Kuning', value: '#f59e0b' },
  { name: 'Ungu', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Abu-abu', value: '#6b7280' }
];

export default function EventCategoriesPage() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  });

  useEffect(() => {
    fetchCategories();
  }, [searchTerm]);

  const fetchCategories = async () => {
    try {
      const params = new URLSearchParams({
        withEventCount: 'true',
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await fetch(`/api/events/categories?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.categories);
      } else {
        toast.error(data.error || 'Failed to fetch categories');
      }
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      const response = await fetch('/api/events/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Category created successfully');
        setIsCreateModalOpen(false);
        resetForm();
        fetchCategories();
      } else {
        toast.error(data.error || 'Failed to create category');
      }
    } catch (error) {
      toast.error('Failed to create category');
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory) return;
    
    try {
      const response = await fetch(`/api/events/categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Category updated successfully');
        setIsEditModalOpen(false);
        setSelectedCategory(null);
        resetForm();
        fetchCategories();
      } else {
        toast.error(data.error || 'Failed to update category');
      }
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/events/categories/${categoryId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Category deleted successfully');
        fetchCategories();
      } else {
        toast.error(data.error || 'Failed to delete category');
      }
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3b82f6'
    });
  };

  const openEditModal = (category: EventCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color
    });
    setIsEditModalOpen(true);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Kategori Event</h1>
          <p className="text-gray-600">Kelola kategori untuk mengorganisir event</p>
        </div>
        {session?.user?.role === 'PUSAT' && (
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Buat Kategori Baru
          </Button>
        )}
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    {category.description && (
                      <CardDescription className="mt-1">
                        {category.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
                {session?.user?.role === 'PUSAT' && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Tag className="h-4 w-4" />
                  {category.eventCount || 0} event
                </div>
                <Badge 
                  style={{ 
                    backgroundColor: category.color + '20', 
                    color: category.color,
                    border: `1px solid ${category.color}40`
                  }}
                >
                  {category.name}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {searchTerm ? 'Kategori tidak ditemukan' : 'Belum ada kategori'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Coba ubah kata kunci pencarian Anda' 
                : 'Mulai dengan membuat kategori pertama untuk mengorganisir event'
              }
            </p>
            {!searchTerm && session?.user?.role === 'PUSAT' && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Buat Kategori Pertama
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Category Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedCategory(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isCreateModalOpen ? 'Buat Kategori Baru' : 'Edit Kategori'}
            </DialogTitle>
            <DialogDescription>
              {isCreateModalOpen 
                ? 'Isi form di bawah untuk membuat kategori event baru' 
                : 'Edit informasi kategori event'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Kategori *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Masukkan nama kategori"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Deskripsi kategori (opsional)"
                rows={3}
              />
            </div>
            
            <div>
              <Label>Warna Kategori</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      formData.color === color.value 
                        ? 'border-gray-800 scale-110' 
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    title={color.name}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Warna terpilih: <span style={{ color: formData.color }}>●</span> {colorOptions.find(c => c.value === formData.color)?.name}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedCategory(null);
                resetForm();
              }}
            >
              Batal
            </Button>
            <Button
              onClick={isCreateModalOpen ? handleCreateCategory : handleEditCategory}
              disabled={!formData.name.trim()}
            >
              {isCreateModalOpen ? 'Buat Kategori' : 'Update Kategori'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}