const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Data dummy produk UMKM yang realistis untuk alumni
const productTemplates = [
  // Makanan & Minuman
  {
    name: "Keripik Singkong Renyah",
    shortDescription: "Keripik singkong buatan rumahan dengan rasa original dan pedas",
    description: "Keripik singkong premium yang dibuat dari singkong pilihan dengan bumbu rahasia keluarga. Tersedia dalam varian rasa original dan pedas. Cocok untuk camilan sehari-hari atau oleh-oleh khas daerah.",
    priceMin: 15000,
    priceMax: 25000,
    priceText: "Mulai dari 15rb",
    categoryName: "Makanan & Minuman",
    businessName: "Keripik Mama Sari",
    businessType: "Makanan Ringan",
    location: "Sukorame, Lamongan",
    tags: ["keripik", "singkong", "camilan", "oleh-oleh", "lamongan"],
    images: ["/products/keripik-singkong-1.jpg", "/products/keripik-singkong-2.jpg"],
    whatsappNumber: "6281234567890",
    instagramUrl: "https://instagram.com/keripik_mama_sari"
  },
  {
    name: "Sambal Pecel Khas Madiun",
    shortDescription: "Sambal pecel autentik dengan resep turun temurun",
    description: "Sambal pecel khas Madiun dengan cita rasa autentik yang telah diwariskan turun temurun. Dibuat dari kacang tanah pilihan dan bumbu rempah alami tanpa pengawet. Cocok untuk pecel, gado-gado, atau lalapan.",
    price: 12000,
    categoryName: "Makanan & Minuman",
    businessName: "Sambal Pecel Bu Tini",
    businessType: "Bumbu & Sambal",
    location: "Madiun, Jawa Timur",
    tags: ["sambal", "pecel", "madiun", "bumbu", "tradisional"],
    images: ["/products/sambal-pecel-1.jpg"],
    shopeeUrl: "https://shopee.co.id/sambal-pecel-bu-tini",
    whatsappNumber: "6281234567891"
  },
  {
    name: "Kopi Robusta Lampung Premium",
    shortDescription: "Kopi robusta asli Lampung dengan cita rasa khas",
    description: "Kopi robusta premium dari perkebunan Lampung dengan proses roasting yang sempurna. Memiliki aroma yang kuat dan rasa yang nikmat. Tersedia dalam kemasan 250gr dan 500gr.",
    priceMin: 35000,
    priceMax: 65000,
    categoryName: "Makanan & Minuman",
    businessName: "Kopi Lampung Asli",
    businessType: "Kopi & Minuman",
    location: "Bandar Lampung",
    tags: ["kopi", "robusta", "lampung", "premium", "roasting"],
    images: ["/products/kopi-robusta-1.jpg", "/products/kopi-robusta-2.jpg"],
    tokopediaUrl: "https://tokopedia.com/kopi-lampung-asli",
    whatsappNumber: "6281234567892",
    websiteUrl: "https://kopilampungasli.com"
  },

  // Fashion & Kecantikan
  {
    name: "Hijab Voal Premium",
    shortDescription: "Hijab voal import dengan kualitas premium dan nyaman dipakai",
    description: "Hijab voal premium dengan bahan import yang lembut dan adem. Tersedia dalam berbagai warna cantik dan motif yang elegan. Cocok untuk acara formal maupun casual.",
    priceMin: 45000,
    priceMax: 85000,
    categoryName: "Fashion & Kecantikan",
    businessName: "Hijab Cantik Collection",
    businessType: "Fashion Muslim",
    location: "Solo, Jawa Tengah",
    tags: ["hijab", "voal", "premium", "fashion", "muslim"],
    images: ["/products/hijab-voal-1.jpg", "/products/hijab-voal-2.jpg", "/products/hijab-voal-3.jpg"],
    shopeeUrl: "https://shopee.co.id/hijab-cantik-collection",
    tokopediaUrl: "https://tokopedia.com/hijab-cantik",
    instagramUrl: "https://instagram.com/hijab_cantik_collection",
    whatsappNumber: "6281234567893"
  },
  {
    name: "Tas Rajut Handmade",
    shortDescription: "Tas rajut buatan tangan dengan desain unik dan berkualitas",
    description: "Tas rajut handmade dengan desain unik dan menarik. Dibuat dengan benang berkualitas tinggi dan dikerjakan dengan teliti. Cocok untuk gaya casual dan hangout. Tersedia dalam berbagai warna dan ukuran.",
    priceMin: 75000,
    priceMax: 150000,
    categoryName: "Fashion & Kecantikan",
    businessName: "Rajut Kreatif Nusantara",
    businessType: "Kerajinan Tangan",
    location: "Yogyakarta",
    tags: ["tas", "rajut", "handmade", "unik", "kreatif"],
    images: ["/products/tas-rajut-1.jpg", "/products/tas-rajut-2.jpg"],
    shopeeUrl: "https://shopee.co.id/rajut-kreatif-nusantara",
    instagramUrl: "https://instagram.com/rajut_kreatif_nusantara",
    whatsappNumber: "6281234567894"
  },

  // Kerajinan Tangan
  {
    name: "Miniatur Kapal Pinisi",
    shortDescription: "Miniatur kapal pinisi khas Sulawesi dengan detail yang indah",
    description: "Miniatur kapal pinisi tradisional Sulawesi yang dibuat dengan detail yang sangat indah. Cocok untuk pajangan rumah, kantor, atau sebagai souvenir khas Indonesia. Dibuat dari kayu berkualitas dengan finishing yang rapi.",
    priceMin: 150000,
    priceMax: 500000,
    categoryName: "Kerajinan Tangan",
    businessName: "Pinisi Art Craft",
    businessType: "Kerajinan Kayu",
    location: "Makassar, Sulawesi Selatan",
    tags: ["miniatur", "pinisi", "kapal", "sulawesi", "kerajinan"],
    images: ["/products/miniatur-pinisi-1.jpg", "/products/miniatur-pinisi-2.jpg"],
    tokopediaUrl: "https://tokopedia.com/pinisi-art-craft",
    whatsappNumber: "6281234567895",
    shippingInfo: "Pengiriman ke seluruh Indonesia dengan packing aman"
  },
  {
    name: "Batik Tulis Jogja Premium",
    shortDescription: "Batik tulis asli Jogja dengan motif tradisional dan modern",
    description: "Batik tulis premium asli Jogja dengan motif tradisional dan kontemporer. Dibuat oleh pengrajin berpengalaman dengan pewarna alami. Tersedia dalam berbagai motif seperti parang, kawung, dan motif modern.",
    priceMin: 200000,
    priceMax: 800000,
    categoryName: "Kerajinan Tangan",
    businessName: "Batik Jogja Heritage",
    businessType: "Batik & Tekstil",
    location: "Yogyakarta",
    tags: ["batik", "tulis", "jogja", "premium", "tradisional"],
    images: ["/products/batik-tulis-1.jpg", "/products/batik-tulis-2.jpg", "/products/batik-tulis-3.jpg"],
    shopeeUrl: "https://shopee.co.id/batik-jogja-heritage",
    tokopediaUrl: "https://tokopedia.com/batik-jogja-heritage",
    instagramUrl: "https://instagram.com/batik_jogja_heritage",
    whatsappNumber: "6281234567896",
    websiteUrl: "https://batikjogjaheritage.com"
  },

  // Jasa & Layanan
  {
    name: "Jasa Desain Grafis & Logo",
    shortDescription: "Jasa desain grafis profesional untuk kebutuhan bisnis Anda",
    description: "Menyediakan jasa desain grafis profesional meliputi logo, brosur, banner, kartu nama, dan kebutuhan desain lainnya. Dengan pengalaman lebih dari 5 tahun dan portfolio yang beragam.",
    priceMin: 50000,
    priceMax: 500000,
    priceText: "Mulai dari 50rb",
    categoryName: "Jasa & Layanan",
    businessName: "Creative Design Studio",
    businessType: "Jasa Desain",
    location: "Jakarta",
    tags: ["desain", "grafis", "logo", "jasa", "kreatif"],
    images: ["/products/jasa-desain-1.jpg", "/products/jasa-desain-2.jpg"],
    whatsappNumber: "6281234567897",
    instagramUrl: "https://instagram.com/creative_design_studio",
    websiteUrl: "https://creativedesignstudio.com"
  },
  {
    name: "Les Privat Mengaji & Tahfidz",
    shortDescription: "Les privat mengaji dan tahfidz untuk anak-anak dan dewasa",
    description: "Menyediakan layanan les privat mengaji dan tahfidz dengan metode yang mudah dipahami. Pengajar berpengalaman dan bersertifikat. Tersedia untuk anak-anak maupun dewasa dengan jadwal yang fleksibel.",
    priceMin: 100000,
    priceMax: 300000,
    priceText: "100rb-300rb/bulan",
    categoryName: "Edukasi & Kursus",
    businessName: "Rumah Tahfidz Al-Hikmah",
    businessType: "Pendidikan Islam",
    location: "Depok, Jawa Barat",
    tags: ["mengaji", "tahfidz", "les", "privat", "islam"],
    images: ["/products/les-mengaji-1.jpg"],
    whatsappNumber: "6281234567898"
  },

  // Elektronik & Gadget
  {
    name: "Powerbank Solar 20000mAh",
    shortDescription: "Powerbank dengan panel solar untuk charging outdoor",
    description: "Powerbank kapasitas 20000mAh dengan panel solar yang cocok untuk aktivitas outdoor. Dilengkapi dengan LED flashlight dan tahan air. Dapat mengcharge smartphone hingga 6-8 kali.",
    price: 185000,
    categoryName: "Elektronik & Gadget",
    businessName: "Gadget Outdoor Pro",
    businessType: "Aksesoris Elektronik",
    location: "Bandung, Jawa Barat",
    tags: ["powerbank", "solar", "outdoor", "gadget", "charger"],
    images: ["/products/powerbank-solar-1.jpg", "/products/powerbank-solar-2.jpg"],
    shopeeUrl: "https://shopee.co.id/gadget-outdoor-pro",
    tokopediaUrl: "https://tokopedia.com/gadget-outdoor-pro",
    whatsappNumber: "6281234567899"
  }
];

async function generateProductDummies() {
  try {
    console.log('🚀 Memulai generate data dummy produk UMKM alumni...');
    
    // Ambil data alumni yang ada
    const alumni = await prisma.alumni.findMany({
      select: {
        id: true,
        fullName: true,
        provinsi: true,
        kabupaten: true
      }
    });
    
    if (alumni.length === 0) {
      console.log('❌ Tidak ada data alumni. Silakan buat data alumni terlebih dahulu.');
      return;
    }
    
    console.log(`📊 Ditemukan ${alumni.length} alumni`);
    
    // Ambil kategori yang ada
    const categories = await prisma.productCategory.findMany({
      select: {
        id: true,
        name: true
      }
    });
    
    if (categories.length === 0) {
      console.log('❌ Tidak ada kategori produk. Silakan buat kategori terlebih dahulu.');
      return;
    }
    
    console.log(`📂 Ditemukan ${categories.length} kategori produk`);
    
    // Hapus produk yang sudah ada (jika ada)
    const existingProducts = await prisma.product.count();
    if (existingProducts > 0) {
      console.log(`🗑️ Menghapus ${existingProducts} produk yang sudah ada...`);
      await prisma.product.deleteMany({});
    }
    
    let createdCount = 0;
    
    // Generate produk untuk setiap template
    for (const template of productTemplates) {
      // Cari kategori yang sesuai
      const category = categories.find(cat => 
        cat.name.toLowerCase().includes(template.categoryName.toLowerCase()) ||
        template.categoryName.toLowerCase().includes(cat.name.toLowerCase())
      );
      
      if (!category) {
        console.log(`⚠️ Kategori '${template.categoryName}' tidak ditemukan untuk produk '${template.name}'`);
        continue;
      }
      
      // Pilih alumni secara acak
      const randomAlumni = alumni[Math.floor(Math.random() * alumni.length)];
      
      // Generate slug unik
      const baseSlug = template.name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
      
      let slug = baseSlug;
      let counter = 1;
      
      // Pastikan slug unik
      while (await prisma.product.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      // Buat produk
      const productData = {
        name: template.name,
        slug: slug,
        description: template.description,
        shortDescription: template.shortDescription,
        price: template.price ? parseFloat(template.price.toString()) : null,
        priceMin: template.priceMin ? parseFloat(template.priceMin.toString()) : null,
        priceMax: template.priceMax ? parseFloat(template.priceMax.toString()) : null,
        priceText: template.priceText || null,
        categoryId: category.id,
        alumniId: randomAlumni.id,
        shopeeUrl: template.shopeeUrl || null,
        tokopediaUrl: template.tokopediaUrl || null,
        tiktokUrl: template.tiktokUrl || null,
        whatsappNumber: template.whatsappNumber || null,
        instagramUrl: template.instagramUrl || null,
        websiteUrl: template.websiteUrl || null,
        images: template.images || [],
        thumbnailImage: template.images && template.images.length > 0 ? template.images[0] : null,
        location: template.location || `${randomAlumni.kabupaten}, ${randomAlumni.provinsi}`,
        shippingInfo: template.shippingInfo || null,
        isActive: true,
        isApproved: true,
        isFeatured: Math.random() > 0.7, // 30% chance featured
        tags: template.tags || [],
        businessName: template.businessName || null,
        businessType: template.businessType || null,
        viewCount: Math.floor(Math.random() * 100),
        clickCount: Math.floor(Math.random() * 50)
      };
      
      const product = await prisma.product.create({
        data: productData
      });
      
      createdCount++;
      console.log(`✅ Produk '${product.name}' berhasil dibuat untuk alumni '${randomAlumni.fullName}'`);
    }
    
    console.log(`\n🎉 Berhasil membuat ${createdCount} produk UMKM dummy!`);
    
    // Tampilkan ringkasan
    const totalProducts = await prisma.product.count();
    const featuredProducts = await prisma.product.count({ where: { isFeatured: true } });
    
    console.log('\n📊 RINGKASAN:');
    console.log(`Total produk: ${totalProducts}`);
    console.log(`Produk featured: ${featuredProducts}`);
    console.log(`Alumni dengan produk: ${new Set(productTemplates.map(() => Math.floor(Math.random() * alumni.length))).size}`);
    
  } catch (error) {
    console.error('❌ Error saat generate produk dummy:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan script
generateProductDummies();