const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSyubiyah() {
  try {
    const syubiyahData = await prisma.syubiyah.findMany();
    console.log('Data Syubiyah yang tersedia:');
    console.log(JSON.stringify(syubiyahData, null, 2));
    
    const mustahiqData = await prisma.mustahiq.findMany();
    console.log('\nData Mustahiq yang tersedia:');
    console.log(JSON.stringify(mustahiqData, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSyubiyah();