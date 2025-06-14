'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, MessageCircle, CheckCircle, XCircle, Clock, User, FileText, Eye } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Comment {
  id: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  post: {
    id: string;
    title: string;
    slug: string;
  };
  parent?: {
    id: string;
    content: string;
    author: {
      name: string;
    };
  };
  replies?: Comment[];
}

interface CommentFormData {
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface Post {
  id: string;
  title: string;
  slug: string;
}

const initialFormData: CommentFormData = {
  content: '',
  status: 'PENDING'
};

const statusOptions = [
  { value: 'PENDING', label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'APPROVED', label: 'Disetujui', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'REJECTED', label: 'Ditolak', icon: XCircle, color: 'bg-red-100 text-red-800' }
];

export default function CommentsPage() {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [postFilter, setPostFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CommentFormData>(initialFormData);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Check if user is admin
  const isAdmin = session?.user?.role === 'PUSAT';

  // Fetch posts for filter
  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/news/posts?limit=100&status=APPROVED');
      const data = await response.json();
      
      if (response.ok) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(postFilter !== 'all' && { postId: postFilter })
      });
      
      const response = await fetch(`/api/news/comments?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setComments(data.comments);
        setTotalPages(data.pagination.totalPages);
        
        // Calculate stats
        const pending = data.comments.filter((c: Comment) => c.status === 'PENDING').length;
        const approved = data.comments.filter((c: Comment) => c.status === 'APPROVED').length;
        const rejected = data.comments.filter((c: Comment) => c.status === 'REJECTED').length;
        
        setStats({
          total: data.pagination.total,
          pending,
          approved,
          rejected
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch comments',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch comments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchComments();
  }, [currentPage, searchTerm, statusFilter, postFilter]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast({
        title: 'Error',
        description: 'Only admin can edit comments',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/news/comments/${editingId}`, {
        method: 'PUT',
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
        fetchComments();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update comment',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update comment',
        variant: 'destructive'
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      toast({
        title: 'Error',
        description: 'Only admin can delete comments',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/news/comments/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message
        });
        fetchComments();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete comment',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive'
      });
    }
  };

  // Handle edit
  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setFormData({
      content: comment.content,
      status: comment.status
    });
    setIsModalOpen(true);
  };

  // Quick status update
  const handleQuickStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (!isAdmin) {
      toast({
        title: 'Error',
        description: 'Only admin can update comment status',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/news/comments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: `Comment ${status.toLowerCase()}`
        });
        fetchComments();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update status',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    }
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    if (!statusOption) return null;
    
    const Icon = statusOption.icon;
    return (
      <Badge className={statusOption.color}>
        <Icon className="w-3 h-3 mr-1" />
        {statusOption.label}
      </Badge>
    );
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Komentar</h1>
          <p className="text-muted-foreground">Kelola komentar dari pembaca artikel dan berita</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Komentar</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
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
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari komentar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={postFilter} onValueChange={setPostFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Post" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Post</SelectItem>
                {posts.map((post) => (
                  <SelectItem key={post.id} value={post.id}>
                    {truncateText(post.title, 50)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPostFilter('all');
                setCurrentPage(1);
              }}
            >
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Komentar</CardTitle>
          <CardDescription>
            Halaman {currentPage} dari {totalPages} - Menampilkan {comments.length} komentar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Belum ada komentar</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || postFilter !== 'all' 
                  ? 'Tidak ada komentar yang sesuai dengan filter.' 
                  : 'Belum ada komentar yang masuk.'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Komentar</TableHead>
                    <TableHead>Penulis</TableHead>
                    <TableHead>Post</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    {isAdmin && <TableHead>Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comments.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="text-sm">{truncateText(comment.content, 150)}</p>
                          {comment.parent && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                              <strong>Membalas:</strong> {truncateText(comment.parent.content, 50)}
                              <br />
                              <span className="text-muted-foreground">oleh {comment.parent.author.name}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">{comment.author.name}</div>
                            <div className="text-xs text-muted-foreground">{comment.author.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium text-sm">{truncateText(comment.post.title, 40)}</div>
                          <div className="text-xs text-muted-foreground">{comment.post.slug}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(comment.status)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(comment.createdAt)}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {comment.status === 'PENDING' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuickStatusUpdate(comment.id, 'APPROVED')}
                                  title="Setujui"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuickStatusUpdate(comment.id, 'REJECTED')}
                                  title="Tolak"
                                >
                                  <XCircle className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(comment)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  title="Hapus"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Komentar</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus komentar ini? 
                                    Tindakan ini tidak dapat dibatalkan.
                                    {comment.replies && comment.replies.length > 0 && (
                                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                        <strong>Peringatan:</strong> Komentar ini memiliki {comment.replies.length} balasan. 
                                        Semua balasan juga akan terhapus.
                                      </div>
                                    )}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(comment.id)}>
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
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={resetModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Komentar</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Konten Komentar *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                required
                rows={6}
                placeholder="Konten komentar"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
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
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={resetModal}>
                Batal
              </Button>
              <Button type="submit">
                Update Komentar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}