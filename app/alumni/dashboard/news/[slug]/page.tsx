'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Calendar,
  User,
  Eye,
  MessageCircle,
  Heart,
  Share2,
  Clock,
  Tag,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  imageUrl?: string
  status: string
  publishedAt: string
  viewCount: number
  commentCount: number
  author: {
    id: string
    name: string
    email: string
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

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt: string
  imageUrl?: string
  publishedAt: string
  author: {
    name: string
  }
  category: {
    name: string
  }
}

export default function AlumniNewsDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check login status
    const token = localStorage.getItem('alumni_token')
    if (!token) {
      router.push('/alumni-login')
      return
    }

    // Detect mobile screen size
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    fetchPost()
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [router, params.slug])

  const fetchPost = async () => {
    try {
      setIsLoading(true)
      setError(null)
      // Fetch post by slug (mirip modul public)
      const postsResponse = await fetch(`/api/news/posts?slug=${params.slug}&status=APPROVED&limit=1`)
      if (!postsResponse.ok) throw new Error('Failed to fetch post')
      const postsData = await postsResponse.json()
      const foundPost = postsData.posts[0]
      if (!foundPost) {
        setError('Artikel tidak ditemukan')
        return
      }
      setPost(foundPost)
      // Fetch related posts
      const relatedResponse = await fetch(
        `/api/news/posts?categoryId=${foundPost.category?.id || ''}&limit=4&status=APPROVED`
      )
      if (relatedResponse.ok) {
        const relatedData = await relatedResponse.json()
        const filtered = relatedData.posts.filter((p: RelatedPost) => p.id !== foundPost.id)
        setRelatedPosts(filtered.slice(0, 3))
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      setError('Gagal memuat artikel')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.trim().split(/\s+/).length
    const minutes = Math.ceil(words / wordsPerMinute)
    return `${minutes} menit baca`
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const RelatedPostCard = ({ post }: { post: RelatedPost }) => (
    <Link href={`/alumni/dashboard/news/${post.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
        <div className="aspect-video bg-gray-100 overflow-hidden">
          {post.imageUrl ? (
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
              <BookOpen className="w-8 h-8" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <Badge variant="outline" className="mb-2">{post.category.name}</Badge>
          <h3 className="font-bold text-sm leading-tight mb-2">{post.title}</h3>
          <p className="text-xs text-gray-600 mb-3">{truncateText(post.excerpt, 80)}</p>
          <div className="flex items-center text-xs text-gray-500">
            <span>{post.author.name}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(post.publishedAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <BookOpen className="w-16 h-16 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Artikel Tidak Ditemukan</h2>
        <p className="text-gray-600 mb-6">{error || 'Artikel yang Anda cari tidak ditemukan'}</p>
        <Link href="/alumni/dashboard/news">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Berita
          </Button>
        </Link>
      </div>
    )
  }

  const renderDesktopView = () => (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      {/* Header with Breadcrumb and Back Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-600">
          <Link href="/alumni/dashboard" className="hover:text-green-600">Dashboard</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href="/alumni/dashboard/news" className="hover:text-green-600">Berita</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 font-medium">{truncateText(post.title, 50)}</span>
        </div>
        <Link href="/alumni/dashboard/news">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Berita
          </Button>
        </Link>
      </div>

      {/* Main Article Content */}
      <Card className="overflow-hidden">
        {post.imageUrl && (
          <div className="w-full aspect-[16/8] bg-gray-100">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className="p-8">
          <div className="mb-6">
            <Badge variant="outline" className="mb-4 text-sm">{post.category.name}</Badge>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{post.title}</h1>
            <p className="text-xl text-gray-600">{post.excerpt}</p>
          </div>
          
          <Separator className="my-6" />

          <div className="flex items-center justify-between text-sm text-gray-500 mb-8">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={undefined} />
                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-800">{post.author.name}</p>
                  <p className="text-xs">{post.author.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{formatReadingTime(post.content)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                <span>{post.viewCount} dilihat</span>
              </div>
              <div className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                <span>{post.commentCount} komentar</span>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none mx-auto">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t">
              <div className="flex items-center mb-4">
                <Tag className="w-5 h-5 mr-2 text-gray-500" />
                <span className="text-base font-semibold text-gray-800">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Badge key={tag.id} variant="secondary" className="px-3 py-1 text-sm">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Artikel Terkait</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedPosts.map(p => (
              <RelatedPostCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderMobileView = () => (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">Detail Berita</h1>
        <div className="w-9" />
      </div>

      {/* Article Content */}
      <Card>
        <CardContent className="p-4">
          {/* Article Header */}
          <div className="mb-4">
            <Badge variant="outline" className="mb-2">{post.category.name}</Badge>
            <h1 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{post.title}</h1>
            <p className="text-sm text-gray-600 mb-4">{post.excerpt}</p>
            
            {/* Article Meta */}
            <div className="space-y-2 text-xs text-gray-500 mb-4">
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={undefined} />
                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{post.author.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{formatReadingTime(post.content)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  <span>{post.viewCount} dilihat</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  <span>{post.commentCount} komentar</span>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {post.imageUrl && (
            <div className="mb-4">
              <img 
                src={post.imageUrl} 
                alt={post.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center mb-2">
                <Tag className="w-3 h-3 mr-1 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">Tag:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {post.tags.map(tag => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Artikel Terkait</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {relatedPosts.map(post => (
              <Link key={post.id} href={`/alumni/dashboard/news/${post.slug}`}>
                <div className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <Badge variant="outline" className="mb-1 self-start text-xs">{post.category.name}</Badge>
                    <h4 className="font-semibold text-sm leading-tight flex-grow">{post.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(post.publishedAt)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )

  return isMobile ? renderMobileView() : renderDesktopView()
}
