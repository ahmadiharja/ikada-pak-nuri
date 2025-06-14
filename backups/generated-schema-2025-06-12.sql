-- Generated SQL Schema from Prisma
-- Generated at: 2025-06-12T17:01:37.117Z
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
