"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Play, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const slides = [
  {
    id: 1,
    title: "Selamat Datang di IKADA Sumbersari",
    subtitle: "Ikatan Alumni Pondok Darussalam",
    description: "Membangun jaringan alumni yang kuat, berbagi ilmu, dan berkontribusi untuk kemajuan umat dan bangsa.",
    image: "/placeholder.svg?height=600&width=1200",
    cta: {
      primary: { text: "Daftar Sekarang", href: "/register" },
      secondary: { text: "Pelajari Lebih Lanjut", href: "/about" },
    },
  },
  {
    id: 2,
    title: "Program Donasi & Sponsorship",
    subtitle: "Berbagi Keberkahan Bersama",
    description:
      "Bergabunglah dalam program donasi dan sponsorship untuk mendukung berbagai kegiatan sosial dan pendidikan.",
    image: "/placeholder.svg?height=600&width=1200",
    cta: {
      primary: { text: "Donasi Sekarang", href: "/donations" },
      secondary: { text: "Lihat Program", href: "/donations/programs" },
    },
  },
  {
    id: 3,
    title: "Syubiyah & Mustahiq",
    subtitle: "Jaringan Alumni Berdasarkan Wilayah",
    description:
      "Temukan dan bergabung dengan syubiyah (cabang wilayah) terdekat serta program bantuan untuk mustahiq.",
    image: "/placeholder.svg?height=600&width=1200",
    cta: {
      primary: { text: "Cari Syubiyah", href: "/syubiyah" },
      secondary: { text: "Program Mustahiq", href: "/mustahiq" },
    },
  },
  {
    id: 4,
    title: "Event & Acara Terbaru",
    subtitle: "Jangan Lewatkan Kegiatan Menarik",
    description: "Ikuti berbagai event, seminar, reuni, dan kegiatan menarik lainnya yang diselenggarakan IKADA.",
    image: "/placeholder.svg?height=600&width=1200",
    cta: {
      primary: { text: "Lihat Event", href: "/events" },
      secondary: { text: "Daftar Event", href: "/events/register" },
    },
  },
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(true)

  const nextSlide = React.useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [])

  const prevSlide = React.useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  const goToSlide = React.useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  // Auto-play functionality
  React.useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide])

  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  return (
    <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="min-w-full h-full relative">
            {/* Background Image */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60">
              <img src={slide.image || "/placeholder.svg"} alt={slide.title} className="w-full h-full object-cover" />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 h-full flex items-center">
              <div className="container">
                <div className="max-w-3xl">
                  <div className="animate-fade-in">
                    <p className="text-ikada-accent-light dark:text-ikada-accent-dark text-lg font-medium mb-2">
                      {slide.subtitle}
                    </p>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">{slide.description}</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button asChild size="lg" className="ikada-gradient hover:opacity-90 text-white">
                        <Link href={slide.cta.primary.href}>
                          {slide.cta.primary.text}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="border-white text-white hover:bg-white hover:text-black"
                      >
                        <Link href={slide.cta.secondary.href}>{slide.cta.secondary.text}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/20 hover:bg-black/40 text-white border-white/20"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/20 hover:bg-black/40 text-white border-white/20"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      {/* Auto-play Control */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-black/20 hover:bg-black/40 text-white border-white/20"
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
      >
        <Play className={`h-4 w-4 ${isAutoPlaying ? "opacity-100" : "opacity-50"}`} />
      </Button>
    </section>
  )
}
