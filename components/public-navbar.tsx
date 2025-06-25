"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Star } from 'lucide-react'
import clsx from 'clsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Animasi glow CSS
const glowStyle = `
  @keyframes glow {
    0% { box-shadow: 0 0 0px 0px #4ade80, 0 0 0px 0px #22d3ee; }
    50% { box-shadow: 0 0 24px 8px #4ade80, 0 0 24px 8px #22d3ee; }
    100% { box-shadow: 0 0 0px 0px #4ade80, 0 0 0px 0px #22d3ee; }
  }
`;

const menuItems = [
  { label: 'Beranda', href: '/' },
  { label: 'Reuni 2026', href: '/ikada/reuni-2026', highlight: true },
  { label: 'Blog', href: '/ikada/blog' },
  { label: 'Buku Alumni', href: '/ikada/alumni' },
  { label: 'Marketplace', href: '/ikada/marketplace' },
  { label: 'Event', href: '/ikada/events' },
  { label: 'Donasi', href: '/ikada/donasi' },
  {
    label: 'Tentang Kami',
    href: '/ikada/about',
    children: [
      { label: 'Profile Ikada', href: '/ikada/about/profile' },
      { label: 'Pedoman Kerja', href: '/ikada/about/pedoman-kerja' },
      { label: 'Pengurus Ikada', href: '/ikada/about/pengurus' },
      { label: 'Syubiyah', href: '/ikada/about/syubiyah' },
      { label: 'Hubungi Kami', href: '/ikada/about/hubungi-kami' },
    ],
  },
];

const drawerMenuItems = [
  { label: 'Blog', href: '/ikada/blog' },
  { label: 'Buku Alumni', href: '/ikada/alumni' },
  { label: 'Marketplace', href: '/ikada/marketplace' },
  { label: 'Event', href: '/ikada/events' },
  { label: 'Donasi', href: '/ikada/donasi' },
  {
    label: 'Tentang Kami',
    href: '/ikada/about',
    children: [
      { label: 'Profile Ikada', href: '/ikada/about/profile' },
      { label: 'Pedoman Kerja', href: '/ikada/about/pedoman-kerja' },
      { label: 'Pengurus Ikada', href: '/ikada/about/pengurus' },
      { label: 'Syubiyah', href: '/ikada/about/syubiyah' },
      { label: 'Hubungi Kami', href: '/ikada/about/hubungi-kami' },
    ],
  },
];
// menuItems untuk desktop, drawerMenuItems untuk drawer mobile

export function PublicNavbar() {
  const [open, setOpen] = useState(false)
  const [isAlumniLoggedIn, setIsAlumniLoggedIn] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  
  // Cek apakah path saat ini aktif
  const isActive = (href: string) => {
    if (href === '/') return pathname === href
    return pathname.startsWith(href)
  }

  useEffect(() => {
    // Cek alumni_token di localStorage atau cookie
    const checkLogin = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('alumni_token')
        if (token) {
          setIsAlumniLoggedIn(true)
          return
        }
        // Cek di cookie jika perlu
        if (document.cookie.split(';').some(c => c.trim().startsWith('alumni_token='))) {
          setIsAlumniLoggedIn(true)
          return
        }
      }
      setIsAlumniLoggedIn(false)
    }
    checkLogin()
    window.addEventListener('storage', checkLogin)
    return () => window.removeEventListener('storage', checkLogin)
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('alumni_token')
      localStorage.removeItem('alumni_data')
      document.cookie = 'alumni_token=; path=/; max-age=0'
      setIsAlumniLoggedIn(false)
      router.push('/')
    }
  }

  return (
    <>
      <style>{glowStyle}</style>
      <header className="bg-white shadow fixed top-0 left-0 right-0 z-50 w-full">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-green-700">
            <img src="/ikada.png" alt="IKADA" className="h-8 w-8" />
            IKADA
          </Link>
        </div>
        <div className="hidden md:flex gap-2 lg:gap-4 items-center">
          {menuItems.map(item => {
            if (item.label === 'Tentang Kami' && item.children) {
              return (
                <DropdownMenu key={item.label}>
                  <style>{glowStyle}</style>
                  <DropdownMenuTrigger className="px-3 py-2 rounded hover:bg-green-50 text-gray-700 text-sm font-medium flex items-center gap-1">
                    {item.label}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    {item.children.map(sub => (
                      <DropdownMenuItem key={sub.href} asChild>
                        <Link href={sub.href} className="block px-4 py-2 text-gray-700 hover:bg-green-50 text-sm whitespace-nowrap">
                          {sub.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            }
            return (
              <div key={item.href} className="relative">
                <Link
                  href={item.href}
                  className={clsx(
                    'px-3 py-2 rounded text-sm font-medium transition-all flex items-center gap-1',
                    isActive(item.href) ? 'text-green-600 font-semibold bg-green-50' : 'text-gray-700 hover:bg-green-50',
                    item.highlight && 'relative overflow-hidden group'
                  )}
                >
                  {item.label}
                  {item.highlight && (
                    <>
                      <Star className={`h-4 w-4 ml-1 ${isActive(item.href) ? 'text-yellow-500' : 'text-yellow-500'}`} />
                      <span 
                        className={clsx(
                          'absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity',
                          'bg-gradient-to-r from-emerald-400/20 to-cyan-400/20',
                          isActive(item.href) ? 'opacity-100' : ''
                        )}
                        style={item.highlight ? { animation: 'glow 4s infinite' } : {}}
                      />
                    </>
                  )}
                </Link>
              </div>
            )
          })}
          {isAlumniLoggedIn ? (
            <>
              <Link href="/alumni/dashboard" className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold">Dashboard</Link>
              <button onClick={handleLogout} className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold">Logout</button>
            </>
          ) : (
            <Link href="/alumni-login" className="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-semibold">Login</Link>
          )}
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>
      {/* Mobile menu */}
      {/* Overlay & Drawer */}
      <div className={`fixed inset-0 z-40 md:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Overlay dengan efek glass */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setOpen(false)}
        />
        {/* Drawer */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 max-w-[80vw] bg-white shadow-lg z-50 transform transition-transform duration-300 rounded-r-2xl border-r border-white/30 backdrop-blur-md
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ willChange: 'transform' }}
        >
          <button className="absolute top-4 right-4 p-2" onClick={() => setOpen(false)} aria-label="Tutup Menu">
            <X className="w-6 h-6" />
          </button>
          <div className="flex flex-col gap-2 mt-16 px-4 pb-4">
            {drawerMenuItems.map(item =>
              item.children ? (
                <div key={item.label}>
                  <Link href={item.href} className="px-3 py-2 rounded hover:bg-green-50 text-gray-700 text-base font-medium block" onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                  <div className="ml-4 mt-1 flex flex-col gap-1">
                    {item.children.map(sub => (
                      <Link key={sub.href} href={sub.href} className="px-3 py-2 rounded hover:bg-green-50 text-gray-700 text-base font-normal block" onClick={() => setOpen(false)}>
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded text-gray-700 text-base font-medium transition-all hover:bg-green-50`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
            {isAlumniLoggedIn ? (
              <button onClick={() => { setOpen(false); handleLogout(); }} className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-base font-semibold">Logout</button>
            ) : (
              <Link href="/alumni-login" className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-base font-semibold" onClick={() => setOpen(false)}>Login</Link>
            )}
          </div>
        </aside>
      </div>
    </header>
    </>
  )
}