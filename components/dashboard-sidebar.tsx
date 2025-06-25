"use client"

import React from "react"
import type * as ReactType from "react"
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  User,
  Bell,
  BarChart3,
  GraduationCap,
  ChevronDown,
  UserCheck,
  Building2,
  Heart,
  DollarSign,
  History,
  Handshake,
  Gift,
  CreditCard,
  TrendingUp,
  PieChart,
  FileBarChart,
  CalendarIcon,
  Globe,
  Mail,
  Shield,
  Database,
  CheckCircle,
  UserCog,
  Tag,
  MessageCircle,
  ShoppingBag,
  Store,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    title: "Profil Saya",
    icon: User,
    url: "/dashboard/profile",
  },
]

const managementItems = [
  {
    title: "Alumni",
    icon: Users,
    items: [
      {
        title: "Data Alumni",
        icon: UserCheck,
        url: "/dashboard/alumni/alumni",
      },
      {
        title: "Syubiyah",
        icon: Building2,
        url: "/dashboard/alumni/syubiyah",
      },
      {
        title: "Mustahiq",
        icon: Heart,
        url: "/dashboard/alumni/mustahiq",
      },
    ],
  },
  {
    title: "UMKM Alumni",
    icon: ShoppingBag,
    items: [
      {
        title: "Produk Alumni",
        icon: Store,
        url: "/dashboard/umkm/products",
      },
      {
        title: "Kategori Produk",
        icon: Tag,
        url: "/dashboard/umkm/categories",
      },
    ],
  },
  {
    title: "Berita & Artikel",
    icon: FileText,
    items: [
      {
        title: "Post",
        icon: FileText,
        url: "/dashboard/news/posts",
      },
      {
        title: "Kategori",
        icon: Tag,
        url: "/dashboard/news/categories",
      },
      {
        title: "Komentar",
        icon: MessageCircle,
        url: "/dashboard/news/comments",
      },
    ],
  },
  {
    title: "Event & Acara",
    icon: Calendar,
    items: [
      {
        title: "Daftar Event",
        icon: Calendar,
        url: "/dashboard/events/list",
      },
      {
        title: "Peserta Event",
        icon: Users,
        url: "/dashboard/events/participants",
      },
    ],
  },
  {
    title: "Donasi",
    icon: DollarSign,
    items: [
      {
        title: "Program Donasi",
        icon: Gift,
        url: "/dashboard/donations/programs",
      },
      {
        title: "Transaksi Donasi",
        icon: History,
        url: "/dashboard/donations/transactions",
      },
      {
        title: "Persetujuan Transfer",
        icon: CheckCircle,
        url: "/dashboard/donations/approvals",
      },
      {
        title: "Laporan Donasi",
        icon: BarChart3,
        url: "/dashboard/donations/reports",
      },
    ],
  },
  {
    title: "Laporan",
    icon: BarChart3,
    items: [
      {
        title: "Laporan Alumni",
        icon: TrendingUp,
        url: "/dashboard/reports/alumni",
      },
      {
        title: "Laporan Kegiatan",
        icon: CalendarIcon,
        url: "/dashboard/reports/activities",
      },
      {
        title: "Laporan Donasi",
        icon: PieChart,
        url: "/dashboard/reports/donations",
      },
      {
        title: "Laporan Keuangan",
        icon: FileBarChart,
        url: "/dashboard/reports/financial",
      },
      {
        title: "Laporan Website",
        icon: Globe,
        url: "/dashboard/reports/website",
      },
      {
        title: "Laporan Bulanan",
        icon: Calendar,
        url: "/dashboard/reports/monthly",
      },
    ],
  },
  {
    title: "Pengaturan",
    icon: Settings,
    items: [
      {
        title: "Pengaturan Umum",
        icon: Settings,
        url: "/dashboard/settings/general",
      },
      {
        title: "Pengaturan Website",
        icon: Globe,
        url: "/dashboard/settings/website",
      },
      {
        title: "Pengaturan Email",
        icon: Mail,
        url: "/dashboard/settings/email",
      },
      {
        title: "Pengaturan Notifikasi",
        icon: Bell,
        url: "/dashboard/settings/notifications",
      },
      {
        title: "Manajemen Admin",
        icon: UserCog,
        url: "/dashboard/settings/admins",
      },
      {
        title: "Manajemen Role",
        icon: Shield,
        url: "/dashboard/settings/roles",
      },
      {
        title: "Backup & Restore",
        icon: Database,
        url: "/dashboard/settings/backup",
      },
      {
        title: "Keamanan",
        icon: Shield,
        url: "/dashboard/settings/security",
      },
      {
        title: "Susunan Organisasi",
        icon: Users,
        url: "/dashboard/settings/organization",
      },
    ],
  },
]

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const router = useRouter()
// DEBUG: tampilkan isi session di console
  React.useEffect(() => {
    if (session) {
      // eslint-disable-next-line no-console
      console.log("Current NextAuth session in Sidebar ===>", session)
    }
  }, [session]);

  const handleLogout = async () => {
    try {
      await signOut({ 
        redirect: false,
        callbackUrl: '/admin'
      })
      router.push('/admin')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getUserDisplayName = () => {
    if (session?.user?.name) {
      return session.user.name
    }
    return 'Admin IKADA'
  }

  const getUserEmail = () => {
    if (session?.user?.email) {
      return session.user.email
    }
    return 'admin@ikada.com'
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg ikada-gradient">
                  <GraduationCap className="size-4 text-white" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">IKADA Admin</span>
                  <span className="truncate text-xs text-muted-foreground">Dashboard</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Menu Reuni 2026 khusus Superadmin */}
        {session?.user?.role === "PUSAT" && (
          <SidebarGroup>
            <SidebarGroupLabel>Reuni</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/dashboard/reuni">
                      <Calendar className="h-4 w-4" />
                      <span>Reuni 2026</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Manajemen</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible className="group/collapsible">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <a href={subItem.url}>
                                  <subItem.icon className="h-4 w-4" />
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="/placeholder-user.jpg" alt="Admin" />
                    <AvatarFallback className="rounded-lg ikada-gradient text-white">
                      {getUserInitials(getUserDisplayName())}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{getUserDisplayName()}</span>
                    <span className="truncate text-xs text-muted-foreground">{getUserEmail()}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profil Saya
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Pengaturan
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="h-4 w-4 mr-2" />
                  Notifikasi
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
