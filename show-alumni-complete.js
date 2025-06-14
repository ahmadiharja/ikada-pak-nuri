const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showAlumniComplete() {
  try {
    console.log('📋 Menampilkan semua data alumni dengan syubiyah dan mustahiq ID...');
    
    // Get semua alumni dengan relasi
    const allAlumni = await prisma.$queryRawUnsafe(`
      SELECT 
        a.id,
        a."fullName", 
        a.email, 
        a."syubiyahId", 
        a."mustahiqId",
        s.name as syubiyah_name,
        m.name as mustahiq_name,
        a."createdAt"
      FROM alumni a
      LEFT JOIN syubiyah s ON a."syubiyahId" = s.id
      LEFT JOIN mustahiq m ON a."mustahiqId" = m.id
      ORDER BY a."createdAt" ASC
    `);
    
    console.log(`\n🎯 Total Alumni: ${allAlumni.length}`);
    console.log('\n📊 Detail Alumni:');
    console.log('=' .repeat(80));
    
    allAlumni.forEach((alumni, index) => {
      console.log(`\n${index + 1}. ${alumni.fullName}`);
      console.log(`   ID Alumni: ${alumni.id}`);
      console.log(`   Email: ${alumni.email}`);
      console.log(`   Syubiyah ID: ${alumni.syubiyahId || 'NULL'}`);
      console.log(`   Syubiyah Name: ${alumni.syubiyah_name || 'NULL'}`);
      console.log(`   Mustahiq ID: ${alumni.mustahiqId || 'NULL'}`);
      console.log(`   Mustahiq Name: ${alumni.mustahiq_name || 'NULL'}`);
      console.log(`   Created: ${alumni.createdAt}`);
      console.log('   ' + '-'.repeat(60));
    });
    
    // Statistik
    const withSyubiyah = allAlumni.filter(a => a.syubiyahId).length;
    const withMustahiq = allAlumni.filter(a => a.mustahiqId).length;
    const withBoth = allAlumni.filter(a => a.syubiyahId && a.mustahiqId).length;
    
    console.log('\n📈 Statistik:');
    console.log(`   Alumni dengan Syubiyah ID: ${withSyubiyah}/${allAlumni.length}`);
    console.log(`   Alumni dengan Mustahiq ID: ${withMustahiq}/${allAlumni.length}`);
    console.log(`   Alumni dengan kedua ID: ${withBoth}/${allAlumni.length}`);
    
    // Daftar ID unik
    const uniqueSyubiyahIds = [...new Set(allAlumni.filter(a => a.syubiyahId).map(a => a.syubiyahId))];
    const uniqueMustahiqIds = [...new Set(allAlumni.filter(a => a.mustahiqId).map(a => a.mustahiqId))];
    
    console.log('\n🔗 ID Syubiyah yang digunakan:');
    uniqueSyubiyahIds.forEach((id, index) => {
      const syubiyahName = allAlumni.find(a => a.syubiyahId === id)?.syubiyah_name;
      console.log(`   ${index + 1}. ${id} - ${syubiyahName}`);
    });
    
    console.log('\n🔗 ID Mustahiq yang digunakan:');
    uniqueMustahiqIds.forEach((id, index) => {
      const mustahiqName = allAlumni.find(a => a.mustahiqId === id)?.mustahiq_name;
      console.log(`   ${index + 1}. ${id} - ${mustahiqName}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showAlumniComplete();