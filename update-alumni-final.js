const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAlumniRelations() {
  try {
    console.log('🔄 Mengupdate relasi alumni dengan syubiyah dan mustahiq...');
    
    // ID yang valid dari database
    const validSyubiyahIds = [
      'cmbspg3g9000011mvhdni91hb', // Syubiyah Banjari Kediri
      'cmbsppbf9000111mvbg17r8jl'  // Syubiyah Bangbang Wetan
    ];
    
    const validMustahiqIds = [
      'cmbsq1sw00000dhjrb96gip70', // KH. Ahmad Basari
      'cmbtnz0yz005n11xvqhqvhqhq', // Fatimah Zahra
      'cmbtnz13k005o11xvqhqvhqhq', // Abdullah Rahman
      'cmbtnz17v005p11xvqhqvhqhq', // Khadijah Aminah
      'cmbtnz1bh005q11xvqhqvhqhq', // Muhammad Yusuf
      'cmbtnz1f8005r11xvne3owb7z', // Umar Faruq
      'cmbtnz1is005s11xvd7bzcnrq', // Aisyah Putri
      'cmbtnz1n4005t11xvjgz9i8sb', // Ali Akbar
      'cmbtnz1r6005u11xviptjcgsm'  // Maryam Salsabila
    ];
    
    // Get alumni yang perlu diupdate
    const alumniToUpdate = await prisma.$queryRawUnsafe(`
      SELECT id, "fullName", email 
      FROM alumni 
      WHERE "syubiyahId" IS NULL OR "mustahiqId" IS NULL
      ORDER BY "createdAt" DESC
    `);
    
    console.log(`\n📋 Ditemukan ${alumniToUpdate.length} alumni yang perlu diupdate:`);
    
    let updateCount = 0;
    
    for (const alumni of alumniToUpdate) {
      // Pilih syubiyah dan mustahiq secara acak
      const randomSyubiyahId = validSyubiyahIds[Math.floor(Math.random() * validSyubiyahIds.length)];
      const randomMustahiqId = validMustahiqIds[Math.floor(Math.random() * validMustahiqIds.length)];
      
      try {
        await prisma.$queryRawUnsafe(`
          UPDATE alumni 
          SET "syubiyahId" = $1, "mustahiqId" = $2, "updatedAt" = NOW()
          WHERE id = $3
        `, randomSyubiyahId, randomMustahiqId, alumni.id);
        
        console.log(`✅ ${alumni.fullName} (${alumni.email}) - Updated`);
        console.log(`   Syubiyah ID: ${randomSyubiyahId}`);
        console.log(`   Mustahiq ID: ${randomMustahiqId}`);
        updateCount++;
      } catch (error) {
        console.error(`❌ Error updating ${alumni.fullName}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Berhasil mengupdate ${updateCount} dari ${alumniToUpdate.length} alumni!`);
    
    // Verifikasi hasil
    const updatedAlumni = await prisma.$queryRawUnsafe(`
      SELECT 
        a."fullName", 
        a.email, 
        a."syubiyahId", 
        a."mustahiqId",
        s.name as syubiyah_name,
        m.name as mustahiq_name
      FROM alumni a
      LEFT JOIN syubiyah s ON a."syubiyahId" = s.id
      LEFT JOIN mustahiq m ON a."mustahiqId" = m.id
      ORDER BY a."createdAt" DESC
      LIMIT 5
    `);
    
    console.log('\n📊 Sample alumni setelah update:');
    updatedAlumni.forEach((alumni, index) => {
      console.log(`${index + 1}. ${alumni.fullName}`);
      console.log(`   Email: ${alumni.email}`);
      console.log(`   Syubiyah: ${alumni.syubiyah_name || 'NULL'} (${alumni.syubiyahId || 'NULL'})`);
      console.log(`   Mustahiq: ${alumni.mustahiq_name || 'NULL'} (${alumni.mustahiqId || 'NULL'})`);
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAlumniRelations();