'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, User, Eye, MessageCircle, ArrowLeft, Share2, Clock, Tag } from 'lucide-react';
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

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
  };
  replies: Comment[];
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
  createdAt: string;
  updatedAt: string;
  author: Author;
  category: Category | null;
  tags: Tag[];
  comments: Comment[];
  commentCount: number;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  author: Author;
  category: Category | null;
}

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get post by slug
      const postsResponse = await fetch(`/api/news/posts?search=${params.slug}&limit=1`);
      if (!postsResponse.ok) throw new Error('Failed to fetch post');
      
      const postsData = await postsResponse.json();
      const foundPost = postsData.posts.find((p: Post) => p.slug === params.slug);
      
      if (!foundPost) {
        setError('Artikel tidak ditemukan');
        return;
      }
      
      // Get full post details with comments
      const postResponse = await fetch(`/api/news/posts/${foundPost.id}`);
      if (!postResponse.ok) throw new Error('Failed to fetch post details');
      
      const postData = await postResponse.json();
      setPost(postData.post);
      
      // Increment view count
      fetch(`/api/news/posts/${foundPost.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'increment_view' }),
      }).catch(console.error);
      
      // Fetch related posts
      const relatedResponse = await fetch(
        `/api/news/posts?categoryId=${foundPost.category?.id || ''}&limit=4&status=APPROVED`
      );
      if (relatedResponse.ok) {
        const relatedData = await relatedResponse.json();
        const filtered = relatedData.posts.filter((p: RelatedPost) => p.id !== foundPost.id);
        setRelatedPosts(filtered.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Gagal memuat artikel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.slug) {
      fetchPost();
    }
  }, [params.slug]);

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || 'Baca artikel menarik ini',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link artikel telah disalin ke clipboard!');
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const formatContent = (content: string) => {
    // Simple HTML rendering - in production, consider using a proper HTML sanitizer
    return { __html: content };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-64 w-full mb-6 rounded-lg" />
            <Skeleton className="h-12 w-full mb-4" />
            <div className="flex gap-4 mb-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Artikel tidak ditemukan'}
            </h1>
            <p className="text-gray-600 mb-6">
              Artikel yang Anda cari mungkin telah dihapus atau tidak tersedia.
            </p>
            <Link href="/news">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Berita
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/news">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Berita
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <article className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            {/* Featured Image */}
            {post.imageUrl && (
              <div className="relative h-64 md:h-96">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
                {post.category && (
                  <Badge 
                    className="absolute top-4 left-4" 
                    style={{ backgroundColor: post.category.color }}
                  >
                    {post.category.name}
                  </Badge>
                )}
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={post.author.name} />
                    <AvatarFallback className="bg-green-100 text-green-700">
                      {post.author.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{post.author.name}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {post.publishedAt 
                      ? format(new Date(post.publishedAt), 'dd MMMM yyyy', { locale: id })
                      : format(new Date(post.createdAt), 'dd MMMM yyyy', { locale: id })
                    }
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{Math.ceil(post.content.length / 1000)} menit baca</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.viewCount} kali dibaca</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments.length} komentar</span>
                </div>
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <Tag className="h-4 w-4 text-gray-500" />
                  {post.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Share Button */}
              <div className="flex justify-end mb-6">
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Bagikan
                </Button>
              </div>

              <Separator className="mb-6" />

              {/* Excerpt */}
              {post.excerpt && (
                <div className="text-lg text-gray-700 font-medium mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                  {post.excerpt}
                </div>
              )}

              {/* Content */}
              <div 
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700"
                dangerouslySetInnerHTML={formatContent(post.content)}
              />
            </div>
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Artikel Terkait</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-32">
                      <Image
                        src={relatedPost.imageUrl || '/placeholder.jpg'}
                        alt={relatedPost.title}
                        fill
                        className="object-cover"
                      />
                      {relatedPost.category && (
                        <Badge 
                          className="absolute top-2 left-2 text-xs" 
                          style={{ backgroundColor: relatedPost.category.color }}
                        >
                          {relatedPost.category.name}
                        </Badge>
                      )}
                    </div>
                    
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm leading-tight">
                        <Link href={`/news/${relatedPost.slug}`} className="hover:text-green-600 transition-colors">
                          {relatedPost.title.length > 60 
                            ? relatedPost.title.substring(0, 60) + '...' 
                            : relatedPost.title
                          }
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>
                          {relatedPost.publishedAt 
                            ? format(new Date(relatedPost.publishedAt), 'dd MMM yyyy', { locale: id })
                            : format(new Date(relatedPost.createdAt), 'dd MMM yyyy', { locale: id })
                          }
                        </span>
                      </div>
                      
                      <Link href={`/news/${relatedPost.slug}`}>
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          Baca Artikel
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}