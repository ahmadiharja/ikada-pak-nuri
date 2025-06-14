const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importMustahiqAndSyubiyahData() {
  try {
    console.log('🔄 Memulai impor data Mustahiq dan Syubiyah ke database Prisma...');
    
    // Baca file mustahiq.json
    const mustahiqPath = path.join(__dirname, 'mustahiq.json');
    const syubiyahPath = path.join(__dirname, 'syubiyah.json');
    
    if (!fs.existsSync(mustahiqPath)) {
      console.log('❌ File mustahiq.json tidak ditemukan');
      return;
    }
    
    if (!fs.existsSync(syubiyahPath)) {
      console.log('❌ File syubiyah.json tidak ditemukan');
      return;
    }
    
    const mustahiqData = JSON.parse(fs.readFileSync(mustahiqPath, 'utf8'));
    const syubiyahData = JSON.parse(fs.readFileSync(syubiyahPath, 'utf8'));
    
    console.log(`📊 Data yang akan diimpor:`);
    console.log(`   - Mustahiq: ${mustahiqData.length} record`);
    console.log(`   - Syubiyah: ${syubiyahData.length} record`);
    
    // Cek data yang sudah ada
    const existingMustahiq = await prisma.mustahiq.count();
    const existingSyubiyah = await prisma.syubiyah.count();
    
    console.log(`\n📈 Data yang sudah ada di database:`);
    console.log(`   - Mustahiq: ${existingMustahiq} record`);
    console.log(`   - Syubiyah: ${existingSyubiyah} record`);
    
    let mustahiqImported = 0;
    let syubiyahImported = 0;
    let mustahiqSkipped = 0;
    let syubiyahSkipped = 0;
    
    // Import Mustahiq data
    console.log('\n🔄 Mengimpor data Mustahiq...');
    for (const mustahiq of mustahiqData) {
      try {
        // Cek apakah mustahiq sudah ada berdasarkan ID atau email
        const existing = await prisma.mustahiq.findFirst({
          where: {
            OR: [
              { id: mustahiq.id },
              { email: mustahiq.email }
            ]
          }
        });
        
        if (existing) {
          console.log(`   ⏭️  Mustahiq ${mustahiq.name} sudah ada, dilewati`);
          mustahiqSkipped++;
          continue;
        }
        
        // Konversi tanggal dari string ke Date object
        const mustahiqToCreate = {
          ...mustahiq,
          createdAt: new Date(mustahiq.createdAt),
          updatedAt: new Date(mustahiq.updatedAt)
        };
        
        await prisma.mustahiq.create({
          data: mustahiqToCreate
        });
        
        console.log(`   ✅ Mustahiq ${mustahiq.name} berhasil diimpor`);
        mustahiqImported++;
      } catch (error) {
        console.log(`   ❌ Error mengimpor mustahiq ${mustahiq.name}:`, error.message);
      }
    }
    
    // Import Syubiyah data
    console.log('\n🔄 Mengimpor data Syubiyah...');
    for (const syubiyah of syubiyahData) {
      try {
        // Cek apakah syubiyah sudah ada berdasarkan ID atau nama
        const existing = await prisma.syubiyah.findFirst({
          where: {
            OR: [
              { id: syubiyah.id },
              { name: syubiyah.name }
            ]
          }
        });
        
        if (existing) {
          console.log(`   ⏭️  Syubiyah ${syubiyah.name} sudah ada, dilewati`);
          syubiyahSkipped++;
          continue;
        }
        
        // Konversi tanggal dari string ke Date object
        const syubiyahToCreate = {
          ...syubiyah,
          createdAt: new Date(syubiyah.createdAt),
          updatedAt: new Date(syubiyah.updatedAt)
        };
        
        await prisma.syubiyah.create({
          data: syubiyahToCreate
        });
        
        console.log(`   ✅ Syubiyah ${syubiyah.name} berhasil diimpor`);
        syubiyahImported++;
      } catch (error) {
        console.log(`   ❌ Error mengimpor syubiyah ${syubiyah.name}:`, error.message);
      }
    }
    
    // Verifikasi hasil impor
    const finalMustahiqCount = await prisma.mustahiq.count();
    const finalSyubiyahCount = await prisma.syubiyah.count();
    
    console.log('\n📊 Ringkasan Impor:');
    console.log(`   Mustahiq:`);
    console.log(`   - Diimpor: ${mustahiqImported}`);
    console.log(`   - Dilewati: ${mustahiqSkipped}`);
    console.log(`   - Total di database: ${finalMustahiqCount}`);
    console.log(`   Syubiyah:`);
    console.log(`   - Diimpor: ${syubiyahImported}`);
    console.log(`   - Dilewati: ${syubiyahSkipped}`);
    console.log(`   - Total di database: ${finalSyubiyahCount}`);
    
    console.log('\n✅ Proses impor selesai!');
    
  } catch (error) {
    console.error('❌ Error dalam proses impor:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan fungsi impor
importMustahiqAndSyubiyahData()
  .then(() => {
    console.log('🎉 Script selesai dijalankan');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script gagal:', error);
    process.exit(1);
  });