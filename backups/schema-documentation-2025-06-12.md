# Database Schema Documentation

## Generated: 2025-06-12T17:01:37.121Z

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

- `prisma-schema-2025-06-12.prisma` - Backup file schema Prisma
- `generated-schema-2025-06-12.sql` - SQL schema untuk restore manual
- `schema-documentation-2025-06-12.md` - Dokumentasi ini

## Usage

### Restore ke Database Baru
```bash
# Menggunakan file SQL
psql "postgresql://user:pass@host/db?sslmode=require" -f generated-schema-2025-06-12.sql

# Atau menggunakan Prisma (recommended)
npx prisma db push
```

### Update Schema
```bash
# Edit prisma/schema.prisma kemudian:
npx prisma db push
# atau
npx prisma migrate dev
```
