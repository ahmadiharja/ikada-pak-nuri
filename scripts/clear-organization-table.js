const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function clearOrganizationTable() {
  try {
    console.log('🗑️  Mengosongkan tabel struktur organisasi...')
    
    // Hapus semua data dari tabel organization_members
    const deletedCount = await prisma.organizationMember.deleteMany({})
    
    console.log(`✅ Berhasil menghapus ${deletedCount.count} anggota organisasi`)
    console.log('📋 Tabel organization_members telah dikosongkan')
    
  } catch (error) {
    console.error('❌ Error saat mengosongkan tabel:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Jalankan script jika dipanggil langsung
if (require.main === module) {
  clearOrganizationTable()
    .then(() => {
      console.log('🎉 Script selesai dijalankan')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Script gagal:', error)
      process.exit(1)
    })
}

module.exports = { clearOrganizationTable }