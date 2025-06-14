const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAlumniPhotos() {
  try {
    // Ambil alumni yang memiliki profilePhoto
    const alumni = await prisma.alumni.findMany({
      where: {
        profilePhoto: {
          not: null,
          not: ''
        }
      }
    });

    console.log('Updating alumni photos...');
    console.log(`Found ${alumni.length} alumni with photos`);
    
    for (const alumniItem of alumni) {
      if (alumniItem.profilePhoto && !alumniItem.profilePhoto.startsWith('/foto_alumni/')) {
        const newPath = `/foto_alumni/${alumniItem.profilePhoto}`;
        
        await prisma.alumni.update({
          where: { id: alumniItem.id },
          data: { profilePhoto: newPath }
        });
        
        console.log(`Updated ${alumniItem.fullName}: ${alumniItem.profilePhoto} -> ${newPath}`);
      } else {
        console.log(`Skipped ${alumniItem.fullName}: already has correct path`);
      }
    }
    
    console.log('\nUpdate completed!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAlumniPhotos();