const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Schema tambahan untuk Role dan Permission
const rolePermissionSchema = `
// ===== ROLE & PERMISSION SYSTEM =====

model Role {
  id          String   @id @default(cuid())
  name        String   @unique // e.g., "Super Admin", "Admin Alumni", "Admin Berita", "Admin Event", "Admin Donasi", "Admin Laporan", "Viewer"
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  userRoles      UserRole[]
  rolePermissions RolePermission[]
  
  @@map("roles")
}

model Permission {
  id          String   @id @default(cuid())
  name        String   @unique // e.g., "dashboard.view", "alumni.create", "alumni.edit", "alumni.delete", "news.create", etc.
  module      String   // e.g., "dashboard", "alumni", "news", "events", "donations", "reports", "settings"
  action      String   // e.g., "view", "create", "edit", "delete", "manage"
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  rolePermissions RolePermission[]
  
  @@map("permissions")
}

model RolePermission {
  id           String     @id @default(cuid())
  roleId       String
  permissionId String
  createdAt    DateTime   @default(now())
  
  // Relations
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  
  @@unique([roleId, permissionId])
  @@map("role_permissions")
}

model UserRole {
  id        String   @id @default(cuid())
  userId    String
  roleId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)
  
  @@unique([userId, roleId])
  @@map("user_roles")
}
`;

// Data permissions berdasarkan menu sidebar
const permissions = [
  // Dashboard
  { name: 'dashboard.view', module: 'dashboard', action: 'view', description: 'Melihat dashboard utama' },
  
  // Profile
  { name: 'profile.view', module: 'profile', action: 'view', description: 'Melihat profil sendiri' },
  { name: 'profile.edit', module: 'profile', action: 'edit', description: 'Mengedit profil sendiri' },
  
  // Alumni Management
  { name: 'alumni.view', module: 'alumni', action: 'view', description: 'Melihat data alumni' },
  { name: 'alumni.create', module: 'alumni', action: 'create', description: 'Menambah data alumni' },
  { name: 'alumni.edit', module: 'alumni', action: 'edit', description: 'Mengedit data alumni' },
  { name: 'alumni.delete', module: 'alumni', action: 'delete', description: 'Menghapus data alumni' },
  { name: 'alumni.manage', module: 'alumni', action: 'manage', description: 'Mengelola semua data alumni' },
  
  // Syubiyah Management
  { name: 'syubiyah.view', module: 'syubiyah', action: 'view', description: 'Melihat data syubiyah' },
  { name: 'syubiyah.create', module: 'syubiyah', action: 'create', description: 'Menambah data syubiyah' },
  { name: 'syubiyah.edit', module: 'syubiyah', action: 'edit', description: 'Mengedit data syubiyah' },
  { name: 'syubiyah.delete', module: 'syubiyah', action: 'delete', description: 'Menghapus data syubiyah' },
  { name: 'syubiyah.manage', module: 'syubiyah', action: 'manage', description: 'Mengelola semua data syubiyah' },
  
  // Mustahiq Management
  { name: 'mustahiq.view', module: 'mustahiq', action: 'view', description: 'Melihat data mustahiq' },
  { name: 'mustahiq.create', module: 'mustahiq', action: 'create', description: 'Menambah data mustahiq' },
  { name: 'mustahiq.edit', module: 'mustahiq', action: 'edit', description: 'Mengedit data mustahiq' },
  { name: 'mustahiq.delete', module: 'mustahiq', action: 'delete', description: 'Menghapus data mustahiq' },
  { name: 'mustahiq.manage', module: 'mustahiq', action: 'manage', description: 'Mengelola semua data mustahiq' },
  
  // News & Articles
  { name: 'news.view', module: 'news', action: 'view', description: 'Melihat berita dan artikel' },
  { name: 'news.create', module: 'news', action: 'create', description: 'Membuat berita dan artikel' },
  { name: 'news.edit', module: 'news', action: 'edit', description: 'Mengedit berita dan artikel' },
  { name: 'news.delete', module: 'news', action: 'delete', description: 'Menghapus berita dan artikel' },
  { name: 'news.manage', module: 'news', action: 'manage', description: 'Mengelola semua berita dan artikel' },
  { name: 'news.categories.manage', module: 'news', action: 'manage', description: 'Mengelola kategori berita' },
  { name: 'news.comments.manage', module: 'news', action: 'manage', description: 'Mengelola komentar berita' },
  
  // Events
  { name: 'events.view', module: 'events', action: 'view', description: 'Melihat event dan acara' },
  { name: 'events.create', module: 'events', action: 'create', description: 'Membuat event dan acara' },
  { name: 'events.edit', module: 'events', action: 'edit', description: 'Mengedit event dan acara' },
  { name: 'events.delete', module: 'events', action: 'delete', description: 'Menghapus event dan acara' },
  { name: 'events.manage', module: 'events', action: 'manage', description: 'Mengelola semua event dan acara' },
  { name: 'events.categories.manage', module: 'events', action: 'manage', description: 'Mengelola kategori event' },
  { name: 'events.participants.manage', module: 'events', action: 'manage', description: 'Mengelola peserta event' },
  
  // Donations & Sponsorship
  { name: 'donations.view', module: 'donations', action: 'view', description: 'Melihat data donasi' },
  { name: 'donations.create', module: 'donations', action: 'create', description: 'Membuat program donasi' },
  { name: 'donations.edit', module: 'donations', action: 'edit', description: 'Mengedit program donasi' },
  { name: 'donations.delete', module: 'donations', action: 'delete', description: 'Menghapus program donasi' },
  { name: 'donations.manage', module: 'donations', action: 'manage', description: 'Mengelola semua donasi' },
  { name: 'donations.history.view', module: 'donations', action: 'view', description: 'Melihat riwayat donasi' },
  { name: 'donations.donors.manage', module: 'donations', action: 'manage', description: 'Mengelola data donatur' },
  { name: 'donations.sponsors.manage', module: 'donations', action: 'manage', description: 'Mengelola data sponsor' },
  { name: 'donations.payment.manage', module: 'donations', action: 'manage', description: 'Mengelola pengaturan pembayaran' },
  
  // Reports
  { name: 'reports.view', module: 'reports', action: 'view', description: 'Melihat laporan' },
  { name: 'reports.alumni.view', module: 'reports', action: 'view', description: 'Melihat laporan alumni' },
  { name: 'reports.activities.view', module: 'reports', action: 'view', description: 'Melihat laporan kegiatan' },
  { name: 'reports.donations.view', module: 'reports', action: 'view', description: 'Melihat laporan donasi' },
  { name: 'reports.financial.view', module: 'reports', action: 'view', description: 'Melihat laporan keuangan' },
  { name: 'reports.website.view', module: 'reports', action: 'view', description: 'Melihat laporan website' },
  { name: 'reports.monthly.view', module: 'reports', action: 'view', description: 'Melihat laporan bulanan' },
  { name: 'reports.export', module: 'reports', action: 'export', description: 'Export laporan' },
  
  // Settings
  { name: 'settings.view', module: 'settings', action: 'view', description: 'Melihat pengaturan' },
  { name: 'settings.general.manage', module: 'settings', action: 'manage', description: 'Mengelola pengaturan umum' },
  { name: 'settings.website.manage', module: 'settings', action: 'manage', description: 'Mengelola pengaturan website' },
  { name: 'settings.email.manage', module: 'settings', action: 'manage', description: 'Mengelola pengaturan email' },
  { name: 'settings.notifications.manage', module: 'settings', action: 'manage', description: 'Mengelola pengaturan notifikasi' },
  { name: 'settings.admins.manage', module: 'settings', action: 'manage', description: 'Mengelola admin' },
  { name: 'settings.backup.manage', module: 'settings', action: 'manage', description: 'Mengelola backup & restore' },
  { name: 'settings.security.manage', module: 'settings', action: 'manage', description: 'Mengelola keamanan' },
];

// Data roles default
const roles = [
  {
    name: 'Super Admin',
    description: 'Akses penuh ke semua fitur sistem'
  },
  {
    name: 'Admin Alumni',
    description: 'Mengelola data alumni, syubiyah, dan mustahiq'
  },
  {
    name: 'Admin Berita',
    description: 'Mengelola berita, artikel, dan konten website'
  },
  {
    name: 'Admin Event',
    description: 'Mengelola event, acara, dan peserta'
  },
  {
    name: 'Admin Donasi',
    description: 'Mengelola donasi, sponsor, dan program donasi'
  },
  {
    name: 'Admin Laporan',
    description: 'Melihat dan mengexport laporan'
  },
  {
    name: 'Viewer',
    description: 'Hanya dapat melihat data tanpa bisa mengedit'
  }
];

async function addRolePermissionSchema() {
  try {
    console.log('🔄 Menambahkan schema Role & Permission ke Prisma...');
    
    // Baca file schema.prisma yang ada
    const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
    let schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Cek apakah schema role sudah ada
    if (schemaContent.includes('model Role {')) {
      console.log('⚠️  Schema Role & Permission sudah ada di schema.prisma');
      return;
    }
    
    // Tambahkan schema role & permission sebelum enum
    const enumIndex = schemaContent.indexOf('enum UserRole {');
    if (enumIndex === -1) {
      console.log('❌ Tidak dapat menemukan enum UserRole dalam schema');
      return;
    }
    
    // Insert schema baru sebelum enum
    const beforeEnum = schemaContent.substring(0, enumIndex);
    const afterEnum = schemaContent.substring(enumIndex);
    const newSchemaContent = beforeEnum + rolePermissionSchema + '\n' + afterEnum;
    
    // Update model User untuk menambahkan relasi UserRole
    const updatedSchemaContent = newSchemaContent.replace(
      /(\/\/ Relations\s+syubiyah\s+Syubiyah\?[^}]+)/,
      '$1\n  userRoles   UserRole[]'
    );
    
    // Tulis kembali file schema
    fs.writeFileSync(schemaPath, updatedSchemaContent);
    console.log('✅ Schema Role & Permission berhasil ditambahkan ke schema.prisma');
    
    console.log('\n📝 Langkah selanjutnya:');
    console.log('1. Jalankan: npx prisma db push');
    console.log('2. Jalankan script ini lagi untuk mengisi data default');
    
  } catch (error) {
    console.error('❌ Error menambahkan schema:', error);
  }
}

async function seedRolePermissionData() {
  try {
    console.log('🔄 Mengisi data default Role & Permission...');
    
    // Cek apakah tabel sudah ada
    try {
      await prisma.role.findFirst();
    } catch (error) {
      console.log('❌ Tabel Role belum ada. Jalankan "npx prisma db push" terlebih dahulu.');
      return;
    }
    
    // Seed Permissions
    console.log('\n📝 Membuat permissions...');
    let permissionCount = 0;
    for (const permission of permissions) {
      try {
        const existing = await prisma.permission.findUnique({
          where: { name: permission.name }
        });
        
        if (!existing) {
          await prisma.permission.create({ data: permission });
          console.log(`   ✅ Permission: ${permission.name}`);
          permissionCount++;
        }
      } catch (error) {
        console.log(`   ❌ Error creating permission ${permission.name}:`, error.message);
      }
    }
    
    // Seed Roles
    console.log('\n👥 Membuat roles...');
    let roleCount = 0;
    for (const role of roles) {
      try {
        const existing = await prisma.role.findUnique({
          where: { name: role.name }
        });
        
        if (!existing) {
          await prisma.role.create({ data: role });
          console.log(`   ✅ Role: ${role.name}`);
          roleCount++;
        }
      } catch (error) {
        console.log(`   ❌ Error creating role ${role.name}:`, error.message);
      }
    }
    
    // Setup Super Admin dengan semua permissions
    console.log('\n🔐 Setup Super Admin permissions...');
    const superAdminRole = await prisma.role.findUnique({
      where: { name: 'Super Admin' }
    });
    
    if (superAdminRole) {
      const allPermissions = await prisma.permission.findMany();
      let assignedCount = 0;
      
      for (const permission of allPermissions) {
        try {
          const existing = await prisma.rolePermission.findUnique({
            where: {
              roleId_permissionId: {
                roleId: superAdminRole.id,
                permissionId: permission.id
              }
            }
          });
          
          if (!existing) {
            await prisma.rolePermission.create({
              data: {
                roleId: superAdminRole.id,
                permissionId: permission.id
              }
            });
            assignedCount++;
          }
        } catch (error) {
          console.log(`   ❌ Error assigning permission ${permission.name}:`, error.message);
        }
      }
      
      console.log(`   ✅ Assigned ${assignedCount} permissions to Super Admin`);
    }
    
    console.log('\n📊 Ringkasan:');
    console.log(`   - Permissions dibuat: ${permissionCount}`);
    console.log(`   - Roles dibuat: ${roleCount}`);
    console.log(`   - Total permissions: ${await prisma.permission.count()}`);
    console.log(`   - Total roles: ${await prisma.role.count()}`);
    
    console.log('\n✅ Setup Role & Permission selesai!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  // Cek apakah schema sudah ada
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  if (!schemaContent.includes('model Role {')) {
    await addRolePermissionSchema();
  } else {
    await seedRolePermissionData();
  }
}

main()
  .then(() => {
    console.log('🎉 Script selesai dijalankan');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script gagal:', error);
    process.exit(1);
  });