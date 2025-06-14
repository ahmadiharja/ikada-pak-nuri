const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Fungsi untuk membuat slug dari title
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Hapus karakter khusus
    .replace(/\s+/g, '-') // Ganti spasi dengan dash
    .replace(/-+/g, '-') // Hapus dash berlebihan
    .trim();
}

// Data artikel dummy
const articlesData = [
  // 3 Artikel dari Admin Pusat
  {
    title: "Sejarah dan Perkembangan Ikatan Alumni Daarul Pakar Nuri",
    content: `<h2>Sejarah Berdirinya IKADA Pakar Nuri</h2>
    <p>Ikatan Alumni Daarul Pakar Nuri (IKADA Pakar Nuri) didirikan sebagai wadah silaturahmi dan kerjasama antar alumni Pondok Pesantren Daarul Pakar Nuri. Organisasi ini lahir dari semangat untuk menjaga tali persaudaraan yang telah terjalin selama menuntut ilmu di pesantren.</p>
    
    <h3>Visi dan Misi</h3>
    <p>IKADA Pakar Nuri memiliki visi untuk menjadi organisasi alumni yang solid, produktif, dan bermanfaat bagi masyarakat. Misi utama kami adalah:</p>
    <ul>
      <li>Mempererat silaturahmi antar alumni</li>
      <li>Mengembangkan potensi alumni dalam berbagai bidang</li>
      <li>Berkontribusi positif untuk kemajuan pesantren dan masyarakat</li>
      <li>Menjaga dan melestarikan nilai-nilai pesantren</li>
    </ul>
    
    <h3>Perkembangan Organisasi</h3>
    <p>Sejak berdiri, IKADA Pakar Nuri terus berkembang dengan membentuk syubiyah-syubiyah di berbagai daerah. Hal ini memudahkan koordinasi dan kegiatan alumni di tingkat regional.</p>
    
    <p>Organisasi ini juga aktif dalam berbagai kegiatan sosial, pendidikan, dan dakwah sebagai bentuk pengabdian kepada masyarakat.</p>`,
    excerpt: "Mengenal sejarah, visi, misi, dan perkembangan Ikatan Alumni Daarul Pakar Nuri sebagai wadah silaturahmi dan kerjasama antar alumni.",
    imageUrl: "/placeholder.jpg",
    status: "APPROVED",
    authorEmail: "admin@ikadapaknuri.com",
    publishedAt: new Date('2024-01-15T10:00:00Z'),
    visibility: "ALL_SYUBIYAH"
  },
  {
    title: "Program Beasiswa IKADA Pakar Nuri untuk Santri Berprestasi",
    content: `<h2>Program Beasiswa IKADA Pakar Nuri</h2>
    <p>IKADA Pakar Nuri dengan bangga mengumumkan program beasiswa untuk santri-santri berprestasi yang membutuhkan bantuan finansial dalam melanjutkan pendidikan.</p>
    
    <h3>Jenis Beasiswa</h3>
    <ol>
      <li><strong>Beasiswa Prestasi Akademik</strong> - Untuk santri dengan nilai akademik terbaik</li>
      <li><strong>Beasiswa Prestasi Non-Akademik</strong> - Untuk santri berprestasi di bidang olahraga, seni, atau organisasi</li>
      <li><strong>Beasiswa Ekonomi</strong> - Untuk santri dari keluarga kurang mampu</li>
    </ol>
    
    <h3>Persyaratan Umum</h3>
    <ul>
      <li>Santri aktif Pondok Pesantren Daarul Pakar Nuri</li>
      <li>Memiliki prestasi akademik atau non-akademik yang membanggakan</li>
      <li>Berkelakuan baik dan tidak pernah melanggar tata tertib pesantren</li>
      <li>Membutuhkan bantuan finansial (khusus beasiswa ekonomi)</li>
    </ul>
    
    <h3>Cara Pendaftaran</h3>
    <p>Pendaftaran dapat dilakukan melalui:</p>
    <ul>
      <li>Website resmi IKADA Pakar Nuri</li>
      <li>Kantor sekretariat pesantren</li>
      <li>Koordinator syubiyah di daerah masing-masing</li>
    </ul>
    
    <p>Batas waktu pendaftaran: 31 Maret 2024</p>`,
    excerpt: "IKADA Pakar Nuri membuka program beasiswa untuk santri berprestasi dalam bidang akademik, non-akademik, dan bantuan ekonomi.",
    imageUrl: "/placeholder.jpg",
    status: "APPROVED",
    authorEmail: "admin@ikadapaknuri.com",
    publishedAt: new Date('2024-02-01T14:30:00Z'),
    visibility: "ALL_SYUBIYAH"
  },
  {
    title: "Panduan Registrasi Alumni Baru di Platform IKADA Pakar Nuri",
    content: `<h2>Selamat Datang Alumni Baru!</h2>
    <p>Bagi para alumni yang baru lulus dari Pondok Pesantren Daarul Pakar Nuri, kami mengundang Anda untuk bergabung dalam platform digital IKADA Pakar Nuri.</p>
    
    <h3>Langkah-langkah Registrasi</h3>
    <ol>
      <li><strong>Kunjungi Website</strong><br>
         Akses website resmi IKADA Pakar Nuri di alamat yang telah disediakan</li>
      
      <li><strong>Klik Menu Registrasi</strong><br>
         Pilih menu "Daftar Alumni" di halaman utama</li>
      
      <li><strong>Isi Data Pribadi</strong><br>
         Lengkapi formulir dengan data yang akurat:
         <ul>
           <li>Nama lengkap</li>
           <li>Tahun masuk dan keluar pesantren</li>
           <li>Alamat lengkap</li>
           <li>Nomor telepon dan email</li>
           <li>Pekerjaan saat ini</li>
         </ul>
      </li>
      
      <li><strong>Upload Dokumen</strong><br>
         Unggah foto profil dan dokumen pendukung jika diperlukan</li>
      
      <li><strong>Verifikasi</strong><br>
         Tunggu proses verifikasi dari admin (maksimal 3 hari kerja)</li>
    </ol>
    
    <h3>Manfaat Bergabung</h3>
    <ul>
      <li>Akses informasi terbaru tentang kegiatan IKADA</li>
      <li>Networking dengan sesama alumni</li>
      <li>Kesempatan berpartisipasi dalam berbagai program</li>
      <li>Update lowongan kerja dan peluang bisnis</li>
    </ul>
    
    <p>Untuk bantuan registrasi, hubungi admin melalui WhatsApp atau email yang tersedia di website.</p>`,
    excerpt: "Panduan lengkap untuk alumni baru dalam melakukan registrasi di platform digital IKADA Pakar Nuri.",
    imageUrl: "/placeholder.jpg",
    status: "APPROVED",
    authorEmail: "admin@ikadapaknuri.com",
    publishedAt: new Date('2024-02-15T09:15:00Z'),
    visibility: "ALL_SYUBIYAH"
  },
  
  // 2 Artikel dari Syubiyah
  {
    title: "Kegiatan Syubiyah Jawa Timur: Pengajian Rutin dan Bakti Sosial",
    content: `<h2>Laporan Kegiatan Syubiyah Jawa Timur</h2>
    <p>Syubiyah IKADA Pakar Nuri Jawa Timur telah melaksanakan serangkaian kegiatan rutin selama bulan ini yang meliputi pengajian bulanan dan program bakti sosial.</p>
    
    <h3>Pengajian Rutin Bulanan</h3>
    <p>Pengajian rutin bulan ini diselenggarakan pada:</p>
    <ul>
      <li><strong>Tanggal:</strong> 10 Februari 2024</li>
      <li><strong>Tempat:</strong> Masjid Al-Hidayah, Surabaya</li>
      <li><strong>Pemateri:</strong> KH. Ahmad Basari</li>
      <li><strong>Tema:</strong> "Menjaga Silaturahmi di Era Digital"</li>
      <li><strong>Peserta:</strong> 85 alumni dari berbagai angkatan</li>
    </ul>
    
    <p>Pengajian berlangsung khidmat dengan antusiasme tinggi dari para peserta. Materi yang disampaikan sangat relevan dengan kondisi saat ini.</p>
    
    <h3>Program Bakti Sosial</h3>
    <p>Sebagai bentuk kepedulian terhadap masyarakat, syubiyah juga mengadakan:</p>
    <ul>
      <li>Pembagian sembako untuk 50 keluarga kurang mampu</li>
      <li>Santunan untuk 15 anak yatim</li>
      <li>Bantuan biaya pendidikan untuk 10 siswa berprestasi</li>
    </ul>
    
    <h3>Rencana Kegiatan Mendatang</h3>
    <p>Syubiyah Jawa Timur merencanakan beberapa kegiatan untuk bulan depan:</p>
    <ol>
      <li>Workshop kewirausahaan untuk alumni</li>
      <li>Buka puasa bersama</li>
      <li>Kunjungan ke pesantren induk</li>
    </ol>
    
    <p>Mari kita dukung dan berpartisipasi aktif dalam setiap kegiatan syubiyah untuk memperkuat ukhuwah islamiyah.</p>`,
    excerpt: "Laporan kegiatan Syubiyah Jawa Timur meliputi pengajian rutin bulanan dan program bakti sosial untuk masyarakat.",
    imageUrl: "/placeholder.jpg",
    status: "APPROVED",
    authorEmail: "syubiyah@ikada.com",
    publishedAt: new Date('2024-02-12T16:45:00Z'),
    visibility: "SPECIFIC_SYUBIYAH",
    targetSyubiyahIds: ["syubiyah_jatim_id"] // ID syubiyah Jawa Timur
  },
  {
    title: "Silaturahmi Alumni Angkatan 2010-2015 Syubiyah Jakarta",
    content: `<h2>Reuni Akbar Alumni Jakarta</h2>
    <p>Syubiyah IKADA Pakar Nuri Jakarta mengadakan acara silaturahmi khusus untuk alumni angkatan 2010-2015 yang bertempat di Jakarta.</p>
    
    <h3>Detail Acara</h3>
    <ul>
      <li><strong>Tanggal:</strong> Sabtu, 17 Februari 2024</li>
      <li><strong>Waktu:</strong> 14:00 - 21:00 WIB</li>
      <li><strong>Tempat:</strong> Hotel Santika Jakarta</li>
      <li><strong>Tema:</strong> "Mempererat Ukhuwah, Membangun Masa Depan"</li>
    </ul>
    
    <h3>Rundown Acara</h3>
    <table>
      <tr><th>Waktu</th><th>Kegiatan</th></tr>
      <tr><td>14:00-14:30</td><td>Registrasi peserta</td></tr>
      <tr><td>14:30-15:00</td><td>Pembukaan dan sambutan ketua syubiyah</td></tr>
      <tr><td>15:00-16:30</td><td>Sharing session: "Perjalanan Karir Alumni"</td></tr>
      <tr><td>16:30-17:00</td><td>Coffee break</td></tr>
      <tr><td>17:00-18:00</td><td>Diskusi program kerja syubiyah</td></tr>
      <tr><td>18:00-19:30</td><td>Makan malam bersama</td></tr>
      <tr><td>19:30-21:00</td><td>Hiburan dan door prize</td></tr>
    </table>
    
    <h3>Narasumber</h3>
    <p>Acara ini menghadirkan beberapa alumni sukses sebagai narasumber:</p>
    <ul>
      <li><strong>Ahmad Fauzi</strong> - Direktur PT. Berkah Mandiri (Angkatan 2012)</li>
      <li><strong>Siti Aminah</strong> - Founder Yayasan Pendidikan Nusantara (Angkatan 2013)</li>
      <li><strong>Muhammad Ridwan</strong> - Dosen UIN Jakarta (Angkatan 2014)</li>
    </ul>
    
    <h3>Pendaftaran</h3>
    <p>Bagi alumni angkatan 2010-2015 yang berdomisili di Jakarta dan sekitarnya, silakan daftar melalui:</p>
    <ul>
      <li>WhatsApp: 0812-3456-7890 (Koordinator Acara)</li>
      <li>Email: jakarta@ikadapaknuri.com</li>
      <li>Link pendaftaran: bit.ly/reuni-jakarta-2024</li>
    </ul>
    
    <p><strong>Batas pendaftaran:</strong> 15 Februari 2024<br>
    <strong>Kontribusi:</strong> Rp 150.000/orang (sudah termasuk makan malam dan doorprize)</p>
    
    <p>Mari ramaikan acara silaturahmi ini dan perkuat jaringan alumni di Jakarta!</p>`,
    excerpt: "Syubiyah Jakarta mengadakan acara silaturahmi khusus alumni angkatan 2010-2015 dengan tema mempererat ukhuwah dan membangun masa depan.",
    imageUrl: "/placeholder.jpg",
    status: "APPROVED",
    authorEmail: "syubiyah@ikada.com",
    publishedAt: new Date('2024-02-08T11:20:00Z'),
    visibility: "SPECIFIC_SYUBIYAH",
    targetSyubiyahIds: ["syubiyah_jakarta_id"] // ID syubiyah Jakarta
  }
];

async function createDummyArticles() {
  try {
    console.log('🔄 Membuat dummy data artikel...');
    
    // Cari user admin pusat
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@ikadapaknuri.com' }
    });
    
    if (!adminUser) {
      console.log('❌ User admin@ikadapaknuri.com tidak ditemukan!');
      console.log('   Silakan jalankan script create user terlebih dahulu.');
      return;
    }
    
    // Cari user syubiyah
    const syubiyahUser = await prisma.user.findUnique({
      where: { email: 'syubiyah@ikada.com' }
    });
    
    if (!syubiyahUser) {
      console.log('❌ User syubiyah@ikada.com tidak ditemukan!');
      console.log('   Membuat user syubiyah...');
      
      // Buat user syubiyah jika belum ada
      const newSyubiyahUser = await prisma.user.create({
        data: {
          email: 'syubiyah@ikada.com',
          password: 'syubiyah123', // password sederhana untuk demo
          role: 'SYUBIYAH',
          name: 'Admin Syubiyah',
          isVerified: true,
          syubiyah_id: null // Bisa diisi dengan ID syubiyah tertentu jika ada
        }
      });
      console.log(`   ✅ User syubiyah created: ${newSyubiyahUser.email}`);
    }
    
    // Ambil ulang user syubiyah
    const finalSyubiyahUser = await prisma.user.findUnique({
      where: { email: 'syubiyah@ikada.com' }
    });
    
    console.log('\n📝 Membuat artikel...');
    
    for (const articleData of articlesData) {
      const authorId = articleData.authorEmail === 'admin@ikadapaknuri.com' 
        ? adminUser.id 
        : finalSyubiyahUser.id;
      
      const slug = createSlug(articleData.title);
      
      // Cek apakah artikel dengan slug yang sama sudah ada
      const existingPost = await prisma.post.findUnique({
        where: { slug }
      });
      
      if (existingPost) {
        console.log(`   ⚠️  Artikel dengan slug "${slug}" sudah ada, dilewati.`);
        continue;
      }
      
      const post = await prisma.post.create({
        data: {
          title: articleData.title,
          slug: slug,
          content: articleData.content,
          excerpt: articleData.excerpt,
          imageUrl: articleData.imageUrl,
          status: articleData.status,
          authorId: authorId,
          publishedAt: articleData.publishedAt,
          visibility: articleData.visibility,
          targetSyubiyahIds: articleData.targetSyubiyahIds || [],
          viewCount: Math.floor(Math.random() * 100) + 10 // Random view count
        }
      });
      
      console.log(`   ✅ Artikel created: "${post.title}" by ${articleData.authorEmail}`);
    }
    
    console.log('\n🎉 Semua dummy artikel berhasil dibuat!');
    console.log('\n📊 Ringkasan:');
    console.log('   - 3 artikel dari admin pusat (admin@ikadapaknuri.com)');
    console.log('   - 2 artikel dari syubiyah (syubiyah@ikada.com)');
    console.log('   - Semua artikel berstatus APPROVED dan sudah dipublish');
    
  } catch (error) {
    console.error('❌ Error creating dummy articles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan fungsi jika file dieksekusi langsung
if (require.main === module) {
  createDummyArticles();
}

module.exports = { createDummyArticles };