const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMustahiqPhotos() {
  try {
    const mustahiqs = await prisma.mustahiq.findMany({
      select: {
        id: true,
        name: true,
        profilePhoto: true
      }
    });

    console.log('Mustahiq dengan foto profil:');
    console.log('===========================');
    
    mustahiqs.forEach((mustahiq, index) => {
      console.log(`${index + 1}. ${mustahiq.name}`);
      console.log(`   ID: ${mustahiq.id}`);
      console.log(`   Profile Photo: ${mustahiq.profilePhoto || 'TIDAK ADA'}`);
      console.log('---');
    });

    console.log(`\nTotal mustahiq: ${mustahiqs.length}`);
    console.log(`Mustahiq dengan foto: ${mustahiqs.filter(m => m.profilePhoto).length}`);
    console.log(`Mustahiq tanpa foto: ${mustahiqs.filter(m => !m.profilePhoto).length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMustahiqPhotos();