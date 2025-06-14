const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Data user default
const defaultUser = {
  email: 'admin@ikadapaknuri.com',
  password: 'admin123', // password sederhana tanpa hash untuk demo
  role: 'PUSAT',
  name: 'Administrator',
  isVerified: true
};

// Fungsi untuk mengkonversi tanggal
function convertDate(dateStr) {
  if (!dateStr) return new Date();
  
  // Jika sudah dalam format ISO, return as is
  if (dateStr.includes('T')) {
    return new Date(dateStr);
  }
  
  // Konversi dari format DD/MM/YYYY ke Date object
  const [day, month, year] = dateStr.split('/');
  return new Date(year, month - 1, day);
}

async function reimportAllData() {
  try {
    console.log('🔄 Mengimpor ulang semua data...');
    
    // 1. Import User Default
    console.log('\n👤 Membuat user default...');
    
    const existingUser = await prisma.user.findUnique({
      where: { email: defaultUser.email }
    });
    
    let user;
    if (!existingUser) {
      user = await prisma.user.create({
        data: {
          ...defaultUser
        }
      });
      console.log(`   ✅ User created: ${user.email}`);
    } else {
      user = existingUser;
      console.log(`   ⚠️  User already exists: ${user.email}`);
    }
    
    // 2. Assign Super Admin role to default user
    console.log('\n🔐 Assign Super Admin role...');
    const superAdminRole = await prisma.role.findUnique({
      where: { name: 'Super Admin' }
    });
    
    if (superAdminRole) {
      const existingUserRole = await prisma.userRole.findFirst({
        where: {
          userId: user.id,
          roleId: superAdminRole.id
        }
      });
      
      if (!existingUserRole) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: superAdminRole.id
          }
        });
        console.log(`   ✅ Super Admin role assigned to ${user.email}`);
      } else {
        console.log(`   ⚠️  Super Admin role already assigned`);
      }
    }
    
    // 3. Import Syubiyah data
    console.log('\n🏢 Mengimpor data Syubiyah...');
    const syubiyahPath = path.join(__dirname, 'syubiyah.json');
    
    if (fs.existsSync(syubiyahPath)) {
      const syubiyahData = JSON.parse(fs.readFileSync(syubiyahPath, 'utf8'));
      let syubiyahCount = 0;
      
      for (const syubiyah of syubiyahData) {
        try {
          const existing = await prisma.syubiyah.findFirst({
            where: { name: syubiyah.name }
          });
          
          if (!existing) {
            await prisma.syubiyah.create({
              data: {
                ...syubiyah,
                createdAt: syubiyah.createdAt ? new Date(syubiyah.createdAt) : new Date(),
                updatedAt: syubiyah.updatedAt ? new Date(syubiyah.updatedAt) : new Date()
              }
            });
            console.log(`   ✅ Syubiyah: ${syubiyah.name}`);
            syubiyahCount++;
          }
        } catch (error) {
          console.log(`   ❌ Error importing syubiyah ${syubiyah.name}:`, error.message);
        }
      }
      
      console.log(`   📊 ${syubiyahCount} syubiyah data imported`);
    } else {
      console.log('   ⚠️  File syubiyah.json tidak ditemukan');
    }
    
    // 4. Import Mustahiq data
    console.log('\n👥 Mengimpor data Mustahiq...');
    const mustahiqPath = path.join(__dirname, 'mustahiq.json');
    
    if (fs.existsSync(mustahiqPath)) {
      const mustahiqData = JSON.parse(fs.readFileSync(mustahiqPath, 'utf8'));
      let mustahiqCount = 0;
      
      for (const mustahiq of mustahiqData) {
        try {
          const existing = await prisma.mustahiq.findFirst({
            where: { email: mustahiq.email }
          });
          
          if (!existing) {
            await prisma.mustahiq.create({
              data: {
                ...mustahiq,
                createdAt: mustahiq.createdAt ? new Date(mustahiq.createdAt) : new Date(),
                updatedAt: mustahiq.updatedAt ? new Date(mustahiq.updatedAt) : new Date()
              }
            });
            console.log(`   ✅ Mustahiq: ${mustahiq.name}`);
            mustahiqCount++;
          }
        } catch (error) {
          console.log(`   ❌ Error importing mustahiq ${mustahiq.name}:`, error.message);
        }
      }
      
      console.log(`   📊 ${mustahiqCount} mustahiq data imported`);
    } else {
      console.log('   ⚠️  File mustahiq.json tidak ditemukan');
    }
    
    // 5. Generate dummy data lagi
    console.log('\n🎲 Membuat data dummy...');
    
    // Generate 10 dummy syubiyah
    const dummySyubiyah = [
      { name: 'Syubiyah Jakarta Selatan', provinsi: 'DKI Jakarta', kabupaten: 'Jakarta Selatan' },
      { name: 'Syubiyah Bandung Kota', provinsi: 'Jawa Barat', kabupaten: 'Bandung' },
      { name: 'Syubiyah Surabaya Timur', provinsi: 'Jawa Timur', kabupaten: 'Surabaya' },
      { name: 'Syubiyah Medan Utara', provinsi: 'Sumatera Utara', kabupaten: 'Medan' },
      { name: 'Syubiyah Makassar Selatan', provinsi: 'Sulawesi Selatan', kabupaten: 'Makassar' },
      { name: 'Syubiyah Denpasar Barat', provinsi: 'Bali', kabupaten: 'Denpasar' },
      { name: 'Syubiyah Palembang Tengah', provinsi: 'Sumatera Selatan', kabupaten: 'Palembang' },
      { name: 'Syubiyah Semarang Utara', provinsi: 'Jawa Tengah', kabupaten: 'Semarang' },
      { name: 'Syubiyah Balikpapan Timur', provinsi: 'Kalimantan Timur', kabupaten: 'Balikpapan' },
      { name: 'Syubiyah Yogyakarta Kota', provinsi: 'DI Yogyakarta', kabupaten: 'Yogyakarta' }
    ];
    
    let newSyubiyahCount = 0;
    for (const syubiyah of dummySyubiyah) {
      try {
        const existing = await prisma.syubiyah.findFirst({
          where: { name: syubiyah.name }
        });
        
        if (!existing) {
          await prisma.syubiyah.create({
            data: {
              ...syubiyah,
              description: `Syubiyah yang berlokasi di ${syubiyah.kabupaten}, ${syubiyah.provinsi}`,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          newSyubiyahCount++;
        }
      } catch (error) {
        console.log(`   ❌ Error creating dummy syubiyah ${syubiyah.name}:`, error.message);
      }
    }
    
    // Generate 10 dummy mustahiq
    const dummyMustahiq = [
      { name: 'Ahmad Fauzi', email: 'ahmad.fauzi@email.com', phone: '081234567890', provinsi: 'DKI Jakarta', kabupaten: 'Jakarta Selatan', kecamatan: 'Kebayoran Baru', desa: 'Senayan', namaJalan: 'Jl. Merdeka No. 123', rt: '01', rw: '02', bidangKeahlian: 'Teknologi Informasi' },
      { name: 'Siti Nurhaliza', email: 'siti.nurhaliza@email.com', phone: '081234567891', provinsi: 'Jawa Barat', kabupaten: 'Bandung', kecamatan: 'Bandung Wetan', desa: 'Cihapit', namaJalan: 'Jl. Sudirman No. 456', rt: '02', rw: '03', bidangKeahlian: 'Pendidikan' },
      { name: 'Muhammad Rizki', email: 'muhammad.rizki@email.com', phone: '081234567892', provinsi: 'Jawa Timur', kabupaten: 'Surabaya', kecamatan: 'Gubeng', desa: 'Gubeng', namaJalan: 'Jl. Thamrin No. 789', rt: '03', rw: '04', bidangKeahlian: 'Ekonomi' },
      { name: 'Fatimah Zahra', email: 'fatimah.zahra@email.com', phone: '081234567893', provinsi: 'Sumatera Utara', kabupaten: 'Medan', kecamatan: 'Medan Kota', desa: 'Kesawan', namaJalan: 'Jl. Gatot Subroto No. 321', rt: '04', rw: '05', bidangKeahlian: 'Kesehatan' },
      { name: 'Abdul Rahman', email: 'abdul.rahman@email.com', phone: '081234567894', provinsi: 'Sulawesi Selatan', kabupaten: 'Makassar', kecamatan: 'Makassar', desa: 'Losari', namaJalan: 'Jl. Ahmad Yani No. 654', rt: '05', rw: '06', bidangKeahlian: 'Pertanian' },
      { name: 'Khadijah Aisyah', email: 'khadijah.aisyah@email.com', phone: '081234567895', provinsi: 'Bali', kabupaten: 'Denpasar', kecamatan: 'Denpasar Barat', desa: 'Pemecutan', namaJalan: 'Jl. Diponegoro No. 987', rt: '06', rw: '07', bidangKeahlian: 'Seni dan Budaya' },
      { name: 'Umar Faruq', email: 'umar.faruq@email.com', phone: '081234567896', provinsi: 'Sumatera Selatan', kabupaten: 'Palembang', kecamatan: 'Ilir Barat I', desa: 'Bukit Baru', namaJalan: 'Jl. Veteran No. 147', rt: '07', rw: '08', bidangKeahlian: 'Teknik' },
      { name: 'Aisyah Putri', email: 'aisyah.putri@email.com', phone: '081234567897', provinsi: 'Jawa Tengah', kabupaten: 'Semarang', kecamatan: 'Semarang Utara', desa: 'Bandarharjo', namaJalan: 'Jl. Pemuda No. 258', rt: '08', rw: '09', bidangKeahlian: 'Komunikasi' },
      { name: 'Ali Akbar', email: 'ali.akbar@email.com', phone: '081234567898', provinsi: 'Kalimantan Timur', kabupaten: 'Balikpapan', kecamatan: 'Balikpapan Timur', desa: 'Manggar', namaJalan: 'Jl. Mulawarman No. 369', rt: '09', rw: '10', bidangKeahlian: 'Perdagangan' },
      { name: 'Maryam Salsabila', email: 'maryam.salsabila@email.com', phone: '081234567899', provinsi: 'DI Yogyakarta', kabupaten: 'Yogyakarta', kecamatan: 'Gondokusuman', desa: 'Terban', namaJalan: 'Jl. Malioboro No. 741', rt: '10', rw: '11', bidangKeahlian: 'Pariwisata' }
    ];
    
    let newMustahiqCount = 0;
    for (const mustahiq of dummyMustahiq) {
      try {
        const existing = await prisma.mustahiq.findFirst({
          where: { email: mustahiq.email }
        });
        
        if (!existing) {
          await prisma.mustahiq.create({
            data: {
              ...mustahiq,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          newMustahiqCount++;
        }
      } catch (error) {
        console.log(`   ❌ Error creating dummy mustahiq ${mustahiq.name}:`, error.message);
      }
    }
    
    console.log(`   📊 ${newSyubiyahCount} dummy syubiyah created`);
    console.log(`   📊 ${newMustahiqCount} dummy mustahiq created`);
    
    // 6. Verifikasi data final
    console.log('\n📊 Verifikasi data final...');
    const userCount = await prisma.user.count();
    const syubiyahCount = await prisma.syubiyah.count();
    const mustahiqCount = await prisma.mustahiq.count();
    const roleCount = await prisma.role.count();
    const permissionCount = await prisma.permission.count();
    const userRoleCount = await prisma.userRole.count();
    
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Syubiyah: ${syubiyahCount}`);
    console.log(`   - Mustahiq: ${mustahiqCount}`);
    console.log(`   - Roles: ${roleCount}`);
    console.log(`   - Permissions: ${permissionCount}`);
    console.log(`   - User Roles: ${userRoleCount}`);
    
    console.log('\n✅ Import ulang semua data selesai!');
    
  } catch (error) {
    console.error('❌ Error importing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

reimportAllData()
  .then(() => {
    console.log('🎉 Script selesai dijalankan');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script gagal:', error);
    process.exit(1);
  });