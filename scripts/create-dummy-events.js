const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Data event dummy
const eventsData = [
  // Event dari Admin Pusat
  {
    title: "Muktamar Nasional IKADA Pakar Nuri 2024",
    description: `<h2>Muktamar Nasional IKADA Pakar Nuri 2024</h2>
    <p>IKADA Pakar Nuri dengan bangga mengundang seluruh alumni untuk menghadiri Muktamar Nasional yang akan diselenggarakan di Pondok Pesantren Daarul Pakar Nuri.</p>
    
    <h3>Agenda Muktamar</h3>
    <ul>
      <li>Laporan pertanggungjawaban pengurus pusat</li>
      <li>Pemilihan pengurus pusat periode 2024-2029</li>
      <li>Penetapan program kerja strategis</li>
      <li>Diskusi pengembangan organisasi</li>
      <li>Silaturahmi dan networking alumni</li>
    </ul>
    
    <h3>Fasilitas</h3>
    <ul>
      <li>Akomodasi di pesantren (terbatas)</li>
      <li>Konsumsi selama acara</li>
      <li>Transportasi lokal</li>
      <li>Kit peserta</li>
      <li>Sertifikat kehadiran</li>
    </ul>
    
    <p>Acara ini merupakan momentum penting untuk menentukan arah organisasi ke depan. Mari berpartisipasi aktif!</p>`,
    excerpt: "Muktamar Nasional IKADA Pakar Nuri 2024 untuk pemilihan pengurus dan penetapan program kerja strategis organisasi.",
    imageUrl: "/placeholder.jpg",
    location: "Pondok Pesantren Daarul Pakar Nuri",
    locationDetail: "Jl. Pesantren No. 1, Kediri, Jawa Timur",
    startDate: new Date('2024-04-15T08:00:00Z'),
    endDate: new Date('2024-04-17T17:00:00Z'),
    registrationStart: new Date('2024-03-01T00:00:00Z'),
    registrationEnd: new Date('2024-04-10T23:59:59Z'),
    maxParticipants: 500,
    eventType: "SINGLE",
    status: "APPROVED",
    visibility: "ALL_SYUBIYAH",
    organizerEmail: "admin@ikadapaknuri.com",
    registrationFee: 250000,
    isOnline: false,
    requirements: [
      "Alumni IKADA Pakar Nuri",
      "Membawa KTP/identitas diri",
      "Mengisi formulir pendaftaran",
      "Melakukan pembayaran registrasi"
    ],
    benefits: [
      "Networking dengan alumni se-Indonesia",
      "Update informasi organisasi",
      "Sertifikat kehadiran",
      "Konsumsi dan akomodasi",
      "Hak suara dalam pemilihan pengurus"
    ],
    contactPerson: "Panitia Muktamar",
    contactPhone: "0812-3456-7890",
    contactEmail: "muktamar@ikadapaknuri.com"
  },
  {
    title: "Workshop Kewirausahaan Digital untuk Alumni",
    description: `<h2>Workshop Kewirausahaan Digital</h2>
    <p>IKADA Pakar Nuri mengadakan workshop kewirausahaan digital untuk membekali alumni dengan keterampilan bisnis di era digital.</p>
    
    <h3>Materi Workshop</h3>
    <ol>
      <li><strong>Digital Marketing Fundamentals</strong>
         <ul>
           <li>Social media marketing</li>
           <li>Content creation</li>
           <li>Online advertising</li>
         </ul>
      </li>
      <li><strong>E-commerce Setup</strong>
         <ul>
           <li>Platform marketplace</li>
           <li>Payment gateway</li>
           <li>Inventory management</li>
         </ul>
      </li>
      <li><strong>Financial Management</strong>
         <ul>
           <li>Business planning</li>
           <li>Cash flow management</li>
           <li>Investment strategies</li>
         </ul>
      </li>
    </ol>
    
    <h3>Narasumber</h3>
    <ul>
      <li>Dr. Ahmad Fauzi - Digital Marketing Expert</li>
      <li>Siti Aminah, S.E., M.M. - Business Consultant</li>
      <li>Muhammad Ridwan - E-commerce Specialist</li>
    </ul>
    
    <p>Workshop ini akan dilaksanakan secara hybrid (online dan offline) untuk memudahkan partisipasi alumni dari berbagai daerah.</p>`,
    excerpt: "Workshop kewirausahaan digital untuk membekali alumni dengan keterampilan bisnis di era digital modern.",
    imageUrl: "/placeholder.jpg",
    location: "Hotel Santika Jakarta",
    locationDetail: "Jl. MH Thamrin No. 53, Jakarta Pusat",
    startDate: new Date('2024-03-20T09:00:00Z'),
    endDate: new Date('2024-03-22T16:00:00Z'),
    registrationStart: new Date('2024-02-15T00:00:00Z'),
    registrationEnd: new Date('2024-03-15T23:59:59Z'),
    maxParticipants: 200,
    eventType: "SINGLE",
    status: "APPROVED",
    visibility: "ALL_SYUBIYAH",
    organizerEmail: "admin@ikadapaknuri.com",
    registrationFee: 150000,
    isOnline: true,
    onlineLink: "https://zoom.us/j/workshop-ikada",
    requirements: [
      "Alumni IKADA Pakar Nuri",
      "Laptop/smartphone untuk sesi online",
      "Koneksi internet stabil",
      "Motivasi tinggi untuk berwirausaha"
    ],
    benefits: [
      "Materi workshop lengkap",
      "Sertifikat kehadiran",
      "Networking dengan entrepreneur alumni",
      "Konsultasi bisnis gratis 1 bulan",
      "Akses grup WhatsApp entrepreneur"
    ],
    contactPerson: "Tim Workshop",
    contactPhone: "0813-4567-8901",
    contactEmail: "workshop@ikadapaknuri.com"
  },
  {
    title: "Bakti Sosial Nasional: Bantuan Pendidikan untuk Anak Yatim",
    description: `<h2>Bakti Sosial Nasional IKADA Pakar Nuri</h2>
    <p>Program bakti sosial nasional IKADA Pakar Nuri untuk memberikan bantuan pendidikan kepada anak-anak yatim dan dhuafa di seluruh Indonesia.</p>
    
    <h3>Program Bantuan</h3>
    <ul>
      <li><strong>Beasiswa Pendidikan</strong> - Bantuan biaya sekolah untuk 100 anak yatim</li>
      <li><strong>Perlengkapan Sekolah</strong> - Tas, buku, alat tulis untuk 500 anak</li>
      <li><strong>Bantuan Gizi</strong> - Susu dan makanan bergizi untuk 200 anak</li>
      <li><strong>Santunan Bulanan</strong> - Bantuan rutin untuk 50 keluarga</li>
    </ul>
    
    <h3>Target Penerima</h3>
    <ul>
      <li>Anak yatim usia 6-18 tahun</li>
      <li>Keluarga dhuafa dengan anak sekolah</li>
      <li>Prioritas wilayah terpencil dan kurang mampu</li>
      <li>Rekomendasi dari syubiyah setempat</li>
    </ul>
    
    <h3>Cara Berpartisipasi</h3>
    <ol>
      <li>Donasi melalui rekening resmi IKADA</li>
      <li>Menjadi relawan distribusi bantuan</li>
      <li>Mendata calon penerima di daerah masing-masing</li>
      <li>Menyebarkan informasi program</li>
    </ol>
    
    <p>Mari bersama-sama berbagi kebahagiaan dan membantu sesama dalam semangat ukhuwah islamiyah.</p>`,
    excerpt: "Program bakti sosial nasional untuk memberikan bantuan pendidikan kepada anak yatim dan dhuafa di seluruh Indonesia.",
    imageUrl: "/placeholder.jpg",
    location: "Seluruh Indonesia",
    locationDetail: "Koordinasi melalui syubiyah di masing-masing daerah",
    startDate: new Date('2024-05-01T00:00:00Z'),
    endDate: new Date('2024-12-31T23:59:59Z'),
    registrationStart: new Date('2024-04-01T00:00:00Z'),
    registrationEnd: new Date('2024-11-30T23:59:59Z'),
    maxParticipants: null, // Tidak terbatas
    eventType: "RECURRING",
    status: "APPROVED",
    visibility: "ALL_SYUBIYAH",
    organizerEmail: "admin@ikadapaknuri.com",
    registrationFee: null, // Gratis untuk relawan
    isOnline: false,
    requirements: [
      "Alumni IKADA Pakar Nuri",
      "Komitmen untuk membantu sesama",
      "Koordinasi dengan syubiyah setempat",
      "Laporan kegiatan berkala"
    ],
    benefits: [
      "Pahala membantu anak yatim",
      "Sertifikat relawan",
      "Networking dengan alumni peduli sosial",
      "Update laporan penggunaan dana",
      "Apresiasi dari pengurus pusat"
    ],
    contactPerson: "Tim Baksos Nasional",
    contactPhone: "0814-5678-9012",
    contactEmail: "baksos@ikadapaknuri.com"
  },
  
  // Event dari Admin Syubiyah
  {
    title: "Halaqah Bulanan Syubiyah Jawa Timur",
    description: `<h2>Halaqah Bulanan Syubiyah Jawa Timur</h2>
    <p>Kegiatan rutin bulanan syubiyah Jawa Timur berupa halaqah dan kajian kitab untuk memperdalam ilmu agama.</p>
    
    <h3>Materi Kajian</h3>
    <ul>
      <li><strong>Kitab Hikam</strong> - Pembahasan hikmah-hikmah Ibn Athaillah</li>
      <li><strong>Fiqh Muamalah</strong> - Hukum-hukum dalam bermuamalah</li>
      <li><strong>Akhlaq</strong> - Pembinaan akhlak dan tasawuf</li>
      <li><strong>Tanya Jawab</strong> - Diskusi masalah keagamaan sehari-hari</li>
    </ul>
    
    <h3>Jadwal Rutin</h3>
    <ul>
      <li>Setiap Minggu kedua tiap bulan</li>
      <li>Waktu: Ba'da Maghrib - Isya</li>
      <li>Tempat: Bergilir di masjid-masjid anggota</li>
    </ul>
    
    <p>Halaqah ini terbuka untuk semua alumni syubiyah Jawa Timur dan keluarga. Mari perkuat ikatan ukhuwah melalui kajian ilmu.</p>`,
    excerpt: "Kegiatan halaqah bulanan syubiyah Jawa Timur untuk kajian kitab dan pendalaman ilmu agama.",
    imageUrl: "/placeholder.jpg",
    location: "Masjid Al-Hidayah Surabaya",
    locationDetail: "Jl. Raya Darmo No. 123, Surabaya, Jawa Timur",
    startDate: new Date('2024-03-10T11:00:00Z'),
    endDate: new Date('2024-03-10T13:30:00Z'),
    registrationStart: new Date('2024-03-01T00:00:00Z'),
    registrationEnd: new Date('2024-03-09T23:59:59Z'),
    maxParticipants: 80,
    eventType: "RECURRING",
    status: "APPROVED",
    visibility: "SPECIFIC_SYUBIYAH",
    targetSyubiyahIds: ["syubiyah_jatim_id"],
    organizerEmail: "syubiyah@ikada.com",
    registrationFee: null, // Gratis
    isOnline: false,
    requirements: [
      "Alumni syubiyah Jawa Timur",
      "Membawa Al-Quran dan kitab kajian",
      "Berpakaian sopan dan rapi",
      "Datang tepat waktu"
    ],
    benefits: [
      "Ilmu agama yang bermanfaat",
      "Silaturahmi dengan sesama alumni",
      "Konsumsi ringan",
      "Buku kajian gratis",
      "Networking alumni Jawa Timur"
    ],
    contactPerson: "Koordinator Syubiyah Jatim",
    contactPhone: "0815-6789-0123",
    contactEmail: "jatim@ikadapaknuri.com"
  },
  {
    title: "Pelatihan Tahfidz untuk Anak-anak Alumni Jakarta",
    description: `<h2>Pelatihan Tahfidz Anak-anak Alumni</h2>
    <p>Syubiyah Jakarta mengadakan program pelatihan tahfidz Al-Quran khusus untuk anak-anak alumni yang berdomisili di Jakarta dan sekitarnya.</p>
    
    <h3>Program Pelatihan</h3>
    <ul>
      <li><strong>Tahfidz Juz 30</strong> - Untuk anak usia 5-8 tahun</li>
      <li><strong>Tahfidz Juz 1-3</strong> - Untuk anak usia 9-12 tahun</li>
      <li><strong>Tahsin Al-Quran</strong> - Perbaikan bacaan untuk semua usia</li>
      <li><strong>Adab Membaca Al-Quran</strong> - Etika dan tata cara membaca</li>
    </ul>
    
    <h3>Metode Pembelajaran</h3>
    <ol>
      <li>Pembelajaran berkelompok sesuai usia</li>
      <li>Metode talaqqi (face to face)</li>
      <li>Muraja'ah (pengulangan) rutin</li>
      <li>Evaluasi berkala</li>
      <li>Reward dan motivasi</li>
    </ol>
    
    <h3>Fasilitas</h3>
    <ul>
      <li>Ustadz/ustadzah berpengalaman</li>
      <li>Mushaf Al-Quran untuk setiap anak</li>
      <li>Ruang belajar ber-AC</li>
      <li>Snack dan minum</li>
      <li>Sertifikat kelulusan</li>
    </ul>
    
    <p>Program ini bertujuan untuk mencetak generasi Qurani dari keluarga alumni IKADA Pakar Nuri.</p>`,
    excerpt: "Program pelatihan tahfidz Al-Quran khusus untuk anak-anak alumni yang berdomisili di Jakarta dan sekitarnya.",
    imageUrl: "/placeholder.jpg",
    location: "Masjid Al-Ikhlas Jakarta",
    locationDetail: "Jl. Kemang Raya No. 45, Jakarta Selatan",
    startDate: new Date('2024-04-01T14:00:00Z'),
    endDate: new Date('2024-06-30T16:00:00Z'),
    registrationStart: new Date('2024-03-15T00:00:00Z'),
    registrationEnd: new Date('2024-03-28T23:59:59Z'),
    maxParticipants: 50,
    eventType: "RECURRING",
    status: "APPROVED",
    visibility: "SPECIFIC_SYUBIYAH",
    targetSyubiyahIds: ["syubiyah_jakarta_id"],
    organizerEmail: "syubiyah@ikada.com",
    registrationFee: 200000, // Per 3 bulan
    isOnline: false,
    requirements: [
      "Anak alumni syubiyah Jakarta",
      "Usia 5-12 tahun",
      "Sudah bisa membaca huruf hijaiyah",
      "Komitmen mengikuti program sampai selesai",
      "Izin dan dukungan orang tua"
    ],
    benefits: [
      "Hafalan Al-Quran yang kuat",
      "Bacaan Al-Quran yang benar",
      "Akhlak Islami yang baik",
      "Sertifikat kelulusan",
      "Networking anak-anak alumni"
    ],
    contactPerson: "Koordinator Tahfidz Jakarta",
    contactPhone: "0816-7890-1234",
    contactEmail: "tahfidz.jakarta@ikadapaknuri.com"
  }
];

// Data kategori event
const eventCategories = [
  {
    name: "Organisasi",
    description: "Event terkait organisasi dan kepengurusan",
    color: "blue"
  },
  {
    name: "Pendidikan",
    description: "Workshop, seminar, dan pelatihan",
    color: "green"
  },
  {
    name: "Sosial",
    description: "Kegiatan bakti sosial dan kemasyarakatan",
    color: "orange"
  },
  {
    name: "Keagamaan",
    description: "Kajian, halaqah, dan kegiatan keagamaan",
    color: "purple"
  },
  {
    name: "Keluarga",
    description: "Program untuk keluarga dan anak-anak alumni",
    color: "pink"
  }
];

async function createDummyEvents() {
  try {
    console.log('🔄 Membuat dummy data event dan kegiatan...');
    
    // Cari user admin pusat
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@ikadapaknuri.com' }
    });
    
    if (!adminUser) {
      console.log('❌ User admin@ikadapaknuri.com tidak ditemukan!');
      return;
    }
    
    // Cari user syubiyah
    let syubiyahUser = await prisma.user.findUnique({
      where: { email: 'syubiyah@ikada.com' }
    });
    
    if (!syubiyahUser) {
      console.log('❌ User syubiyah@ikada.com tidak ditemukan!');
      console.log('   Membuat user syubiyah...');
      
      syubiyahUser = await prisma.user.create({
        data: {
          email: 'syubiyah@ikada.com',
          password: 'syubiyah123',
          role: 'SYUBIYAH',
          name: 'Admin Syubiyah',
          isVerified: true
        }
      });
      console.log(`   ✅ User syubiyah created: ${syubiyahUser.email}`);
    }
    
    // Buat kategori event
    console.log('\n📂 Membuat kategori event...');
    const createdCategories = {};
    
    for (const categoryData of eventCategories) {
      const existingCategory = await prisma.eventCategory.findUnique({
        where: { name: categoryData.name }
      });
      
      if (existingCategory) {
        createdCategories[categoryData.name] = existingCategory;
        console.log(`   ⚠️  Kategori "${categoryData.name}" sudah ada, dilewati.`);
      } else {
        const category = await prisma.eventCategory.create({
          data: categoryData
        });
        createdCategories[categoryData.name] = category;
        console.log(`   ✅ Kategori created: "${category.name}"`);
      }
    }
    
    // Mapping kategori untuk setiap event
    const eventCategoryMapping = {
      "Muktamar Nasional IKADA Pakar Nuri 2024": "Organisasi",
      "Workshop Kewirausahaan Digital untuk Alumni": "Pendidikan",
      "Bakti Sosial Nasional: Bantuan Pendidikan untuk Anak Yatim": "Sosial",
      "Halaqah Bulanan Syubiyah Jawa Timur": "Keagamaan",
      "Pelatihan Tahfidz untuk Anak-anak Alumni Jakarta": "Keluarga"
    };
    
    console.log('\n🎉 Membuat event...');
    
    for (const eventData of eventsData) {
      const organizerId = eventData.organizerEmail === 'admin@ikadapaknuri.com' 
        ? adminUser.id 
        : syubiyahUser.id;
      
      const categoryName = eventCategoryMapping[eventData.title];
      const categoryId = createdCategories[categoryName]?.id;
      
      // Cek apakah event dengan title yang sama sudah ada
      const existingEvent = await prisma.event.findFirst({
        where: { title: eventData.title }
      });
      
      if (existingEvent) {
        console.log(`   ⚠️  Event "${eventData.title}" sudah ada, dilewati.`);
        continue;
      }
      
      const event = await prisma.event.create({
        data: {
          title: eventData.title,
          description: eventData.description,
          excerpt: eventData.excerpt,
          imageUrl: eventData.imageUrl,
          location: eventData.location,
          locationDetail: eventData.locationDetail,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          registrationStart: eventData.registrationStart,
          registrationEnd: eventData.registrationEnd,
          maxParticipants: eventData.maxParticipants,
          eventType: eventData.eventType,
          status: eventData.status,
          visibility: eventData.visibility,
          targetSyubiyahIds: eventData.targetSyubiyahIds || [],
          categoryId: categoryId,
          organizerId: organizerId,
          registrationFee: eventData.registrationFee,
          isOnline: eventData.isOnline,
          onlineLink: eventData.onlineLink,
          requirements: eventData.requirements,
          benefits: eventData.benefits,
          contactPerson: eventData.contactPerson,
          contactPhone: eventData.contactPhone,
          contactEmail: eventData.contactEmail,
          currentParticipants: Math.floor(Math.random() * (eventData.maxParticipants || 50))
        }
      });
      
      console.log(`   ✅ Event created: "${event.title}" by ${eventData.organizerEmail}`);
    }
    
    console.log('\n🎉 Semua dummy event berhasil dibuat!');
    console.log('\n📊 Ringkasan:');
    console.log('   - 3 event dari admin pusat (admin@ikadapaknuri.com)');
    console.log('   - 2 event dari syubiyah (syubiyah@ikada.com)');
    console.log('   - 5 kategori event dibuat');
    console.log('   - Semua event berstatus APPROVED');
    
  } catch (error) {
    console.error('❌ Error creating dummy events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan fungsi jika file dieksekusi langsung
if (require.main === module) {
  createDummyEvents();
}

module.exports = { createDummyEvents };