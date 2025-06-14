'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/theme-toggle'
import { GraduationCap, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavbarProps {
  className?: string
}

export function Navbar({ className = '' }: NavbarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  const navItems = [
    { href: '/', label: 'Beranda' },
    { href: '/ikada', label: 'Ikada' },
    { href: '/alumni', label: 'Alumni' },
    { href: '/umkm', label: 'UMKM Alumni' },
    { href: '/news', label: 'Berita' },
    { href: '/events', label: 'Event' },
    { href: '/contact', label: 'Kontak' },
  ]

  return (
    <nav className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-green-600" />
            <Link href="/" className="text-xl font-bold text-foreground">
              IKADA Sumbersari
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side - Theme Toggle & Buttons */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/alumni/register">
                <Button variant="outline" size="sm">
                  Daftar Alumni
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm">
                  Login
                </Button>
              </Link>
            </div>
            
            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-lg font-medium transition-colors ${
                        isActive(item.href)
                          ? 'text-primary'
                          : 'hover:text-primary'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="pt-4 border-t space-y-2">
                    <Link href="/alumni/register" className="block" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Daftar Alumni
                      </Button>
                    </Link>
                    <Link href="/login" className="block" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">
                        Login
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}