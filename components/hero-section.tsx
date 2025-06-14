"use client"
import Link from "next/link"
import { ArrowRight, Users, Calendar, BookOpen, Award } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const stats = [
  { icon: Users, label: "Alumni Terdaftar", value: "1,200+" },
  { icon: Calendar, label: "Acara per Tahun", value: "24+" },
  { icon: BookOpen, label: "Program Aktif", value: "8" },
  { icon: Award, label: "Prestasi Alumni", value: "150+" },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-ikada-green-light/5 via-transparent to-ikada-accent-light/5 dark:from-ikada-green-dark/10 dark:to-ikada-accent-dark/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(6,95,70,0.2),transparent_50%)]" />
      </div>

      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              <span className="ikada-text-gradient">IKADA</span>
              <br />
              <span className="text-foreground">Sumbersari</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground md:text-xl">
              Ikatan Alumni Pondok Darussalam - Membangun jaringan alumni yang kuat, berbagi ilmu, dan berkontribusi
              untuk kemajuan umat.
            </p>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Button asChild size="lg" className="ikada-gradient hover:opacity-90 text-white">
              <Link href="/register">
                Daftar Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">Pelajari Lebih Lanjut</Link>
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          {stats.map((stat, index) => (
            <Card
              key={stat.label}
              className="animate-fade-in border-0 bg-card/50 backdrop-blur-sm"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-2 rounded-full p-3 ikada-gradient">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
