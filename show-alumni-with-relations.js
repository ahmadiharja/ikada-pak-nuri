const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showAlumniWithRelations() {
  try {
    console.log('📋 Data Alumni dengan Relasi Syubiyah dan Mustahiq\n');
    
    // Get all alumni with their relations
    const alumni = await prisma.alumni.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Total Alumni: ${alumni.length}\n`);
    
    alumni.forEach((alumnus, index) => {
      console.log(`${index + 1}. ${alumnus.fullName}`);
      console.log(`   Email: ${alumnus.email}`);
      console.log(`   Status: ${alumnus.status}`);
      console.log(`   Syubiyah ID: ${alumnus.syubiyahId || 'null'}`);
      console.log(`   Syubiyah: ${alumnus.syubiyah?.nama || 'Tidak ada'}`);
      console.log(`   Mustahiq ID: ${alumnus.mustahiqId || 'null'}`);
      console.log(`   Mustahiq: ${alumnus.mustahiq?.nama || 'Tidak ada'}`);
      console.log(`   Dibuat: ${alumnus.createdAt}`);
      console.log('   ---');
    });
    
    // Show available syubiyah and mustahiq
    console.log('\n🏢 Data Syubiyah yang Tersedia:');
    const syubiyahList = await prisma.syubiyah.findMany();
    syubiyahList.forEach((syubiyah, index) => {
      console.log(`${index + 1}. ID: ${syubiyah.id}`);
      console.log(`   Nama: ${syubiyah.nama}`);
      console.log(`   Provinsi: ${syubiyah.provinsi}`);
      console.log(`   Kabupaten: ${syubiyah.kabupaten}`);
      console.log('   ---');
    });
    
    console.log('\n👤 Data Mustahiq yang Tersedia:');
    const mustahiqList = await prisma.mustahiq.findMany();
    mustahiqList.forEach((mustahiq, index) => {
      console.log(`${index + 1}. ID: ${mustahiq.id}`);
      console.log(`   Nama: ${mustahiq.nama}`);
      console.log(`   Bidang Keahlian: ${mustahiq.bidangKeahlian}`);
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showAlumniWithRelations();