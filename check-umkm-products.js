const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUMKMProducts() {
  try {
    console.log('🔍 Memeriksa data produk UMKM alumni...');
    
    // Ambil semua produk dengan relasi
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        alumni: {
          select: {
            fullName: true,
            provinsi: true,
            kabupaten: true,
            email: true
          }
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
            reviewerName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`\n📊 TOTAL PRODUK: ${products.length}`);
    
    if (products.length === 0) {
      console.log('❌ Belum ada produk UMKM yang terdaftar.');
      return;
    }
    
    // Statistik umum
    const activeProducts = products.filter(p => p.isActive).length;
    const featuredProducts = products.filter(p => p.isFeatured).length;
    const approvedProducts = products.filter(p => p.isApproved).length;
    
    console.log(`\n📈 STATISTIK:`);
    console.log(`- Produk aktif: ${activeProducts}`);
    console.log(`- Produk featured: ${featuredProducts}`);
    console.log(`- Produk approved: ${approvedProducts}`);
    
    // Statistik per kategori
    const categoryStats = {};
    products.forEach(product => {
      const categoryName = product.category.name;
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = 0;
      }
      categoryStats[categoryName]++;
    });
    
    console.log(`\n📂 PRODUK PER KATEGORI:`);
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`- ${category}: ${count} produk`);
    });
    
    // Statistik per alumni
    const alumniStats = {};
    products.forEach(product => {
      const alumniName = product.alumni.fullName;
      if (!alumniStats[alumniName]) {
        alumniStats[alumniName] = 0;
      }
      alumniStats[alumniName]++;
    });
    
    console.log(`\n👥 PRODUK PER ALUMNI:`);
    Object.entries(alumniStats).forEach(([alumni, count]) => {
      console.log(`- ${alumni}: ${count} produk`);
    });
    
    // Detail setiap produk
    console.log(`\n📋 DETAIL PRODUK:`);
    console.log('='.repeat(80));
    
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Kategori: ${product.category.name}`);
      console.log(`   Alumni: ${product.alumni.fullName}`);
      console.log(`   Lokasi: ${product.location}`);
      console.log(`   Business: ${product.businessName || 'Tidak ada'}`);
      
      // Harga
      if (product.price) {
        console.log(`   Harga: Rp ${product.price.toLocaleString('id-ID')}`);
      } else if (product.priceMin && product.priceMax) {
        console.log(`   Harga: Rp ${product.priceMin.toLocaleString('id-ID')} - Rp ${product.priceMax.toLocaleString('id-ID')}`);
      } else if (product.priceText) {
        console.log(`   Harga: ${product.priceText}`);
      }
      
      // Marketplace links
      const marketplaces = [];
      if (product.shopeeUrl) marketplaces.push('Shopee');
      if (product.tokopediaUrl) marketplaces.push('Tokopedia');
      if (product.tiktokUrl) marketplaces.push('TikTok Shop');
      if (product.whatsappNumber) marketplaces.push('WhatsApp');
      if (product.instagramUrl) marketplaces.push('Instagram');
      if (product.websiteUrl) marketplaces.push('Website');
      
      console.log(`   Marketplace: ${marketplaces.length > 0 ? marketplaces.join(', ') : 'Tidak ada'}`);
      
      // Status
      const status = [];
      if (product.isActive) status.push('Aktif');
      if (product.isFeatured) status.push('Featured');
      if (product.isApproved) status.push('Approved');
      if (product.isPromoted) status.push('Promoted');
      
      console.log(`   Status: ${status.join(', ')}`);
      console.log(`   Views: ${product.viewCount} | Clicks: ${product.clickCount}`);
      
      if (product.tags && product.tags.length > 0) {
        console.log(`   Tags: ${product.tags.join(', ')}`);
      }
      
      if (product.reviews && product.reviews.length > 0) {
        console.log(`   Reviews: ${product.reviews.length} review(s)`);
      }
      
      console.log(`   Dibuat: ${new Date(product.createdAt).toLocaleDateString('id-ID')}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Pemeriksaan data produk UMKM selesai!');
    
  } catch (error) {
    console.error('❌ Error saat memeriksa produk UMKM:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan script
checkUMKMProducts();