const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAlumniSimple() {
  try {
    console.log('🔄 Mengupdate relasi alumni dengan syubiyah dan mustahiq...');
    
    // ID yang tersedia dari database
    const syubiyahIds = [
      '01J5QHQHQHQHQHQHQHQHQH', // Syubiyah Bangbang Wetan
      '01J5QHQHQHQHQHQHQHQHQJ'  // Syubiyah Banjari Kediri
    ];
    
    const mustahiqId = '01J5QHQHQHQHQHQHQHQHQI'; // KH. Ahmad Basari
    
    // Update alumni dengan raw SQL untuk menghindari error Prisma
    const updateQueries = [
      // Update alumni dengan syubiyah pertama
      `UPDATE "alumni" SET "syubiyahId" = '${syubiyahIds[0]}', "mustahiqId" = '${mustahiqId}' WHERE "email" LIKE '%ahmad.fauzi%' OR "email" LIKE '%siti.aisyah%' OR "email" LIKE '%muhammad.rizki%';`,
      
      // Update alumni dengan syubiyah kedua
      `UPDATE "alumni" SET "syubiyahId" = '${syubiyahIds[1]}', "mustahiqId" = '${mustahiqId}' WHERE "email" LIKE '%fatimah.azzahra%' OR "email" LIKE '%abdul.rahman%' OR "email" LIKE '%khadijah.ummu%';`,
      
      // Update alumni sisanya dengan syubiyah pertama
      `UPDATE "alumni" SET "syubiyahId" = '${syubiyahIds[0]}', "mustahiqId" = '${mustahiqId}' WHERE "email" LIKE '%umar.khattab%' OR "email" LIKE '%aisyah.radhiya%' OR "email" LIKE '%ali.abithalib%' OR "email" LIKE '%zainab.jahsy%';`
    ];
    
    for (const query of updateQueries) {
      await prisma.$executeRawUnsafe(query);
      console.log('✓ Batch update berhasil');
    }
    
    console.log('\n📊 Verifikasi hasil update:');
    
    // Verifikasi dengan query sederhana
    const result = await prisma.$queryRawUnsafe(`
      SELECT 
        "fullName", 
        "email", 
        "syubiyahId", 
        "mustahiqId"
      FROM "alumni" 
      WHERE "syubiyahId" IS NOT NULL 
      ORDER BY "createdAt" DESC 
      LIMIT 5
    `);
    
    result.forEach((alumni, index) => {
      console.log(`${index + 1}. ${alumni.fullName}`);
      console.log(`   Email: ${alumni.email}`);
      console.log(`   Syubiyah ID: ${alumni.syubiyahId}`);
      console.log(`   Mustahiq ID: ${alumni.mustahiqId}`);
      console.log('   ---');
    });
    
    console.log('\n✅ Update relasi alumni berhasil!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAlumniSimple();