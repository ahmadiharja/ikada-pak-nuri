const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Kredensial Neon DB (ganti dengan kredensial yang benar)
const NEON_DATABASE_URL = "postgresql://ikada_owner:npg_V1GsU0lQLgJr@ep-sweet-unit-a1e1v2mp-pooler.ap-southeast-1.aws.neon.tech/ikada?sslmode=require";

async function readAllDataFromNeon() {
  const client = new Client({
    connectionString: NEON_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔗 Menghubungkan ke Neon Database...');
    await client.connect();
    console.log('✅ Koneksi berhasil!');

    // Daftar tabel yang akan dibaca
    const tables = [
      'User',
      'Syubiyah', 
      'Alumni',
      'Mustahiq',
      'Post',
      'Category',
      'Comment',
      'Tag',
      'PostTag',
      'Blog',
      'EventCategory',
      'Event',
      'EventSession',
      'EventParticipant',
      'DonationProgram',
      'Donation'
    ];

    const allData = {};
    
    console.log('\n📊 Membaca data dari semua tabel...');
    
    for (const tableName of tables) {
      try {
        console.log(`\n🔍 Membaca tabel: ${tableName}`);
        
        // Query untuk mendapatkan semua data dari tabel
        const query = `SELECT * FROM "${tableName}"`;
        const result = await client.query(query);
        
        allData[tableName] = result.rows;
        console.log(`✅ ${tableName}: ${result.rows.length} records`);
        
        // Tampilkan sample data jika ada
        if (result.rows.length > 0) {
          console.log(`   Sample data:`, JSON.stringify(result.rows[0], null, 2).substring(0, 200) + '...');
        }
        
      } catch (error) {
        console.log(`❌ Error reading ${tableName}:`, error.message);
        allData[tableName] = [];
      }
    }

    // Simpan data ke file JSON
    const timestamp = new Date().toISOString().split('T')[0];
    const outputDir = path.join(__dirname, '..', 'backups');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputFile = path.join(outputDir, `neon-data-export-${timestamp}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2));
    
    console.log('\n💾 Data berhasil disimpan ke:', outputFile);
    
    // Buat summary
    console.log('\n📋 Summary Export:');
    let totalRecords = 0;
    for (const [tableName, data] of Object.entries(allData)) {
      console.log(`   ${tableName}: ${data.length} records`);
      totalRecords += data.length;
    }
    console.log(`\n🎯 Total records: ${totalRecords}`);
    
    // Buat file summary
    const summaryFile = path.join(outputDir, `neon-export-summary-${timestamp}.md`);
    let summaryContent = `# Neon Database Export Summary\n\n`;
    summaryContent += `**Export Date:** ${new Date().toISOString()}\n\n`;
    summaryContent += `**Source Database:** Neon PostgreSQL\n\n`;
    summaryContent += `## Tables Exported\n\n`;
    
    for (const [tableName, data] of Object.entries(allData)) {
      summaryContent += `- **${tableName}**: ${data.length} records\n`;
    }
    
    summaryContent += `\n**Total Records:** ${totalRecords}\n\n`;
    summaryContent += `## Files Generated\n\n`;
    summaryContent += `- \`neon-data-export-${timestamp}.json\` - Complete data export\n`;
    summaryContent += `- \`neon-export-summary-${timestamp}.md\` - This summary file\n\n`;
    summaryContent += `## Next Steps\n\n`;
    summaryContent += `1. Review the exported data\n`;
    summaryContent += `2. Use \`migrate-neon-to-prisma.js\` to import data to Prisma DB\n`;
    summaryContent += `3. Verify data integrity after migration\n`;
    
    fs.writeFileSync(summaryFile, summaryContent);
    console.log('📄 Summary disimpan ke:', summaryFile);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Pastikan kredensial Neon DB sudah benar');
    console.error('2. Pastikan koneksi internet stabil');
    console.error('3. Cek apakah database masih aktif di Neon');
  } finally {
    await client.end();
    console.log('\n🔌 Koneksi database ditutup.');
  }
}

// Jalankan script
if (require.main === module) {
  readAllDataFromNeon();
}

module.exports = { readAllDataFromNeon };