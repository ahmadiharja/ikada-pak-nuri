import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Data kategori produk dengan struktur hierarki seperti marketplace umum
const categories = [
  // 1. ELEKTRONIK
  {
    name: 'Elektronik',
    slug: 'elektronik',
    description: 'Produk elektronik dan gadget',
    icon: '📱',
    color: 'blue',
    level: 0,
    sortOrder: 1,
    children: [
      {
        name: 'Handphone & Tablet',
        slug: 'handphone-tablet',
        description: 'Smartphone, tablet, dan aksesoris',
        icon: '📱',
        color: 'blue',
        level: 1,
        sortOrder: 1,
        children: [
          { name: 'Smartphone', slug: 'smartphone', level: 2, sortOrder: 1 },
          { name: 'Tablet', slug: 'tablet', level: 2, sortOrder: 2 },
          { name: 'Aksesoris HP', slug: 'aksesoris-hp', level: 2, sortOrder: 3 },
          { name: 'Powerbank', slug: 'powerbank', level: 2, sortOrder: 4 }
        ]
      },
      {
        name: 'Komputer & Laptop',
        slug: 'komputer-laptop',
        description: 'Laptop, PC, dan aksesoris komputer',
        icon: '💻',
        color: 'blue',
        level: 1,
        sortOrder: 2,
        children: [
          { name: 'Laptop', slug: 'laptop', level: 2, sortOrder: 1 },
          { name: 'PC Desktop', slug: 'pc-desktop', level: 2, sortOrder: 2 },
          { name: 'Monitor', slug: 'monitor', level: 2, sortOrder: 3 },
          { name: 'Aksesoris Komputer', slug: 'aksesoris-komputer', level: 2, sortOrder: 4 }
        ]
      },
      {
        name: 'Audio',
        slug: 'audio',
        description: 'Headphone, speaker, dan audio equipment',
        icon: '🎧',
        color: 'blue',
        level: 1,
        sortOrder: 3,
        children: [
          { name: 'Headphone & Earphone', slug: 'headphone-earphone', level: 2, sortOrder: 1 },
          { name: 'Speaker', slug: 'speaker', level: 2, sortOrder: 2 },
          { name: 'Audio Professional', slug: 'audio-professional', level: 2, sortOrder: 3 }
        ]
      }
    ]
  },

  // 2. FASHION
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Pakaian dan aksesoris fashion',
    icon: '👕',
    color: 'pink',
    level: 0,
    sortOrder: 2,
    children: [
      {
        name: 'Pakaian Pria',
        slug: 'pakaian-pria',
        description: 'Fashion pria',
        icon: '👔',
        color: 'pink',
        level: 1,
        sortOrder: 1,
        children: [
          { name: 'Kemeja', slug: 'kemeja-pria', level: 2, sortOrder: 1 },
          { name: 'Kaos', slug: 'kaos-pria', level: 2, sortOrder: 2 },
          { name: 'Celana', slug: 'celana-pria', level: 2, sortOrder: 3 },
          { name: 'Jaket & Outerwear', slug: 'jaket-pria', level: 2, sortOrder: 4 }
        ]
      },
      {
        name: 'Pakaian Wanita',
        slug: 'pakaian-wanita',
        description: 'Fashion wanita',
        icon: '👗',
        color: 'pink',
        level: 1,
        sortOrder: 2,
        children: [
          { name: 'Blouse & Kemeja', slug: 'blouse-kemeja', level: 2, sortOrder: 1 },
          { name: 'Dress', slug: 'dress', level: 2, sortOrder: 2 },
          { name: 'Rok', slug: 'rok', level: 2, sortOrder: 3 },
          { name: 'Celana Wanita', slug: 'celana-wanita', level: 2, sortOrder: 4 }
        ]
      },
      {
        name: 'Sepatu',
        slug: 'sepatu',
        description: 'Sepatu pria dan wanita',
        icon: '👟',
        color: 'pink',
        level: 1,
        sortOrder: 3,
        children: [
          { name: 'Sepatu Sneakers', slug: 'sepatu-sneakers', level: 2, sortOrder: 1 },
          { name: 'Sepatu Formal', slug: 'sepatu-formal', level: 2, sortOrder: 2 },
          { name: 'Sandal', slug: 'sandal', level: 2, sortOrder: 3 },
          { name: 'Sepatu Olahraga', slug: 'sepatu-olahraga', level: 2, sortOrder: 4 }
        ]
      }
    ]
  },

  // 3. MAKANAN & MINUMAN
  {
    name: 'Makanan & Minuman',
    slug: 'makanan-minuman',
    description: 'Produk makanan dan minuman',
    icon: '🍕',
    color: 'orange',
    level: 0,
    sortOrder: 3,
    children: [
      {
        name: 'Makanan Siap Saji',
        slug: 'makanan-siap-saji',
        description: 'Makanan yang siap dikonsumsi',
        icon: '🍔',
        color: 'orange',
        level: 1,
        sortOrder: 1,
        children: [
          { name: 'Frozen Food', slug: 'frozen-food', level: 2, sortOrder: 1 },
          { name: 'Snack & Camilan', slug: 'snack-camilan', level: 2, sortOrder: 2 },
          { name: 'Makanan Tradisional', slug: 'makanan-tradisional', level: 2, sortOrder: 3 }
        ]
      },
      {
        name: 'Minuman',
        slug: 'minuman',
        description: 'Berbagai jenis minuman',
        icon: '🥤',
        color: 'orange',
        level: 1,
        sortOrder: 2,
        children: [
          { name: 'Kopi', slug: 'kopi', level: 2, sortOrder: 1 },
          { name: 'Teh', slug: 'teh', level: 2, sortOrder: 2 },
          { name: 'Jus & Smoothie', slug: 'jus-smoothie', level: 2, sortOrder: 3 },
          { name: 'Minuman Tradisional', slug: 'minuman-tradisional', level: 2, sortOrder: 4 }
        ]
      },
      {
        name: 'Bahan Makanan',
        slug: 'bahan-makanan',
        description: 'Bahan-bahan untuk memasak',
        icon: '🌾',
        color: 'orange',
        level: 1,
        sortOrder: 3,
        children: [
          { name: 'Bumbu & Rempah', slug: 'bumbu-rempah', level: 2, sortOrder: 1 },
          { name: 'Beras & Serealia', slug: 'beras-serealia', level: 2, sortOrder: 2 },
          { name: 'Minyak & Saus', slug: 'minyak-saus', level: 2, sortOrder: 3 }
        ]
      }
    ]
  },

  // 4. KESEHATAN & KECANTIKAN
  {
    name: 'Kesehatan & Kecantikan',
    slug: 'kesehatan-kecantikan',
    description: 'Produk kesehatan dan kecantikan',
    icon: '💄',
    color: 'purple',
    level: 0,
    sortOrder: 4,
    children: [
      {
        name: 'Skincare',
        slug: 'skincare',
        description: 'Perawatan kulit',
        icon: '🧴',
        color: 'purple',
        level: 1,
        sortOrder: 1,
        children: [
          { name: 'Facial Wash', slug: 'facial-wash', level: 2, sortOrder: 1 },
          { name: 'Moisturizer', slug: 'moisturizer', level: 2, sortOrder: 2 },
          { name: 'Serum', slug: 'serum', level: 2, sortOrder: 3 },
          { name: 'Sunscreen', slug: 'sunscreen', level: 2, sortOrder: 4 }
        ]
      },
      {
        name: 'Makeup',
        slug: 'makeup',
        description: 'Produk makeup dan kosmetik',
        icon: '💄',
        color: 'purple',
        level: 1,
        sortOrder: 2,
        children: [
          { name: 'Foundation', slug: 'foundation', level: 2, sortOrder: 1 },
          { name: 'Lipstick', slug: 'lipstick', level: 2, sortOrder: 2 },
          { name: 'Eyeshadow', slug: 'eyeshadow', level: 2, sortOrder: 3 },
          { name: 'Mascara', slug: 'mascara', level: 2, sortOrder: 4 }
        ]
      },
      {
        name: 'Suplemen & Vitamin',
        slug: 'suplemen-vitamin',
        description: 'Suplemen kesehatan dan vitamin',
        icon: '💊',
        color: 'purple',
        level: 1,
        sortOrder: 3,
        children: [
          { name: 'Vitamin', slug: 'vitamin', level: 2, sortOrder: 1 },
          { name: 'Suplemen Herbal', slug: 'suplemen-herbal', level: 2, sortOrder: 2 },
          { name: 'Protein & Fitness', slug: 'protein-fitness', level: 2, sortOrder: 3 }
        ]
      }
    ]
  },

  // 5. RUMAH TANGGA
  {
    name: 'Rumah Tangga',
    slug: 'rumah-tangga',
    description: 'Peralatan dan perlengkapan rumah tangga',
    icon: '🏠',
    color: 'green',
    level: 0,
    sortOrder: 5,
    children: [
      {
        name: 'Peralatan Dapur',
        slug: 'peralatan-dapur',
        description: 'Peralatan untuk memasak dan dapur',
        icon: '🍳',
        color: 'green',
        level: 1,
        sortOrder: 1,
        children: [
          { name: 'Panci & Wajan', slug: 'panci-wajan', level: 2, sortOrder: 1 },
          { name: 'Pisau & Cutting Board', slug: 'pisau-cutting-board', level: 2, sortOrder: 2 },
          { name: 'Peralatan Makan', slug: 'peralatan-makan', level: 2, sortOrder: 3 },
          { name: 'Storage & Container', slug: 'storage-container', level: 2, sortOrder: 4 }
        ]
      },
      {
        name: 'Dekorasi & Furniture',
        slug: 'dekorasi-furniture',
        description: 'Dekorasi dan furniture rumah',
        icon: '🪑',
        color: 'green',
        level: 1,
        sortOrder: 2,
        children: [
          { name: 'Kursi & Meja', slug: 'kursi-meja', level: 2, sortOrder: 1 },
          { name: 'Lemari & Rak', slug: 'lemari-rak', level: 2, sortOrder: 2 },
          { name: 'Hiasan Dinding', slug: 'hiasan-dinding', level: 2, sortOrder: 3 },
          { name: 'Tanaman Hias', slug: 'tanaman-hias', level: 2, sortOrder: 4 }
        ]
      },
      {
        name: 'Cleaning & Laundry',
        slug: 'cleaning-laundry',
        description: 'Produk pembersih dan laundry',
        icon: '🧽',
        color: 'green',
        level: 1,
        sortOrder: 3,
        children: [
          { name: 'Deterjen & Sabun', slug: 'deterjen-sabun', level: 2, sortOrder: 1 },
          { name: 'Pembersih Lantai', slug: 'pembersih-lantai', level: 2, sortOrder: 2 },
          { name: 'Alat Kebersihan', slug: 'alat-kebersihan', level: 2, sortOrder: 3 }
        ]
      }
    ]
  },

  // 6. HOBI & KOLEKSI
  {
    name: 'Hobi & Koleksi',
    slug: 'hobi-koleksi',
    description: 'Produk untuk hobi dan koleksi',
    icon: '🎨',
    color: 'indigo',
    level: 0,
    sortOrder: 6,
    children: [
      {
        name: 'Kerajinan Tangan',
        slug: 'kerajinan-tangan',
        description: 'Produk kerajinan tangan dan handmade',
        icon: '✂️',
        color: 'indigo',
        level: 1,
        sortOrder: 1,
        children: [
          { name: 'Rajutan & Crochet', slug: 'rajutan-crochet', level: 2, sortOrder: 1 },
          { name: 'Lukisan & Kaligrafi', slug: 'lukisan-kaligrafi', level: 2, sortOrder: 2 },
          { name: 'Keramik & Pottery', slug: 'keramik-pottery', level: 2, sortOrder: 3 },
          { name: 'Aksesoris Handmade', slug: 'aksesoris-handmade', level: 2, sortOrder: 4 }
        ]
      },
      {
        name: 'Buku & Alat Tulis',
        slug: 'buku-alat-tulis',
        description: 'Buku dan alat tulis',
        icon: '📚',
        color: 'indigo',
        level: 1,
        sortOrder: 2,
        children: [
          { name: 'Buku Agama', slug: 'buku-agama', level: 2, sortOrder: 1 },
          { name: 'Buku Pendidikan', slug: 'buku-pendidikan', level: 2, sortOrder: 2 },
          { name: 'Novel & Fiksi', slug: 'novel-fiksi', level: 2, sortOrder: 3 },
          { name: 'Alat Tulis', slug: 'alat-tulis', level: 2, sortOrder: 4 }
        ]
      },
      {
        name: 'Olahraga',
        slug: 'olahraga',
        description: 'Peralatan dan perlengkapan olahraga',
        icon: '⚽',
        color: 'indigo',
        level: 1,
        sortOrder: 3,
        children: [
          { name: 'Fitness & Gym', slug: 'fitness-gym', level: 2, sortOrder: 1 },
          { name: 'Sepak Bola', slug: 'sepak-bola', level: 2, sortOrder: 2 },
          { name: 'Badminton', slug: 'badminton', level: 2, sortOrder: 3 },
          { name: 'Outdoor & Adventure', slug: 'outdoor-adventure', level: 2, sortOrder: 4 }
        ]
      }
    ]
  }
];

async function createCategoryHierarchy(categoryData, parentId = null, parentPath = '') {
  const { children, ...categoryInfo } = categoryData;
  
  // Generate path
  const currentPath = parentPath ? `${parentPath}/${categoryInfo.slug}` : categoryInfo.slug;
  
  // Create category
  const category = await prisma.productCategory.create({
    data: {
      ...categoryInfo,
      parentId,
      path: currentPath
    }
  });
  
  console.log(`✅ Created category: ${category.name} (Level ${category.level})`);
  
  // Create children if any
  if (children && children.length > 0) {
    for (const child of children) {
      await createCategoryHierarchy(child, category.id, currentPath);
    }
  }
  
  return category;
}

async function seedProductCategories() {
  try {
    console.log('🌱 Starting to seed product categories...');
    
    // Check if categories already exist
    const existingCount = await prisma.productCategory.count();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing categories. Skipping seed.`);
      console.log('💡 If you want to reseed, please delete existing categories first.');
      return;
    }
    
    // Create all categories
    for (const category of categories) {
      await createCategoryHierarchy(category);
    }
    
    // Get final count
    const totalCount = await prisma.productCategory.count();
    console.log(`\n🎉 Successfully created ${totalCount} product categories!`);
    
    // Show hierarchy
    console.log('\n📋 Category Hierarchy:');
    const rootCategories = await prisma.productCategory.findMany({
      where: { level: 0 },
      include: {
        children: {
          include: {
            children: true
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });
    
    rootCategories.forEach(root => {
      console.log(`📁 ${root.name} (${root.children.length} subcategories)`);
      root.children.forEach(sub => {
        console.log(`  📂 ${sub.name} (${sub.children.length} sub-subcategories)`);
        sub.children.forEach(subsub => {
          console.log(`    📄 ${subsub.name}`);
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Error seeding product categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedProductCategories();