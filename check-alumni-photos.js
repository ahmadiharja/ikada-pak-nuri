const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAlumniPhotos() {
  try {
    const alumni = await prisma.alumni.findMany({
      select: {
        id: true,
        fullName: true,
        profilePhoto: true
      }
    });

    console.log('Alumni dengan foto profil:');
    console.log('========================');
    
    alumni.forEach((alumniItem, index) => {
      console.log(`${index + 1}. ${alumniItem.fullName}`);
      console.log(`   ID: ${alumniItem.id}`);
      console.log(`   Profile Photo: ${alumniItem.profilePhoto || 'TIDAK ADA'}`);
      if (alumniItem.profilePhoto) {
        console.log(`   Path yang digunakan: ${alumniItem.profilePhoto}`);
      }
      console.log('---');
    });

    console.log(`\nTotal alumni: ${alumni.length}`);
    console.log(`Alumni dengan foto: ${alumni.filter(a => a.profilePhoto).length}`);
    console.log(`Alumni tanpa foto: ${alumni.filter(a => !a.profilePhoto).length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAlumniPhotos();