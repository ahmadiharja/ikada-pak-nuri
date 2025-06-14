const { PrismaClient } = require('@prisma/client')
const readline = require('readline')

const prisma = new PrismaClient()

// Setup readline interface untuk input user
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

async function showCurrentData() {
  try {
    const count = await prisma.organizationMember.count()
    console.log(`📊 Saat ini terdapat ${count} anggota dalam tabel organization_members`)
    
    if (count > 0) {
      const members = await prisma.organizationMember.findMany({
        select: {
          id: true,
          name: true,
          position: true,
          department: true
        },
        take: 5
      })
      
      console.log('\n📋 Contoh data (5 teratas):')
      members.forEach((member, index) => {
        console.log(`${index + 1}. ${member.name} - ${member.position} (${member.department})`)
      })
      
      if (count > 5) {
        console.log(`... dan ${count - 5} anggota lainnya`)
      }
    }
    
    return count
  } catch (error) {
    console.error('❌ Error saat mengambil data:', error)
    return 0
  }
}

async function clearWithPrisma() {
  const deletedCount = await prisma.organizationMember.deleteMany({})
  return deletedCount.count
}

async function clearWithSQL() {
  try {
    await prisma.$executeRaw`TRUNCATE TABLE "organization_members" RESTART IDENTITY CASCADE`
    return 'TRUNCATE berhasil'
  } catch (error) {
    console.log('⚠️  TRUNCATE gagal, menggunakan DELETE...')
    await prisma.$executeRaw`DELETE FROM "organization_members"`
    return 'DELETE berhasil'
  }
}

async function main() {
  try {
    console.log('🏢 Script Pembersihan Tabel Struktur Organisasi')
    console.log('=' .repeat(50))
    
    // Tampilkan data saat ini
    const currentCount = await showCurrentData()
    
    if (currentCount === 0) {
      console.log('\n✅ Tabel sudah kosong, tidak ada yang perlu dihapus.')
      return
    }
    
    console.log('\n⚠️  PERINGATAN: Operasi ini akan menghapus SEMUA data struktur organisasi!')
    console.log('📝 Data yang dihapus tidak dapat dikembalikan.')
    
    // Konfirmasi pertama
    const confirm1 = await askQuestion('\n❓ Apakah Anda yakin ingin melanjutkan? (ketik "YA" untuk melanjutkan): ')
    
    if (confirm1.toUpperCase() !== 'YA') {
      console.log('❌ Operasi dibatalkan.')
      return
    }
    
    // Pilih metode
    console.log('\n🔧 Pilih metode penghapusan:')
    console.log('1. Prisma deleteMany() - Aman, dengan logging')
    console.log('2. SQL TRUNCATE - Lebih cepat, reset auto-increment')
    
    const method = await askQuestion('\n❓ Pilih metode (1 atau 2): ')
    
    // Konfirmasi kedua
    const confirm2 = await askQuestion('\n❓ Konfirmasi terakhir. Ketik "HAPUS" untuk melanjutkan: ')
    
    if (confirm2.toUpperCase() !== 'HAPUS') {
      console.log('❌ Operasi dibatalkan.')
      return
    }
    
    console.log('\n🗑️  Memulai penghapusan data...')
    
    let result
    if (method === '1') {
      result = await clearWithPrisma()
      console.log(`✅ Berhasil menghapus ${result} anggota organisasi menggunakan Prisma`)
    } else if (method === '2') {
      result = await clearWithSQL()
      console.log(`✅ ${result} - Tabel organization_members telah dikosongkan`)
    } else {
      console.log('❌ Pilihan tidak valid, operasi dibatalkan.')
      return
    }
    
    // Verifikasi hasil
    const finalCount = await prisma.organizationMember.count()
    console.log(`\n📊 Verifikasi: Tabel sekarang berisi ${finalCount} anggota`)
    
    if (finalCount === 0) {
      console.log('🎉 Tabel berhasil dikosongkan!')
    } else {
      console.log('⚠️  Masih ada data tersisa, mungkin ada error.')
    }
    
  } catch (error) {
    console.error('❌ Error saat menjalankan script:', error)
    throw error
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

// Jalankan script
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🎉 Script selesai dijalankan')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Script gagal:', error)
      process.exit(1)
    })
}

module.exports = { main, showCurrentData, clearWithPrisma, clearWithSQL }