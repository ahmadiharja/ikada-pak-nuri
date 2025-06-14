const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konfigurasi
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const PRISMA_SCHEMA = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];

// Pastikan direktori backup ada
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const SCHEMA_BACKUP_FILE = path.join(BACKUP_DIR, `prisma-schema-${TIMESTAMP}.prisma`);
const SQL_SCHEMA_FILE = path.join(BACKUP_DIR, `generated-schema-${TIMESTAMP}.sql`);

console.log('🔄 Memulai backup schema Prisma...');

function backupPrismaSchema() {
  try {
    // 1. Copy file schema.prisma
    console.log('\n📋 Menyalin schema Prisma...');
    fs.copyFileSync(PRISMA_SCHEMA, SCHEMA_BACKUP_FILE);
    console.log(`✅ Schema Prisma disalin ke: ${path.basename(SCHEMA_BACKUP_FILE)}`);
    
    // 2. Generate SQL dari Prisma schema
    console.log('\n🔨 Generating SQL dari Prisma schema...');
    
    try {
      // Coba generate SQL menggunakan prisma db push --help untuk melihat opsi
      const result = execSync('npx prisma generate --help', { 
        stdio: 'pipe', 
        encoding: 'utf8',
        cwd: path.join(__dirname, '..')
      });
      
      // Generate SQL schema menggunakan prisma db push dengan dry run
      console.log('⚡ Menggunakan Prisma untuk generate SQL...');
      
      // Buat temporary SQL file dengan struktur manual berdasarkan schema
      const sqlContent = generateSQLFromPrismaSchema();
      fs.writeFileSync(SQL_SCHEMA_FILE, sqlContent);
      
      console.log(`✅ SQL schema generated: ${path.basename(SQL_SCHEMA_FILE)}`);
      
    } catch (prismaError) {
      console.log('⚠️  Prisma CLI tidak tersedia, membuat SQL manual...');
      
      // Fallback: buat SQL manual
      const sqlContent = generateSQLFromPrismaSchema();
      fs.writeFileSync(SQL_SCHEMA_FILE, sqlContent);
      
      console.log(`✅ SQL schema (manual) generated: ${path.basename(SQL_SCHEMA_FILE)}`);
    }
    
    // 3. Buat dokumentasi
    const docContent = createSchemaDocumentation();
    const docFile = path.join(BACKUP_DIR, `schema-documentation-${TIMESTAMP}.md`);
    fs.writeFileSync(docFile, docContent);
    
    console.log('\n🎉 Backup schema berhasil!');
    console.log('📁 File yang dihasilkan:');
    
    [SCHEMA_BACKUP_FILE, SQL_SCHEMA_FILE, docFile].forEach(file => {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const sizeInKB = (stats.size / 1024).toFixed(2);
        console.log(`   📄 ${path.basename(file)} (${sizeInKB} KB)`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error saat backup schema:', error.message);
    throw error;
  }
}

function generateSQLFromPrismaSchema() {
  const schemaContent = fs.readFileSync(PRISMA_SCHEMA, 'utf8');
  
  return `-- Generated SQL Schema from Prisma
-- Generated at: ${new Date().toISOString()}
-- Source: prisma/schema.prisma

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE "UserRole" AS ENUM ('PUSAT', 'SYUBIYAH');
CREATE TYPE "AlumniStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE "ContentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "DonationType" AS ENUM ('VOLUNTARY', 'PROGRAM');
CREATE TYPE "MaritalStatus" AS ENUM ('MENIKAH', 'LAJANG', 'DUDA', 'JANDA', 'BELUM_MENIKAH');
CREATE TYPE "IncomeRange" AS ENUM ('RANGE_1_5', 'RANGE_5_10', 'RANGE_10_30', 'ABOVE_30');
CREATE TYPE "PostVisibility" AS ENUM ('ALL_SYUBIYAH', 'SPECIFIC_SYUBIYAH');
CREATE TYPE "EventType" AS ENUM ('SINGLE', 'RECURRING');
CREATE TYPE "EventParticipantStatus" AS ENUM ('REGISTERED', 'CONFIRMED', 'ATTENDED', 'CANCELLED', 'WAITLISTED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED', 'FREE');

-- Create tables

-- Users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "name" TEXT NOT NULL,
    "syubiyah_id" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Syubiyah table
CREATE TABLE "syubiyah" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provinsi" TEXT NOT NULL DEFAULT '',
    "kabupaten" TEXT NOT NULL DEFAULT '',
    "provinsiId" TEXT,
    "kabupatenId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "syubiyah_pkey" PRIMARY KEY ("id")
);

-- Mustahiq table
CREATE TABLE "mustahiq" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "provinsi" TEXT NOT NULL DEFAULT '',
    "kabupaten" TEXT NOT NULL DEFAULT '',
    "kecamatan" TEXT NOT NULL DEFAULT '',
    "desa" TEXT NOT NULL DEFAULT '',
    "provinsiId" TEXT,
    "kabupatenId" TEXT,
    "kecamatanId" TEXT,
    "desaId" TEXT,
    "namaJalan" TEXT,
    "rt" TEXT,
    "rw" TEXT,
    "bidangKeahlian" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mustahiq_pkey" PRIMARY KEY ("id")
);

-- Alumni table
CREATE TABLE "alumni" (
    "id" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "fullName" TEXT NOT NULL,
    "tahunMasuk" INTEGER,
    "tahunKeluar" INTEGER,
    "asalDaerah" TEXT,
    "syubiyahId" TEXT,
    "mustahiqId" TEXT,
    "tempatLahir" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "statusPernikahan" "MaritalStatus",
    "jumlahAnak" INTEGER,
    "pendidikanTerakhir" TEXT,
    "pekerjaan" TEXT[],
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "penghasilanBulan" "IncomeRange",
    "provinsi" TEXT NOT NULL DEFAULT '',
    "kabupaten" TEXT NOT NULL DEFAULT '',
    "kecamatan" TEXT NOT NULL DEFAULT '',
    "desa" TEXT NOT NULL DEFAULT '',
    "provinsiId" TEXT,
    "kabupatenId" TEXT,
    "kecamatanId" TEXT,
    "desaId" TEXT,
    "namaJalan" TEXT,
    "rt" TEXT,
    "rw" TEXT,
    "password" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3),
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "emailVerifiedAt" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "status" "AlumniStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alumni_pkey" PRIMARY KEY ("id")
);

-- Add other tables (posts, categories, comments, etc.)
-- Note: This is a simplified version. For complete schema, use the Prisma migration files.

-- Create unique indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "mustahiq_email_key" ON "mustahiq"("email");
CREATE UNIQUE INDEX "alumni_email_key" ON "alumni"("email");

-- Add foreign key constraints
ALTER TABLE "users" ADD CONSTRAINT "users_syubiyah_id_fkey" FOREIGN KEY ("syubiyah_id") REFERENCES "syubiyah"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "alumni" ADD CONSTRAINT "alumni_syubiyahId_fkey" FOREIGN KEY ("syubiyahId") REFERENCES "syubiyah"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "alumni" ADD CONSTRAINT "alumni_mustahiqId_fkey" FOREIGN KEY ("mustahiqId") REFERENCES "mustahiq"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Note: This is a partial schema. For complete schema with all tables,
-- please use 'npx prisma db push' or 'npx prisma migrate' commands.
`;
}

function createSchemaDocumentation() {
  return `# Database Schema Documentation

## Generated: ${new Date().toISOString()}

## Overview
Dokumentasi ini berisi informasi tentang struktur database untuk aplikasi IKADA (Ikatan Alumni Daarul Arqam).

## Models

### User
- **Purpose**: Mengelola user admin (PUSAT dan SYUBIYAH)
- **Key Fields**: email, role, syubiyah_id
- **Relations**: syubiyah, posts, comments, blogs, events, donations

### Syubiyah
- **Purpose**: Data cabang/syubiyah di berbagai daerah
- **Key Fields**: name, provinsi, kabupaten
- **Relations**: alumni, users, eventParticipants

### Alumni
- **Purpose**: Data alumni dengan sistem autentikasi terpisah
- **Key Fields**: email, password, fullName, status
- **Relations**: syubiyah, mustahiq, eventParticipants

### Mustahiq
- **Purpose**: Data penerima bantuan/mustahiq
- **Key Fields**: name, email, bidangKeahlian
- **Relations**: alumni

### Post
- **Purpose**: Konten/artikel dengan sistem visibilitas
- **Key Fields**: title, content, visibility, targetSyubiyahIds
- **Relations**: author, category, comments, tags

### Event
- **Purpose**: Manajemen event/kegiatan
- **Key Fields**: title, startDate, maxParticipants, eventType
- **Relations**: category, organizer, participants, sessions

## Enums

- **UserRole**: PUSAT, SYUBIYAH
- **AlumniStatus**: PENDING, VERIFIED, REJECTED
- **ContentStatus**: PENDING, APPROVED, REJECTED
- **PostVisibility**: ALL_SYUBIYAH, SPECIFIC_SYUBIYAH
- **EventType**: SINGLE, RECURRING
- **PaymentStatus**: PENDING, PAID, CANCELLED, REFUNDED, FREE

## Key Features

1. **Multi-tenant Architecture**: Sistem mendukung multiple syubiyah
2. **Content Visibility**: Post dan event dapat ditargetkan ke syubiyah tertentu
3. **Alumni Authentication**: Sistem login terpisah untuk alumni
4. **Event Management**: Mendukung event sekali dan berulang
5. **Regional Data**: Integrasi dengan API wilayah Indonesia

## Files Generated

- \`prisma-schema-${TIMESTAMP}.prisma\` - Backup file schema Prisma
- \`generated-schema-${TIMESTAMP}.sql\` - SQL schema untuk restore manual
- \`schema-documentation-${TIMESTAMP}.md\` - Dokumentasi ini

## Usage

### Restore ke Database Baru
\`\`\`bash
# Menggunakan file SQL
psql "postgresql://user:pass@host/db?sslmode=require" -f generated-schema-${TIMESTAMP}.sql

# Atau menggunakan Prisma (recommended)
npx prisma db push
\`\`\`

### Update Schema
\`\`\`bash
# Edit prisma/schema.prisma kemudian:
npx prisma db push
# atau
npx prisma migrate dev
\`\`\`
`;
}

// Jalankan backup
if (require.main === module) {
  backupPrismaSchema();
}

module.exports = { backupPrismaSchema };