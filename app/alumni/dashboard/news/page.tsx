'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Search,
  Calendar,
  User,
  Eye,
  MessageCircle,
  Heart,
  Share2,
  Filter,
  Home,
  Users,
  Store,
  Calendar as CalendarIcon,
  ChevronRight,
  Newspaper,
  Settings,
  CreditCard
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Post {
  id: string
  title: string
  excerpt: string
  content: string
  slug: string
  imageUrl?: string
  status: string
  featured: boolean
  publishedAt: string
  viewCount: number
  commentCount: number
  author: {
    id: string
    fullName: string
    profilePhoto?: string
  }
  category: {
    id: string
    name: string
    color?: string
  }
  tags: {
    id: string
    name: string
  }[]
}

interface Category {
  id: string
  name: string
  color?: string
}

export default function AlumniNewsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check login status
    const token = localStorage.getItem('alumni_token')
    if (!token) {
      router.push('/alumni-login')
      return
    }
    
    // Initial fetch
    fetchCategories()
    fetchPosts(true) // reset = true for initial load
  }, [router])

  // Re-fetch when filters change
  useEffect(() => {
    setPage(1) // Reset page to 1 when filters change
    fetchPosts(true)
  }, [searchQuery, selectedCategory])
  
  // Fetch more posts when page changes (for infinite scroll)
  useEffect(() => {
    if (page > 1) {
      fetchPosts()
    }
  }, [page])

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/news/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchPosts = async (reset = false) => {
    try {
      setIsLoading(reset) // Only show main loader on reset
      const params = new URLSearchParams({
        page: (reset ? 1 : page).toString(),
        limit: '6',
        status: 'APPROVED'
      })
      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory !== 'all') params.append('categoryId', selectedCategory)
      
      const response = await fetch(`/api/news/posts?${params.toString()}`)
        const data = await response.json()

      setPosts(prev => reset ? data.posts : [...prev, ...data.posts])
      setHasMore(data.posts.length > 0)
    } catch (error) {
      console.error("Failed to fetch posts", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const PostCard = ({ post }: { post: Post }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <Link href={`/alumni/dashboard/news/${post.slug}`} className="block">
        <div className="aspect-video bg-gray-100 overflow-hidden">
          {post.imageUrl ? (
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
              <Newspaper className="w-10 h-10" />
                  </div>
          )}
                  </div>
        <CardContent className="p-4">
          <Badge variant="outline" className="mb-2">{post.category.name}</Badge>
          <h3 className="font-bold text-md leading-tight mb-2">{post.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{truncateText(post.excerpt, 100)}</p>
          <div className="flex items-center text-xs text-gray-500">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={post.author?.profilePhoto || undefined} />
              <AvatarFallback>{post.author?.fullName?.charAt(0) || 'A'}</AvatarFallback>
            </Avatar>
            <span>{post.author?.fullName || 'Anonim'}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(post.publishedAt)}</span>
                  </div>
                </CardContent>
      </Link>
              </Card>
  )

  const renderDesktopView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Berita & Artikel</h1>
                <p className="text-gray-600">Informasi terbaru dari IKADA</p>
              </div>

      <div className="flex gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
            placeholder="Cari berita..." 
            className="pl-10"
                    value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

      {isLoading && posts.length === 0 ? (
        <p>Memuat berita...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map(post => <PostCard key={post.id} post={post} />)}
                              </div>
                            )}
      {hasMore && !isLoading && (
        <div className="text-center mt-6">
          <Button onClick={() => setPage(p => p + 1)} variant="outline">Muat Lebih Banyak</Button>
                </div>
              )}
            </div>
  )

  const renderMobileView = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Cari berita..."
          className="pl-10"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Kategori</SelectItem>
          {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
        </SelectContent>
      </Select>
      
      {isLoading && posts.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Memuat berita...</p>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <Link key={post.id} href={`/alumni/dashboard/news/${post.slug}`}>
              <Card className="flex gap-4 p-3 active:bg-gray-50">
                <div className="w-24 h-24 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                      <Newspaper className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <Badge variant="outline" className="mb-1 self-start">{post.category.name}</Badge>
                  <h4 className="font-semibold text-sm leading-tight flex-grow">{post.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(post.publishedAt)}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {hasMore && !isLoading && (
        <div className="text-center mt-6">
          <Button onClick={() => setPage(p => p + 1)} variant="outline">Muat Lebih Banyak</Button>
        </div>
      )}
    </div>
  )

  return isMobile ? renderMobileView() : renderDesktopView()
}