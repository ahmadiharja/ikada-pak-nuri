'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import dynamic from 'next/dynamic';
import { ImageUploader } from '@/components/ui/image-uploader';

// Dynamic import untuk RichTextEditor agar tidak ada SSR issues
const RichTextEditor = dynamic(() => import('@/components/ui/rich-text-editor'), {
  ssr: false,
  loading: () => <div className="border rounded-lg h-64 flex items-center justify-center text-gray-500">Loading editor...</div>
});
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Eye, FileText, Calendar, User, MessageCircle, Tag } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };
  commentCount: number;
  tags: {
    id: string;
    name: string;
    slug: string;
  }[];
  featured: boolean;
  featuredOrder: number | null;
  highlighted: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

interface Syubiyah {
  id: string;
  name: string;
  provinsi: string;
  kabupaten: string;
}

interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  categoryId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  tags: string[];
  visibility: 'ALL_SYUBIYAH' | 'SPECIFIC_SYUBIYAH';
  targetSyubiyahIds: string[];
  featured: boolean;
  featuredOrder: number | null;
  highlighted: boolean;
}

interface NewCategoryData {
  name: string;
  description: string;
  color: string;
}

const initialFormData: PostFormData = {
  title: '',
  content: '',
  excerpt: '',
  imageUrl: '',
  categoryId: 'none',
  status: 'PENDING',
  tags: [],
  visibility: 'ALL_SYUBIYAH',
  targetSyubiyahIds: [],
  featured: false,
  featuredOrder: null,
  highlighted: false
};

const initialNewCategoryData: NewCategoryData = {
  name: '',
  description: '',
  color: '#3B82F6'
};

const visibilityOptions = [
  { value: 'ALL_SYUBIYAH', label: 'Semua Syubiyah' },
  { value: 'SPECIFIC_SYUBIYAH', label: 'Syubiyah Tertentu' }
];

const colorOptions = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280'
];

const statusOptions = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-green-100 text-green-800' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800' }
];

export default function PostsPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [syubiyahs, setSyubiyahs] = useState<Syubiyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState<NewCategoryData>(initialNewCategoryData);
  const [formData, setFormData] = useState<PostFormData>(initialFormData);
  const [tagInput, setTagInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { categoryId: categoryFilter })
      });
      
      const response = await fetch(`/api/news/posts?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setPosts(data.posts);
        setTotalPages(data.pagination.totalPages);
        
        // Calculate stats
        const statsResponse = await fetch('/api/news/posts?limit=1000');
        const statsData = await statsResponse.json();
        if (statsResponse.ok) {
          const allPosts = statsData.posts;
          setStats({
            total: allPosts.length,
            pending: allPosts.filter((p: Post) => p.status === 'PENDING').length,
            approved: allPosts.filter((p: Post) => p.status === 'APPROVED').length,
            rejected: allPosts.filter((p: Post) => p.status === 'REJECTED').length
          });
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch posts',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch posts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/news/categories');
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Fetch syubiyahs
  const fetchSyubiyahs = async () => {
    try {
      const response = await fetch('/api/syubiyah');
      const data = await response.json();
      
      if (response.ok) {
        setSyubiyahs(data.syubiyahs || []);
      }
    } catch (error) {
      console.error('Failed to fetch syubiyahs:', error);
    }
  };

  // Handle create new category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/news/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCategoryData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Kategori berhasil dibuat'
        });
        setIsNewCategoryModalOpen(false);
        setNewCategoryData(initialNewCategoryData);
        fetchCategories(); // Refresh categories
        // Set the new category as selected
        setFormData(prev => ({ ...prev, categoryId: data.category.id }));
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create category',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create category',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchSyubiyahs();
  }, [currentPage, searchTerm, statusFilter, categoryFilter]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/news/posts/${editingId}` : '/api/news/posts';
      
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
        setTagInput('');
        fetchPosts();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save post',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save post',
        variant: 'destructive'
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/news/posts/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message
        });
        fetchPosts();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete post',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive'
      });
    }
  };

  // Handle edit
  const handleEdit = (post: Post) => {
    setEditingId(post.id);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      imageUrl: post.imageUrl || '',
      categoryId: post.category?.id || 'none',
      status: post.status,
      tags: post.tags.map(tag => tag.name),
      visibility: 'ALL_SYUBIYAH',
      targetSyubiyahIds: [],
      featured: post.featured || false,
      featuredOrder: post.featuredOrder || null
    });
    setTagInput(post.tags.map(tag => tag.name).join(', '));
    setIsModalOpen(true);
  };

  // Handle featured toggle
  const handleFeaturedToggle = async (postId: string, currentFeatured: boolean) => {
    try {
      const response = await fetch(`/api/news/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          featured: !currentFeatured,
          featuredOrder: !currentFeatured ? 1 : null
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: `Post ${!currentFeatured ? 'ditambahkan ke' : 'dihapus dari'} slider featured`
        });
        fetchPosts();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update featured status',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update featured status',
        variant: 'destructive'
      });
    }
  };

  // Handle highlighted toggle
  const handleHighlightedToggle = async (postId: string, currentHighlighted: boolean) => {
    try {
      const response = await fetch(`/api/posts/${postId}/highlighted`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          highlighted: !currentHighlighted
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message
        });
        fetchPosts();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update highlighted status',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update highlighted status',
        variant: 'destructive'
      });
    }
  };

  // Handle add tag
  const handleAddTags = () => {
    if (tagInput.trim()) {
      const newTags = tagInput.split(',').map(tag => tag.trim()).filter(tag => tag);
      setFormData(prev => ({
        ...prev,
        tags: [...new Set([...prev.tags, ...newTags])]
      }));
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Reset modal
  const resetModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormData);
    setTagInput('');
  };

  // Open modal for adding new post
  const openAddModal = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setTagInput('');
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return (
      <Badge className={statusOption?.color}>
        {statusOption?.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Post</h1>
          <p className="text-muted-foreground">Kelola artikel dan berita website</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Post' : 'Tambah Post Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kolom Kiri - Konten Utama (2/3 lebar) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Judul */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Judul *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  
                  {/* Ringkasan */}
                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Ringkasan</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      rows={3}
                      placeholder="Ringkasan singkat artikel yang akan ditampilkan di halaman utama..."
                    />
                  </div>
                  
                  {/* Rich Text Editor */}
                  <div className="space-y-2">
                    <Label htmlFor="content">Konten Artikel *</Label>
                    <RichTextEditor
                      content={formData.content}
                      onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                      placeholder="Mulai menulis artikel Anda di sini..."
                      className="min-h-[400px]"
                    />
                  </div>
                </div>
                
                {/* Kolom Kanan - Metadata (1/3 lebar) */}
                <div className="space-y-6">
                  {/* Kategori */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="category">Kategori</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsNewCategoryModalOpen(true)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Buat Baru
                      </Button>
                    </div>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tanpa Kategori</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              {category.color && (
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: category.color }}
                                />
                              )}
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Gambar Thumbnail */}
                  <div>
                    <ImageUploader
                      value={formData.imageUrl}
                      onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                      label="Gambar Thumbnail"
                      placeholder="Upload gambar thumbnail atau masukkan URL"
                    />
                  </div>
                  
                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'PENDING' | 'APPROVED' | 'REJECTED') => 
                        setFormData(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Visibilitas */}
                  <div className="space-y-2">
                    <Label htmlFor="visibility">Visibilitas</Label>
                    <Select
                      value={formData.visibility}
                      onValueChange={(value: 'ALL_SYUBIYAH' | 'SPECIFIC_SYUBIYAH') => 
                        setFormData(prev => ({ ...prev, visibility: value, targetSyubiyahIds: value === 'ALL_SYUBIYAH' ? [] : prev.targetSyubiyahIds }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {visibilityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Target Syubiyah - hanya tampil jika visibility SPECIFIC_SYUBIYAH */}
                  {formData.visibility === 'SPECIFIC_SYUBIYAH' && (
                    <div className="space-y-2">
                      <Label>Target Syubiyah</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                        {syubiyahs.map((syubiyah) => (
                          <div key={syubiyah.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`syubiyah-${syubiyah.id}`}
                              checked={formData.targetSyubiyahIds.includes(syubiyah.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    targetSyubiyahIds: [...prev.targetSyubiyahIds, syubiyah.id]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    targetSyubiyahIds: prev.targetSyubiyahIds.filter(id => id !== syubiyah.id)
                                  }));
                                }
                              }}
                              className="rounded"
                            />
                            <label htmlFor={`syubiyah-${syubiyah.id}`} className="text-sm cursor-pointer">
                              {syubiyah.name} ({syubiyah.provinsi}, {syubiyah.kabupaten})
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Tags */}
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Pisahkan dengan koma"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTags();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddTags} size="sm">
                        Tambah
                      </Button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Featured Article */}
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          featured: e.target.checked,
                          featuredOrder: e.target.checked ? 1 : null
                        }))}
                        className="rounded"
                      />
                      <Label htmlFor="featured" className="font-medium">
                        Artikel Pilihan (Featured)
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Artikel pilihan akan ditampilkan di slider homepage
                    </p>
                    
                    {formData.featured && (
                      <div className="space-y-2">
                        <Label htmlFor="featuredOrder">Urutan Tampil</Label>
                        <Select
                          value={formData.featuredOrder?.toString() || ''}
                          onValueChange={(value) => setFormData(prev => ({ 
                            ...prev, 
                            featuredOrder: value ? parseInt(value) : null 
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih urutan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 (Prioritas Tertinggi)</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="6">6</SelectItem>
                            <SelectItem value="7">7</SelectItem>
                            <SelectItem value="8">8</SelectItem>
                            <SelectItem value="9">9</SelectItem>
                            <SelectItem value="10">10 (Prioritas Terendah)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons - Full Width */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={resetModal} size="lg">
                  Batal
                </Button>
                <Button type="submit" disabled={loading} size="lg" className="min-w-[120px]">
                  {loading ? 'Menyimpan...' : (editingId ? 'Update Post' : 'Simpan Post')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Post</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <Trash2 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari judul, konten..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setCurrentPage(1);
                }}
                className="w-full"
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Post</CardTitle>
          <CardDescription>
            Menampilkan {posts.length} post dari total {stats.total} post
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Penulis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tampilkan di Slider</TableHead>
                    <TableHead>Highlighted</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Komentar</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{post.title}</div>
                          {post.excerpt && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {post.excerpt}
                            </div>
                          )}
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {post.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag.id} variant="outline" className="text-xs">
                                  {tag.name}
                                </Badge>
                              ))}
                              {post.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{post.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {post.category ? (
                          <Badge 
                            style={{ backgroundColor: post.category.color || '#gray' }}
                            className="text-white"
                          >
                            {post.category.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="text-sm">{post.author.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(post.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={post.featured || false}
                            onChange={() => handleFeaturedToggle(post.id, post.featured || false)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          {post.featured && post.featuredOrder && (
                            <Badge variant="secondary" className="text-xs">
                              #{post.featuredOrder}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={post.highlighted || false}
                            onChange={() => handleHighlightedToggle(post.id, post.highlighted || false)}
                            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                          />
                          {post.highlighted && (
                            <Badge variant="destructive" className="text-xs">
                              ★
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.viewCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.commentCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(post.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(post)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Post</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus post "{post.title}"? 
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(post.id)}>
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
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Modal Kategori Baru */}
      <Dialog open={isNewCategoryModalOpen} onOpenChange={setIsNewCategoryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Kategori Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nama Kategori</Label>
              <Input
                id="categoryName"
                value={newCategoryData.name}
                onChange={(e) => setNewCategoryData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Masukkan nama kategori"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryDescription">Deskripsi</Label>
              <Input
                id="categoryDescription"
                value={newCategoryData.description}
                onChange={(e) => setNewCategoryData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Masukkan deskripsi kategori"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryColor">Warna</Label>
              <Select
                value={newCategoryData.color}
                onValueChange={(value) => setNewCategoryData(prev => ({ ...prev, color: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className={`w-4 h-4 rounded-full ${option.bgClass}`}
                        />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsNewCategoryModalOpen(false);
                setNewCategoryData(initialNewCategoryData);
              }}
            >
              Batal
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={!newCategoryData.name.trim()}
            >
              Buat Kategori
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}