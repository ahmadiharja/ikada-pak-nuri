"use client"
import { Users, Calendar, FileText, TrendingUp, Award, MessageSquare } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const stats = [
  {
    title: "Total Alumni",
    value: "1,247",
    change: "+12%",
    icon: Users,
    color: "text-ikada-green-light dark:text-ikada-green-dark",
  },
  {
    title: "Acara Bulan Ini",
    value: "8",
    change: "+3",
    icon: Calendar,
    color: "text-ikada-accent-light dark:text-ikada-accent-dark",
  },
  {
    title: "Artikel Terbaru",
    value: "24",
    change: "+6",
    icon: FileText,
    color: "text-blue-500",
  },
  {
    title: "Prestasi Alumni",
    value: "156",
    change: "+8",
    icon: Award,
    color: "text-purple-500",
  },
]

const recentActivities = [
  {
    id: 1,
    user: "Ahmad Fauzi",
    action: "menambahkan prestasi baru",
    time: "2 jam yang lalu",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 2,
    user: "Siti Nurhaliza",
    action: "membuat acara 'Reuni Akbar 2024'",
    time: "4 jam yang lalu",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 3,
    user: "Muhammad Rizki",
    action: "memperbarui profil alumni",
    time: "6 jam yang lalu",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 4,
    user: "Fatimah Zahra",
    action: "mengirim artikel baru",
    time: "1 hari yang lalu",
    avatar: "/placeholder-user.jpg",
  },
]

const upcomingEvents = [
  {
    id: 1,
    title: "Reuni Akbar IKADA 2024",
    date: "15 Desember 2024",
    location: "Pondok Darussalam",
    attendees: 150,
  },
  {
    id: 2,
    title: "Seminar Kewirausahaan",
    date: "22 Desember 2024",
    location: "Aula Utama",
    attendees: 80,
  },
  {
    id: 3,
    title: "Bakti Sosial Ramadan",
    date: "10 Maret 2025",
    location: "Desa Sumbersari",
    attendees: 200,
  },
]

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">{stat.change}</span> dari bulan lalu
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-ikada-green-light dark:text-ikada-green-dark" />
              Aktivitas Terbaru
            </CardTitle>
            <CardDescription>Aktivitas terbaru dari anggota IKADA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.avatar || "/placeholder.svg"} alt={activity.user} />
                  <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-ikada-accent-light dark:text-ikada-accent-dark" />
              Acara Mendatang
            </CardTitle>
            <CardDescription>Acara dan kegiatan yang akan datang</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.location}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {event.attendees} peserta
                  </Badge>
                </div>
                <p className="text-xs text-ikada-green-light dark:text-ikada-green-dark font-medium">{event.date}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            Aksi Cepat
          </CardTitle>
          <CardDescription>Akses cepat ke fitur-fitur utama</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="flex items-center space-x-4 p-4">
                <div className="p-2 rounded-full ikada-gradient">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">Tambah Alumni</p>
                  <p className="text-xs text-muted-foreground">Daftarkan alumni baru</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="flex items-center space-x-4 p-4">
                <div className="p-2 rounded-full ikada-gradient">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">Buat Acara</p>
                  <p className="text-xs text-muted-foreground">Jadwalkan acara baru</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="flex items-center space-x-4 p-4">
                <div className="p-2 rounded-full ikada-gradient">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">Tulis Artikel</p>
                  <p className="text-xs text-muted-foreground">Bagikan berita terbaru</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
