# Database Management Scripts

Kumpulan script untuk mengelola database, termasuk export dari Neon, migrasi ke Prisma Accelerate, dan backup skema.

## Scripts yang Tersedia

### 1. export-neon-db.js
Script untuk mengekspor database dari Neon menggunakan pg_dump.

### 2. generate-schema-backup.js
Script untuk menyimpan skema Prisma yang ada ke dalam format SQL dan membuat dokumentasi.

### 3. verify-prisma-migration.js
Script untuk memverifikasi koneksi dan migrasi database ke Prisma Accelerate.

### 4. restore-data-to-prisma.js
Script untuk memberikan panduan restore data ke database Prisma Accelerate yang baru.

## Export Database Neon

Script `export-neon-db.js` digunakan untuk mengekspor database dari Neon ke file lokal. Script ini akan menghasilkan beberapa file backup yang dapat digunakan untuk memindahkan database ke akun Neon baru.

### Cara Penggunaan

```bash
# Pastikan PostgreSQL client tools (pg_dump) sudah terinstall
node scripts/export-neon-db.js
```

### File yang Dihasilkan

Script akan membuat folder `backups` dan menghasilkan file-file berikut:

- `ikada-backup-[tanggal].dump` - Full backup dalam format custom PostgreSQL
- `ikada-schema-[tanggal].sql` - Schema database saja (tanpa data)
- `ikada-data-[tanggal].sql` - Data saja (tanpa schema)
- `export-info-[tanggal].md` - Informasi dan instruksi restore

### Konfigurasi

Script menggunakan connection string dari environment variable `DATABASE_URL` atau menggunakan default yang sudah disediakan dalam script.

## Generate Schema Backup

Script `generate-schema-backup.js` digunakan untuk membuat backup dari schema Prisma dan menghasilkan file SQL yang dapat digunakan untuk restore manual.

### Cara Penggunaan

```bash
node scripts/generate-schema-backup.js
```

### File yang Dihasilkan

Script akan membuat folder `backups` dan menghasilkan file-file berikut:

- `prisma-schema-[tanggal].prisma` - Backup file schema Prisma
- `generated-schema-[tanggal].sql` - SQL schema untuk restore manual
- `schema-documentation-[tanggal].md` - Dokumentasi schema database

## Instalasi PostgreSQL Client Tools

Untuk menggunakan script export database, Anda perlu menginstal PostgreSQL client tools yang menyediakan `pg_dump` dan `pg_restore`.

### Windows

1. Download PostgreSQL installer dari [postgresql.org](https://www.postgresql.org/download/windows/)
2. Saat instalasi, pilih hanya komponen "Command Line Tools"
3. Pastikan folder bin PostgreSQL (biasanya `C:\Program Files\PostgreSQL\[version]\bin`) ditambahkan ke PATH

### macOS

```bash
brew install postgresql
```

### Ubuntu/Debian

```bash
sudo apt-get update
sudo apt-get install postgresql-client
```

## Memindahkan Database ke Akun Neon Baru

1. Buat akun Neon baru di [neon.tech](https://neon.tech)
2. Buat project dan database baru
3. Dapatkan connection string dari dashboard Neon
4. Gunakan perintah berikut untuk restore database:

```bash
pg_restore -d "postgresql://user:password@host/database?sslmode=require" path/to/ikada-backup-[tanggal].dump
```

5. Update file `.env` dan `.env.local` dengan connection string baru

## Migrasi ke Prisma Accelerate

### Langkah-langkah Migrasi

1. **Update DATABASE_URL**
   ```bash
   # Di file .env dan .env.local
   DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
   ```

2. **Push Schema ke Database Baru**
   ```bash
   npx prisma db push
   ```

3. **Verifikasi Migrasi**
   ```bash
   npx tsx scripts/verify-prisma-migration.js
   ```

4. **Buka Prisma Studio**
   ```bash
   npx prisma studio
   # Akses: http://localhost:5555
   ```

### Status Migrasi
- ✅ Database URL sudah dikonfigurasi
- ✅ Schema sudah diterapkan ke Prisma Accelerate
- ✅ Semua tabel sudah tersedia
- ✅ Prisma Studio dapat diakses
- 📝 Data masih kosong (perlu restore manual jika diperlukan)

## Troubleshooting

### Error: pg_dump not found
Instal PostgreSQL client tools:
- **Windows**: Download dari https://www.postgresql.org/download/windows/
- **macOS**: `brew install postgresql`
- **Ubuntu/Debian**: `sudo apt-get install postgresql-client`

### Error: Connection timeout
Tambahkan parameter timeout:
```bash
node export-neon-db.js --timeout=300
```

### Error: Permission denied
Pastikan user memiliki akses read ke database Neon.

### Error: Prisma Accelerate connection
- Pastikan API key masih valid
- Cek quota dan limits di dashboard Prisma
- Verifikasi format DATABASE_URL

### Error: Connection refused

Pastikan connection string sudah benar dan Anda memiliki akses ke database Neon.

### Error: Permission denied

Pastikan Anda memiliki izin untuk membuat folder dan file di direktori project.

### Error saat Restore

Jika terjadi error saat restore, coba gunakan opsi tambahan:

```bash
pg_restore -d "postgresql://user:password@host/database?sslmode=require" --no-owner --no-privileges path/to/ikada-backup-[tanggal].dump
```