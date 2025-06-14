import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Hapus data existing (hati-hati di production!)
    await prisma.kegiatanAlumni.deleteMany();
    await prisma.donasi.deleteMany();
    await prisma.berita.deleteMany();
    await prisma.kegiatan.deleteMany();
    await prisma.alumni.deleteMany();
    await prisma.mustahiq.deleteMany();
    await prisma.syubiyah.deleteMany();
    
    // Seed Syubiyah
    const syubiyah = await prisma.syubiyah.createMany({
      data: [
        {
          name: "Syubiyah Al-Ikhlas Jakarta",
          description: "Syubiyah yang fokus pada pengembangan karakter dan akhlak mulia",
          provinsi: "DKI Jakarta",
          kabupaten: "Jakarta Pusat",
          provinsiId: "31",
          kabupatenId: "3171"
        },
        {
          name: "Syubiyah An-Nur Bandung",
          description: "Syubiyah yang mengutamakan kajian ilmu agama dan dakwah",
          provinsi: "Jawa Barat",
          kabupaten: "Kota Bandung",
          provinsiId: "32",
          kabupatenId: "3273"
        },
        {
          name: "Syubiyah At-Taqwa Surabaya",
          description: "Syubiyah yang berfokus pada pembinaan keluarga sakinah",
          provinsi: "Jawa Timur",
          kabupaten: "Kota Surabaya",
          provinsiId: "35",
          kabupatenId: "3578"
        },
        {
          name: "Syubiyah Al-Hikmah Yogyakarta",
          description: "Syubiyah yang mengembangkan kajian sains dan teknologi dalam perspektif Islam",
          provinsi: "DI Yogyakarta",
          kabupaten: "Kota Yogyakarta",
          provinsiId: "34",
          kabupatenId: "3471"
        },
        {
          name: "Syubiyah Ar-Rahman Medan",
          description: "Syubiyah yang fokus pada kegiatan sosial dan pemberdayaan masyarakat",
          provinsi: "Sumatera Utara",
          kabupaten: "Kota Medan",
          provinsiId: "12",
          kabupatenId: "1275"
        },
        {
          name: "Syubiyah Al-Barakah Makassar",
          description: "Syubiyah yang mengutamakan pengembangan ekonomi syariah",
          provinsi: "Sulawesi Selatan",
          kabupaten: "Kota Makassar",
          provinsiId: "73",
          kabupatenId: "7371"
        },
        {
          name: "Syubiyah As-Salam Palembang",
          description: "Syubiyah yang berfokus pada perdamaian dan toleransi antar umat",
          provinsi: "Sumatera Selatan",
          kabupaten: "Kota Palembang",
          provinsiId: "16",
          kabupatenId: "1671"
        },
        {
          name: "Syubiyah Al-Falah Semarang",
          description: "Syubiyah yang mengembangkan pendidikan dan keterampilan hidup",
          provinsi: "Jawa Tengah",
          kabupaten: "Kota Semarang",
          provinsiId: "33",
          kabupatenId: "3374"
        },
        {
          name: "Syubiyah At-Taubah Denpasar",
          description: "Syubiyah yang fokus pada pembinaan rohani dan taubat nasuha",
          provinsi: "Bali",
          kabupaten: "Kota Denpasar",
          provinsiId: "51",
          kabupatenId: "5171"
        },
        {
          name: "Syubiyah Al-Mujahid Banjarmasin",
          description: "Syubiyah yang mengutamakan jihad dalam menuntut ilmu dan beramal",
          provinsi: "Kalimantan Selatan",
          kabupaten: "Kota Banjarmasin",
          provinsiId: "63",
          kabupatenId: "6371"
        }
      ]
    });
    
    // Ambil syubiyah yang sudah dibuat untuk referensi
    const createdSyubiyah = await prisma.syubiyah.findMany();
    
    // Seed Mustahiq
    const mustahiq = await prisma.mustahiq.createMany({
      data: [
        {
          nama: "Ahmad Fauzi",
          kategori: "FAKIR",
          deskripsi: "Seorang lansia yang tidak mampu bekerja dan tidak memiliki penghasilan tetap",
          alamat: "Jl. Kenanga No. 15, RT 03/RW 05, Jakarta Pusat",
          noTelp: "081234567901",
          jumlahKeluarga: 1,
          penghasilanBulanan: 500000,
          statusVerifikasi: "TERVERIFIKASI",
          syubiyahId: createdSyubiyah[0].id
        },
        {
          nama: "Siti Aminah",
          kategori: "MISKIN",
          deskripsi: "Seorang janda dengan 3 anak yang bekerja sebagai buruh cuci dengan penghasilan tidak mencukupi kebutuhan",
          alamat: "Jl. Melati No. 27, RT 08/RW 02, Bandung",
          noTelp: "081234567902",
          jumlahKeluarga: 4,
          penghasilanBulanan: 1200000,
          statusVerifikasi: "TERVERIFIKASI",
          syubiyahId: createdSyubiyah[1].id
        },
        {
          nama: "Muhammad Rizki",
          kategori: "AMIL",
          deskripsi: "Petugas yang ditunjuk untuk mengumpulkan dan mendistribusikan zakat di wilayah Surabaya",
          alamat: "Jl. Dahlia No. 42, RT 05/RW 07, Surabaya",
          noTelp: "081234567903",
          jumlahKeluarga: 3,
          penghasilanBulanan: 2500000,
          statusVerifikasi: "TERVERIFIKASI",
          syubiyahId: createdSyubiyah[2].id
        },
        {
          nama: "Anwar Hidayat",
          kategori: "MUALLAF",
          deskripsi: "Seorang muallaf yang baru masuk Islam dan membutuhkan dukungan untuk belajar agama",
          alamat: "Jl. Anggrek No. 18, RT 02/RW 04, Yogyakarta",
          noTelp: "081234567904",
          jumlahKeluarga: 2,
          penghasilanBulanan: 1800000,
          statusVerifikasi: "TERVERIFIKASI",
          syubiyahId: createdSyubiyah[3].id
        },
        {
          nama: "Budi Santoso",
          kategori: "RIQAB",
          deskripsi: "Seorang yang terjerat hutang rentenir dan membutuhkan bantuan untuk membebaskan diri",
          alamat: "Jl. Mawar No. 33, RT 06/RW 03, Medan",
          noTelp: "081234567905",
          jumlahKeluarga: 5,
          penghasilanBulanan: 1500000,
          statusVerifikasi: "TERVERIFIKASI",
          syubiyahId: createdSyubiyah[4].id
        },
        {
          nama: "Hendra Wijaya",
          kategori: "GHARIMIN",
          deskripsi: "Seorang pedagang kecil yang bangkrut dan memiliki hutang untuk modal usaha",
          alamat: "Jl. Cempaka No. 21, RT 04/RW 06, Makassar",
          noTelp: "081234567906",
          jumlahKeluarga: 4,
          penghasilanBulanan: 900000,
          statusVerifikasi: "TERVERIFIKASI",
          syubiyahId: createdSyubiyah[5].id
        },
        {
          nama: "Dina Fitriani",
          kategori: "FISABILILLAH",
          deskripsi: "Seorang guru mengaji yang mendedikasikan hidupnya untuk mengajar Al-Quran tanpa bayaran",
          alamat: "Jl. Teratai No. 12, RT 01/RW 09, Palembang",
          noTelp: "081234567907",
          jumlahKeluarga: 2,
          penghasilanBulanan: 1000000,
          statusVerifikasi: "TERVERIFIKASI",
          syubiyahId: createdSyubiyah[6].id
        },
        {
          nama: "Rudi Hartono",
          kategori: "IBNU_SABIL",
          deskripsi: "Seorang mahasiswa yang kehabisan bekal saat menuntut ilmu di luar kota",
          alamat: "Jl. Tulip No. 9, RT 07/RW 01, Semarang",
          noTelp: "081234567908",
          jumlahKeluarga: 1,
          penghasilanBulanan: 600000,
          statusVerifikasi: "TERVERIFIKASI",
          syubiyahId: createdSyubiyah[7].id
        },
        {
          nama: "Rina Susanti",
          kategori: "FAKIR",
          deskripsi: "Seorang difabel yang tidak mampu bekerja dan tinggal sendirian",
          alamat: "Jl. Kamboja No. 24, RT 09/RW 08, Denpasar",
          noTelp: "081234567909",
          jumlahKeluarga: 1,
          penghasilanBulanan: 400000,
          statusVerifikasi: "TERVERIFIKASI",
          syubiyahId: createdSyubiyah[8].id
        },
        {
          nama: "Agus Setiawan",
          kategori: "MISKIN",
          deskripsi: "Seorang kepala keluarga dengan 6 anak yang bekerja sebagai pemulung",
          alamat: "Jl. Seroja No. 36, RT 10/RW 10, Banjarmasin",
          noTelp: "081234567910",
          jumlahKeluarga: 7,
          penghasilanBulanan: 1100000,
          statusVerifikasi: "TERVERIFIKASI",
          syubiyahId: createdSyubiyah[9].id
        }
      ]
    });
    
    // Ambil mustahiq yang sudah dibuat untuk referensi
    const createdMustahiq = await prisma.mustahiq.findMany();
    
    // Seed Alumni
    const alumni = await prisma.alumni.createMany({
      data: [
        {
          nama: "Ahmad Fauzi",
          email: "ahmad.fauzi@email.com",
          telepon: "081234567890",
          alamat: "Jl. Merdeka No. 123, Jakarta",
          angkatan: 2015,
          jurusan: "Teknik Informatika",
          pekerjaan: "Software Engineer",
          perusahaan: "PT. Tech Indonesia",
          status: "AKTIF"
        },
        {
          nama: "Siti Nurhaliza",
          email: "siti.nurhaliza@email.com",
          telepon: "081234567891",
          alamat: "Jl. Sudirman No. 456, Bandung",
          angkatan: 2016,
          jurusan: "Manajemen",
          pekerjaan: "Marketing Manager",
          perusahaan: "PT. Kreatif Nusantara",
          status: "AKTIF"
        },
        {
          nama: "Budi Santoso",
          email: "budi.santoso@email.com",
          telepon: "081234567892",
          alamat: "Jl. Gatot Subroto No. 789, Surabaya",
          angkatan: 2014,
          jurusan: "Akuntansi",
          pekerjaan: "Financial Analyst",
          perusahaan: "Bank Mandiri",
          status: "AKTIF"
        },
        {
          nama: "Dewi Sartika",
          email: "dewi.sartika@email.com",
          telepon: "081234567893",
          alamat: "Jl. Diponegoro No. 321, Yogyakarta",
          angkatan: 2017,
          jurusan: "Psikologi",
          pekerjaan: "HR Specialist",
          perusahaan: "PT. Maju Bersama",
          status: "AKTIF"
        },
        {
          nama: "Rizki Pratama",
          email: "rizki.pratama@email.com",
          telepon: "081234567894",
          alamat: "Jl. Ahmad Yani No. 654, Medan",
          angkatan: 2018,
          jurusan: "Teknik Mesin",
          pekerjaan: "Mechanical Engineer",
          perusahaan: "PT. Industri Jaya",
          status: "AKTIF"
        },
        {
          nama: "Maya Sari",
          email: "maya.sari@email.com",
          telepon: "081234567895",
          alamat: "Jl. Veteran No. 987, Makassar",
          angkatan: 2019,
          jurusan: "Desain Grafis",
          pekerjaan: "UI/UX Designer",
          perusahaan: "Startup Digital",
          status: "AKTIF"
        },
        {
          nama: "Andi Wijaya",
          email: "andi.wijaya@email.com",
          telepon: "081234567896",
          alamat: "Jl. Pahlawan No. 147, Palembang",
          angkatan: 2020,
          jurusan: "Ekonomi",
          pekerjaan: "Business Analyst",
          perusahaan: "Konsultan Bisnis",
          status: "ALUMNI_BARU"
        },
        {
          nama: "Lestari Indah",
          email: "lestari.indah@email.com",
          telepon: "081234567897",
          alamat: "Jl. Kartini No. 258, Semarang",
          angkatan: 2021,
          jurusan: "Komunikasi",
          pekerjaan: "Content Creator",
          perusahaan: "Media Digital",
          status: "ALUMNI_BARU"
        }
      ]
    });
    
    // Ambil alumni yang sudah dibuat untuk referensi
    const createdAlumni = await prisma.alumni.findMany();
    
    // Seed Kegiatan
    const kegiatan = await prisma.kegiatan.createMany({
      data: [
        {
          nama: "Reuni Akbar 2024",
          deskripsi: "Reuni akbar alumni semua angkatan dengan berbagai acara menarik",
          tanggal: new Date('2024-12-15'),
          lokasi: "Aula Utama Kampus",
          kategori: "REUNI",
          status: "AKTIF",
          maxPeserta: 200,
          biaya: 150000
        },
        {
          nama: "Seminar Teknologi AI",
          deskripsi: "Seminar tentang perkembangan teknologi AI dan dampaknya di masa depan",
          tanggal: new Date('2024-11-20'),
          lokasi: "Auditorium Kampus",
          kategori: "SEMINAR",
          status: "AKTIF",
          maxPeserta: 100,
          biaya: 50000
        },
        {
          nama: "Workshop Digital Marketing",
          deskripsi: "Workshop praktis tentang strategi digital marketing untuk UMKM",
          tanggal: new Date('2024-11-25'),
          lokasi: "Lab Komputer",
          kategori: "WORKSHOP",
          status: "AKTIF",
          maxPeserta: 50,
          biaya: 100000
        },
        {
          nama: "Bakti Sosial Ramadan",
          deskripsi: "Kegiatan bakti sosial memberikan bantuan kepada masyarakat kurang mampu",
          tanggal: new Date('2024-03-15'),
          lokasi: "Desa Sukamaju",
          kategori: "SOSIAL",
          status: "SELESAI",
          maxPeserta: 75
        },
        {
          nama: "Turnamen Futsal Alumni",
          deskripsi: "Turnamen futsal antar angkatan untuk mempererat silaturahmi",
          tanggal: new Date('2024-10-10'),
          lokasi: "Lapangan Futsal Kampus",
          kategori: "OLAHRAGA",
          status: "SELESAI",
          maxPeserta: 80
        }
      ]
    });
    
    // Ambil kegiatan yang sudah dibuat
    const createdKegiatan = await prisma.kegiatan.findMany();
    
    // Seed Donasi
    const donasi = await prisma.donasi.createMany({
      data: [
        {
          alumniId: createdAlumni[0].id,
          jumlah: 500000,
          tujuan: "Pembangunan Masjid Kampus",
          metode: "TRANSFER_BANK",
          status: "BERHASIL",
          catatan: "Semoga bermanfaat untuk kemajuan kampus"
        },
        {
          alumniId: createdAlumni[1].id,
          jumlah: 250000,
          tujuan: "Beasiswa Mahasiswa Kurang Mampu",
          metode: "E_WALLET",
          status: "BERHASIL",
          catatan: "Untuk membantu adik-adik yang membutuhkan"
        },
        {
          alumniId: createdAlumni[2].id,
          jumlah: 1000000,
          tujuan: "Renovasi Perpustakaan",
          metode: "TRANSFER_BANK",
          status: "BERHASIL",
          catatan: "Investasi untuk masa depan pendidikan"
        },
        {
          alumniId: createdAlumni[3].id,
          jumlah: 300000,
          tujuan: "Program Pelatihan Keterampilan",
          metode: "QRIS",
          status: "BERHASIL"
        },
        {
          alumniId: createdAlumni[4].id,
          jumlah: 750000,
          tujuan: "Pembangunan Masjid Kampus",
          metode: "TRANSFER_BANK",
          status: "BERHASIL",
          catatan: "Barakallahu fiikum"
        }
      ]
    });
    
    // Seed Kegiatan Alumni (Peserta)
    const kegiatanAlumni = await prisma.kegiatanAlumni.createMany({
      data: [
        // Reuni Akbar
        { alumniId: createdAlumni[0].id, kegiatanId: createdKegiatan[0].id, status: "TERDAFTAR" },
        { alumniId: createdAlumni[1].id, kegiatanId: createdKegiatan[0].id, status: "TERDAFTAR" },
        { alumniId: createdAlumni[2].id, kegiatanId: createdKegiatan[0].id, status: "TERDAFTAR" },
        { alumniId: createdAlumni[3].id, kegiatanId: createdKegiatan[0].id, status: "TERDAFTAR" },
        
        // Seminar AI
        { alumniId: createdAlumni[0].id, kegiatanId: createdKegiatan[1].id, status: "TERDAFTAR" },
        { alumniId: createdAlumni[4].id, kegiatanId: createdKegiatan[1].id, status: "TERDAFTAR" },
        { alumniId: createdAlumni[5].id, kegiatanId: createdKegiatan[1].id, status: "TERDAFTAR" },
        
        // Workshop Digital Marketing
        { alumniId: createdAlumni[1].id, kegiatanId: createdKegiatan[2].id, status: "TERDAFTAR" },
        { alumniId: createdAlumni[3].id, kegiatanId: createdKegiatan[2].id, status: "TERDAFTAR" },
        { alumniId: createdAlumni[5].id, kegiatanId: createdKegiatan[2].id, status: "TERDAFTAR" },
        
        // Bakti Sosial (Sudah selesai)
        { alumniId: createdAlumni[0].id, kegiatanId: createdKegiatan[3].id, status: "HADIR" },
        { alumniId: createdAlumni[2].id, kegiatanId: createdKegiatan[3].id, status: "HADIR" },
        { alumniId: createdAlumni[4].id, kegiatanId: createdKegiatan[3].id, status: "HADIR" },
        { alumniId: createdAlumni[6].id, kegiatanId: createdKegiatan[3].id, status: "HADIR" },
        
        // Turnamen Futsal (Sudah selesai)
        { alumniId: createdAlumni[1].id, kegiatanId: createdKegiatan[4].id, status: "HADIR" },
        { alumniId: createdAlumni[3].id, kegiatanId: createdKegiatan[4].id, status: "HADIR" },
        { alumniId: createdAlumni[5].id, kegiatanId: createdKegiatan[4].id, status: "HADIR" },
        { alumniId: createdAlumni[7].id, kegiatanId: createdKegiatan[4].id, status: "HADIR" }
      ]
    });
    
    // Seed Berita
    const berita = await prisma.berita.createMany({
      data: [
        {
          judul: "Reuni Akbar Alumni 2024 Segera Digelar",
          konten: "Ikatan Alumni Pondok Darussalam Sumbersari akan menggelar Reuni Akbar 2024 pada tanggal 15 Desember 2024. Acara ini akan dihadiri oleh alumni dari berbagai angkatan...",
          ringkasan: "Reuni Akbar Alumni 2024 akan digelar pada 15 Desember 2024 di Aula Utama Kampus",
          kategori: "KEGIATAN",
          status: "APPROVED",
          views: 150,
          publishedAt: new Date()
        },
        {
          judul: "Alumni Berprestasi: Ahmad Fauzi Raih Penghargaan Developer Terbaik",
          konten: "Ahmad Fauzi, alumni angkatan 2015 jurusan Teknik Informatika, berhasil meraih penghargaan sebagai Developer Terbaik 2024 dari PT. Tech Indonesia...",
          ringkasan: "Ahmad Fauzi alumni 2015 meraih penghargaan Developer Terbaik 2024",
          kategori: "PRESTASI",
          status: "APPROVED",
          views: 89,
          publishedAt: new Date()
        },
        {
          judul: "Program Beasiswa Alumni untuk Mahasiswa Berprestasi",
          konten: "Ikatan Alumni meluncurkan program beasiswa untuk mahasiswa berprestasi yang berasal dari keluarga kurang mampu. Program ini didanai dari donasi alumni...",
          ringkasan: "Program beasiswa alumni untuk mahasiswa berprestasi dari keluarga kurang mampu",
          kategori: "PENGUMUMAN",
          status: "APPROVED",
          views: 234,
          publishedAt: new Date()
        }
      ]
    });
    
    return NextResponse.json({
      success: true,
      message: 'Data sample berhasil dibuat',
      data: {
        syubiyah: 10,
        mustahiq: 10,
        alumni: 8,
        kegiatan: 5,
        donasi: 5,
        kegiatanAlumni: 18,
        berita: 3
      }
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat data sample' },
      { status: 500 }
    );
  }
}