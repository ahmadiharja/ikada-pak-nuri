const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearOrganizationTableSQL() {
  try {
    console.log('🗑️  Mengosongkan tabel struktur organisasi dengan SQL...')
    
    // Menggunakan raw SQL untuk menghapus semua data
    // TRUNCATE lebih efisien untuk menghapus semua data
    await prisma.$executeRaw`TRUNCATE TABLE "organization_members" RESTART IDENTITY CASCADE`
    
    console.log('✅ Berhasil mengosongkan tabel organization_members')
    console.log('🔄 Auto-increment ID telah direset ke 1')
    
  } catch (error) {
    console.error('❌ Error saat mengosongkan tabel:', error)
    
    // Fallback ke DELETE jika TRUNCATE gagal
    try {
      console.log('🔄 Mencoba dengan DELETE...')
      await prisma.$executeRaw`DELETE FROM "organization_members"`
      console.log('✅ Berhasil menghapus semua data dengan DELETE')
    } catch (deleteError) {
      console.error('❌ DELETE juga gagal:', deleteError)
      throw deleteError
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Jalankan script jika dipanggil langsung
if (require.main === module) {
  clearOrganizationTableSQL()
    .then(() => {
      console.log('🎉 Script selesai dijalankan')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Script gagal:', error)
      process.exit(1)
    })
}

module.exports = { clearOrganizationTableSQL }