const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    // Check if superadmin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'PUSAT'
      }
    });

    if (existingAdmin) {
      console.log('Superadmin sudah ada:');
      console.log('Email:', existingAdmin.email);
      console.log('Nama:', existingAdmin.name);
      return;
    }

    // Create superadmin
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin@ikada.com',
        password: hashedPassword,
        name: 'Super Admin',
        role: 'PUSAT',
        isVerified: true,
      }
    });

    console.log('Superadmin berhasil dibuat!');
    console.log('Email:', superAdmin.email);
    console.log('Password: admin123');
    console.log('Nama:', superAdmin.name);
    console.log('Role:', superAdmin.role);
    console.log('');
    console.log('Silakan login menggunakan kredensial di atas.');
    
  } catch (error) {
    console.error('Error creating superadmin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();