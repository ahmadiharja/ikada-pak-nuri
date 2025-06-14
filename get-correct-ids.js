const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getCorrectIds() {
  try {
    console.log('🔍 Mencari ID Syubiyah dan Mustahiq yang benar dari database...');
    
    // Get syubiyah data
    const syubiyahData = await prisma.$queryRawUnsafe(`
      SELECT id, name, provinsi, kabupaten 
      FROM syubiyah 
      ORDER BY "createdAt"
    `);
    
    console.log('\n🏢 Data Syubiyah:');
    syubiyahData.forEach((syubiyah, index) => {
      console.log(`${index + 1}. ID: ${syubiyah.id}`);
      console.log(`   Nama: ${syubiyah.name}`);
      console.log(`   Provinsi: ${syubiyah.provinsi}`);
      console.log(`   Kabupaten: ${syubiyah.kabupaten}`);
      console.log('   ---');
    });
    
    // Get mustahiq data
    const mustahiqData = await prisma.$queryRawUnsafe(`
      SELECT id, name, "bidangKeahlian" 
      FROM mustahiq 
      ORDER BY "createdAt"
    `);
    
    console.log('\n👤 Data Mustahiq:');
    mustahiqData.forEach((mustahiq, index) => {
      console.log(`${index + 1}. ID: ${mustahiq.id}`);
      console.log(`   Nama: ${mustahiq.name}`);
      console.log(`   Bidang Keahlian: ${mustahiq.bidangKeahlian}`);
      console.log('   ---');
    });
    
    // Get current alumni data
    const alumniData = await prisma.$queryRawUnsafe(`
      SELECT "fullName", email, "syubiyahId", "mustahiqId" 
      FROM alumni 
      WHERE "syubiyahId" IS NULL OR "mustahiqId" IS NULL
      ORDER BY "createdAt" DESC
    `);
    
    console.log('\n📋 Alumni yang perlu diupdate:');
    alumniData.forEach((alumni, index) => {
      console.log(`${index + 1}. ${alumni.fullName}`);
      console.log(`   Email: ${alumni.email}`);
      console.log(`   Syubiyah ID: ${alumni.syubiyahId || 'NULL'}`);
      console.log(`   Mustahiq ID: ${alumni.mustahiqId || 'NULL'}`);
      console.log('   ---');
    });
    
    console.log('\n💡 Untuk mengupdate alumni, gunakan ID yang benar dari data di atas!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getCorrectIds();