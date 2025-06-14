// Script untuk menguji akses ke berbagai file statis
const http = require('http');

const testFiles = [
  'http://localhost:3003/ikada.png',
  'http://localhost:3003/placeholder-user.jpg',
  'http://localhost:3003/foto_alumni/zainab_binti_jahsy_ramadhani.jpg',
  'http://localhost:3003/foto_alumni/ahmadi_harja.jpg',
  'http://localhost:3003/foto_mustahiq/ali_akbar.jpg'
];

console.log('Testing static file access...');
console.log('================================');

function testUrl(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      console.log(`${url}: ${res.statusCode} (${res.headers['content-type'] || 'unknown'})`);
      resolve(res.statusCode);
    });
    
    req.on('error', (err) => {
      console.log(`${url}: ERROR - ${err.message}`);
      resolve(0);
    });
    
    req.setTimeout(3000, () => {
      console.log(`${url}: TIMEOUT`);
      req.destroy();
      resolve(0);
    });
  });
}

async function testAllFiles() {
  for (const url of testFiles) {
    await testUrl(url);
  }
  console.log('\nTest completed.');
}

testAllFiles();