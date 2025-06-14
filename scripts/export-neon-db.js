const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Konfigurasi
const NEON_CONNECTION_STRING = 'postgresql://ikada_owner:npg_V1GsU0lQLgJr@ep-sweet-unit-a1e1v2mp-pooler.ap-southeast-1.aws.neon.tech/ikada?sslmode=require';
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];

// Pastikan direktori backup ada
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const BACKUP_FILE = path.join(BACKUP_DIR, `ikada-backup-${TIMESTAMP}.dump`);
const SCHEMA_FILE = path.join(BACKUP_DIR, `ikada-schema-${TIMESTAMP}.sql`);
const DATA_FILE = path.join(BACKUP_DIR, `ikada-data-${TIMESTAMP}.sql`);

console.log('🚀 Memulai export database Neon...');
console.log('📁 Direktori backup:', BACKUP_DIR);

// Fungsi untuk menjalankan command dengan error handling
function runCommand(command, description) {
  try {
    console.log(`\n⏳ ${description}...`);
    console.log(`📝 Command: ${command.replace(/postgresql:\/\/[^@]+@/, 'postgresql://***:***@')}`);
    
    const output = execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf8',
      timeout: 300000 // 5 menit timeout
    });
    
    console.log(`✅ ${description} berhasil!`);
    return output;
  } catch (error) {
    console.error(`❌ Error saat ${description}:`);
    console.error(error.message);
    if (error.stdout) console.error('STDOUT:', error.stdout);
    if (error.stderr) console.error('STDERR:', error.stderr);
    throw error;
  }
}

// Fungsi untuk mengecek apakah pg_dump tersedia
function checkPgDump() {
  try {
    execSync('pg_dump --version', { stdio: 'pipe' });
    console.log('✅ pg_dump tersedia');
  } catch (error) {
    console.error('❌ pg_dump tidak ditemukan!');
    console.error('💡 Silakan install PostgreSQL client tools:');
    console.error('   - Windows: Download dari https://www.postgresql.org/download/windows/');
    console.error('   - macOS: brew install postgresql');
    console.error('   - Ubuntu: sudo apt-get install postgresql-client');
    process.exit(1);
  }
}

async function exportDatabase() {
  try {
    // Cek pg_dump
    checkPgDump();
    
    console.log('\n📊 Informasi Export:');
    console.log('🔗 Database:', NEON_CONNECTION_STRING.replace(/postgresql:\/\/[^@]+@/, 'postgresql://***:***@'));
    console.log('📅 Timestamp:', TIMESTAMP);
    
    // 1. Export full database (schema + data) dalam format custom
    const fullBackupCommand = `pg_dump "${NEON_CONNECTION_STRING}" -F c -b -v -f "${BACKUP_FILE}"`;
    runCommand(fullBackupCommand, 'Export full database (custom format)');
    
    // 2. Export schema only (SQL format)
    const schemaCommand = `pg_dump "${NEON_CONNECTION_STRING}" -s -f "${SCHEMA_FILE}"`;
    runCommand(schemaCommand, 'Export schema only');
    
    // 3. Export data only (SQL format)
    const dataCommand = `pg_dump "${NEON_CONNECTION_STRING}" -a --disable-triggers -f "${DATA_FILE}"`;
    runCommand(dataCommand, 'Export data only');
    
    // 4. Buat info file
    const infoContent = `# Database Export Information

## Export Details
- **Database**: Neon PostgreSQL
- **Export Date**: ${new Date().toISOString()}
- **Files Generated**:
  - \`${path.basename(BACKUP_FILE)}\` - Full backup (custom format)
  - \`${path.basename(SCHEMA_FILE)}\` - Schema only (SQL)
  - \`${path.basename(DATA_FILE)}\` - Data only (SQL)

## Restore Commands

### Restore Full Database (to new Neon account)
\`\`\`bash
pg_restore -d "postgresql://new_user:new_password@new_host/new_database?sslmode=require" "${path.basename(BACKUP_FILE)}"
\`\`\`

### Restore Schema Only
\`\`\`bash
psql "postgresql://new_user:new_password@new_host/new_database?sslmode=require" -f "${path.basename(SCHEMA_FILE)}"
\`\`\`

### Restore Data Only
\`\`\`bash
psql "postgresql://new_user:new_password@new_host/new_database?sslmode=require" -f "${path.basename(DATA_FILE)}"
\`\`\`

## File Sizes
`;
    
    // Tambahkan informasi ukuran file
    const files = [BACKUP_FILE, SCHEMA_FILE, DATA_FILE];
    let sizeInfo = '';
    
    files.forEach(file => {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        sizeInfo += `- \`${path.basename(file)}\`: ${sizeInMB} MB\n`;
      }
    });
    
    const finalInfo = infoContent + sizeInfo;
    const infoFile = path.join(BACKUP_DIR, `export-info-${TIMESTAMP}.md`);
    fs.writeFileSync(infoFile, finalInfo);
    
    console.log('\n🎉 Export database berhasil!');
    console.log('📁 File yang dihasilkan:');
    
    files.concat([infoFile]).forEach(file => {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`   📄 ${path.basename(file)} (${sizeInMB} MB)`);
      }
    });
    
    console.log('\n💡 Tips:');
    console.log('   - Simpan file backup di tempat yang aman');
    console.log('   - File .dump dapat digunakan untuk restore lengkap');
    console.log('   - File .sql dapat diedit sebelum restore jika diperlukan');
    console.log('   - Baca file export-info untuk instruksi restore');
    
  } catch (error) {
    console.error('\n💥 Export gagal:', error.message);
    process.exit(1);
  }
}

// Jalankan export
if (require.main === module) {
  exportDatabase();
}

module.exports = { exportDatabase };