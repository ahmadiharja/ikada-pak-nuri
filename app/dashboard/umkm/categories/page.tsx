'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  ChevronDown,
  FolderOpen,
  Folder,
  Tag,
  Move,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  level: number;
  parentId?: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  parent?: Category;
  children?: Category[];
  productCount?: number;
  _count?: {
    products: number;
  };
}

interface CategoryForm {
  name: string;
  description: string;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  parentId?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');
  const [formData, setFormData] = useState<CategoryForm>({
    name: '',
    description: '',
    icon: '',
    color: '#3B82F6',
    sortOrder: 0,
    isActive: true,
    parentId: undefined,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching categories...');
      const response = await fetch('/api/products/categories?includeCount=true&hierarchical=true');
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Categories data:', data);
        setCategories(data);
        // Flatten categories for table view and parent selection
        const flattened = flattenCategories(data);
        console.log('Flattened categories:', flattened);
        setFlatCategories(flattened);
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        toast.error('Gagal mengambil data kategori');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Terjadi kesalahan saat mengambil data kategori');
    } finally {
      setLoading(false);
    }
  };

  const flattenCategories = (categories: Category[], level = 0): Category[] => {
    const result: Category[] = [];
    categories.forEach(category => {
      result.push({ ...category, level });
      if (category.children && category.children.length > 0) {
        result.push(...flattenCategories(category.children, level + 1));
      }
    });
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingCategory 
        ? `/api/products/categories/${editingCategory.id}`
        : '/api/products/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editingCategory 
          ? "Kategori berhasil diperbarui" 
          : "Kategori berhasil dibuat"
        );
        
        setIsDialogOpen(false);
        setEditingCategory(null);
        resetForm();
        fetchCategories();
      } else {
        toast.error(data.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error("Gagal menyimpan kategori");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6',
      icon: category.icon || '',
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      parentId: category.parentId
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${category.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/categories/${category.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success("Kategori berhasil dihapus");
        fetchCategories();
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal menghapus kategori");
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error("Gagal menghapus kategori");
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      icon: '',
      sortOrder: 0,
      isActive: true,
      parentId: undefined
    });
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const addIds = (cats: Category[]) => {
      cats.forEach(cat => {
        if (cat.children && cat.children.length > 0) {
          allIds.add(cat.id);
          addIds(cat.children);
        }
      });
    };
    addIds(categories);
    setExpandedCategories(allIds);
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    resetForm();
  };

  const filterCategories = (cats: Category[], term: string): Category[] => {
    if (!term) return cats;
    
    return cats.filter(category => {
      const matchesSearch = 
        category.name.toLowerCase().includes(term.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(term.toLowerCase()));
      
      const hasMatchingChildren = category.children && 
        filterCategories(category.children, term).length > 0;
      
      if (matchesSearch || hasMatchingChildren) {
        return {
          ...category,
          children: category.children ? filterCategories(category.children, term) : []
        };
      }
      
      return false;
    }).map(category => ({
      ...category,
      children: category.children ? filterCategories(category.children, term) : []
    }));
  };

  const filteredCategories = filterCategories(categories, searchTerm);
  const filteredFlatCategories = flatCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderCategoryTree = (cats: Category[], level = 0) => {
    return cats.map((category) => (
      <div key={category.id} className="border-l-2 border-gray-100">
        <div 
          className={`flex items-center py-2 px-3 hover:bg-gray-50 ${
            level > 0 ? 'ml-' + (level * 6) : ''
          }`}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          {/* Expand/Collapse Button */}
          {category.children && category.children.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 mr-2"
              onClick={() => toggleExpanded(category.id)}
            >
              {expandedCategories.has(category.id) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6 mr-2" />
          )}

          {/* Category Icon */}
          <div className="mr-3">
            {category.children && category.children.length > 0 ? (
              expandedCategories.has(category.id) ? (
                <FolderOpen className="h-4 w-4 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 text-blue-500" />
              )
            ) : (
              <Tag className="h-4 w-4 text-gray-500" />
            )}
          </div>

          {/* Category Info */}
          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {category.icon && (
                <span className="text-lg">{category.icon}</span>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{category.name}</span>
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: category.color }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  Level {category.level + 1} • {category.productCount || 0} produk
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant={category.isActive ? "default" : "secondary"}>
                {category.isActive ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(category)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDelete(category)}
                    disabled={(category.productCount || 0) > 0 || (category.children && category.children.length > 0)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Render Children */}
        {category.children && 
         category.children.length > 0 && 
         expandedCategories.has(category.id) && (
          <div>
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kategori Produk UMKM</h1>
          <p className="text-muted-foreground">
            Kelola kategori produk UMKM alumni
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingCategory(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Kategori</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama kategori"
                  required
                />
              </div>

              <div>
                <Label htmlFor="parentId">Kategori Parent (Opsional)</Label>
                <Select 
                  value={formData.parentId || ''} 
                  onValueChange={(value) => setFormData({ ...formData, parentId: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori parent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tidak ada parent (Kategori utama)</SelectItem>
                    {flatCategories
                      .filter(cat => {
                        // Exclude current category and its descendants when editing
                        if (editingCategory) {
                          return cat.id !== editingCategory.id && 
                                 !cat.path.startsWith(editingCategory.path + '/') &&
                                 cat.level < 2; // Max 3 levels (0, 1, 2)
                        }
                        return cat.level < 2; // Max 3 levels
                      })
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {'  '.repeat(category.level)}📁 {category.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Maksimal 3 level kategori yang diizinkan
                </p>
              </div>
              
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi kategori (opsional)"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icon">Icon (opsional)</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="Emoji atau nama icon"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sortOrder">Urutan</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="color">Warna</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Kategori aktif</Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : (editingCategory ? 'Perbarui' : 'Simpan')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kategori</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flatCategories.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategori Utama</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flatCategories.filter(c => c.level === 0).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategori Aktif</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flatCategories.filter(c => c.isActive).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flatCategories.reduce((sum, c) => sum + (c.productCount || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={viewMode} onValueChange={(value: 'tree' | 'table') => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tree">🌳 Tree View</SelectItem>
                  <SelectItem value="table">📋 Table View</SelectItem>
                </SelectContent>
              </Select>
              
              {viewMode === 'tree' && (
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={expandAll}
                    className="text-xs"
                  >
                    Expand All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={collapseAll}
                    className="text-xs"
                  >
                    Collapse All
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Display */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              Daftar Kategori ({viewMode === 'tree' ? filteredCategories.length : filteredFlatCategories.length})
            </CardTitle>
            {viewMode === 'tree' && (
              <div className="text-sm text-gray-500">
                Tampilan hierarkis kategori dan sub-kategori
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : viewMode === 'tree' ? (
            <div className="space-y-1">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'Tidak ada kategori yang sesuai dengan pencarian' : 'Belum ada kategori'}
                </div>
              ) : (
                renderCategoryTree(filteredCategories)
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Warna</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlatCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'Tidak ada kategori yang sesuai dengan pencarian' : 'Belum ada kategori'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFlatCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div style={{ paddingLeft: `${category.level * 16}px` }}>
                            {category.icon && (
                              <span className="text-lg mr-2">{category.icon}</span>
                            )}
                            <div>
                              <div className="font-medium">{category.name}</div>
                              <div className="text-sm text-gray-500">{category.slug}</div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline">
                          Level {category.level + 1}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        {category.parent ? (
                          <span className="text-sm text-gray-600">{category.parent.name}</span>
                        ) : (
                          <span className="text-sm text-gray-400">Root</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="max-w-xs">
                          {category.description ? (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {category.description}
                            </p>
                          ) : (
                            <span className="text-sm text-gray-400">Tidak ada deskripsi</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="text-sm font-mono">{category.color}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline">
                          {category.productCount || 0} produk
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {formatDate(category.createdAt)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(category)}
                            disabled={(category.productCount || 0) > 0 || (category.children && category.children.length > 0)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
  );
}