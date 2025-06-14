const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Data dummy alumni lengkap
const alumniDummyData = [
  {
    fullName: "Siti Nurhaliza Putri",
    email: "siti.nurhaliza.alumni@ikada.com",
    password: "password123",
    tahunMasuk: 2016,
    tahunKeluar: 2019,
    asalDaerah: "Sidoarjo",
    tempatLahir: "Sidoarjo",
    tanggalLahir: new Date('1998-07-22'),
    statusPernikahan: "LAJANG",
    jumlahAnak: 0,
    pendidikanTerakhir: "S1 Ekonomi Syariah",
    pekerjaan: ["Konsultan Keuangan Syariah"],
    phone: "081234567891",
    penghasilanBulan: "RANGE_5_10",
    provinsi: "JAWA TIMUR",
    kabupaten: "KABUPATEN SIDOARJO",
    kecamatan: "SIDOARJO",
    desa: "SIDOARJO",
    provinsiId: "35",
    kabupatenId: "3515",
    kecamatanId: "3515010",
    desaId: "3515010001",
    namaJalan: "Jl. Ahmad Yani No. 456",
    rt: "002",
    rw: "003",
    syubiyahId: null, // Akan diset nanti setelah data berhasil dibuat
      mustahiqId: null, // Akan diset nanti setelah data berhasil dibuat
    isVerified: true,
    status: "VERIFIED"
  },
  {
    fullName: "Muhammad Yusuf Hakim",
    email: "muhammad.yusuf.alumni@ikada.com",
    password: "password123",
    tahunMasuk: 2014,
    tahunKeluar: 2017,
    asalDaerah: "Malang",
    tempatLahir: "Malang",
    tanggalLahir: new Date('1996-11-08'),
    statusPernikahan: "MENIKAH",
    jumlahAnak: 1,
    pendidikanTerakhir: "S2 Hukum Islam",
    pekerjaan: ["Pengacara", "Dosen"],
    phone: "081234567892",
    penghasilanBulan: "RANGE_10_30",
    provinsi: "JAWA TIMUR",
    kabupaten: "KOTA MALANG",
    kecamatan: "KLOJEN",
    desa: "KLOJEN",
    provinsiId: "35",
    kabupatenId: "3573",
    kecamatanId: "3573010",
    desaId: "3573010001",
    namaJalan: "Jl. Ijen No. 789",
    rt: "003",
    rw: "004",
    syubiyahId: null,
      mustahiqId: null,
    isVerified: true,
    status: "VERIFIED"
  },
  {
    fullName: "Fatimah Az-Zahra Sari",
    email: "fatimah.azzahra.alumni@ikada.com",
    password: "password123",
    tahunMasuk: 2017,
    tahunKeluar: 2020,
    asalDaerah: "Surabaya",
    tempatLahir: "Surabaya",
    tanggalLahir: new Date('1999-01-12'),
    statusPernikahan: "BELUM_MENIKAH",
    jumlahAnak: 0,
    pendidikanTerakhir: "S1 Psikologi",
    pekerjaan: ["Psikolog"],
    phone: "081234567893",
    penghasilanBulan: "RANGE_5_10",
    provinsi: "JAWA TIMUR",
    kabupaten: "KOTA SURABAYA",
    kecamatan: "GUBENG",
    desa: "GUBENG",
    provinsiId: "35",
    kabupatenId: "3578",
    kecamatanId: "3578040",
    desaId: "3578040001",
    namaJalan: "Jl. Pemuda No. 321",
    rt: "004",
    rw: "005",
    syubiyahId: null, // Syubiyah Bangbang Wetan
      mustahiqId: null, // KH. Ahmad Basari
    isVerified: true,
    status: "VERIFIED"
  },
  {
    fullName: "Abdul Rahman Wahid",
    email: "abdul.rahman.alumni@ikada.com",
    password: "password123",
    tahunMasuk: 2013,
    tahunKeluar: 2016,
    asalDaerah: "Jombang",
    tempatLahir: "Jombang",
    tanggalLahir: new Date('1995-05-30'),
    statusPernikahan: "MENIKAH",
    jumlahAnak: 3,
    pendidikanTerakhir: "S1 Dakwah",
    pekerjaan: ["Ustadz", "Penulis"],
    phone: "081234567894",
    penghasilanBulan: "RANGE_1_5",
    provinsi: "JAWA TIMUR",
    kabupaten: "KABUPATEN JOMBANG",
    kecamatan: "JOMBANG",
    desa: "JOMBANG",
    provinsiId: "35",
    kabupatenId: "3517",
    kecamatanId: "3517010",
    desaId: "3517010001",
    namaJalan: "Jl. KH. Wahab Hasbullah No. 555",
    rt: "005",
    rw: "006",
    syubiyahId: null, // Syubiyah Banjari Kediri
      mustahiqId: null, // KH. Ahmad Basari
    isVerified: false,
    status: "PENDING"
  },
  {
    fullName: "Khadijah Ummu Salamah",
    email: "khadijah.ummu.alumni@ikada.com",
    password: "password123",
    tahunMasuk: 2018,
    tahunKeluar: 2021,
    asalDaerah: "Pasuruan",
    tempatLahir: "Pasuruan",
    tanggalLahir: new Date('2000-09-18'),
    statusPernikahan: "LAJANG",
    jumlahAnak: 0,
    pendidikanTerakhir: "S1 Bahasa Arab",
    pekerjaan: ["Guru Bahasa Arab", "Penerjemah"],
    phone: "081234567895",
    penghasilanBulan: "RANGE_1_5",
    provinsi: "JAWA TIMUR",
    kabupaten: "KABUPATEN PASURUAN",
    kecamatan: "PASURUAN",
    desa: "PASURUAN",
    provinsiId: "35",
    kabupatenId: "3514",
    kecamatanId: "3514010",
    desaId: "3514010001",
    namaJalan: "Jl. Raya Pandaan No. 777",
    rt: "006",
    rw: "007",
    syubiyahId: null, // Syubiyah Bangbang Wetan
    mustahiqId: null, // KH. Ahmad Basari
    isVerified: true,
    status: "VERIFIED"
  },
  {
    fullName: "Umar bin Khattab Santoso",
    email: "umar.khattab.alumni@ikada.com",
    password: "password123",
    tahunMasuk: 2019,
    tahunKeluar: 2022,
    asalDaerah: "Blitar",
    tempatLahir: "Blitar",
    tanggalLahir: new Date('2001-12-25'),
    statusPernikahan: "BELUM_MENIKAH",
    jumlahAnak: 0,
    pendidikanTerakhir: "S1 Teknik Informatika",
    pekerjaan: ["Software Developer", "Freelancer"],
    phone: "081234567896",
    penghasilanBulan: "RANGE_5_10",
    provinsi: "JAWA TIMUR",
    kabupaten: "KOTA BLITAR",
    kecamatan: "KEPANJENKIDUL",
    desa: "KEPANJENKIDUL",
    provinsiId: "35",
    kabupatenId: "3572",
    kecamatanId: "3572010",
    desaId: "3572010001",
    namaJalan: "Jl. Veteran No. 999",
    rt: "007",
    rw: "008",
    syubiyahId: null, // Syubiyah Banjari Kediri
    mustahiqId: null, // KH. Ahmad Basari
    isVerified: true,
    status: "VERIFIED"
  },
  {
    fullName: "Aisyah Radhiyallahu Anha",
    email: "aisyah.radhiya.alumni@ikada.com",
    password: "password123",
    tahunMasuk: 2020,
    tahunKeluar: 2023,
    asalDaerah: "Mojokerto",
    tempatLahir: "Mojokerto",
    tanggalLahir: new Date('2002-04-10'),
    statusPernikahan: "BELUM_MENIKAH",
    jumlahAnak: 0,
    pendidikanTerakhir: "S1 Farmasi",
    pekerjaan: ["Apoteker"],
    phone: "081234567897",
    penghasilanBulan: "RANGE_5_10",
    provinsi: "JAWA TIMUR",
    kabupaten: "KABUPATEN MOJOKERTO",
    kecamatan: "MOJOKERTO",
    desa: "MOJOKERTO",
    provinsiId: "35",
    kabupatenId: "3516",
    kecamatanId: "3516010",
    desaId: "3516010001",
    namaJalan: "Jl. Majapahit No. 111",
    rt: "008",
    rw: "009",
    syubiyahId: null, // Syubiyah Bangbang Wetan
    mustahiqId: null, // KH. Ahmad Basari
    isVerified: false,
    status: "PENDING"
  },
  {
    fullName: "Ali bin Abi Thalib Wijaya",
    email: "ali.abithalib.alumni@ikada.com",
    password: "password123",
    tahunMasuk: 2021,
    tahunKeluar: 2024,
    asalDaerah: "Gresik",
    tempatLahir: "Gresik",
    tanggalLahir: new Date('2003-02-14'),
    statusPernikahan: "BELUM_MENIKAH",
    jumlahAnak: 0,
    pendidikanTerakhir: "S1 Teknik Mesin",
    pekerjaan: ["Engineer"],
    phone: "081234567898",
    penghasilanBulan: "RANGE_5_10",
    provinsi: "JAWA TIMUR",
    kabupaten: "KABUPATEN GRESIK",
    kecamatan: "GRESIK",
    desa: "GRESIK",
    provinsiId: "35",
    kabupatenId: "3525",
    kecamatanId: "3525010",
    desaId: "3525010001",
    namaJalan: "Jl. Sunan Giri No. 222",
    rt: "009",
    rw: "010",
    syubiyahId: null, // Syubiyah Banjari Kediri
    mustahiqId: null, // KH. Ahmad Basari
    isVerified: true,
    status: "VERIFIED"
  },
  {
    fullName: "Zainab binti Jahsy Ramadhani",
    email: "zainab.jahsy.alumni@ikada.com",
    password: "password123",
    tahunMasuk: 2012,
    tahunKeluar: 2015,
    asalDaerah: "Lamongan",
    tempatLahir: "Lamongan",
    tanggalLahir: new Date('1994-08-17'),
    statusPernikahan: "MENIKAH",
    jumlahAnak: 2,
    pendidikanTerakhir: "S1 Pendidikan Bahasa Inggris",
    pekerjaan: ["Guru Bahasa Inggris", "Translator"],
    phone: "081234567899",
    penghasilanBulan: "RANGE_1_5",
    provinsi: "JAWA TIMUR",
    kabupaten: "KABUPATEN LAMONGAN",
    kecamatan: "LAMONGAN",
    desa: "LAMONGAN",
    provinsiId: "35",
    kabupatenId: "3524",
    kecamatanId: "3524010",
    desaId: "3524010001",
    namaJalan: "Jl. Panglima Sudirman No. 333",
    rt: "010",
    rw: "011",
    syubiyahId: null, // Syubiyah Bangbang Wetan
    mustahiqId: null, // KH. Ahmad Basari
    isVerified: true,
    status: "VERIFIED"
  }
];

async function generateAlumniDummy() {
  try {
    console.log('Mulai membuat data dummy alumni...');
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const alumniData of alumniDummyData) {
      // Check if email already exists
      const existingAlumni = await prisma.alumni.findUnique({
        where: { email: alumniData.email }
      });
      
      if (existingAlumni) {
        console.log(`⚠️ Alumni dengan email ${alumniData.email} sudah ada, dilewati`);
        skippedCount++;
        continue;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(alumniData.password, 12);
      
      // Create alumni
      const newAlumni = await prisma.alumni.create({
        data: {
          ...alumniData,
          password: hashedPassword
        }
      });
      
      console.log(`✓ Alumni ${newAlumni.fullName} berhasil dibuat`);
      createdCount++;
    }
    
    console.log('\n✅ Proses selesai!');
    console.log(`📊 Statistik:`);
    console.log(`   - Alumni baru dibuat: ${createdCount}`);
    console.log(`   - Alumni dilewati (sudah ada): ${skippedCount}`);
    
    // Show total count
    const totalAlumni = await prisma.alumni.count();
    console.log(`   - Total alumni di database: ${totalAlumni}`);
    
  } catch (error) {
    console.error('❌ Error membuat data dummy:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateAlumniDummy();