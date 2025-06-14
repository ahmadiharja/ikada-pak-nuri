const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAlumni() {
  try {
    const alumni = await prisma.alumni.findMany({
      take: 3,
      include: {
        syubiyah: true,
        mustahiq: true
      }
    });
    
    console.log('Data Alumni yang ada:');
    console.log(JSON.stringify(alumni, null, 2));
    
    const count = await prisma.alumni.count();
    console.log(`\nTotal alumni: ${count}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAlumni();