"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, GraduationCap, Clock, Menu, ChevronLeft, ChevronRight } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import Image from "next/image"
import { useFeaturedPosts } from "@/hooks/use-featured-posts"
import { useHighlightedPost } from "@/hooks/use-highlighted-post"
import { Footer } from "@/components/footer"

interface NewsPost {
  id: string
  title: string
  content: string
  excerpt: string
  imageUrl: string | null
  publishedAt: string
  author: {
    name: string
  }
}

interface FeaturedPost {
  id: string
  title: string
  excerpt: string
  imageUrl: string | null
  publishedAt: string
  author: {
    name: string
  }
  category?: {
    name: string
    color: string
  }
}

interface Event {
  id: string
  title: string
  description: string
  eventDate: string
  location: string
  featuredImage: string | null
}

interface Syubiyah {
  id: string
  name: string
  description: string
  _count: {
    alumni: number
  }
}

interface Alumni {
  id: string
  name: string
  profilePhoto: string | null
  graduationYear: number
  currentJob: string | null
  createdAt: string
}

export default function HomePage() {
  const [news, setNews] = useState<NewsPost[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [syubiyah, setSyubiyah] = useState<Syubiyah[]>([])
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // Use SWR for featured posts with auto-refresh
  const { featuredPosts, isLoading: featuredLoading, isError: featuredError } = useFeaturedPosts(5)
  
  // Use SWR for highlighted post with auto-refresh
  const { highlightedPost, isLoading: highlightedLoading, error: highlightedError } = useHighlightedPost()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch news posts
        const newsResponse = await fetch('/api/news/posts?status=APPROVED&limit=6')
        if (newsResponse.ok) {
          const newsData = await newsResponse.json()
          setNews(newsData.posts || [])
        }

        // Fetch events
        const eventsResponse = await fetch('/api/events?status=APPROVED&limit=3')
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          setEvents(eventsData.events || [])
        }

        // Fetch syubiyah with alumni count
        const syubiyahResponse = await fetch('/api/syubiyah?includeAlumniCount=true&limit=5&sortBy=alumniCount&order=desc')
        if (syubiyahResponse.ok) {
          const syubiyahData = await syubiyahResponse.json()
          setSyubiyah(syubiyahData.syubiyah || [])
        }

        // Fetch latest alumni
        const alumniResponse = await fetch('/api/alumni?limit=5&sortBy=createdAt&order=desc')
        if (alumniResponse.ok) {
          const alumniData = await alumniResponse.json()
          setAlumni(alumniData.alumni || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Update overall loading state to include featured and highlighted posts
  const isOverallLoading = loading || featuredLoading || highlightedLoading

  // Auto-play slider
  useEffect(() => {
    if (featuredPosts.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredPosts.length)
      }, 5000) // Change slide every 5 seconds
      return () => clearInterval(interval)
    }
  }, [featuredPosts.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredPosts.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isOverallLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Memuat halaman...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[60vh] bg-gradient-to-r from-green-600 to-green-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              IKADA Sumbersari
            </h1>
            <p className="text-xl mb-8 leading-relaxed">
              Ikatan Alumni Pondok Pesantren Darussalam Sumbersari - Membangun Silaturahmi, Mengembangkan Potensi Umat
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="bg-white text-green-800 hover:bg-gray-100">
                Bergabung Sekarang
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-800">
                Pelajari Lebih Lanjut
              </Button>
            </div>
          </div>
        </div>
        {/* Hero Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 border-2 border-white rounded-lg rotate-45"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-32 right-1/3 w-14 h-14 border-2 border-white rounded-lg rotate-12"></div>
        </div>
      </section>

      {/* Featured Articles Slider */}
      {featuredPosts.length > 0 && (
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Artikel Pilihan</h2>
              <p className="text-muted-foreground">Artikel dan berita terpilih yang wajib dibaca</p>
            </div>
            
            <div className="relative overflow-hidden rounded-lg">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {featuredPosts.map((post, index) => (
                  <div key={post.id} className="w-full flex-shrink-0">
                    <div className="relative h-[400px] bg-gradient-to-r from-black/60 to-black/40 rounded-lg overflow-hidden">
                      {post.imageUrl && (
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          className="object-cover -z-10"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                        <div className="max-w-3xl">
                          {post.category && (
                            <Badge 
                              className="mb-3" 
                              style={{ backgroundColor: post.category.color }}
                            >
                              {post.category.name}
                            </Badge>
                          )}
                          <h3 className="text-3xl font-bold mb-3 leading-tight">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-lg text-gray-200 mb-4 line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-300">
                              <span>Oleh {post.author.name}</span>
                              <span>•</span>
                              <span>{formatDate(post.publishedAt)}</span>
                            </div>
                            <Button variant="secondary" size="sm">
                              Baca Selengkapnya
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Navigation Arrows */}
              {featuredPosts.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6 text-white" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6 text-white" />
                  </button>
                </>
              )}
              
              {/* Slide Indicators */}
              {featuredPosts.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {featuredPosts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentSlide ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Column A - Left Side (3/4 width) */}
            <div className="lg:col-span-3">
              {/* Featured News Section */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-foreground">Featured Berita</h2>
                  <Link href="/news?featured=true">
                    <Button variant="outline" size="sm">
                      Lihat Semua
                    </Button>
                  </Link>
                </div>
                
                {/* Highlighted News - Single Large Card */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group mb-6">
                  {highlightedPost && (
                    <>
                      {/* Featured Image */}
                      <div className="relative h-64 w-full overflow-hidden">
                        <Image
                          src={highlightedPost.imageUrl || '/placeholder.jpg'}
                          alt={highlightedPost.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {highlightedPost.category && (
                          <Badge 
                            className="absolute top-4 left-4" 
                            style={{ backgroundColor: highlightedPost.category.color }}
                          >
                            {highlightedPost.category.name}
                          </Badge>
                        )}
                        <Badge className="absolute top-4 right-4 bg-red-600 text-white">
                          ★ Highlighted
                        </Badge>
                      </div>
                      
                      {/* Card Content */}
                      <div className="p-6">
                        <CardHeader className="p-0 mb-4">
                          <CardTitle className="text-2xl hover:text-primary transition-colors line-clamp-2">
                            <Link href={`/news/${highlightedPost.slug}`}>
                              {highlightedPost.title}
                            </Link>
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDate(highlightedPost.publishedAt)}
                            </span>
                            <span>oleh {highlightedPost.author.name}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <p className="text-muted-foreground mb-4 line-clamp-3">
                            {highlightedPost.excerpt || 'Baca artikel lengkap untuk informasi lebih detail...'}
                          </p>
                          <Link href={`/news/${highlightedPost.slug}`}>
                            <Button size="default" className="">
                              Baca Selengkapnya
                            </Button>
                          </Link>
                        </CardContent>
                      </div>
                    </>
                  )}
                </Card>
              </div>

              {/* Latest Articles Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-foreground">Artikel Terbaru</h2>
                  <Link href="/news">
                    <Button variant="outline" size="sm">
                      Lihat Semua
                    </Button>
                  </Link>
                </div>
                
                {/* 3 Column Grid for Latest Articles */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {news.length > 0 ? (
                    news.slice(0, 6).map((post) => (
                      <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                        {/* Featured Image */}
                        <div className="relative h-40 w-full overflow-hidden">
                          <Image
                            src={post.imageUrl || '/placeholder.jpg'}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        
                        {/* Card Content */}
                        <div className="p-4">
                          <CardHeader className="p-0 mb-3">
                            <CardTitle className="text-base hover:text-primary transition-colors line-clamp-2 leading-tight">
                              <Link href={`/news/${post.id}`}>
                                {post.title}
                              </Link>
                            </CardTitle>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(post.publishedAt)}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="p-0">
                            <p className="text-muted-foreground mb-3 line-clamp-2 text-xs">
                              {post.excerpt || post.content.substring(0, 80) + '...'}
                            </p>
                            <Link href={`/news/${post.id}`}>
                              <Button variant="outline" size="sm" className="w-full text-xs">
                                Baca Selengkapnya
                              </Button>
                            </Link>
                          </CardContent>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card className="col-span-full">
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">Belum ada berita tersedia</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>

            {/* Column B - Right Sidebar (1/4 width) */}
            <div className="space-y-6">
              {/* Events Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5" />
                    Event Terbaru
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {events.length > 0 ? (
                    <div className="space-y-4">
                      {events.slice(0, 5).map((event) => (
                        <div key={event.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                          <h4 className="font-semibold text-sm mb-2 hover:text-primary transition-colors line-clamp-2">
                            <Link href={`/events/${event.id}`}>
                              {event.title}
                            </Link>
                          </h4>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(event.eventDate)}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Belum ada event tersedia</p>
                  )}
                  <div className="mt-4">
                    <Link href="/events">
                      <Button variant="outline" size="sm" className="w-full">
                        Lihat Semua Event
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Top 5 Syubiyah Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5" />
                    Top 5 Syubiyah
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {syubiyah.length > 0 ? (
                    <div className="space-y-3">
                      {syubiyah.slice(0, 5).map((item, index) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <Badge variant="secondary" className="w-7 h-7 rounded-full p-0 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.alumniCount || 0} Alumni
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Belum ada data syubiyah</p>
                  )}
                  <div className="mt-4">
                    <Link href="/syubiyah">
                      <Button variant="outline" size="sm" className="w-full">
                        Lihat Semua Syubiyah
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
