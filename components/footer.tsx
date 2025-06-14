import Link from "next/link"
import { GraduationCap, MapPin, Phone, Mail } from "lucide-react"

interface FooterProps {
  className?: string
}

export function Footer({ className = "" }: FooterProps) {
  const currentYear = new Date().getFullYear()

  const navigationLinks = [
    { name: "Beranda", href: "/" },
    { name: "Tentang", href: "/about" },
    { name: "Alumni", href: "/alumni" },
    { name: "Berita", href: "/news" },
    { name: "Event", href: "/events" },
    { name: "Syubiyah", href: "/syubiyah" },
    { name: "Kontak", href: "/contact" },
  ]

  const contactInfo = [
    {
      icon: MapPin,
      text: "Jl. Gumuk Mas No. 221, Sumbersari, Jember, Jawa Timur 68121"
    },
    {
      icon: Phone,
      text: "+62 331 487-754"
    },
    {
      icon: Mail,
      text: "info@ikadasumbersari.org"
    }
  ]

  return (
    <footer className={`bg-muted/50 border-t py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo dan Deskripsi */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="h-10 w-10 text-green-600" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">IKADA Sumbersari</span>
                <span className="text-xs text-muted-foreground">Ikatan Alumni Pondok Darussalam</span>
              </div>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Membangun jaringan alumni yang kuat, berbagi ilmu, dan berkontribusi untuk kemajuan umat melalui kegiatan sosial, pendidikan, dan dakwah.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              <Link 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </Link>
              <Link 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.198 7.053 7.708 8.35 7.708s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387zm7.718 0c-1.297 0-2.448-.49-3.323-1.297-.897-.875-1.387-2.026-1.387-3.323s.49-2.448 1.297-3.323c.875-.897 2.026-1.387 3.323-1.387s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387z"/>
                </svg>
              </Link>
              <Link 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Menu Navigasi */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Navigasi</h3>
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informasi Kontak */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Kontak</h3>
            <ul className="space-y-3">
              {contactInfo.map((contact, index) => {
                const IconComponent = contact.icon
                return (
                  <li key={index} className="flex items-start gap-2">
                    <IconComponent className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      {contact.text}
                    </span>
                  </li>
                )
              })}
            </ul>
            
            {/* Jam Operasional */}
            <div className="mt-4">
              <h4 className="font-medium text-sm text-foreground mb-2">Jam Operasional</h4>
              <div className="text-sm text-muted-foreground">
                <p>Senin - Jumat: 08:00 - 16:00 WIB</p>
                <p>Sabtu: 08:00 - 12:00 WIB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} IKADA Sumbersari - Ikatan Alumni Pondok Darussalam. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  )
}