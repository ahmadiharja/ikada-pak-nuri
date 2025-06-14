'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Tag, FileText, Palette } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
}

const initialFormData: CategoryFormData = {
  name: '',
  description: '',
  color: '#3B82F6'
};

const predefinedColors = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280'  // Gray
];

export default function CategoriesPage() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [stats, setStats] = useState({
    total: 0,
    totalPosts: 0
  });

  // Check if user is admin
  const isAdmin = session?.user?.role === 'PUSAT';

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        withPostCount: 'true',
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await fetch(`/api/news/categories?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.categories);
        
        // Calculate stats
        const totalPosts = data.categories.reduce((sum: number, cat: Category) => sum + (cat.postCount || 0), 0);
        setStats({
          total: data.categories.length,
          totalPosts
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch categories',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch categories',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [searchTerm]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast({
        title: 'Error',
        description: 'Only admin can manage categories',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/news/categories/${editingId}` : '/api/news/categories';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message
        });
        setIsModalOpen(false);
        setEditingId(null);
        setFormData(initialFormData);
        fetchCategories();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save category',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save category',
        variant: 'destructive'
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      toast({
        title: 'Error',
        description: 'Only admin can delete categories',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/news/categories/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message
        });
        fetchCategories();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete category',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive'
      });
    }
  };

  // Handle edit
  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6'
    });
    setIsModalOpen(true);
  };

  // Reset modal
  const resetModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Kategori</h1>
          <p className="text-muted-foreground">Kelola kategori untuk artikel dan berita</p>
        </div>
        {isAdmin && (
          <Dialog open={isModalOpen} onOpenChange={resetModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Kategori
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Kategori *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Masukkan nama kategori"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Deskripsi kategori (opsional)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="color">Warna Kategori</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500"
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetModal}>
                    Batal
                  </Button>
                  <Button type="submit">
                    {editingId ? 'Update' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kategori</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Post</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama kategori atau deskripsi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm('')}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
          <CardDescription>
            Menampilkan {categories.length} kategori
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Belum ada kategori</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ? 'Tidak ada kategori yang sesuai dengan pencarian.' : 'Mulai dengan membuat kategori pertama.'}
              </p>
              {isAdmin && !searchTerm && (
                <div className="mt-6">
                  <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Kategori
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Jumlah Post</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  {isAdmin && <TableHead>Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: category.color || '#3B82F6' }}
                        />
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-muted-foreground">{category.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {category.description ? (
                          <span className="text-sm">{category.description}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Tidak ada deskripsi</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {category.postCount || 0} post
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(category.createdAt)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                disabled={(category.postCount || 0) > 0}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus kategori "{category.name}"? 
                                  Tindakan ini tidak dapat dibatalkan.
                                  {(category.postCount || 0) > 0 && (
                                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                      <strong>Peringatan:</strong> Kategori ini memiliki {category.postCount} post. 
                                      Pindahkan atau hapus post tersebut terlebih dahulu.
                                    </div>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(category.id)}
                                  disabled={(category.postCount || 0) > 0}
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}