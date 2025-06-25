'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, MapPin, Users, Mic, Utensils, Camera, Gift, ArrowRight, Book, Star, Heart, Moon, Sun, Home, Clock, Target, UserCheck } from 'lucide-react'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        clearInterval(timer)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="flex justify-center items-center gap-3 md:gap-6 my-6">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="text-center bg-white/20 backdrop-blur-sm p-3 rounded-lg border border-white/30">
          <div className="text-3xl md:text-5xl font-bold text-white">
            {String(value).padStart(2, '0')}
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider mt-1 text-white/80">{unit}</div>
        </div>
      ))}
    </div>
  )
}

const quranVerse = {
  arabic: 'إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ',
  translation: 'Sesungguhnya orang-orang mukmin itu bersaudara',
  source: 'Al-Hujurat: 10'
}

const hadithSilaturahmi = {
  arabic: 'مَنْ أَحَبَّ أَنْ يُبْسَطَ لَهُ فِي رِزْقِهِ، وَيُنْسَأَ لَهُ فِي أَثَرِهِ، فَلْيَصِلْ رَحِمَهُ',
  translation: 'Barangsiapa yang ingin dilapangkan rezekinya dan dipanjangkan umurnya, maka hendaklah ia menyambung silaturahmi',
  source: 'HR. Bukhari & Muslim'
}

const eventTheme = {
  title: 'Merajut Silaturahmi, Menguatkan Ukhuwah, Membangun Sinergi, dan Meneladani Warisan Perjuangan KH. Imam Faqih Asy\'ari',
  description: [
    'Mempertemukan kembali ribuan alumni dari berbagai generasi dan daerah dalam satu ikatan batin dan sejarah',
    'Membangun persaudaraan spiritual dan sosial yang kokoh sebagai kekuatan utama alumni IKADA',
    'Menggerakkan potensi dan kontribusi alumni dalam program dakwah, sosial, ekonomi, dan pendidikan',
    'Menjadikan momentum reuni sebagai ajang muhasabah, penghormatan, dan pelanjut perjuangan sang pendiri pondok'
  ]
}

const reunionObjectives = [
  {
    icon: Target,
    title: 'Ekspresi Budaya & Ukhuwah',
    description: 'Wadah menampilkan talenta alumni & nilai-nilai pondok'
  },
  {
    icon: Users,
    title: 'Promosi Karya Nyata Alumni',
    description: 'Ajang memperkenalkan usaha alumni ke sesama alumni & santri'
  },
  {
    icon: Star,
    title: 'Inspirasi Ekonomi Alumni',
    description: 'Membangun jejaring bisnis dan mentoring antar alumni'
  },
  {
    icon: Heart,
    title: 'Menghidupkan Nuansa Santri',
    description: 'Menghidupkan kembali nuansa santri dan kenangan lama'
  }
]

const mondokProgram = {
  title: 'MONDOK BARENG ALUMNI LINTAS GENERASI',
  subtitle: 'Dari Angkatan 1975 hingga 2024 – Kembali ke Pondok, Sebaris Sejarah, Selapis Kenangan',
  objectives: [
    'Menghidupkan kembali nuansa santri dan kenangan lama',
    'Mempererat silaturahmi berdasarkan angkatan, bukan hanya Syu\'biyah',
    'Menumbuhkan rasa kebersamaan lintas usia dan profesi',
    'Menyatukan energi spiritual alumni dalam suasana pondok'
  ],
  details: {
    duration: '3 malam (Jumat sore – Minggu pagi, 12 – 14 Juni 2026)',
    capacity: '±100 ruang kelas dengan estimasi 20–150 alumni per kelas',
    facilities: 'Kasur lipat/sajadah, air minum, snack, kipas angin portable, pencahayaan malam',
    grouping: 'Berdasarkan tahun masuk (angkatan) dan jenis kelamin'
  },
  nightActivities: [
    {
      night: 'Malam Pertama (Jumat)',
      activities: ['Ramah tamah per angkatan', 'Sesi Nostalgia & Testimoni', 'Nonton bareng video dokumentasi', 'Shalat malam berjamaah']
    },
    {
      night: 'Malam Kedua (Sabtu)',
      activities: ['Dzikir bersama di depan kamar', 'Ngaji bareng & kultum 7 menit', 'Tahlil khusus untuk KH. Imam Faqih Asy\'ari', 'Penulisan surat harapan untuk IKADA']
    }
  ]
}

const santriPutriProgram = {
  title: 'PANGGUNG KHUSUS SANTRI PUTRI',
  subtitle: 'Panggung Alumniah: Kembali, Bertemu, dan Bersinergi',
  time: '08.00 – 11.30 WIB',
  activities: [
    'Pembukaan & Tilawah Al-Qur\'an',
    'Sambutan Alumni Santri Putri IKADA',
    'Tausiyah & Doa Para Ibu Nyai',
    'Testimoni & Inspirasi Alumni Santri Putri',
    'Mushofahah (Silaturrahim Kolektif)',
    'Video Dokumenter Alumni Santri Putri'
  ]
}

const scheduleData = {
  'Jumat': [
    { time: '15.00 - 22.00', title: 'Kedatangan & Registrasi Alumni', description: 'Proses registrasi di posko utama, pengambilan ID Card, dan pembagian zona kamar' },
    { time: 'Malam', title: 'Ramah Tamah & Nostalgia', description: 'Sesi nostalgia per angkatan, sharing pengalaman, dan shalat malam berjamaah' }
  ],
  'Sabtu': [
    { time: '08.00 - 21.00', title: 'Bazar UMKM Alumni', description: 'Pameran dan penjualan produk alumni dari berbagai bidang usaha' },
    { time: '13.00 - 17.00', title: 'Lomba Pentas Seni & Budaya', description: 'Pertunjukan hadrah, qasidah, drama, dan penampilan budaya' },
    { time: '19.30 - 21.00', title: 'Sesi Inspirasi Usaha', description: 'Sharing pengalaman sukses dari alumni entrepreneur' }
  ],
  'Minggu': [
    { time: '08.00 - 12.00', title: 'Acara Resmi & Tausiyah', description: 'Pembukaan resmi, parade angkatan, dan tausiyah dari para masayikh' },
    { time: '13.00 - 16.00', title: 'Sidang Reformasi', description: 'Pemilihan Ketua Umum IKADA Nasional' },
    { time: '19.00 - 22.00', title: 'Puncak Haul & Tasyakur', description: 'Pelantikan pengurus baru, dzikir & tahlil akbar, dan sholawat nasional' }
  ]
}

const highlights = [
  { icon: Book, text: 'Tausiyah Para Masayikh' },
  { icon: Home, text: 'Mondok Bareng Alumni' },
  { icon: Star, text: 'Pentas Seni & Budaya' },
  { icon: Utensils, text: 'Bazar UMKM Alumni' },
  { icon: Heart, text: 'Dzikir & Tahlil Akbar' },
  { icon: Moon, text: 'Sholawat Nasional' },
  { icon: UserCheck, text: 'Program Santri Putri' },
  { icon: Clock, text: 'Sumpah Alumni Nasional' },
]

const galleryImages = [
  { src: '/reuni/Lucid_Realism_a_cinematic_photo_of_A_lively_cinematic_photo_ca_2.jpg', alt: 'Suasana alumni ceria di acara reuni' },
  { src: '/reuni/Lucid_Realism_a_cinematic_photo_of_A_cinematic_natural_morning_3.jpg', alt: 'Pagi natural sinematik di lokasi reuni' },
  { src: '/reuni/Lucid_Realism_a_cinematic_photo_of_A_warm_and_peaceful_cinemat_3.jpg', alt: 'Momen hangat dan damai reuni' },
  { src: '/reuni/a-photograph-of-a-group-of-young-indones_qPnExoIaRPGb2IH6JrXxIQ_pmnCjJRHSGGXdi1XSeLVUQ.jpeg', alt: 'Foto grup alumni Indonesia di reuni' },
]

export default function Reuni2026Page() {
  // fallback jika konten gagal diambil atau sedang loading
  const eventDate = new Date('2026-07-12T08:00:00+07:00')

  return (
    <div className="relative bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950 min-h-screen text-zinc-800 dark:text-zinc-200">
      {/* Quranic Verse Section */}
      <section className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-700 text-white py-8 md:py-10 text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/ikada.png')] bg-center bg-no-repeat bg-contain pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <p className="text-3xl md:text-4xl mb-2 font-arabic drop-shadow-lg" style={{ fontFamily: 'Amiri, serif' }}>{quranVerse.arabic}</p>
          <p className="text-lg md:text-2xl mb-1 italic font-medium text-emerald-100">"{quranVerse.translation}"</p>
          <p className="text-sm text-emerald-200 tracking-widest uppercase font-semibold">{quranVerse.source}</p>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[220px] sm:h-[60vh] sm:min-h-[400px] w-full flex items-center justify-center text-center text-white overflow-hidden p-2 sm:p-0">
        <div className="absolute inset-0">
          <Image
            src="/placeholder.jpg"
            alt="Suasana Pondok Pesantren Darussalamah"
            fill
            className="object-cover object-center animate-kenburns scale-105 blur-[1.5px]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-800/60 to-transparent" />
        </div>
        <div className="relative z-10 p-2 sm:p-4">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-2 sm:mb-4 animate-fade-in-down drop-shadow-xl">
            REUNI AKBAR & REFORMASI IKADA NASIONAL 2026
          </h1>
          <p className="text-base sm:text-lg md:text-2xl max-w-2xl sm:max-w-3xl mx-auto text-white/90 animate-fade-in-up mb-3 sm:mb-6 font-medium">
            {eventTheme.title}
          </p>
          <Countdown targetDate={eventDate} />
        </div>
      </section>

      <main className="container mx-auto px-2 sm:px-4 py-6 sm:py-12 md:py-20">
        {/* Hadith Section */}
        <section className="bg-white/90 dark:bg-zinc-900/90 rounded-2xl sm:rounded-3xl p-4 sm:p-10 mb-10 sm:mb-20 text-center shadow-2xl border border-emerald-100 dark:border-emerald-900 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-emerald-200/40 to-emerald-400/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-tr from-emerald-200/40 to-emerald-400/10 rounded-full blur-2xl" />
          <p className="text-lg sm:text-2xl md:text-3xl mb-2 sm:mb-3 font-arabic text-emerald-700 dark:text-emerald-300 drop-shadow-md" style={{ fontFamily: 'Amiri, serif' }}>{hadithSilaturahmi.arabic}</p>
          <p className="text-sm sm:text-lg md:text-xl mb-1 sm:mb-2 italic font-medium text-emerald-800 dark:text-emerald-200">"{hadithSilaturahmi.translation}"</p>
          <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 tracking-widest uppercase font-semibold">{hadithSilaturahmi.source}</p>
        </section>

        {/* About Section */}
        <section className="max-w-4xl mx-auto text-center mb-10 sm:mb-20">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-emerald-700 dark:text-emerald-300 drop-shadow">Sebuah Panggilan untuk Pulang</h2>
          <div className="mx-auto w-10 h-1 sm:w-16 bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-400 rounded-full mb-4 sm:mb-6" />
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6 sm:mb-8">
            Setelah sekian lama, mari kita kembali ke tempat di mana semuanya dimulai. Pondok Pesantren Darussalamah Sumbersari memanggil santri putra dan santri putri terbaiknya untuk berkumpul, berbagi cerita, dan merajut kembali benang persahabatan yang tak lekang oleh waktu. Ini bukan sekadar reuni, ini adalah perayaan keluarga besar IKADA.
          </p>
          {/* Reunion Objectives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12">
            {reunionObjectives.map((objective, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow rounded-xl">
                <CardContent className="p-4 sm:p-6">
                  <objective.icon className="h-8 w-8 sm:h-12 sm:w-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-2 sm:mb-4" />
                  <h3 className="font-bold mb-1 sm:mb-2 text-base sm:text-lg">{objective.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">{objective.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Mondok Program Section */}
        <section className="mb-10 sm:mb-20">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 text-emerald-700 dark:text-emerald-300 drop-shadow">{mondokProgram.title}</h2>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 italic">{mondokProgram.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                  Tujuan Program
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 sm:space-y-3">
                  {mondokProgram.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Home className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                  Detail Pemondokan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <h4 className="font-semibold mb-1 text-sm sm:text-base">Durasi</h4>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">{mondokProgram.details.duration}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-sm sm:text-base">Kapasitas</h4>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">{mondokProgram.details.capacity}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-sm sm:text-base">Fasilitas</h4>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">{mondokProgram.details.facilities}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-sm sm:text-base">Pengelompokan</h4>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">{mondokProgram.details.grouping}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Night Activities */}
          <div className="mt-6 sm:mt-8">
            <h3 className="text-lg sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-emerald-700 dark:text-emerald-300 drop-shadow">Kegiatan Unggulan Tiap Malam</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {mondokProgram.nightActivities.map((night, index) => (
                <Card key={index} className="border-l-4 border-l-emerald-500 rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">{night.night}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 sm:space-y-2">
                      {night.activities.map((activity, actIndex) => (
                        <li key={actIndex} className="flex items-start gap-2">
                          <Moon className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Santri Putri Program Section */}
        <section className="mb-10 sm:mb-20">
          <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950 border-pink-200 dark:border-pink-800 rounded-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-lg sm:text-2xl md:text-3xl text-pink-700 dark:text-pink-300">{santriPutriProgram.title}</CardTitle>
              <p className="text-pink-600 dark:text-pink-400 italic text-sm sm:text-base">{santriPutriProgram.subtitle}</p>
              <p className="text-xs sm:text-sm font-semibold text-pink-600 dark:text-pink-400">{santriPutriProgram.time}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                {santriPutriProgram.activities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/50 dark:bg-pink-900/20 rounded-lg">
                    <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{activity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Schedule Section */}
        <section className="mb-10 sm:mb-20">
          <h2 className="text-lg sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-8 text-emerald-700 dark:text-emerald-300 drop-shadow">Rangkaian Acara</h2>
          <Tabs defaultValue="Jumat" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-8 bg-emerald-100/60 dark:bg-emerald-900/40 rounded-xl shadow-inner">
              <TabsTrigger value="Jumat" className="text-xs sm:text-base data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-xl transition-all">Jumat</TabsTrigger>
              <TabsTrigger value="Sabtu" className="text-xs sm:text-base data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-xl transition-all">Sabtu</TabsTrigger>
              <TabsTrigger value="Minggu" className="text-xs sm:text-base data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-xl transition-all">Minggu</TabsTrigger>
            </TabsList>
            {Object.entries(scheduleData).map(([day, events]) => (
              <TabsContent key={day} value={day} className="space-y-4 sm:space-y-6">
                {events.map((event, index) => (
                  <Card key={index} className="overflow-hidden border-l-4 border-emerald-500/80 bg-white/80 dark:bg-zinc-900/80 shadow-lg hover:scale-[1.015] transition-transform rounded-xl">
                    <CardContent className="p-4 sm:p-7">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-4">
                        <div className="flex-1">
                          <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2 text-emerald-700 dark:text-emerald-300">{event.title}</h3>
                          <p className="text-xs sm:text-base text-zinc-600 dark:text-zinc-400">{event.description}</p>
                        </div>
                        <div className="text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap text-sm sm:text-lg">
                          {event.time}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Details Section */}
        <section className="flex flex-col md:flex-row gap-6 sm:gap-8 md:gap-12 items-stretch mb-10 sm:mb-20">
          {/* Detail Acara */}
          <div className="flex-1 bg-white/90 dark:bg-zinc-900/90 p-4 sm:p-10 rounded-2xl sm:rounded-3xl shadow-2xl border border-emerald-100 dark:border-emerald-900 flex flex-col justify-center min-h-[180px] sm:min-h-[280px]">
            <h3 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-8 text-emerald-700 dark:text-emerald-300">Detail Acara</h3>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500 mr-3 sm:mr-4 mt-1" />
                <div>
                  <p className="font-semibold text-base sm:text-lg">Tanggal & Waktu</p>
                  <p className="text-xs sm:text-zinc-600 dark:text-zinc-400">12-14 Juni 2026 | Jumat - Minggu</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500 mr-3 sm:mr-4 mt-1" />
                <div>
                  <p className="font-semibold text-base sm:text-lg">Lokasi</p>
                  <p className="text-xs sm:text-zinc-600 dark:text-zinc-400">Pondok Pesantren Darussalamah, Sumbersari, Kencong, Kepung, Kediri</p>
                </div>
              </div>
            </div>
          </div>
          {/* Rangkaian Acara Utama */}
          <div className="flex-1 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-4 sm:p-10 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col justify-center min-h-[180px] sm:min-h-[280px]">
            <h3 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-8 text-center">Rangkaian Acara Utama</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 place-items-center">
              {highlights.map((item, index) => (
                <div key={index} className="flex flex-col items-center justify-center w-full h-full min-h-[70px] sm:min-h-[90px] max-w-full sm:max-w-[180px] p-2 sm:p-4 bg-white/15 rounded-2xl shadow-md hover:bg-white/25 transition-colors text-center">
                  <item.icon className="h-6 w-6 sm:h-8 sm:w-8 mb-1 sm:mb-2 text-white" />
                  <span className="text-xs sm:text-sm md:text-base font-semibold leading-tight break-words">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="text-center mb-10 sm:mb-20">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-8 text-emerald-700 dark:text-emerald-300 drop-shadow">Galeri Kenangan</h2>
          <div className="mx-auto w-10 h-1 sm:w-16 bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-400 rounded-full mb-4 sm:mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {galleryImages.map((img, index) => (
              <div key={index} className="relative aspect-square overflow-hidden rounded-xl sm:rounded-2xl shadow-xl group border-2 border-emerald-100 dark:border-emerald-900 bg-white/60 dark:bg-zinc-900/60">
                <Image src={img.src} alt={img.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-1" />
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 sm:w-40 sm:h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-24 h-24 sm:w-40 sm:h-40 bg-white/10 rounded-full blur-2xl" />
          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold drop-shadow-lg mb-3 sm:mb-4">Bergabunglah dalam Reuni Bersejarah!</h2>
          <p className="text-base sm:text-lg max-w-xl mx-auto mb-4 sm:mb-6 font-medium">Amankan tempat Anda sekarang dan jadilah bagian dari sejarah. Momen ini terlalu berharga untuk dilewatkan.</p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-6 mb-4 sm:mb-8 max-w-xl mx-auto">
            <p className="text-xs sm:text-sm mb-1 sm:mb-2 font-semibold">Slogan Program Mondok:</p>
            <p className="italic text-base sm:text-lg">"Pernah Bersama, Kini Kembali Bersama"</p>
            <p className="italic text-xs sm:text-sm mt-1 sm:mt-2">"Mondok Bareng Alumni Lintas Generasi – Satu Langkah Kembali, Seribu Langkah untuk Masa Depan"</p>
          </div>
          <Button size="lg" className="w-full sm:w-auto bg-white text-emerald-700 font-bold rounded-full shadow-xl text-base sm:text-lg px-6 sm:px-12 py-5 sm:py-7 transition-transform hover:scale-105 hover:bg-emerald-50/90 border-2 border-emerald-200">
            Daftar Sekarang <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </section>
      </main>
    </div>
  )
}