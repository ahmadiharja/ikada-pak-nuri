/**
 * Script untuk seeding kategori produk lengkap dengan struktur hierarkis
 * Berdasarkan kategori marketplace populer di Indonesia
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Data kategori produk lengkap dengan struktur hierarkis
const categoryData = [
  {
    name: 'Fashion & Kecantikan',
    slug: 'fashion-kecantikan',
    description: 'Produk fashion dan kecantikan untuk pria dan wanita',
    icon: '👗',
    color: '#EC4899',
    children: [
      {
        name: 'Pakaian Wanita',
        slug: 'pakaian-wanita',
        icon: '👚',
        children: [
          { name: 'Atasan', slug: 'atasan-wanita', icon: '👕' },
          { name: 'Bawahan', slug: 'bawahan-wanita', icon: '👖' },
          { name: 'Dress', slug: 'dress', icon: '👗' },
          { name: 'Outer', slug: 'outer-wanita', icon: '🧥' },
          { name: 'Lingerie', slug: 'lingerie', icon: '👙' },
          { name: 'Pakaian Tidur', slug: 'pakaian-tidur-wanita', icon: '🥱' }
        ]
      },
      {
        name: 'Pakaian Pria',
        slug: 'pakaian-pria',
        icon: '👔',
        children: [
          { name: 'Kemeja', slug: 'kemeja', icon: '👔' },
          { name: 'Kaos', slug: 'kaos-pria', icon: '👕' },
          { name: 'Celana', slug: 'celana-pria', icon: '👖' },
          { name: 'Jaket', slug: 'jaket-pria', icon: '🧥' },
          { name: 'Jas & Blazer', slug: 'jas-blazer', icon: '🤵' },
          { name: 'Pakaian Dalam', slug: 'pakaian-dalam-pria', icon: '🩲' }
        ]
      },
      {
        name: 'Sepatu',
        slug: 'sepatu',
        icon: '👟',
        children: [
          { name: 'Sepatu Sneakers', slug: 'sepatu-sneakers', icon: '👟' },
          { name: 'Sepatu Formal', slug: 'sepatu-formal', icon: '👞' },
          { name: 'Sepatu Heels', slug: 'sepatu-heels', icon: '👠' },
          { name: 'Sandal', slug: 'sandal', icon: '🩴' },
          { name: 'Sepatu Olahraga', slug: 'sepatu-olahraga', icon: '⚽' }
        ]
      },
      {
        name: 'Tas & Dompet',
        slug: 'tas-dompet',
        icon: '👜',
        children: [
          { name: 'Tas Wanita', slug: 'tas-wanita', icon: '👜' },
          { name: 'Tas Pria', slug: 'tas-pria', icon: '🎒' },
          { name: 'Dompet', slug: 'dompet', icon: '👛' },
          { name: 'Koper', slug: 'koper', icon: '🧳' }
        ]
      },
      {
        name: 'Kecantikan',
        slug: 'kecantikan',
        icon: '💄',
        children: [
          { name: 'Makeup', slug: 'makeup', icon: '💄' },
          { name: 'Skincare', slug: 'skincare', icon: '🧴' },
          { name: 'Parfum', slug: 'parfum', icon: '🌸' },
          { name: 'Perawatan Rambut', slug: 'perawatan-rambut', icon: '💇' }
        ]
      },
      {
        name: 'Aksesoris',
        slug: 'aksesoris-fashion',
        icon: '💍',
        children: [
          { name: 'Jam Tangan', slug: 'jam-tangan', icon: '⌚' },
          { name: 'Perhiasan', slug: 'perhiasan', icon: '💍' },
          { name: 'Kacamata', slug: 'kacamata', icon: '🕶️' },
          { name: 'Topi', slug: 'topi', icon: '🧢' }
        ]
      }
    ]
  },
  {
    name: 'Elektronik & Gadget',
    slug: 'elektronik-gadget',
    description: 'Perangkat elektronik dan gadget terkini',
    icon: '📱',
    color: '#3B82F6',
    children: [
      {
        name: 'Smartphone & Tablet',
        slug: 'smartphone-tablet',
        icon: '📱',
        children: [
          { name: 'Smartphone Android', slug: 'smartphone-android', icon: '📱' },
          { name: 'iPhone', slug: 'iphone', icon: '📱' },
          { name: 'Tablet', slug: 'tablet', icon: '📱' },
          { name: 'Aksesoris HP', slug: 'aksesoris-hp', icon: '🔌' }
        ]
      },
      {
        name: 'Komputer & Laptop',
        slug: 'komputer-laptop',
        icon: '💻',
        children: [
          { name: 'Laptop', slug: 'laptop', icon: '💻' },
          { name: 'PC Desktop', slug: 'pc-desktop', icon: '🖥️' },
          { name: 'Aksesoris Komputer', slug: 'aksesoris-komputer', icon: '⌨️' },
          { name: 'Software', slug: 'software', icon: '💿' }
        ]
      },
      {
        name: 'Audio & Video',
        slug: 'audio-video',
        icon: '🎧',
        children: [
          { name: 'Headphone & Earphone', slug: 'headphone-earphone', icon: '🎧' },
          { name: 'Speaker', slug: 'speaker', icon: '🔊' },
          { name: 'TV & Monitor', slug: 'tv-monitor', icon: '📺' },
          { name: 'Kamera', slug: 'kamera', icon: '📷' }
        ]
      },
      {
        name: 'Gaming',
        slug: 'gaming',
        icon: '🎮',
        children: [
          { name: 'Console Game', slug: 'console-game', icon: '🎮' },
          { name: 'Game PC', slug: 'game-pc', icon: '🖥️' },
          { name: 'Aksesoris Gaming', slug: 'aksesoris-gaming', icon: '🕹️' }
        ]
      }
    ]
  },
  {
    name: 'Makanan & Minuman',
    slug: 'makanan-minuman',
    description: 'Produk makanan dan minuman segar dan olahan',
    icon: '🍕',
    color: '#F59E0B',
    children: [
      {
        name: 'Makanan Siap Saji',
        slug: 'makanan-siap-saji',
        icon: '🍕',
        children: [
          { name: 'Frozen Food', slug: 'frozen-food', icon: '🥶' },
          { name: 'Makanan Instan', slug: 'makanan-instan', icon: '🍜' },
          { name: 'Snack & Camilan', slug: 'snack-camilan', icon: '🍿' }
        ]
      },
      {
        name: 'Bahan Makanan',
        slug: 'bahan-makanan',
        icon: '🌾',
        children: [
          { name: 'Beras & Serealia', slug: 'beras-serealia', icon: '🌾' },
          { name: 'Bumbu & Rempah', slug: 'bumbu-rempah', icon: '🌶️' },
          { name: 'Minyak & Saus', slug: 'minyak-saus', icon: '🫗' },
          { name: 'Daging & Seafood', slug: 'daging-seafood', icon: '🥩' }
        ]
      },
      {
        name: 'Minuman',
        slug: 'minuman',
        icon: '🥤',
        children: [
          { name: 'Minuman Ringan', slug: 'minuman-ringan', icon: '🥤' },
          { name: 'Kopi & Teh', slug: 'kopi-teh', icon: '☕' },
          { name: 'Jus & Smoothie', slug: 'jus-smoothie', icon: '🧃' },
          { name: 'Air Mineral', slug: 'air-mineral', icon: '💧' }
        ]
      },
      {
        name: 'Kue & Dessert',
        slug: 'kue-dessert',
        icon: '🍰',
        children: [
          { name: 'Kue Tradisional', slug: 'kue-tradisional', icon: '🥮' },
          { name: 'Kue Modern', slug: 'kue-modern', icon: '🍰' },
          { name: 'Cokelat & Permen', slug: 'cokelat-permen', icon: '🍫' }
        ]
      }
    ]
  },
  {
    name: 'Rumah Tangga & Furniture',
    slug: 'rumah-tangga-furniture',
    description: 'Peralatan rumah tangga dan furniture',
    icon: '🏠',
    color: '#10B981',
    children: [
      {
        name: 'Furniture',
        slug: 'furniture',
        icon: '🪑',
        children: [
          { name: 'Kursi & Sofa', slug: 'kursi-sofa', icon: '🪑' },
          { name: 'Meja', slug: 'meja', icon: '🪑' },
          { name: 'Lemari', slug: 'lemari', icon: '🗄️' },
          { name: 'Tempat Tidur', slug: 'tempat-tidur', icon: '🛏️' }
        ]
      },
      {
        name: 'Peralatan Dapur',
        slug: 'peralatan-dapur',
        icon: '🍳',
        children: [
          { name: 'Alat Masak', slug: 'alat-masak', icon: '🍳' },
          { name: 'Peralatan Makan', slug: 'peralatan-makan', icon: '🍽️' },
          { name: 'Elektronik Dapur', slug: 'elektronik-dapur', icon: '🔌' },
          { name: 'Penyimpanan Makanan', slug: 'penyimpanan-makanan', icon: '🥡' }
        ]
      },
      {
        name: 'Dekorasi & Hiasan',
        slug: 'dekorasi-hiasan',
        icon: '🖼️',
        children: [
          { name: 'Hiasan Dinding', slug: 'hiasan-dinding', icon: '🖼️' },
          { name: 'Tanaman Hias', slug: 'tanaman-hias', icon: '🪴' },
          { name: 'Lampu Hias', slug: 'lampu-hias', icon: '💡' },
          { name: 'Karpet & Tikar', slug: 'karpet-tikar', icon: '🧽' }
        ]
      },
      {
        name: 'Peralatan Kebersihan',
        slug: 'peralatan-kebersihan',
        icon: '🧹',
        children: [
          { name: 'Alat Kebersihan', slug: 'alat-kebersihan', icon: '🧹' },
          { name: 'Produk Pembersih', slug: 'produk-pembersih', icon: '🧴' },
          { name: 'Laundry', slug: 'laundry', icon: '👕' }
        ]
      }
    ]
  },
  {
    name: 'Kesehatan & Kecantikan',
    slug: 'kesehatan-kecantikan',
    description: 'Produk kesehatan dan perawatan tubuh',
    icon: '💊',
    color: '#EF4444',
    children: [
      {
        name: 'Obat & Vitamin',
        slug: 'obat-vitamin',
        icon: '💊',
        children: [
          { name: 'Obat Bebas', slug: 'obat-bebas', icon: '💊' },
          { name: 'Vitamin & Suplemen', slug: 'vitamin-suplemen', icon: '💊' },
          { name: 'Herbal & Tradisional', slug: 'herbal-tradisional', icon: '🌿' }
        ]
      },
      {
        name: 'Perawatan Tubuh',
        slug: 'perawatan-tubuh',
        icon: '🧴',
        children: [
          { name: 'Sabun & Body Wash', slug: 'sabun-body-wash', icon: '🧼' },
          { name: 'Lotion & Moisturizer', slug: 'lotion-moisturizer', icon: '🧴' },
          { name: 'Deodorant', slug: 'deodorant', icon: '🧴' }
        ]
      },
      {
        name: 'Perawatan Gigi',
        slug: 'perawatan-gigi',
        icon: '🦷',
        children: [
          { name: 'Sikat Gigi', slug: 'sikat-gigi', icon: '🪥' },
          { name: 'Pasta Gigi', slug: 'pasta-gigi', icon: '🧴' },
          { name: 'Obat Kumur', slug: 'obat-kumur', icon: '🧴' }
        ]
      }
    ]
  },
  {
    name: 'Olahraga & Outdoor',
    slug: 'olahraga-outdoor',
    description: 'Peralatan olahraga dan aktivitas outdoor',
    icon: '⚽',
    color: '#8B5CF6',
    children: [
      {
        name: 'Pakaian Olahraga',
        slug: 'pakaian-olahraga',
        icon: '👕',
        children: [
          { name: 'Jersey', slug: 'jersey', icon: '👕' },
          { name: 'Celana Olahraga', slug: 'celana-olahraga', icon: '🩳' },
          { name: 'Sepatu Olahraga', slug: 'sepatu-olahraga-kategori', icon: '👟' }
        ]
      },
      {
        name: 'Alat Olahraga',
        slug: 'alat-olahraga',
        icon: '🏋️',
        children: [
          { name: 'Fitness', slug: 'fitness', icon: '🏋️' },
          { name: 'Sepak Bola', slug: 'sepak-bola', icon: '⚽' },
          { name: 'Badminton', slug: 'badminton', icon: '🏸' },
          { name: 'Basket', slug: 'basket', icon: '🏀' }
        ]
      },
      {
        name: 'Outdoor & Camping',
        slug: 'outdoor-camping',
        icon: '⛺',
        children: [
          { name: 'Tenda', slug: 'tenda', icon: '⛺' },
          { name: 'Sleeping Bag', slug: 'sleeping-bag', icon: '🛌' },
          { name: 'Alat Hiking', slug: 'alat-hiking', icon: '🥾' }
        ]
      }
    ]
  },
  {
    name: 'Otomotif',
    slug: 'otomotif',
    description: 'Aksesoris dan spare part kendaraan',
    icon: '🚗',
    color: '#6B7280',
    children: [
      {
        name: 'Aksesoris Mobil',
        slug: 'aksesoris-mobil',
        icon: '🚗',
        children: [
          { name: 'Interior Mobil', slug: 'interior-mobil', icon: '🪑' },
          { name: 'Eksterior Mobil', slug: 'eksterior-mobil', icon: '🚗' },
          { name: 'Audio Mobil', slug: 'audio-mobil', icon: '🔊' }
        ]
      },
      {
        name: 'Aksesoris Motor',
        slug: 'aksesoris-motor',
        icon: '🏍️',
        children: [
          { name: 'Helm', slug: 'helm', icon: '🪖' },
          { name: 'Jaket Motor', slug: 'jaket-motor', icon: '🧥' },
          { name: 'Spare Part Motor', slug: 'spare-part-motor', icon: '🔧' }
        ]
      }
    ]
  },
  {
    name: 'Hobi & Koleksi',
    slug: 'hobi-koleksi',
    description: 'Barang hobi dan koleksi',
    icon: '🎨',
    color: '#F97316',
    children: [
      {
        name: 'Seni & Kerajinan',
        slug: 'seni-kerajinan',
        icon: '🎨',
        children: [
          { name: 'Alat Lukis', slug: 'alat-lukis', icon: '🖌️' },
          { name: 'Kerajinan Tangan', slug: 'kerajinan-tangan', icon: '✂️' },
          { name: 'Origami', slug: 'origami', icon: '📄' }
        ]
      },
      {
        name: 'Koleksi',
        slug: 'koleksi',
        icon: '🏆',
        children: [
          { name: 'Action Figure', slug: 'action-figure', icon: '🤖' },
          { name: 'Kartu Koleksi', slug: 'kartu-koleksi', icon: '🃏' },
          { name: 'Miniatur', slug: 'miniatur', icon: '🏠' }
        ]
      },
      {
        name: 'Musik',
        slug: 'musik',
        icon: '🎵',
        children: [
          { name: 'Alat Musik', slug: 'alat-musik', icon: '🎸' },
          { name: 'Aksesoris Musik', slug: 'aksesoris-musik', icon: '🎼' }
        ]
      }
    ]
  },
  {
    name: 'Buku & Edukasi',
    slug: 'buku-edukasi',
    description: 'Buku dan materi edukasi',
    icon: '📚',
    color: '#059669',
    children: [
      {
        name: 'Buku',
        slug: 'buku',
        icon: '📖',
        children: [
          { name: 'Buku Fiksi', slug: 'buku-fiksi', icon: '📖' },
          { name: 'Buku Non-Fiksi', slug: 'buku-non-fiksi', icon: '📚' },
          { name: 'Buku Anak', slug: 'buku-anak', icon: '📚' },
          { name: 'Buku Pelajaran', slug: 'buku-pelajaran', icon: '📖' }
        ]
      },
      {
        name: 'Alat Tulis',
        slug: 'alat-tulis',
        icon: '✏️',
        children: [
          { name: 'Pulpen & Pensil', slug: 'pulpen-pensil', icon: '✏️' },
          { name: 'Buku Tulis', slug: 'buku-tulis', icon: '📓' },
          { name: 'Alat Gambar', slug: 'alat-gambar', icon: '🖍️' }
        ]
      }
    ]
  },
  {
    name: 'Bayi & Anak',
    slug: 'bayi-anak',
    description: 'Produk untuk bayi dan anak-anak',
    icon: '👶',
    color: '#EC4899',
    children: [
      {
        name: 'Pakaian Bayi',
        slug: 'pakaian-bayi',
        icon: '👶',
        children: [
          { name: 'Baju Bayi', slug: 'baju-bayi', icon: '👕' },
          { name: 'Celana Bayi', slug: 'celana-bayi', icon: '👖' },
          { name: 'Popok', slug: 'popok', icon: '👶' }
        ]
      },
      {
        name: 'Mainan Anak',
        slug: 'mainan-anak',
        icon: '🧸',
        children: [
          { name: 'Boneka', slug: 'boneka', icon: '🧸' },
          { name: 'Mainan Edukasi', slug: 'mainan-edukasi', icon: '🧩' },
          { name: 'Puzzle', slug: 'puzzle', icon: '🧩' }
        ]
      },
      {
        name: 'Perawatan Bayi',
        slug: 'perawatan-bayi',
        icon: '🍼',
        children: [
          { name: 'Susu Formula', slug: 'susu-formula', icon: '🍼' },
          { name: 'Peralatan Makan Bayi', slug: 'peralatan-makan-bayi', icon: '🥄' },
          { name: 'Produk Mandi Bayi', slug: 'produk-mandi-bayi', icon: '🛁' }
        ]
      }
    ]
  }
];

// Fungsi untuk generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Fungsi untuk generate path hierarki
function generatePath(parentPath, slug) {
  return parentPath ? `${parentPath}/${slug}` : slug;
}

// Fungsi untuk membuat kategori secara rekursif
async function createCategory(categoryData, parentId = null, level = 0, parentPath = '') {
  let slug = categoryData.slug || generateSlug(categoryData.name);
  
  // Cek apakah kategori sudah ada berdasarkan nama dan parent
  const existingCategory = await prisma.productCategory.findFirst({
    where: {
      name: categoryData.name,
      parentId: parentId
    }
  });

  if (existingCategory) {
    console.log(`   ⚠️  Kategori "${categoryData.name}" sudah ada, dilewati`);
    return existingCategory;
  }

  // Pastikan slug unik secara global
  let counter = 1;
  let originalSlug = slug;
  while (await prisma.productCategory.findUnique({ where: { slug } })) {
    slug = `${originalSlug}-${counter}`;
    counter++;
  }
  
  const path = generatePath(parentPath, slug);

  // Buat kategori baru
  const category = await prisma.productCategory.create({
    data: {
      name: categoryData.name,
      slug: slug,
      description: categoryData.description || null,
      icon: categoryData.icon || null,
      color: categoryData.color || '#3B82F6',
      level: level,
      parentId: parentId,
      path: path,
      sortOrder: categoryData.sortOrder || 0
    }
  });

  console.log(`   ✓ Kategori "${categoryData.name}" berhasil dibuat (Level ${level})`);

  // Buat sub-kategori jika ada
  if (categoryData.children && categoryData.children.length > 0) {
    for (let i = 0; i < categoryData.children.length; i++) {
      const childData = {
        ...categoryData.children[i],
        sortOrder: i
      };
      await createCategory(childData, category.id, level + 1, path);
    }
  }

  return category;
}

// Fungsi utama untuk seeding
async function seedProductCategories() {
  try {
    console.log('🚀 Memulai seeding kategori produk...');
    
    // Cek apakah sudah ada kategori
    const existingCount = await prisma.productCategory.count();
    
    if (existingCount > 0) {
      console.log(`⚠️  Ditemukan ${existingCount} kategori yang sudah ada`);
      console.log('   Proses akan melanjutkan dan melewati kategori yang sudah ada');
    }

    // Proses setiap kategori utama
    for (let i = 0; i < categoryData.length; i++) {
      const mainCategoryData = {
        ...categoryData[i],
        sortOrder: i
      };
      
      console.log(`\n📦 Memproses kategori utama: ${mainCategoryData.name}`);
      await createCategory(mainCategoryData);
    }

    // Hitung total kategori yang berhasil dibuat
    const totalCategories = await prisma.productCategory.count();
    const newCategories = totalCategories - existingCount;
    
    console.log('\n✅ Seeding kategori produk selesai!');
    console.log(`📊 Total kategori: ${totalCategories}`);
    console.log(`🆕 Kategori baru: ${newCategories}`);
    
    // Tampilkan struktur kategori
    console.log('\n📋 Struktur kategori yang berhasil dibuat:');
    const rootCategories = await prisma.productCategory.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true
              }
            }
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });
    
    rootCategories.forEach(category => {
      console.log(`\n🏷️  ${category.name} (${category.children.length} sub-kategori)`);
      category.children.forEach(subCategory => {
        console.log(`   └── ${subCategory.name} (${subCategory.children.length} sub-sub-kategori)`);
        subCategory.children.forEach(subSubCategory => {
          console.log(`       └── ${subSubCategory.name}`);
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Error saat seeding kategori produk:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan script jika dipanggil langsung
if (require.main === module) {
  seedProductCategories()
    .then(() => {
      console.log('\n🎉 Script seeding berhasil dijalankan!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script seeding gagal:', error);
      process.exit(1);
    });
}

module.exports = { seedProductCategories, categoryData };