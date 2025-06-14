const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importUsersFromJSON() {
  try {
    console.log('📥 Memulai import data users ke Prisma DB...');
    
    // Baca file users.json
    const usersFilePath = path.join(__dirname, 'users.json');
    
    if (!fs.existsSync(usersFilePath)) {
      console.error('❌ File users.json tidak ditemukan di:', usersFilePath);
      return;
    }
    
    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    console.log(`📊 Ditemukan ${usersData.length} users untuk diimport`);
    
    // Cek koneksi database
    await prisma.$connect();
    console.log('✅ Koneksi ke Prisma DB berhasil!');
    
    // Cek data users yang sudah ada
    const existingUsers = await prisma.user.findMany();
    console.log(`📋 Users yang sudah ada di database: ${existingUsers.length}`);
    
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    console.log('\n🔄 Memulai proses import...');
    
    for (const userData of usersData) {
      try {
        // Cek apakah user sudah ada berdasarkan email atau id
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: userData.email },
              { id: userData.id }
            ]
          }
        });
        
        if (existingUser) {
          console.log(`⚠️  User ${userData.email} sudah ada, dilewati`);
          skippedCount++;
          continue;
        }
        
        // Konversi tanggal dari string ke Date object
        const userToCreate = {
          ...userData,
          createdAt: new Date(userData.createdAt),
          updatedAt: new Date(userData.updatedAt)
        };
        
        // Import user ke database
        const createdUser = await prisma.user.create({
          data: userToCreate
        });
        
        console.log(`✅ User ${createdUser.email} berhasil diimport`);
        importedCount++;
        
      } catch (error) {
        console.error(`❌ Error importing user ${userData.email}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Summary Import:');
    console.log(`   ✅ Berhasil diimport: ${importedCount} users`);
    console.log(`   ⚠️  Dilewati (sudah ada): ${skippedCount} users`);
    console.log(`   ❌ Error: ${errorCount} users`);
    console.log(`   📋 Total diproses: ${usersData.length} users`);
    
    // Verifikasi hasil import
    const totalUsersAfter = await prisma.user.count();
    console.log(`\n🎯 Total users di database sekarang: ${totalUsersAfter}`);
    
    if (importedCount > 0) {
      console.log('\n🎉 Import data users berhasil!');
      console.log('🌐 Anda dapat memeriksa data di Prisma Studio: http://localhost:5555');
    } else {
      console.log('\n📝 Tidak ada data baru yang diimport.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Pastikan file users.json ada dan formatnya benar');
    console.error('2. Pastikan koneksi ke Prisma DB stabil');
    console.error('3. Cek apakah schema User sudah sesuai dengan data JSON');
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Koneksi database ditutup.');
  }
}

// Jalankan script
if (require.main === module) {
  importUsersFromJSON();
}

module.exports = { importUsersFromJSON };