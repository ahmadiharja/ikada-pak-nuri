/**
 * Script untuk setup database UMKM Alumni
 * Menjalankan migration dan seeding kategori produk default
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Kategori produk default
const defaultCategories = [
  {
    name: 'Makanan & Minuman',
    slug: 'makanan-minuman',
    description: 'Produk makanan, minuman, dan kuliner',
    icon: '🍯',
    color: 'orange',
    sortOrder: 1
  },
  {
    name: 'Fashion & Aksesoris',
    slug: 'fashion-aksesoris',
    description: 'Pakaian, tas, sepatu, dan aksesoris fashion',
    icon: '👕',
    color: 'pink',
    sortOrder: 2
  },
  {
    name: 'Kerajinan Tangan',
    slug: 'kerajinan-tangan',
    description: 'Produk kerajinan dan handmade',
    icon: '🏠',
    color: 'green',
    sortOrder: 3
  },
  {
    name: 'Teknologi & Digital',
    slug: 'teknologi-digital',
    description: 'Produk teknologi, software, dan layanan digital',
    icon: '📱',
    color: 'blue',
    sortOrder: 4
  },
  {
    name: 'Kesehatan & Kecantikan',
    slug: 'kesehatan-kecantikan',
    description: 'Produk kesehatan, kecantikan, dan perawatan',
    icon: '🌿',
    color: 'emerald',
    sortOrder: 5
  },
  {
    name: 'Edukasi & Kursus',
    slug: 'edukasi-kursus',
    description: 'Layanan edukasi, kursus, dan pelatihan',
    icon: '📚',
    color: 'indigo',
    sortOrder: 6
  },
  {
    name: 'Jasa & Layanan',
    slug: 'jasa-layanan',
    description: 'Berbagai jasa dan layanan profesional',
    icon: '🔧',
    color: 'gray',
    sortOrder: 7
  },
  {
    name: 'Seni & Kreatif',
    slug: 'seni-kreatif',
    description: 'Karya seni, desain, dan produk kreatif',
    icon: '🎨',
    color: 'purple',
    sortOrder: 8
  },
  {
    name: 'Pertanian & Perkebunan',
    slug: 'pertanian-perkebunan',
    description: 'Produk pertanian, perkebunan, dan organik',
    icon: '🌱',
    color: 'lime',
    sortOrder: 9
  },
  {
    name: 'Lainnya',
    slug: 'lainnya',
    description: 'Kategori produk lainnya',
    icon: '📦',
    color: 'slate',
    sortOrder: 10
  }
];

async function setupUMKMDatabase() {
  try {
    console.log('🚀 Memulai setup database UMKM Alumni...');
    
    // 1. Cek apakah kategori sudah ada
    const existingCategories = await prisma.productCategory.count();
    
    if (existingCategories > 0) {
      console.log(`✅ Kategori produk sudah ada (${existingCategories} kategori)`);
    } else {
      // 2. Seed kategori produk default
      console.log('📦 Membuat kategori produk default...');
      
      for (const category of defaultCategories) {
        await prisma.productCategory.create({
          data: category
        });
        console.log(`   ✓ Kategori "${category.name}" berhasil dibuat`);
      }
      
      console.log(`✅ ${defaultCategories.length} kategori produk berhasil dibuat`);
    }
    
    // 3. Cek status alumni verified
    const verifiedAlumni = await prisma.alumni.count({
      where: {
        isVerified: true,
        status: 'VERIFIED'
      }
    });
    
    console.log(`👥 Alumni terverifikasi: ${verifiedAlumni} orang`);
    
    // 4. Cek produk yang sudah ada
    const existingProducts = await prisma.product.count();
    console.log(`📦 Produk yang sudah ada: ${existingProducts} produk`);
    
    console.log('\n🎉 Setup database UMKM Alumni selesai!');
    console.log('\n📋 Langkah selanjutnya:');
    console.log('   1. Buat API endpoints untuk CRUD produk');
    console.log('   2. Buat halaman frontend untuk katalog UMKM');
    console.log('   3. Buat dashboard alumni untuk kelola produk');
    
  } catch (error) {
    console.error('❌ Error setup database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan setup jika file dieksekusi langsung
if (require.main === module) {
  setupUMKMDatabase()
    .then(() => {
      console.log('✅ Setup selesai!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup gagal:', error);
      process.exit(1);
    });
}

module.exports = { setupUMKMDatabase, defaultCategories };