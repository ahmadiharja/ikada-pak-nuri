"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, GraduationCap, Menu } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { toast } from "sonner"
import { Footer } from "@/components/footer"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulasi pengiriman form
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success("Pesan Anda telah terkirim! Kami akan segera menghubungi Anda.")
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-gradient-to-r from-green-600 to-green-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Hubungi Kami
            </h1>
            <p className="text-xl mb-8 leading-relaxed">
              Kami siap membantu Anda. Jangan ragu untuk menghubungi kami melalui berbagai cara di bawah ini.
            </p>
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

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">Alamat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Pondok Darussalam Sumbersari<br />
                  Jl. Gumuk Mas No. 221<br />
                  Sumbersari, Jember<br />
                  Jawa Timur 68121
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg">Telepon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  <a href="tel:+62331487754" className="hover:text-primary transition-colors">
                    (0331) 487-754
                  </a><br />
                  <a href="tel:+6281234567890" className="hover:text-primary transition-colors">
                    +62 812-3456-7890
                  </a>
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg">Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  <a href="mailto:info@ikadasumbersari.org" className="hover:text-primary transition-colors">
                    info@ikadasumbersari.org
                  </a><br />
                  <a href="mailto:admin@ikadasumbersari.org" className="hover:text-primary transition-colors">
                    admin@ikadasumbersari.org
                  </a>
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-lg">Jam Operasional</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Senin - Jumat<br />
                  08:00 - 16:00 WIB<br />
                  <span className="text-sm">Sabtu: 08:00 - 12:00 WIB</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form and Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Kirim Pesan
                </CardTitle>
                <p className="text-muted-foreground">
                  Silakan isi form di bawah ini untuk menghubungi kami. Kami akan merespons dalam 1x24 jam.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama lengkap"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="nama@email.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subjek *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Subjek pesan"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Pesan *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tulis pesan Anda di sini..."
                      rows={6}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Kirim Pesan
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Map and Additional Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lokasi Kami</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.2!2d113.7!3d-8.17!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwMTAnMTIuMCJTIDExM8KwNDInMDAuMCJF!5e0!3m2!1sen!2sid!4v1234567890"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-lg"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pondok Darussalam Sumbersari terletak di jantung kota Jember, mudah diakses dari berbagai arah.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Media Sosial</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <a 
                      href="https://facebook.com/ikadasumbersari" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">f</span>
                      </div>
                      <span>Facebook - IKADA Sumbersari</span>
                    </a>
                    
                    <a 
                      href="https://instagram.com/ikadasumbersari" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">@</span>
                      </div>
                      <span>Instagram - @ikadasumbersari</span>
                    </a>
                    
                    <a 
                      href="https://wa.me/6281234567890" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                    >
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">W</span>
                      </div>
                      <span>WhatsApp - +62 812-3456-7890</span>
                    </a>
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