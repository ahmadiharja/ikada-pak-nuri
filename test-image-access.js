// Script untuk menguji akses ke file foto alumni
const http = require('http');
const fs = require('fs');
const path = require('path');

// Test akses langsung ke file
const testImagePath = path.join(__dirname, 'public', 'foto_alumni', 'zainab_binti_jahsy_ramadhani.jpg');

console.log('Testing image file access...');
console.log('File path:', testImagePath);
console.log('File exists:', fs.existsSync(testImagePath));

if (fs.existsSync(testImagePath)) {
  const stats = fs.statSync(testImagePath);
  console.log('File size:', stats.size, 'bytes');
  console.log('File modified:', stats.mtime);
}

// Test HTTP request ke localhost
const testUrl = 'http://localhost:3003/foto_alumni/zainab_binti_jahsy_ramadhani.jpg';
console.log('\nTesting HTTP access to:', testUrl);

const req = http.get(testUrl, (res) => {
  console.log('HTTP Status:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  console.log('Content-Length:', res.headers['content-length']);
  
  if (res.statusCode === 200) {
    console.log('✅ Image accessible via HTTP');
  } else {
    console.log('❌ Image NOT accessible via HTTP');
  }
});

req.on('error', (err) => {
  console.log('❌ HTTP Error:', err.message);
});

req.setTimeout(5000, () => {
  console.log('❌ HTTP Timeout');
  req.destroy();
});