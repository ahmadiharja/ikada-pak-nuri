const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyMigration() {
  try {
    console.log('🔍 Memverifikasi koneksi database Prisma Accelerate...');
    
    // Test koneksi database
    await prisma.$connect();
    console.log('✅ Koneksi database berhasil!');
    
    // Cek tabel yang tersedia
    console.log('\n📊 Mengecek tabel yang tersedia...');
    
    // Test query sederhana untuk setiap model utama
    const tables = [
      { name: 'User', model: prisma.user },
      { name: 'Syubiyah', model: prisma.syubiyah },
      { name: 'Alumni', model: prisma.alumni },
      { name: 'Mustahiq', model: prisma.mustahiq },
      { name: 'Post', model: prisma.post },
      { name: 'Event', model: prisma.event },
      { name: 'DonationProgram', model: prisma.donationProgram },
    ];
    
    for (const table of tables) {
      try {
        const count = await table.model.count();
        console.log(`✅ Tabel ${table.name}: ${count} records`);
      } catch (error) {
        console.log(`❌ Tabel ${table.name}: Error - ${error.message}`);
      }
    }
    
    console.log('\n🎉 Migrasi database dari Neon ke Prisma Accelerate berhasil!');
    console.log('📝 Database URL: prisma+postgres://accelerate.prisma-data.net/...');
    console.log('🌐 Prisma Studio: http://localhost:5555');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Pastikan DATABASE_URL sudah benar di file .env');
    console.error('2. Pastikan API key Prisma Accelerate masih valid');
    console.error('3. Jalankan: npx prisma db push');
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration();