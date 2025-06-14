"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, GraduationCap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Beranda", href: "/" },
  { name: "Tentang", href: "/about" },
  {
    name: "Alumni",
    items: [
      { name: "Data Alumni", href: "/alumni", description: "Direktori lengkap alumni IKADA" },
      { name: "Syubiyah", href: "/syubiyah", description: "Cabang wilayah alumni" },
      { name: "Mustahiq", href: "/mustahiq", description: "Program bantuan alumni" },
    ],
  },
  { name: "Berita", href: "/news" },
  { name: "Event & Acara", href: "/events" },
  {
    name: "Donasi",
    items: [
      { name: "Program Donasi", href: "/donations/programs", description: "Berbagai program donasi aktif" },
      { name: "Donasi Sekarang", href: "/donations", description: "Berdonasi untuk kegiatan IKADA" },
      { name: "Sponsor", href: "/donations/sponsors", description: "Program sponsorship" },
    ],
  },
  { name: "Kontak", href: "/contact" },
]

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a">>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className,
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  },
)
ListItem.displayName = "ListItem"

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full ikada-gradient">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold ikada-text-gradient">IKADA</span>
            <span className="text-xs text-muted-foreground">Sumbersari</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {navigation.map((item) => (
              <NavigationMenuItem key={item.name}>
                {item.items ? (
                  <>
                    <NavigationMenuTrigger className="text-sm font-medium">{item.name}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {item.items.map((subItem) => (
                          <ListItem key={subItem.name} title={subItem.name} href={subItem.href}>
                            {subItem.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <Link href={item.href} legacyBehavior passHref>
                    <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                      {item.name}
                    </NavigationMenuLink>
                  </Link>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Button asChild className="hidden md:inline-flex ikada-gradient hover:opacity-90">
            <Link href="/dashboard">Dashboard</Link>
          </Button>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.items ? (
                      <div className="space-y-2">
                        <div className="text-lg font-medium text-foreground">{item.name}</div>
                        <div className="ml-4 space-y-2">
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                              onClick={() => setIsOpen(false)}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-lg font-medium transition-colors hover:text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
                <Button asChild className="ikada-gradient hover:opacity-90 mt-4">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
