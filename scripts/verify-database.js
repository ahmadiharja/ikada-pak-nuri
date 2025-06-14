const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDatabase() {
  try {
    console.log('🔍 Verifikasi status database...');
    
    // Test koneksi
    await prisma.$connect();
    console.log('✅ Koneksi database berhasil');
    
    // Hitung data di setiap tabel
    const userCount = await prisma.user.count();
    const syubiyahCount = await prisma.syubiyah.count();
    const mustahiqCount = await prisma.mustahiq.count();
    const roleCount = await prisma.role.count();
    const permissionCount = await prisma.permission.count();
    const rolePermissionCount = await prisma.rolePermission.count();
    const userRoleCount = await prisma.userRole.count();
    
    console.log('\n📊 Status Database:');
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Syubiyah: ${syubiyahCount}`);
    console.log(`   - Mustahiq: ${mustahiqCount}`);
    console.log(`   - Roles: ${roleCount}`);
    console.log(`   - Permissions: ${permissionCount}`);
    console.log(`   - Role Permissions: ${rolePermissionCount}`);
    console.log(`   - User Roles: ${userRoleCount}`);
    
    // Tampilkan roles yang ada
    if (roleCount > 0) {
      console.log('\n👥 Roles yang tersedia:');
      const roles = await prisma.role.findMany({
        select: { name: true, description: true }
      });
      roles.forEach(role => {
        console.log(`   - ${role.name}: ${role.description}`);
      });
    }
    
    // Tampilkan beberapa permissions
    if (permissionCount > 0) {
      console.log('\n🔐 Sample Permissions:');
      const permissions = await prisma.permission.findMany({
        take: 10,
        select: { name: true, module: true, action: true }
      });
      permissions.forEach(permission => {
        console.log(`   - ${permission.name} (${permission.module}.${permission.action})`);
      });
      if (permissionCount > 10) {
        console.log(`   ... dan ${permissionCount - 10} permissions lainnya`);
      }
    }
    
    console.log('\n✅ Verifikasi database selesai!');
    
  } catch (error) {
    console.error('❌ Error verifikasi database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase()
  .then(() => {
    console.log('🎉 Script selesai dijalankan');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script gagal:', error);
    process.exit(1);
  });