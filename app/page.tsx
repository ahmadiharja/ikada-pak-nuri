'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, GraduationCap, Clock, ArrowRight, Star, TrendingUp, Award, BookOpen, Heart, Globe, ChevronLeft, ChevronRight, Home, FileText, Calendar as CalendarIcon, Store, Phone, Image as ImageIcon, Quote, DollarSign, Target, Trophy, Gift, Video, Download, ShoppingBag, PartyPopper, CheckCircle, Newspaper, Building2 } from "lucide-react"
import { PublicNavbar } from '@/components/public-navbar'
import Link from "next/link"
import Image from "next/image"
import { useSwipeable } from 'react-swipeable'

// Interfaces (Keep them as they are)
interface NewsPost { id: string; title: string; content: string; excerpt: string; imageUrl: string | null; publishedAt: string; author: { name: string; }; }
interface Event { id: string; title: string; description: string; eventDate: string; location: string; featuredImage: string | null; }
interface Syubiyah { id: string; name: string; location: string; totalMembers: number; }
interface Alumni { id: string; name: string; graduationYear: number; currentJob: string; profilePicture: string | null; }
interface Product { id: string; name: string; description: string; price: number; imageUrl: string | null; owner: { name: string; }; }
interface Testimonial { id: string; name: string; quote: string; photo: string | null; position: string; }

// Data (Keep them as they are)
const testimonials = [
  { id: 1, name: "Ahmad Fauzi", quote: "IKADA telah membantu saya membangun jaringan bisnis yang luas. Melalui platform ini, UMKM saya berkembang pesat.", photo: "/placeholder-user.jpg", position: "Pengusaha, Angkatan 2010" },
  { id: 2, name: "Siti Nurhaliza", quote: "Komunitas alumni yang solid dan saling mendukung. Event-event yang diselenggarakan sangat bermanfaat untuk pengembangan diri.", photo: "/placeholder-user.jpg", position: "Guru, Angkatan 2008" },
  { id: 3, name: "Muhammad Rizki", quote: "Platform donasi yang transparan dan mudah digunakan. Senang bisa berkontribusi untuk kemajuan almamater.", photo: "/placeholder-user.jpg", position: "Dokter, Angkatan 2005" }
]

const syubiyahList = [
  { name: "IKADA Syubiyah Jakarta", totalMembers: 150, location: "DKI Jakarta" },
  { name: "IKADA Syubiyah Surabaya", totalMembers: 220, location: "Jawa Timur" },
  { name: "IKADA Syubiyah Bandung", totalMembers: 120, location: "Jawa Barat" },
  { name: "IKADA Syubiyah Yogyakarta", totalMembers: 95, location: "DI Yogyakarta" },
  { name: "IKADA Syubiyah Semarang", totalMembers: 80, location: "Jawa Tengah" },
  { name: "IKADA Syubiyah Malang", totalMembers: 180, location: "Jawa Timur" },
];

const officialProducts = [
  { id: 1, name: "Seragam Batik IKADA Official", price: 175000, image: "", description: "Seragam batik resmi IKADA, bahan premium, tersedia berbagai ukuran." },
  { id: 2, name: "Kaos IKADA Original", price: 95000, image: "", description: "Kaos official alumni IKADA, nyaman dipakai harian." },
  { id: 3, name: "Pin Logo IKADA", price: 25000, image: "", description: "Pin eksklusif logo IKADA, cocok untuk aksesoris seragam." },
  { id: 4, name: "Buku Pedoman IKADA", price: 50000, image: "", description: "Buku pedoman resmi organisasi IKADA, edisi terbaru." },
]

function HeroSlideshow({ heroImages, autoplay, interval, websiteTitle }: { heroImages: any[]; autoplay: boolean; interval: number; websiteTitle: string; }) {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!isTransitioning) {
        goToNext();
      }
    },
    onSwipedRight: () => {
      if (!isTransitioning) {
        goToPrevious();
      }
    },
    onSwipedUp: () => {
      // Optional: pause autoplay when user swipes
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 5000); // Resume after 5 seconds
    },
    onSwipedDown: () => {
      // Optional: pause autoplay when user swipes
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 5000); // Resume after 5 seconds
    },
    trackMouse: false,
    delta: 50, // Minimum distance for swipe
    swipeDuration: 500, // Maximum time for swipe
  });

  const goToNext = () => {
    setPrevIndex(index);
    setIsTransitioning(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % heroImages.length);
      setIsTransitioning(false);
    }, 400);
  };

  const goToPrevious = () => {
    setPrevIndex(index);
    setIsTransitioning(true);
    setTimeout(() => {
      setIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
      setIsTransitioning(false);
    }, 400);
  };

  const goToSlide = (slideIndex: number) => {
    setPrevIndex(index);
    setIsTransitioning(true);
    setTimeout(() => {
      setIndex(slideIndex);
      setIsTransitioning(false);
    }, 400);
  };

  useEffect(() => {
    if (!autoplay || isPaused) return;
    const timer = setInterval(() => {
      goToNext();
    }, interval);
    return () => clearInterval(timer);
  }, [autoplay, interval, index, isPaused]);

  if (!heroImages.length) return null;
  
  return (
    <section className="relative h-[400px] sm:h-[500px] md:h-[600px] w-full overflow-hidden bg-black" {...handlers}>
      <div className="absolute inset-0">
        {/* Gambar sebelumnya (fade out) */}
        {isTransitioning && (
          <div
            key={`prev-${prevIndex}-${index}`}
            className="absolute inset-0 transition-opacity duration-700 opacity-100 z-10"
            style={{ willChange: 'opacity' }}
          >
            <div className="w-full h-full">
              <Image
                src={heroImages[prevIndex].src}
                alt={heroImages[prevIndex].alt}
                fill
                className="object-cover object-center animate-hero-kenburns"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
            </div>
          </div>
        )}
        {/* Gambar aktif (fade in) */}
        <div
          key={`active-${index}`}
          className={`absolute inset-0 transition-opacity duration-700 ${isTransitioning ? 'opacity-0' : 'opacity-100'} z-20`}
          style={{ willChange: 'opacity' }}
        >
          <div className="w-full h-full">
            <Image
              src={heroImages[index].src}
              alt={heroImages[index].alt}
              fill
              className="object-cover object-center animate-hero-kenburns"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          </div>
        </div>
      </div>
      
      {/* Navigation arrows for desktop */}
      <div className="hidden md:block">
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div className="relative z-30 flex flex-col items-center justify-center h-full text-center text-white p-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-4 animate-fade-in-down">
          {websiteTitle || "Selamat Datang di Portal Alumni IKADA"}
        </h1>
        <p className="text-lg md:text-xl max-w-2xl text-white/90 animate-fade-in-up">
          Menyambung Silaturahmi, Merajut Asa, Membangun Bangsa.
        </p>
        
        {/* Swipe hint for mobile */}
        <div className="md:hidden mt-4 text-white/60 text-sm animate-pulse">
          ← Geser untuk navigasi →
        </div>
      </div>
      
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-40">
        {heroImages.map((_: any, i: number) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === index ? 'bg-white w-6' : 'bg-white/50'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        clearInterval(timer)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="flex justify-center items-center gap-4 md:gap-6 my-6">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="text-center">
          <div className="text-4xl md:text-5xl font-bold text-white bg-black/20 rounded-lg p-3">
            {String(value).padStart(2, '0')}
          </div>
          <div className="text-sm font-semibold uppercase tracking-wider mt-2 text-white/80">{unit}</div>
        </div>
      ))}
    </div>
  )
}

function HighlightEvent() {
  const eventDate = new Date('2026-07-12T08:00:00+07:00')
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="relative bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl shadow-2xl p-8 md:p-12 text-center overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full animate-pulse" />
          <div className="absolute -bottom-12 -right-12 w-60 h-60 bg-white/10 rounded-full animate-pulse delay-500" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-2">REUNI AKBAR IKADA 2026</h2>
          <p className="text-lg text-white/90 max-w-3xl mx-auto mb-6">Bergabunglah dalam momen reuni akbar alumni Pondok Pesantren Darussalamah Sumbersari!</p>
          <Countdown targetDate={eventDate} />
          <div className="mt-4 text-white/90">
            <p className="text-xl font-bold">12 Juli 2026</p>
            <p className="text-md">Pondok Pesantren Darussalamah, Sumbersari Kencong Kepung Kediri</p>
          </div>
          <Link href="/ikada/reuni-2026">
            <Button size="lg" className="mt-8 bg-white text-emerald-700 font-bold rounded-full shadow-lg text-lg px-10 py-6 transition-transform hover:scale-105 hover:bg-white/90">
              <PartyPopper className="mr-2 h-5 w-5" />
              Lihat Detail & Daftar
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function StatsSection({ stats }: { stats: { alumni: number; umkm: number; events: number } }) {
  return (
    <section className="py-12 md:py-20 bg-white dark:bg-zinc-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-xl md:rounded-2xl p-4 md:p-8 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-center mb-2 md:mb-4">
              <div className="p-2 md:p-4 bg-emerald-500/10 dark:bg-emerald-300/10 rounded-full">
                <Users className="h-6 w-6 md:h-10 md:w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-zinc-900 dark:text-white mb-1 md:mb-2">
              {stats.alumni.toLocaleString('id-ID')}
            </div>
            <div className="text-xs md:text-md text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Alumni</div>
          </div>
          
          <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-xl md:rounded-2xl p-4 md:p-8 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-center mb-2 md:mb-4">
              <div className="p-2 md:p-4 bg-emerald-500/10 dark:bg-emerald-300/10 rounded-full">
                <Store className="h-6 w-6 md:h-10 md:w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-zinc-900 dark:text-white mb-1 md:mb-2">
              {stats.umkm.toLocaleString('id-ID')}
            </div>
            <div className="text-xs md:text-md text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">UMKM</div>
          </div>
          
          <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-xl md:rounded-2xl p-4 md:p-8 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-center mb-2 md:mb-4">
              <div className="p-2 md:p-4 bg-emerald-500/10 dark:bg-emerald-300/10 rounded-full">
                <Building2 className="h-6 w-6 md:h-10 md:w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-zinc-900 dark:text-white mb-1 md:mb-2">
              {stats.events.toLocaleString('id-ID')}
            </div>
            <div className="text-xs md:text-md text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Event</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TestimonialSection() {
  const [index, setIndex] = useState(0)

  const nextTestimonial = () => setIndex((prev) => (prev + 1) % testimonials.length)
  const prevTestimonial = () => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900 dark:text-white">Apa Kata Mereka?</h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl mx-auto">Dengarkan cerita dan pengalaman inspiratif dari para alumni IKADA.</p>
        <div className="relative max-w-3xl mx-auto">
          <div className="overflow-hidden relative h-64">
            {testimonials.map((testimonial, i) => (
              <div key={testimonial.id} className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${i === index ? 'opacity-100' : 'opacity-0'}`}>
                <Card className="h-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg flex flex-col justify-center items-center p-8">
                  <Image src={testimonial.photo || '/placeholder-user.jpg'} alt={testimonial.name} width={80} height={80} className="rounded-full mb-4 border-4 border-emerald-500" />
                  <blockquote className="text-lg italic text-zinc-700 dark:text-zinc-300 mb-4">“{testimonial.quote}”</blockquote>
                  <div className="font-bold text-zinc-900 dark:text-white">{testimonial.name}</div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">{testimonial.position}</div>
                </Card>
              </div>
            ))}
          </div>
          <Button onClick={prevTestimonial} variant="outline" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full h-12 w-12 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button onClick={nextTestimonial} variant="outline" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full h-12 w-12 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </section>
  )
}

function NewsSection({ posts }: { posts: any[] }) {
  // Function to strip HTML tags and get clean text
  const stripHtml = (html: string) => {
    if (!html) return '';
    // Simple regex to remove HTML tags
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  };

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">Berita Terkini</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-2">Ikuti informasi dan kegiatan terbaru dari IKADA.</p>
          </div>
          <Link href="/ikada/blog" className="mt-4 sm:mt-0">
            <Button variant="outline">Lihat Semua Berita <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 flex flex-col">
              <CardContent className="p-0 flex flex-col flex-grow">
                <div className="relative h-40 md:h-52">
                  <Image
                    src={post.imageUrl || "/placeholder.jpg"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-3 md:p-4 flex flex-col flex-grow">
                  <h3 className="font-semibold text-sm md:text-lg text-zinc-900 dark:text-white mb-2 flex-grow line-clamp-2">{post.title}</h3>
                  <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mb-3 line-clamp-2">
                    {post.excerpt ? stripHtml(post.excerpt) : (post.content ? stripHtml(post.content.substring(0, 100)) + '...' : '')}
                  </p>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-auto pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    {post.author?.name || 'Admin IKADA'} - {new Date(post.publishedAt || post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function SyubiyahSection() {
  return (
    <section className="py-12 md:py-20 bg-zinc-100 dark:bg-zinc-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900 dark:text-white">Jangkauan Syubiyah</h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl mx-auto">IKADA hadir di berbagai daerah, menghubungkan alumni di seluruh penjuru negeri.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {syubiyahList.map((syubiyah) => (
            <div key={syubiyah.name} className="bg-white dark:bg-zinc-800 rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:scale-105">
              <Globe className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
              <h3 className="font-semibold text-md text-zinc-800 dark:text-white">{syubiyah.name}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{syubiyah.location}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MarketplaceSection() {
  return (
    <section className="py-12 md:py-20 bg-white dark:bg-zinc-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">IKADA Official Store</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-2">Dapatkan merchandise resmi dan dukung produk alumni.</p>
          </div>
          <Link href="/ikada/marketplace" className="mt-4 sm:mt-0">
            <Button variant="outline">Lihat Semua Produk <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {officialProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <CardContent className="p-0">
                <div className="relative h-40 md:h-56">
                  <Image
                    src={product.image || "/placeholder-logo.png"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-semibold text-sm md:text-lg text-zinc-900 dark:text-white mb-1 truncate">{product.name}</h3>
                  <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mb-3 h-8 md:h-10 line-clamp-2">{product.description}</p>
                  <div className="text-lg md:text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-3 md:mb-4">Rp {product.price.toLocaleString('id-ID')}</div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition text-xs md:text-sm">
                    <ShoppingBag className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" /> Beli Sekarang
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const [config, setConfig] = useState<any>(null);
  const [stats, setStats] = useState({ alumni: 0, umkm: 0, events: 0 });
  const [newsPosts, setNewsPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch config
        const configRes = await fetch("/api/settings/general");
        const configData = await configRes.json();
        setConfig(configData);

        // Fetch stats
        const statsRes = await fetch("/api/dashboard/stats");
        const statsData = await statsRes.json();
        setStats({
          alumni: statsData.alumniCount || 0,
          umkm: statsData.umkmCount || 0,
          events: statsData.eventsCount || 0
        });

        // Fetch latest posts
        const postsRes = await fetch("/api/news/posts?limit=3&status=APPROVED");
        const postsData = await postsRes.json();
        setNewsPosts(postsData.posts || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        // Set fallback data
        setStats({ alumni: 0, umkm: 0, events: 0 });
        setNewsPosts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const heroImages = config?.heroImages?.length ? config.heroImages : [
    { src: "/placeholder.jpg", alt: "Welcome 1" },
    { src: "/placeholder-logo.png", alt: "Welcome 2" },
    { src: "/placeholder-user.jpg", alt: "Welcome 3" },
  ];
  const autoplay = config?.heroAutoplay ?? true;
  const interval = config?.heroInterval ?? 4000;
  const websiteTitle = config?.websiteTitle || "Selamat Datang di Portal Alumni IKADA";

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
      <PublicNavbar />
      <HeroSlideshow heroImages={heroImages} autoplay={autoplay} interval={interval} websiteTitle={websiteTitle} />
      <main className="pb-20 md:pb-8">
        <HighlightEvent />
        <StatsSection stats={stats} />
        <NewsSection posts={newsPosts} />
        <TestimonialSection />
        <SyubiyahSection />
        <MarketplaceSection />
      </main>
    </div>
  )
}
