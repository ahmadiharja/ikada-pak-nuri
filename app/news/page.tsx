'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, User, Eye, MessageCircle, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

interface Author {
  id: string;
  name: string;
  email: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  imageUrl: string | null;
  status: string;
  publishedAt: string | null;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  author: Author;
  category: Category | null;
  tags: Tag[];
}

interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CategoriesResponse {
  categories: Category[];
}

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const fetchPosts = async (page: number = 1, search: string = '', categoryId: string = '') => {
    try {
      setIsSearching(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        status: 'APPROVED'
      });
      
      if (search) params.append('search', search);
      if (categoryId && categoryId !== 'all') params.append('categoryId', categoryId);
      
      const response = await fetch(`/api/news/posts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const data: PostsResponse = await response.json();
      setPosts(data.posts);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.page);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/news/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const data: CategoriesResponse = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPosts(),
        fetchCategories()
      ]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts(1, searchTerm, selectedCategory);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    fetchPosts(1, searchTerm, categoryId);
  };

  const handlePageChange = (page: number) => {
    fetchPosts(page, searchTerm, selectedCategory);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Berita & Artikel
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dapatkan informasi terkini seputar kegiatan IKADA Sumbersari dan dunia pesantren.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Cari artikel atau berita..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Pilih Kategori" />
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
              <Button type="submit" disabled={isSearching}>
                {isSearching ? 'Mencari...' : 'Cari'}
              </Button>
            </div>
          </form>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              {isSearching ? 'Mencari artikel...' : 'Tidak ada artikel yang ditemukan'}
            </div>
            {!isSearching && (
              <p className="text-gray-400">
                Coba ubah kata kunci pencarian atau pilih kategori yang berbeda
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.imageUrl || '/placeholder.jpg'}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {post.category && (
                      <Badge 
                        className="absolute top-3 left-3" 
                        style={{ backgroundColor: post.category.color }}
                      >
                        {post.category.name}
                      </Badge>
                    )}
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg leading-tight hover:text-green-600 transition-colors">
                      <Link href={`/news/${post.slug}`}>
                        {truncateText(post.title, 80)}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {post.excerpt 
                        ? truncateText(post.excerpt, 120)
                        : truncateText(stripHtml(post.content), 120)
                      }
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{post.author.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {post.publishedAt 
                              ? format(new Date(post.publishedAt), 'dd MMM yyyy', { locale: id })
                              : format(new Date(post.createdAt), 'dd MMM yyyy', { locale: id })
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{post.viewCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{post.commentCount}</span>
                        </div>
                      </div>
                      
                      <Link href={`/news/${post.slug}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          Baca Selengkapnya
                        </Button>
                      </Link>
                    </div>
                    
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isSearching}
                >
                  Sebelumnya
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isSearching}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isSearching}
                >
                  Selanjutnya
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
}