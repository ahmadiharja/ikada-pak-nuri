'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { GraduationCap, Menu, Users, Building2, Star } from 'lucide-react'
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
  { href: '/ikada/reuni-2026', label: 'Reuni 2026', highlight: true },
  { href: '/alumni/dashboard', label: 'Portal Alumni' },
  { href: '/dashboard', label: 'Dashboard Admin' },
]

  return (
    <nav className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <Link href="/" className="text-xl font-bold text-foreground">
              Portal Alumni
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
                } ${item.highlight ? 'bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold shadow hover:bg-yellow-300 transition' : ''}`}
              >
                {item.label}
                {item.highlight && <Star className="inline ml-2 h-4 w-4 text-yellow-700" />}
              </Link>
            ))}
          </div>

          {/* Right Side - Theme Toggle & Buttons */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/login">
                <Button size="sm">
                  <Users className="w-4 h-4 mr-2" />
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
                <SheetTitle id="mobile-navbar-title">Menu</SheetTitle>
                <div className="flex flex-col space-y-4 mt-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-lg font-medium transition-colors ${
                        isActive(item.href)
                          ? 'text-primary'
                          : 'hover:text-primary'
                      } ${item.highlight ? 'bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold shadow hover:bg-yellow-300 transition' : ''}`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                      {item.highlight && <Star className="inline ml-2 h-4 w-4 text-yellow-700" />}
                    </Link>
                  ))}
                  <div className="pt-4 border-t space-y-2">
                    <Link href="/login" className="block" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">
                        <Users className="w-4 h-4 mr-2" />
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