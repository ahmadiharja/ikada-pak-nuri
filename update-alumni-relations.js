const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAlumniRelations() {
  try {
    console.log('Mulai mengupdate relasi alumni dengan syubiyah dan mustahiq...');
    
    // Get available syubiyah and mustahiq
    const syubiyahList = await prisma.syubiyah.findMany();
    const mustahiqList = await prisma.mustahiq.findMany();
    
    console.log('\nData Syubiyah yang tersedia:');
    syubiyahList.forEach((syubiyah, index) => {
      console.log(`${index + 1}. ID: ${syubiyah.id} - Nama: ${syubiyah.nama}`);
    });
    
    console.log('\nData Mustahiq yang tersedia:');
    mustahiqList.forEach((mustahiq, index) => {
      console.log(`${index + 1}. ID: ${mustahiq.id} - Nama: ${mustahiq.nama}`);
    });
    
    // Get alumni that need to be updated (those with null syubiyahId or mustahiqId)
    const alumniToUpdate = await prisma.alumni.findMany({
      where: {
        OR: [
          { syubiyahId: null },
          { mustahiqId: null }
        ]
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        syubiyahId: true,
        mustahiqId: true
      }
    });
    
    console.log(`\n📋 Ditemukan ${alumniToUpdate.length} alumni yang perlu diupdate relasi:`);
    
    let updatedCount = 0;
    
    for (const alumni of alumniToUpdate) {
      // Randomly assign syubiyah and mustahiq
      const randomSyubiyah = syubiyahList[Math.floor(Math.random() * syubiyahList.length)];
      const randomMustahiq = mustahiqList[Math.floor(Math.random() * mustahiqList.length)];
      
      const updateData = {};
      
      if (!alumni.syubiyahId) {
        updateData.syubiyahId = randomSyubiyah.id;
      }
      
      if (!alumni.mustahiqId) {
        updateData.mustahiqId = randomMustahiq.id;
      }
      
      if (Object.keys(updateData).length > 0) {
        await prisma.alumni.update({
          where: { id: alumni.id },
          data: updateData
        });
        
        console.log(`✓ ${alumni.fullName} - Syubiyah: ${randomSyubiyah.nama}, Mustahiq: ${randomMustahiq.nama}`);
        updatedCount++;
      }
    }
    
    console.log(`\n✅ Proses selesai! ${updatedCount} alumni berhasil diupdate.`);
    
    // Show sample of updated data
    console.log('\n📊 Sample data alumni dengan relasi:');
    const sampleAlumni = await prisma.alumni.findMany({
      take: 3,
      include: {
        syubiyah: {
          select: {
            id: true,
            nama: true
          }
        },
        mustahiq: {
          select: {
            id: true,
            nama: true
          }
        }
      }
    });
    
    sampleAlumni.forEach((alumni, index) => {
      console.log(`\n${index + 1}. ${alumni.fullName}`);
      console.log(`   Email: ${alumni.email}`);
      console.log(`   Syubiyah: ${alumni.syubiyah?.nama || 'Tidak ada'} (ID: ${alumni.syubiyahId || 'null'})`);
      console.log(`   Mustahiq: ${alumni.mustahiq?.nama || 'Tidak ada'} (ID: ${alumni.mustahiqId || 'null'})`);
    });
    
  } catch (error) {
    console.error('❌ Error mengupdate relasi alumni:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAlumniRelations();