const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// Data dummy untuk Mustahiq
const dummyMustahiq = [
  {
    name: "KH. Muhammad Ridwan",
    profilePhoto: "/foto_mustahiq/kh_muhammad_ridwan.jpg",
    email: "ridwan.mustahiq@gmail.com",
    phone: "081234567890",
    provinsi: "JAWA TENGAH",
    kabupaten: "KABUPATEN SEMARANG",
    kecamatan: "UNGARAN BARAT",
    desa: "LEREP",
    provinsiId: "33",
    kabupatenId: "3322",
    kecamatanId: "3322010",
    desaId: "3322010001",
    namaJalan: "Jl. Raya Lerep No. 15",
    rt: "001",
    rw: "002",
    bidangKeahlian: "Tafsir Al-Quran"
  },
  {
    name: "KH. Abdul Rahman Hakim",
    profilePhoto: "/foto_mustahiq/kh_abdul_rahman.jpg",
    email: "rahman.hakim@gmail.com",
    phone: "082345678901",
    provinsi: "JAWA BARAT",
    kabupaten: "KABUPATEN BANDUNG",
    kecamatan: "CICALENGKA",
    desa: "CICALENGKA",
    provinsiId: "32",
    kabupatenId: "3204",
    kecamatanId: "3204080",
    desaId: "3204080001",
    namaJalan: "Jl. Pesantren Raya No. 22",
    rt: "003",
    rw: "001",
    bidangKeahlian: "Fiqh Muamalah"
  },
  {
    name: "Ustadz Ahmad Fauzi",
    profilePhoto: "/foto_mustahiq/ustadz_ahmad_fauzi.jpg",
    email: "ahmad.fauzi@gmail.com",
    phone: "083456789012",
    provinsi: "JAWA TIMUR",
    kabupaten: "KABUPATEN MALANG",
    kecamatan: "SINGOSARI",
    desa: "ARDIMULYO",
    provinsiId: "35",
    kabupatenId: "3507",
    kecamatanId: "3507090",
    desaId: "3507090001",
    namaJalan: "Jl. Kyai Haji Agus Salim No. 8",
    rt: "002",
    rw: "003",
    bidangKeahlian: "Hadits Nabawi"
  },
  {
    name: "KH. Sholeh Mahmud",
    profilePhoto: "/foto_mustahiq/kh_sholeh_mahmud.jpg",
    email: "sholeh.mahmud@gmail.com",
    phone: "084567890123",
    provinsi: "YOGYAKARTA",
    kabupaten: "KABUPATEN BANTUL",
    kecamatan: "SEWON",
    desa: "PANGGUNGHARJO",
    provinsiId: "34",
    kabupatenId: "3402",
    kecamatanId: "3402080",
    desaId: "3402080001",
    namaJalan: "Jl. Parangtritis Km 5.5",
    rt: "004",
    rw: "002",
    bidangKeahlian: "Akhlak dan Tasawuf"
  },
  {
    name: "Ustadz Yusuf Mansur",
    profilePhoto: "/foto_mustahiq/ustadz_yusuf_mansur.jpg",
    email: "yusuf.mansur@gmail.com",
    phone: "085678901234",
    provinsi: "BANTEN",
    kabupaten: "KABUPATEN TANGERANG",
    kecamatan: "CISAUK",
    desa: "CISAUK",
    provinsiId: "36",
    kabupatenId: "3603",
    kecamatanId: "3603080",
    desaId: "3603080001",
    namaJalan: "Jl. Raya Serpong No. 12",
    rt: "001",
    rw: "004",
    bidangKeahlian: "Ekonomi Syariah"
  },
  {
    name: "KH. Badruzzaman Said",
    profilePhoto: "/foto_mustahiq/kh_badruzzaman.jpg",
    email: "badruzzaman.said@gmail.com",
    phone: "086789012345",
    provinsi: "JAWA TENGAH",
    kabupaten: "KABUPATEN KUDUS",
    kecamatan: "KUDUS",
    desa: "KAJEKSAN",
    provinsiId: "33",
    kabupatenId: "3319",
    kecamatanId: "3319010",
    desaId: "3319010001",
    namaJalan: "Jl. Sunan Kudus No. 45",
    rt: "005",
    rw: "001",
    bidangKeahlian: "Sejarah Islam"
  },
  {
    name: "Ustadz Hasan Basri",
    profilePhoto: "/foto_mustahiq/ustadz_hasan_basri.jpg",
    email: "hasan.basri@gmail.com",
    phone: "087890123456",
    provinsi: "SUMATERA UTARA",
    kabupaten: "KABUPATEN DELI SERDANG",
    kecamatan: "LUBUK PAKAM",
    desa: "LUBUK PAKAM",
    provinsiId: "12",
    kabupatenId: "1208",
    kecamatanId: "1208010",
    desaId: "1208010001",
    namaJalan: "Jl. Medan-Binjai Km 22",
    rt: "002",
    rw: "005",
    bidangKeahlian: "Bahasa Arab"
  },
  {
    name: "KH. Wahid Abdullah",
    profilePhoto: "/foto_mustahiq/kh_wahid_abdullah.jpg",
    email: "wahid.abdullah@gmail.com",
    phone: "088901234567",
    provinsi: "JAWA TIMUR",
    kabupaten: "KABUPATEN JOMBANG",
    kecamatan: "DIWEK",
    desa: "DIWEK",
    provinsiId: "35",
    kabupatenId: "3517",
    kecamatanId: "3517070",
    desaId: "3517070001",
    namaJalan: "Jl. KH. Hasyim Asyari No. 33",
    rt: "003",
    rw: "002",
    bidangKeahlian: "Ushul Fiqh"
  },
  {
    name: "Ustadz Ibrahim Khalil",
    profilePhoto: "/foto_mustahiq/ustadz_ibrahim_khalil.jpg",
    email: "ibrahim.khalil@gmail.com",
    phone: "089012345678",
    provinsi: "LAMPUNG",
    kabupaten: "KABUPATEN LAMPUNG SELATAN",
    kecamatan: "NATAR",
    desa: "NATAR",
    provinsiId: "18",
    kabupatenId: "1803",
    kecamatanId: "1803170",
    desaId: "1803170001",
    namaJalan: "Jl. Lintas Sumatera No. 67",
    rt: "001",
    rw: "003",
    bidangKeahlian: "Dakwah dan Komunikasi"
  },
  {
    name: "KH. Zainuddin Fanani",
    profilePhoto: "/foto_mustahiq/kh_zainuddin_fanani.jpg",
    email: "zainuddin.fanani@gmail.com",
    phone: "090123456789",
    provinsi: "JAWA TENGAH",
    kabupaten: "KABUPATEN PEKALONGAN",
    kecamatan: "KAJEN",
    desa: "KAJEN",
    provinsiId: "33",
    kabupatenId: "3326",
    kecamatanId: "3326050",
    desaId: "3326050001",
    namaJalan: "Jl. Raya Kajen No. 88",
    rt: "004",
    rw: "001",
    bidangKeahlian: "Ilmu Kalam"
  }
];

// Data dummy untuk Syubiyah
const dummySyubiyah = [
  {
    name: "Syubiyah Al-Hikmah Jakarta",
    provinsi: "DKI JAKARTA",
    kabupaten: "JAKARTA SELATAN",
    provinsiId: "31",
    kabupatenId: "3174",
    description: "Syubiyah yang fokus pada pengembangan dakwah di wilayah Jakarta Selatan"
  },
  {
    name: "Syubiyah Nurul Iman Bandung",
    provinsi: "JAWA BARAT",
    kabupaten: "KOTA BANDUNG",
    provinsiId: "32",
    kabupatenId: "3273",
    description: "Organisasi dakwah yang bergerak dalam bidang pendidikan dan sosial"
  },
  {
    name: "Syubiyah Baitul Makmur Semarang",
    provinsi: "JAWA TENGAH",
    kabupaten: "KOTA SEMARANG",
    provinsiId: "33",
    kabupatenId: "3374",
    description: "Syubiyah yang aktif dalam kegiatan pemberdayaan masyarakat"
  },
  {
    name: "Syubiyah Darul Falah Yogyakarta",
    provinsi: "YOGYAKARTA",
    kabupaten: "KOTA YOGYAKARTA",
    provinsiId: "34",
    kabupatenId: "3471",
    description: "Fokus pada pengembangan ekonomi syariah dan kewirausahaan"
  },
  {
    name: "Syubiyah Miftahul Huda Surabaya",
    provinsi: "JAWA TIMUR",
    kabupaten: "KOTA SURABAYA",
    provinsiId: "35",
    kabupatenId: "3578",
    description: "Syubiyah yang bergerak dalam bidang pendidikan dan dakwah"
  },
  {
    name: "Syubiyah Ar-Rahman Medan",
    provinsi: "SUMATERA UTARA",
    kabupaten: "KOTA MEDAN",
    provinsiId: "12",
    kabupatenId: "1275",
    description: "Organisasi dakwah yang fokus pada pembinaan remaja dan pemuda"
  },
  {
    name: "Syubiyah Hidayatullah Makassar",
    provinsi: "SULAWESI SELATAN",
    kabupaten: "KOTA MAKASSAR",
    provinsiId: "73",
    kabupatenId: "7371",
    description: "Syubiyah yang aktif dalam kegiatan sosial dan kemanusiaan"
  },
  {
    name: "Syubiyah Tarbiyah Islamiyah Palembang",
    provinsi: "SUMATERA SELATAN",
    kabupaten: "KOTA PALEMBANG",
    provinsiId: "16",
    kabupatenId: "1671",
    description: "Fokus pada pendidikan Islam dan pembinaan akhlak"
  },
  {
    name: "Syubiyah Nurul Huda Banjarmasin",
    provinsi: "KALIMANTAN SELATAN",
    kabupaten: "KOTA BANJARMASIN",
    provinsiId: "63",
    kabupatenId: "6371",
    description: "Syubiyah yang bergerak dalam bidang dakwah dan pendidikan"
  },
  {
    name: "Syubiyah Baitul Hikmah Denpasar",
    provinsi: "BALI",
    kabupaten: "KOTA DENPASAR",
    provinsiId: "51",
    kabupatenId: "5171",
    description: "Organisasi dakwah yang fokus pada dialog antar umat beragama"
  }
];

async function generateDummyData() {
  try {
    console.log('🔄 Memulai generate data dummy untuk Mustahiq dan Syubiyah...');
    
    let mustahiqCreated = 0;
    let syubiyahCreated = 0;
    let mustahiqSkipped = 0;
    let syubiyahSkipped = 0;
    
    // Generate Mustahiq dummy data
    console.log('\n🔄 Membuat data dummy Mustahiq...');
    for (const mustahiq of dummyMustahiq) {
      try {
        // Cek apakah email sudah ada
        const existing = await prisma.mustahiq.findUnique({
          where: { email: mustahiq.email }
        });
        
        if (existing) {
          console.log(`   ⏭️  Mustahiq ${mustahiq.name} sudah ada, dilewati`);
          mustahiqSkipped++;
          continue;
        }
        
        const mustahiqData = {
          id: `cmb${uuidv4().replace(/-/g, '').substring(0, 20)}`,
          ...mustahiq,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await prisma.mustahiq.create({ data: mustahiqData });
        console.log(`   ✅ Mustahiq ${mustahiq.name} berhasil dibuat`);
        mustahiqCreated++;
      } catch (error) {
        console.log(`   ❌ Error membuat mustahiq ${mustahiq.name}:`, error.message);
      }
    }
    
    // Generate Syubiyah dummy data
    console.log('\n🔄 Membuat data dummy Syubiyah...');
    for (const syubiyah of dummySyubiyah) {
      try {
        // Cek apakah nama sudah ada
        const existing = await prisma.syubiyah.findFirst({
          where: { name: syubiyah.name }
        });
        
        if (existing) {
          console.log(`   ⏭️  Syubiyah ${syubiyah.name} sudah ada, dilewati`);
          syubiyahSkipped++;
          continue;
        }
        
        const syubiyahData = {
          id: `cmb${uuidv4().replace(/-/g, '').substring(0, 20)}`,
          ...syubiyah,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await prisma.syubiyah.create({ data: syubiyahData });
        console.log(`   ✅ Syubiyah ${syubiyah.name} berhasil dibuat`);
        syubiyahCreated++;
      } catch (error) {
        console.log(`   ❌ Error membuat syubiyah ${syubiyah.name}:`, error.message);
      }
    }
    
    // Verifikasi hasil
    const totalMustahiq = await prisma.mustahiq.count();
    const totalSyubiyah = await prisma.syubiyah.count();
    
    console.log('\n📊 Ringkasan Generate Data Dummy:');
    console.log(`   Mustahiq:`);
    console.log(`   - Dibuat: ${mustahiqCreated}`);
    console.log(`   - Dilewati: ${mustahiqSkipped}`);
    console.log(`   - Total di database: ${totalMustahiq}`);
    console.log(`   Syubiyah:`);
    console.log(`   - Dibuat: ${syubiyahCreated}`);
    console.log(`   - Dilewati: ${syubiyahSkipped}`);
    console.log(`   - Total di database: ${totalSyubiyah}`);
    
    console.log('\n✅ Generate data dummy selesai!');
    
  } catch (error) {
    console.error('❌ Error dalam generate data dummy:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan fungsi generate
generateDummyData()
  .then(() => {
    console.log('🎉 Script generate data dummy selesai dijalankan');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script gagal:', error);
    process.exit(1);
  });