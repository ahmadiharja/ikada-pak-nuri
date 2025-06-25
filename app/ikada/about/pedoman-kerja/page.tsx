"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, ShieldCheck, Briefcase, Layers, Users2 } from "lucide-react";

const MENU = [
  { key: "penyantun", label: "Dewan Penyantun", icon: ShieldCheck },
  { key: "pengawas", label: "Dewan Pengawas", icon: Users2 },
  { key: "harian", label: "Dewan Harian", icon: Briefcase },
  { key: "biro", label: "Biro-biro", icon: Layers },
  { key: "tim", label: "Tim Khusus", icon: Users },
];

// --- Konten per bagian ---
const CONTENT: Record<string, JSX.Element> = {
  penyantun: (
    <>
      <h2 className="text-lg sm:text-xl font-bold mb-2 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-500" /> Dewan Penyantun</h2>
      <div className="grid gap-3">
        <Card className="bg-emerald-50/60 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800 shadow-none">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Pelindung</CardTitle></CardHeader>
          <CardContent className="pt-0 pb-3 text-sm sm:text-base">
            <ol className="list-decimal ml-4 text-sm sm:text-base">
              <li>Melindungi segala aktifitas IKADA sepanjang tidak bertentangan dengan AD-ART.</li>
              <li>Memberi kebebasan berfikir kepada Pengurus IKADA dan kemajuan organisasi yang sesuai dengan petunjuk AD-ART.</li>
              <li>Memberi pengarahan kepada Pengurus IKADA baik formal maupun non formal.</li>
            </ol>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50/60 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800 shadow-none">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Penasehat</CardTitle></CardHeader>
          <CardContent className="pt-0 pb-3 text-sm sm:text-base">
            <ol className="list-decimal ml-4 text-sm sm:text-base">
              <li>Memberi pengarahan dan nasehat kepada pengurus di bidang kualitas dan kuantitas.</li>
              <li>Memberi nasehat kepada pengurus kapan saja dibutuhkan baik formal maupun non formal.</li>
              <li>Memanggil dan memberi nasehat kepada pengurus terutama Dewan Harian apabila dalam melaksanakan tugasnya kurang sesuai dengan AD-ART.</li>
            </ol>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50/60 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800 shadow-none">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Pembina</CardTitle></CardHeader>
          <CardContent className="pt-0 pb-3 text-sm sm:text-base">
            <ol className="list-decimal ml-4 text-sm sm:text-base">
              <li>Membina dan mengontrol pengurus harian sekaligus memberi advis di bidang kualitas dan kuantitas.</li>
              <li>Memberi dorongan dan bimbingan kepada pengurus kapan saja dibutuhkan baik formal maupun non formal.</li>
              <li>Memberi pandangan ke depan kepada pengurus demi kemajuan organisasi sekaligus memberi pembinaan kepada pengurus apabila dalam melaksanakan tugasnya kurang sesuai dengan AD-ART.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </>
  ),
  pengawas: (
    <>
      <h2 className="text-lg sm:text-xl font-bold mb-2 flex items-center gap-2"><Users2 className="h-5 w-5 text-emerald-500" /> Dewan Pengawas</h2>
      <Card className="bg-emerald-50/60 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800 shadow-none">
        <CardContent className="py-3 text-sm sm:text-base">
          <ol className="list-decimal ml-4 text-sm sm:text-base">
            <li>Merencanakan dan mengorganisir kegiatan kepengawasan.</li>
            <li>Menjamin agar aset lembaga benar-benar terlindungi dan pengoperasiannya dilakukan secara efisien sesuai dengan kesepakatan para pengawas.</li>
            <li>Bertindak sebagai jembatan antara Pelindung, Penasehat dan Pembina.</li>
            <li>Mempelajari surat-surat.</li>
            <li>Menilai kewajaran biaya.</li>
            <li>Meneliti informasi keuangan secara berkala.</li>
            <li>Meneliti kelancaran kinerja Biro-Biro.</li>
          </ol>
        </CardContent>
      </Card>
    </>
  ),
  harian: (
    <>
      <h2 className="text-lg sm:text-xl font-bold mb-2 flex items-center gap-2"><Briefcase className="h-5 w-5 text-emerald-500" /> Dewan Harian</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          {
            title: "Ketua Umum",
            tugas: [
              "Memimpin Organisasi secara umum.",
              "Bertanggung jawab secara keseluruhan tentang maju mundurnya organisai IKADA.",
              "Menentukan musyawarah bersama ketua Satu, Dua, Tiga atau Empat dan sekretaris umum.",
              "Berkordinasi dengan kepala MIDA-MAHISD dalam aktifitasnya.",
              "Melaporkan aktifitasnya kepada Kepala MIDA-MAHISD dan atau Pelindung.",
              "Menandatangani surat menyurat bersama Sekretaris Umum.",
              "Menyerahkan tugas kepada Ketua Satu bila ada udzur.",
            ],
          },
          {
            title: "Ketua Satu",
            tugas: [
              "Ikut bertanggungjawab secara keseluruhan tentang maju mundurnya organisasi IKADA.",
              "Mengkoordinir Biro Masholihul Mutakhorijin dan Sosial, dan Biro Penyuluhan dan Bantuan Hukum",
              "Bekerja sama dengan ketua dua menata dan menentukan pengurus IKADA yang menghadiri acara yang diadakan oleh IKADA Syu'biyah.",
              "Melaporkan aktifitasnya kepada ketua umum.",
              "Menyerahkan tugas kepada Ketua umum bila ada udzur.",
            ],
          },
          {
            title: "Ketua Dua",
            tugas: [
              "Ikut bertanggungjawab secara keseluruhan tentang maju mundurnya organisasi IKADA.",
              "Mengkoordinir Biro Konsolidasi Organisasi dan Biro Kesehatan",
              "Mengupayakan terbentuknya organisasi IKADA di tingkat daerah yang belum terbentuk.",
              "Membantu lancarnya konsolidasi organisasi di tingkat daerah",
              "Menata dan menentukan pengurus IKADA yang menghadiri acara yang diadakan oleh IKADA Syu'biyah.",
              "Melaporkan aktifitasnya kepada Ketua Umum.",
              "Menyerahkan tugas kepada Ketua umum bila ada udzur.",
            ],
          },
          {
            title: "Ketua Tiga",
            tugas: [
              "Ikut bertanggungjawab secara keseluruhan tentang maju mundurnya organisasi IKADA.",
              "Mengkordinir Biro Ekonomi Kreatif dan Biro Perlengkapan dan Pembantu Umum",
              "Memfasilitasi jalannya Biro Ekonomi Kreatif dan Biro Perlengkapan dan Pembantu Umum",
              "Melaporkan aktifitasnya kepada ketua umum",
              "Menyerahkan tugas kepada Ketua umum bila ada udzur.",
            ],
          },
          {
            title: "Ketua Empat",
            tugas: [
              "Ikut bertanggungjawab secara keseluruhan tentang maju mundurnya organisasi IKADA.",
              "Mengkordinir Biro Pemberdayaan Wanita",
              "Memfasilitasi jalannya Biro Pemberdayaan Wanita",
              "Melaporkan aktifitasnya kepada ketua umum",
              "Menyerahkan tugas kepada Ketua Umum bila ada udzur.",
            ],
          },
          {
            title: "Sekretaris Umum",
            tugas: [
              "Mengatur Administrasi organisasi IKADA secara keseluruhan.",
              "Menentukan musyawarah bersama ketua umum.",
              "Membuat dan atau menandatangani surat menyurat bersama ketua umum.",
              "Sebagai notulen setiap musyawarah bersama Ketua Umum.",
              "Sebagai agendaris.",
              "Mengkoordinir Tim MEDKOM (Media dan Komunikasi) bersama sekretaris satu dan dua",
              "Melaporkan aktifitasnya kepada ketua umum.",
              "Menyerahkan tugas kepada sekretaris satu dan atau sekretaris dua bila udzur.",
            ],
          },
          {
            title: "Sekretaris Satu",
            tugas: [
              "Ikut membantu suksesnya administrasi IKADA secara keseluruhan.",
              "Mengkoordinir pendataan anggota IKADA, baik pusat maupun tingkat daerah.",
              "Membantu sekretaris umum sebagai notulen setiap musyawarah dan menyiapkan materinya.",
              "Membantu Sekretaris Umum dalam mengkoordinir Tim MEDKOM (Media dan Komunikasi)",
              "Melengkapi administrasi IKADA.",
              "Melaporkan aktifitasnya kepada sekretaris umum.",
              "Mengganti sekretaris umum, bila ada udzur.",
            ],
          },
          {
            title: "Sekretaris Dua",
            tugas: [
              "Ikut membantu suksesnya administrasi secara keseluruhan.",
              "Membantu mengkoordinir pendataan anggota IKADA, baik pusat maupun tingkat daerah.",
              "Membantu Sekretaris Umum dalam mengkoordinir Tim MEDKOM (Media dan Komunikasi)",
              "Mencetak dan membukukan materi kajian ilmiyah yang disampaikan dalam acara-acara resmi IKADA.",
              "Ikut serta menyiapkan materi setiap musyawarah.",
              "Menginventarisir seluruh hak milik IKADA.",
              "Melaporkan aktifitasnya kepada sekretaris umum",
              "Mengganti sekretaris umum dan sekretaris satu bila ada udzur.",
            ],
          },
          {
            title: "Bendahara Umum",
            tugas: [
              "Menerima, menyimpan dan menyalurkan seluruh keuangan IKADA.",
              "Melayani kebutuhan IKADA dengan sepengetahuan ketua umum.",
              "Mencatat keluar masuknya uang IKADA dan melaporkan pada setiap musyawarah.",
              "Mengembangkan dan mengelola keuangan IKADA serta mengusahakan pendanaan IKADA bersama Bendahara Satu.",
              "Melaporkan Keuangan IKADA kepada ketua umum.",
              "Menyerahkan tugas pada bendahara satu atau dua bila ada udzur.",
            ],
          },
          {
            title: "Bendahara Satu dan Dua",
            tugas: [
              "Ikut bertanggungjawab tentang suksesnya keuangan IKADA bersama Bendahara Umum.",
              "Membantu dalam mengembangkan dan mengelola keuangan IKADA serta mengusahakan pendanaan IKADA bersama Bendahara Umum.",
              "Melaporkan aktifitasnya kepada Bendahara Umum.",
              "Mengganti Bendahara Umum bila ada udzur.",
            ],
          },
        ].map((item, idx) => (
          <Card key={idx} className="bg-emerald-50/60 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800 shadow-none">
            <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">{item.title}</CardTitle></CardHeader>
            <CardContent className="pt-0 pb-3 text-sm sm:text-base">
              <ol className="list-decimal ml-4 text-sm sm:text-base">
                {item.tugas.map((t, i) => <li key={i}>{t}</li>)}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  ),
  biro: (
    <>
      <h2 className="text-lg sm:text-xl font-bold mb-2 flex items-center gap-2"><Layers className="h-5 w-5 text-emerald-500" /> Biro-biro</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          {
            title: "Biro Masholihul Mutakhorijin dan Sosial",
            tugas: [
              "Menanamkan rasa cinta terhadap eksistensi Pondok Pesantren Darussalam dan Madrasah Islamiyah Darussalamah.",
              "Membuat materi kajians ilmiyah yang disampaikan dalam acara-acara resmi IKADA.",
              "Membuat artikel atau buku keaswajaan dalam rangka membentengi Aqidah para Alumni.",
              "Melaporkan aktifitasnya kepada Ketua Satu",
            ],
          },
          {
            title: "Biro Konsolidasi Organisasi dan Sosial",
            tugas: [
              "Mendata kepengurusan, anggota dan aktifitas organisasi IKADA SYU'BIYAH.",
              "Mewujudkan terjalinnya Ukhuwah Islamiyah antar warga IKADA.",
              "Menyampaikan informasi atau program IKADA kepada warganya, baik secara formal maupun non formal.",
              "Memberikan dorongan sekaligus menggerakkan warga IKADA (wilayah kediri dan sekitarnya) untuk mengikuti kegiatan terutama pengajian kitab Al-Hikam.",
              "Menampung dan menyampaikan aspirasi warga IKADA kepada Ketua Dua",
              "Mengkoordinir dan menghadiri kegiatan yang diadakan oleh organisasi IKADA Syu'biyah.",
              "Melaporkan aktifitasnya kepada Ketua Dua",
            ],
          },
          {
            title: "Biro Perlengkapan & Pembantu Umum",
            tugas: [
              "Ikut bertanggungjawab atas suksesnya kegiatan IKADA.",
              "Melengkapi dan mengusahakan kebutuhan IKADA.",
              "Mempersiapkan tempat rapat.",
              "Melaporkan Aktifitasnya kepada Ketua Tiga",
            ],
          },
          {
            title: "Biro Pemberdayaan Perempuan",
            tugas: [
              "Mendata warga IKADA bagian Putri.",
              "Memberikan dorongan sekaligus menggerakkan warga IKADA Putri untuk mengikuti kegiatan, terutama pengajian kitab Al-Hikam.",
              "Melaporkan Aktifitasnya kepada Ketua Empat",
            ],
          },
          {
            title: "Biro Ekonomi Kreatif",
            tugas: [
              "Mengusahakan sumber dana dan atau Donatur IKADA yang sesuai dengan AD-ART.",
              "Mengkoordinir dan mengelola pendanaan IKADA bersama Bendahara Umum.",
              "Mengembangkan ekonomi melalui berbagai usaha yang sesuai dengan AD-ART.",
              "Melaporkan aktifitas kepada Ketua Tiga dan Bendahara Umum.",
            ],
          },
          {
            title: "Biro Penyuluhan dan Bantuan Hukum",
            tugas: [
              "Melaksanakan pendampingan, konsultasi, dan kajian kebijakan hukum.",
              "Memberikan bantuan hukum kepada anggota yang membutuhkan",
              "Melaporkan aktifitas kepada Ketua Satu",
            ],
          },
          {
            title: "Biro Kesehatan",
            tugas: [
              "Melakukan kegiatan bakti sosial kesehatan saat kegiatan rutin atau insidental IKADA",
              "Mengadakan pelatihan kesehatan pada anggota IKADA",
              "Melaporkan aktifitas kepada Ketua Dua",
            ],
          },
        ].map((item, idx) => (
          <Card key={idx} className="bg-emerald-50/60 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800 shadow-none">
            <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">{item.title}</CardTitle></CardHeader>
            <CardContent className="pt-0 pb-3 text-sm sm:text-base">
              <ol className="list-decimal ml-4 text-sm sm:text-base">
                {item.tugas.map((t, i) => <li key={i}>{t}</li>)}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  ),
  tim: (
    <>
      <h2 className="text-lg sm:text-xl font-bold mb-2 flex items-center gap-2"><Users className="h-5 w-5 text-emerald-500" /> Tim Khusus</h2>
      <Card className="bg-emerald-50/60 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800 shadow-none">
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Tim Media dan Komunikasi (MEDKOM)</CardTitle></CardHeader>
        <CardContent className="pt-0 pb-3 text-sm sm:text-base">
          <ol className="list-decimal ml-4 text-sm sm:text-base">
            <li>Mengupayakan terwujudnya database seluruh anggota IKADA</li>
            <li>Membuat sarana shilaturrahim dan komunikasi IKADA Asliyah, Syu'biyah, dan atau Far'iyyah dengan anggota dalam bentuk media online dan atau media sosial.</li>
            <li>Membranding program dan kegiatan IKADA</li>
            <li>Melaporkan aktifitasnya kepada Sekretaris Umum</li>
          </ol>
        </CardContent>
      </Card>
    </>
  ),
};

export default function PedomanKerjaPage() {
  const [selected, setSelected] = useState("penyantun");

  return (
    <div className="max-w-3xl mx-auto px-0 sm:px-0.5 md:px-0 py-6 sm:py-10 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center mb-6 sm:mb-8">
        <div className="flex flex-col items-center gap-2 mb-3">
          <div className="bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full p-3 shadow-lg mb-2">
            <Briefcase className="h-10 w-10 text-white" />
          </div>
          <h1 className="ikada-text-gradient text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1">Pedoman Kerja Pengurus IKADA</h1>
          <p className="text-emerald-700 dark:text-emerald-300 font-semibold text-base sm:text-lg">Struktur, tugas, dan peran pengurus IKADA</p>
        </div>
        <p className="text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto text-sm sm:text-base">
          Halaman ini memuat pedoman kerja pengurus IKADA Sumbersari, mulai dari Dewan Penyantun, Pengawas, Harian, Biro-biro, hingga Tim Khusus. Pilih bagian di bawah untuk melihat detail tugas dan peran masing-masing.
        </p>
      </section>
      {/* Tab Navigation */}
      <div className="relative mb-6">
        <nav className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 border-b border-emerald-100 dark:border-emerald-900 bg-white/90 dark:bg-zinc-900/80 rounded-xl shadow-sm px-1 sm:px-2" style={{ WebkitOverflowScrolling: 'touch' }}>
          {MENU.map((item) => (
            <button
              key={item.key}
              onClick={() => setSelected(item.key)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all border-b-2
                ${selected === item.key
                  ? "border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30"
                  : "border-transparent text-zinc-600 dark:text-zinc-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10"}
              `}
              style={{ minWidth: 120 }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        {/* Gradient overlays for swipe hint */}
        <div className="pointer-events-none absolute top-0 left-0 h-full w-6 z-10" style={{background: 'linear-gradient(to right, rgba(255,255,255,0.95) 70%, rgba(255,255,255,0))'}} />
        <div className="pointer-events-none absolute top-0 right-0 h-full w-6 z-10" style={{background: 'linear-gradient(to left, rgba(255,255,255,0.95) 70%, rgba(255,255,255,0))'}} />
      </div>
      {/* Konten */}
      <Card className="mb-4">
        <CardContent className="pt-6 pb-2 px-2 sm:px-4 text-sm sm:text-base">
          {CONTENT[selected]}
        </CardContent>
      </Card>
    </div>
  );
} 