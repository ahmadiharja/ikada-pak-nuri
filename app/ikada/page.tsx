'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { OrganizationChart } from '@/components/organization-chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Users, MapPin, FileText, Building2 } from 'lucide-react'

export default function IkadaPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">IKADA Sumbersari</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ikatan Alumni Pondok Pesantren Darussalam Sumbersari - Menjalin silaturahmi dan membangun ukhuwah islamiyah
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="pedoman">Pedoman Kerja</TabsTrigger>
            <TabsTrigger value="pengurus">Pengurus Ikada</TabsTrigger>
            <TabsTrigger value="syubiyah">Syubiyah</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-green-600">
                    IKATAN KELUARGA ALUMNI DARUSSALAMAH
                  </CardTitle>
                  <CardDescription className="text-lg font-semibold">
                    PONDOK PESANTREN DARUSSALAM
                  </CardDescription>
                  <CardDescription className="text-lg font-semibold">
                    MADRASAH ISLAMIYAH DARUSSALAMAH
                  </CardDescription>
                  <CardDescription className="text-base text-muted-foreground">
                    Sumbersari Kencong Kepung Kediri Jawa Timur
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="mb-6">
                      <img 
                        src="/ikada.png" 
                        alt="Logo IKADA" 
                        className="mx-auto h-24 w-24 object-contain"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-green-600 mb-4">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed text-justify">
                      Bahwa Pondok Pesantren Darussalam Madrasah Islamiyah Darussalamah Sumbersari Kencong Kepung Kediri Jawa Timur adalah merupakan salah satu lembaga pendidikan dan pengajaran ilmu pengetahuan yang didirikan oleh Hadhrotusayaikh KH. Imam Faqih Asy'ari. Beliau memberikan pesan kepada siswa-siswi dan santrinya yang berupa :
                    </p>
                    
                    <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg border-l-4 border-green-600">
                      <p className="text-center font-semibold text-green-800 dark:text-green-200 mb-4">
                        "Ngger aku mekas menyang kowe kabeh...."
                      </p>
                      
                      <div className="space-y-2 text-green-700 dark:text-green-300">
                        <p className="font-medium">Kowe kudu : "Taqwalloh."</p>
                        <p className="font-medium">Kowe kudu : "Nasyrul Ilmi Waddin."</p>
                        <p className="font-medium">Kowe kudu : "Istiqomah Olehe Jama'ah."</p>
                        <p className="font-medium">Kowe kudu : "Manut Tindake Ulama' Salaf."</p>
                        <p className="font-medium">Kowe kudu : "Bagusi Guru Lan Wong Tuwo Loro."</p>
                        <p className="text-center font-semibold mt-4">Wes cukup.....</p>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground leading-relaxed text-justify">
                      Untuk tercapainya cita-cita di atas dan rasa ikut serta dalam usaha mewujudkan tujuan Pondok Pesantren Darussalam Madrasah Islamiyah Darussalamah di antaranya membentuk pribadi seutuhnya, memiliki pengetahuan yang tinggi, bersifat religius, keterampilan tinggi, kreatif dan bertanggung jawab, berakhlaqul karimah serta berperilaku sesuai dengan faham aqidah ahlissunnah wal jama'ah.
                    </p>
                    
                    <p className="text-muted-foreground leading-relaxed text-justify">
                      Maka dipandang perlu lulusan Pondok Pesantren Darussalam Madrasah Islamiyah Darussalamah menghimpun diri dalam suatu wadah kebersamaan untuk kegiatan bhaktinya yang disebut <strong className="text-green-600">Ikatan Keluarga Alumni Darussalamah</strong> yang disingkat menjadi <strong className="text-green-600">IKADA</strong>.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pedoman Kerja Tab */}
          <TabsContent value="pedoman" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Pedoman Kerja IKADA
                  </CardTitle>
                  <CardDescription>
                    Struktur Organisasi dan Tugas Pokok Fungsi Pengurus IKADA
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Layout Dua Kolom */}
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Kolom Kiri */}
                    <div className="space-y-8">
                      {/* A. Dewan Penyantun */}
                      <div>
                        <h3 className="text-xl font-bold text-green-600 mb-4">A. Dewan Penyantun</h3>
                        
                        <div className="space-y-4">
                          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border-l-4 border-green-600">
                            <h4 className="font-bold text-green-800 dark:text-green-200 mb-2">Pelindung</h4>
                            <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                              <li>• Melindungi segala aktifitas IKADA sepanjang tidak bertentangan dengan AD-ART.</li>
                              <li>• Memberi kebebasan berfikir kepada Pengurus IKADA dan kemajuan organisasi yang sesuai dengan petunjuk AD-ART.</li>
                              <li>• Memberi pengarahan kepada Pengurus IKADA baik formal maupun non formal.</li>
                            </ul>
                          </div>
                          
                          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border-l-4 border-blue-600">
                            <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">Penasehat</h4>
                            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                              <li>• Memberi pengarahan dan nasehat kepada pengurus di bidang kualitas dan kuantitas.</li>
                              <li>• Memberi nasehat kepada pengurus kapan saja dibutuhkan baik formal maupun non formal.</li>
                              <li>• Memanggil dan memberi nasehat kepada pengurus terutama Dewan Harian apabila dalam melaksanakan tugasnya kurang sesuai dengan AD-ART.</li>
                            </ul>
                          </div>
                          
                          <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border-l-4 border-purple-600">
                            <h4 className="font-bold text-purple-800 dark:text-purple-200 mb-2">Pembina</h4>
                            <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
                              <li>• Membina dan mengontrol pengurus harian sekaligus memberi advis di bidang kualitas dan kuantitas.</li>
                              <li>• Memberi dorongan dan bimbingan kepada pengurus kapan saja dibutuhkan baik formal maupun non formal.</li>
                              <li>• Memberi pandangan ke depan kepada pengurus demi kemajuan organisasi sekaligus memberi pembinaan kepada pengurus apabila dalam melaksanakan tugasnya kurang sesuai dengan AD-ART.</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* B. Dewan Pengawas */}
                      <div>
                        <h3 className="text-xl font-bold text-green-600 mb-4">B. Dewan Pengawas</h3>
                        <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border-l-4 border-orange-600">
                          <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
                            <li>• Merencanakan dan mengorganisir kegiatan kepengawasan.</li>
                            <li>• Menjamin agar aset lembaga benar-benar terlindungi dan pengoperasiannya dilakukan secara efisien sesuai dengan kesepakatan para pengawas.</li>
                            <li>• Bertindak sebagai jembatan antara Pelindung, Penasehat dan Pembina.</li>
                            <li>• Mempelajari surat-surat.</li>
                            <li>• Menilai kewajaran biaya.</li>
                            <li>• Meneliti informasi keuangan secara berkala.</li>
                            <li>• Meneliti kelancaran kinerja Biro-Biro.</li>
                          </ul>
                        </div>
                      </div>

                    </div>
                    
                    {/* Kolom Kanan */}
                    <div className="space-y-8">
                      {/* C. Dewan Harian */}
                      <div>
                        <h3 className="text-xl font-bold text-green-600 mb-4">C. Dewan Harian</h3>
                        
                        <div className="grid gap-3">
                      {/* Ketua Umum */}
                      <Card className="p-3">
                        <h4 className="font-bold text-base mb-2">Ketua Umum</h4>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                          <li>• Memimpin Organisasi secara umum.</li>
                          <li>• Bertanggung jawab secara keseluruhan tentang maju mundurnya organisai IKADA.</li>
                          <li>• Menentukan musyawarah bersama ketua Satu, Dua, Tiga atau Empat dan sekretaris umum.</li>
                          <li>• Berkordinasi dengan kepala MIDA-MAHISD dalam aktifitasnya.</li>
                        </ul>
                      </Card>
                      
                      {/* Ketua Satu */}
                      <Card className="p-3">
                        <h4 className="font-bold text-base mb-2">Ketua Satu</h4>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                          <li>• Ikut bertanggungjawab secara keseluruhan tentang maju mundurnya organisasi IKADA.</li>
                          <li>• Mengkoordinir Biro Masholihul Mutakhorijin dan Sosial, dan Biro Penyuluhan dan Bantuan Hukum.</li>
                          <li>• Bekerja sama dengan ketua dua menata dan menentukan pengurus IKADA yang menghadiri acara yang diadakan oleh IKADA Syu'biyah.</li>
                        </ul>
                      </Card>
                      
                      {/* Ketua Dua */}
                      <Card className="p-3">
                        <h4 className="font-bold text-base mb-2">Ketua Dua</h4>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                          <li>• Ikut bertanggungjawab secara keseluruhan tentang maju mundurnya organisasi IKADA.</li>
                          <li>• Mengkoordinir Biro Konsolidasi Organisasi dan Biro Kesehatan.</li>
                          <li>• Mengupayakan terbentuknya organisasi IKADA di tingkat daerah yang belum terbentuk.</li>
                        </ul>
                      </Card>
                      
                      {/* Ketua Tiga */}
                      <Card className="p-3">
                        <h4 className="font-bold text-base mb-2">Ketua Tiga</h4>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                          <li>• Ikut bertanggungjawab secara keseluruhan tentang maju mundurnya organisasi IKADA.</li>
                          <li>• Mengkordinir Biro Ekonomi Kreatif dan Biro Perlengkapan dan Pembantu Umum.</li>
                          <li>• Memfasilitasi jalannya Biro Ekonomi Kreatif dan Biro Perlengkapan dan Pembantu Umum.</li>
                        </ul>
                      </Card>
                      
                      {/* Ketua Empat */}
                      <Card className="p-3">
                        <h4 className="font-bold text-base mb-2">Ketua Empat</h4>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                          <li>• Ikut bertanggungjawab secara keseluruhan tentang maju mundurnya organisasi IKADA.</li>
                          <li>• Mengkordinir Biro Pemberdayaan Wanita.</li>
                          <li>• Memfasilitasi jalannya Biro Pemberdayaan Wanita.</li>
                        </ul>
                      </Card>
                      
                      {/* Sekretaris Umum */}
                      <Card className="p-3">
                        <h4 className="font-bold text-base mb-2">Sekretaris Umum</h4>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                          <li>• Mengatur Administrasi organisasi IKADA secara keseluruhan.</li>
                          <li>• Menentukan musyawarah bersama ketua umum.</li>
                          <li>• Membuat dan atau menandatangani surat menyurat bersama ketua umum.</li>
                          <li>• Mengkoordinir Tim MEDKOM (Media dan Komunikasi) bersama sekretaris satu dan dua.</li>
                        </ul>
                      </Card>
                      
                      {/* Sekretaris Satu */}
                      <Card className="p-3">
                        <h4 className="font-bold text-base mb-2">Sekretaris Satu</h4>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                          <li>• Ikut membantu suksesnya administrasi IKADA secara keseluruhan.</li>
                          <li>• Mengkoordinir pendataan anggota IKADA, baik pusat maupun tingkat daerah.</li>
                          <li>• Membantu sekretaris umum sebagai notulen setiap musyawarah dan menyiapkan materinya.</li>
                        </ul>
                      </Card>
                      
                      {/* Sekretaris Dua */}
                      <Card className="p-3">
                        <h4 className="font-bold text-base mb-2">Sekretaris Dua</h4>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                          <li>• Ikut membantu suksesnya administrasi secara keseluruhan.</li>
                          <li>• Membantu mengkoordinir pendataan anggota IKADA, baik pusat maupun tingkat daerah.</li>
                          <li>• Mencetak dan membukukan materi kajian ilmiyah yang disampaikan dalam acara-acara resmi IKADA.</li>
                        </ul>
                      </Card>
                      
                      {/* Bendahara Umum */}
                      <Card className="p-3">
                        <h4 className="font-bold text-base mb-2">Bendahara Umum</h4>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                          <li>• Menerima, menyimpan dan menyalurkan seluruh keuangan IKADA.</li>
                          <li>• Melayani kebutuhan IKADA dengan sepengetahuan ketua umum.</li>
                          <li>• Mencatat keluar masuknya uang IKADA dan melaporkan pada setiap musyawarah.</li>
                        </ul>
                      </Card>
                      
                      {/* Bendahara Satu dan Dua */}
                      <Card className="p-3">
                        <h4 className="font-bold text-base mb-2">Bendahara Satu dan Dua</h4>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                          <li>• Ikut bertanggungjawab tentang suksesnya keuangan IKADA bersama Bendahara Umum.</li>
                          <li>• Membantu dalam mengembangkan dan mengelola keuangan IKADA serta mengusahakan pendanaan IKADA bersama Bendahara Umum.</li>
                        </ul>
                      </Card>
                    </div>
                  </div>
                  
                  {/* D. Biro-biro */}
                  <div>
                    <h3 className="text-xl font-bold text-green-600 mb-4">D. Biro-biro</h3>
                    
                    <div className="grid gap-3">
                      {/* Biro Masholihul Mutakhorijin dan Sosial */}
                      <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
                        <h4 className="font-bold text-lg mb-3 text-green-700 dark:text-green-300">Biro Masholihul Mutakhorijin dan Sosial</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Menanamkan rasa cinta terhadap eksistensi Pondok Pesantren Darussalam dan Madrasah Islamiyah Darussalamah.</li>
                          <li>• Membuat materi kajian ilmiyah yang disampaikan dalam acara-acara resmi IKADA.</li>
                          <li>• Membuat artikel atau buku keaswajaan dalam rangka membentengi Aqidah para Alumni.</li>
                          <li>• Melaporkan aktifitasnya kepada Ketua Satu.</li>
                        </ul>
                      </Card>
                      
                      {/* Biro Konsolidasi Organisasi */}
                      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                        <h4 className="font-bold text-lg mb-3 text-blue-700 dark:text-blue-300">Biro Konsolidasi Organisasi dan Sosial</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Mendata kepengurusan, anggota dan aktifitas organisasi IKADA SYU'BIYAH.</li>
                          <li>• Mewujudkan terjalinnya Ukhuwah Islamiyah antar warga IKADA.</li>
                          <li>• Menyampaikan informasi atau program IKADA kepada warganya, baik secara formal maupun non formal.</li>
                          <li>• Memberikan dorongan sekaligus menggerakkan warga IKADA (wilayah kediri dan sekitarnya) untuk mengikuti kegiatan terutama pengajian kitab Al-Hikam.</li>
                          <li>• Menampung dan menyampaikan aspirasi warga IKADA kepada Ketua Dua.</li>
                          <li>• Mengkoordinir dan menghadiri kegiatan yang diadakan oleh organisasi IKADA Syu'biyah.</li>
                          <li>• Melaporkan aktifitasnya kepada Ketua Dua.</li>
                        </ul>
                      </Card>
                      
                      {/* Biro Perlengkapan & Pembantu umum */}
                      <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                        <h4 className="font-bold text-lg mb-3 text-purple-700 dark:text-purple-300">Biro Perlengkapan & Pembantu Umum</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Ikut bertanggungjawab atas suksesnya kegiatan IKADA.</li>
                          <li>• Melengkapi dan mengusahakan kebutuhan IKADA.</li>
                          <li>• Mempersiapkan tempat rapat.</li>
                          <li>• Melaporkan Aktifitasnya kepada Ketua Tiga.</li>
                        </ul>
                      </Card>
                      
                      {/* Biro Pemberdayaan Perempuan */}
                      <Card className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950">
                        <h4 className="font-bold text-lg mb-3 text-pink-700 dark:text-pink-300">Biro Pemberdayaan Perempuan</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Mendata warga IKADA bagian Putri.</li>
                          <li>• Memberikan dorongan sekaligus menggerakkan warga IKADA Putri untuk mengikuti kegiatan, terutama pengajian kitab Al-Hikam.</li>
                          <li>• Melaporkan Aktifitasnya kepada Ketua Empat.</li>
                        </ul>
                      </Card>
                      
                      {/* Biro Ekonomi Kreatif */}
                      <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
                        <h4 className="font-bold text-lg mb-3 text-yellow-700 dark:text-yellow-300">Biro Ekonomi Kreatif</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Mengusahakan sumber dana dan atau Donatur IKADA yang sesuai dengan AD-ART.</li>
                          <li>• Mengkoordinir dan mengelola pendanaan IKADA bersama Bendahara Umum.</li>
                          <li>• Mengembangkan ekonomi melalui berbagai usaha yang sesuai dengan AD-ART.</li>
                          <li>• Melaporkan aktifitas kepada Ketua Tiga dan Bendahara Umum.</li>
                        </ul>
                      </Card>
                      
                      {/* Biro Penyuluhan dan Bantuan Hukum */}
                      <Card className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950">
                        <h4 className="font-bold text-lg mb-3 text-indigo-700 dark:text-indigo-300">Biro Penyuluhan dan Bantuan Hukum</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Melaksanakan pendampingan, konsultasi, dan kajian kebijakan hukum.</li>
                          <li>• Memberikan bantuan hukum kepada anggota yang membutuhkan.</li>
                          <li>• Melaporkan aktifitas kepada Ketua Satu.</li>
                        </ul>
                      </Card>
                      
                      {/* Biro Kesehatan */}
                      <Card className="p-4 bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-950 dark:to-green-950">
                        <h4 className="font-bold text-lg mb-3 text-teal-700 dark:text-teal-300">Biro Kesehatan</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Melakukan kegiatan bakti sosial kesehatan saat kegiatan rutin atau insidental IKADA.</li>
                          <li>• Mengadakan pelatihan kesehatan pada anggota IKADA.</li>
                          <li>• Melaporkan aktifitas kepada Ketua Dua.</li>
                        </ul>
                      </Card>
                    </div>
                  </div>

                  <Separator />

                  {/* E. Tim Khusus */}
                  <div>
                    <h3 className="text-xl font-bold text-green-600 mb-4">E. Tim Khusus</h3>
                    
                    <Card className="p-6 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950">
                      <h4 className="font-bold text-lg mb-3 text-slate-700 dark:text-slate-300">Tim Media dan Komunikasi (MEDKOM)</h4>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li>• Mengupayakan terwujudnya database seluruh anggota IKADA.</li>
                        <li>• Membuat sarana shilaturrahim dan komunikasi IKADA Asliyah, Syu'biyah, dan atau Far'iyyah dengan anggota dalam bentuk media online dan atau media sosial.</li>
                        <li>• Membranding program dan kegiatan IKADA.</li>
                        <li>• Melaporkan aktifitasnya kepada Sekretaris Umum.</li>
                      </ul>
                    </Card>
                  </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pengurus Ikada Tab */}
          <TabsContent value="pengurus" className="mt-6">
            <OrganizationChart />
          </TabsContent>

          {/* Syubiyah Tab */}
          <TabsContent value="syubiyah" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Syubiyah IKADA
                  </CardTitle>
                  <CardDescription>
                    Cabang-cabang IKADA berdasarkan wilayah
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">Syubiyah Jember</h5>
                          <Badge variant="secondary">Aktif</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Koordinator: Ahmad Jember</p>
                          <p className="text-sm text-muted-foreground">Anggota: 45 orang</p>
                          <p className="text-sm text-muted-foreground">Wilayah: Jember & sekitarnya</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">Syubiyah Surabaya</h5>
                          <Badge variant="secondary">Aktif</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Koordinator: Budi Surabaya</p>
                          <p className="text-sm text-muted-foreground">Anggota: 38 orang</p>
                          <p className="text-sm text-muted-foreground">Wilayah: Surabaya & Sidoarjo</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">Syubiyah Malang</h5>
                          <Badge variant="secondary">Aktif</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Koordinator: Candra Malang</p>
                          <p className="text-sm text-muted-foreground">Anggota: 32 orang</p>
                          <p className="text-sm text-muted-foreground">Wilayah: Malang & Batu</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">Syubiyah Jakarta</h5>
                          <Badge variant="secondary">Aktif</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Koordinator: Dedi Jakarta</p>
                          <p className="text-sm text-muted-foreground">Anggota: 28 orang</p>
                          <p className="text-sm text-muted-foreground">Wilayah: Jabodetabek</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">Syubiyah Banyuwangi</h5>
                          <Badge variant="secondary">Aktif</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Koordinator: Eko Banyuwangi</p>
                          <p className="text-sm text-muted-foreground">Anggota: 22 orang</p>
                          <p className="text-sm text-muted-foreground">Wilayah: Banyuwangi</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">Syubiyah Bondowoso</h5>
                          <Badge variant="outline">Pembentukan</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Koordinator: Farid Bondowoso</p>
                          <p className="text-sm text-muted-foreground">Anggota: 15 orang</p>
                          <p className="text-sm text-muted-foreground">Wilayah: Bondowoso</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h5 className="font-medium mb-2">Informasi Syubiyah</h5>
                    <p className="text-sm text-muted-foreground">
                      Syubiyah adalah cabang IKADA berdasarkan wilayah domisili alumni. Setiap syubiyah memiliki 
                      koordinator dan mengadakan kegiatan rutin untuk mempererat silaturahmi antar alumni di wilayah tersebut.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  )
}